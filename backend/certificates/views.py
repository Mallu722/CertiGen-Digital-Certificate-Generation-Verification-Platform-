import os
import io
import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils import timezone
from .models import Certificate, generate_next_certificate_number
from .serializers import (
    CertificateSerializer,
    CertificateCreateSerializer,
    CertificateVerifySerializer,
    CertificateRevokeSerializer,
)
from .pdf_generator import generate_certificate_pdf, generate_qr_code_image
from verification.models import VerificationLog


def get_certificate_by_identifier(identifier: str):
    """Helper to find certificate by certificate_number, verification_id, or primary key id."""
    # 1. Try certificate_number (exact or case-insensitive)
    cert = Certificate.objects.filter(certificate_number__iexact=identifier).first()
    if cert:
        return cert
    
    # 2. Try as UUID (verification_id or id)
    try:
        val = uuid.UUID(identifier)
        cert = Certificate.objects.filter(verification_id=val).first()
        if cert:
            return cert
        cert = Certificate.objects.filter(id=val).first()
        if cert:
            return cert
    except (ValueError, TypeError):
        pass

    return None


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'issue']:
            return CertificateCreateSerializer
        return CertificateSerializer
    
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['verify', 'pdf', 'download', 'qr', 'next_id']:
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Validate private template password if user is not admin
        template = serializer.validated_data.get('template')
        if template and template.is_private and getattr(self.request.user, 'role', '') != 'ADMIN':
            provided_pass = self.request.data.get('template_password', '') or self.request.data.get('password', '')
            if template.access_password and provided_pass.strip() != template.access_password.strip():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('This template is private and requires a valid access password set by an Administrator.')
        serializer.save(issued_by=self.request.user)


    @action(detail=False, methods=['get'], url_path='next-id')
    def next_id(self, request):
        """Get the next unique sequential certificate ID (e.g. CERT-2026-000001)."""
        next_number = generate_next_certificate_number()
        return Response({'next_number': next_number})

    @action(detail=False, methods=['get'], url_path='verify/(?P<certificate_id>[^/]+)')
    def verify(self, request, certificate_id=None):
        """
        Public verification endpoint.
        Accepts certificate_number (e.g. CERT-2026-000001) or UUID.
        Returns certificate details, valid boolean, and revocation status.
        """
        certificate = get_certificate_by_identifier(certificate_id)
        if not certificate:
            return Response({
                'error': 'Certificate not found',
                'valid': False,
                'status': 'NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)

        is_valid = (certificate.status == 'VALID')

        # Log this verification inquiry
        VerificationLog.objects.create(
            certificate_id=certificate.certificate_number,
            verified_by_ip=request.META.get('REMOTE_ADDR'),
            verified_by_user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            is_valid=is_valid
        )

        now_str = timezone.now().isoformat()
        if not is_valid:
            return Response({
                'certificate': CertificateSerializer(certificate).data,
                'valid': False,
                'status': certificate.status,
                'revoked_at': certificate.revoked_at.isoformat() if certificate.revoked_at else None,
                'revocation_reason': certificate.revocation_reason or 'Certificate has been revoked by issuing authority.',
                'verified_at': now_str,
                'message': 'This certificate has been REVOKED and is no longer valid.'
            })

        # Mark certificate as verified if first time
        if not certificate.verified:
            certificate.verified = True
            certificate.save(update_fields=['verified'])

        return Response({
            'certificate': CertificateSerializer(certificate).data,
            'valid': True,
            'status': 'VALID',
            'verified_at': now_str,
            'message': 'Certificate is authentic and valid.'
        })

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """View or preview PDF inline."""
        certificate = self.get_object()
        base_url = request.META.get('HTTP_ORIGIN') or getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        pdf_bytes = generate_certificate_pdf(certificate, base_url=base_url)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{certificate.certificate_number}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download certificate PDF as file attachment."""
        certificate = self.get_object()
        base_url = request.META.get('HTTP_ORIGIN') or getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        pdf_bytes = generate_certificate_pdf(certificate, base_url=base_url)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{certificate.certificate_number}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        """Get certificate QR code image (PNG)."""
        certificate = self.get_object()
        base_url = request.META.get('HTTP_ORIGIN') or getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{base_url.rstrip('/')}/verify/{certificate.certificate_number}"

        img = generate_qr_code_image(verification_url)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        return HttpResponse(buffer.getvalue(), content_type='image/png')

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def revoke(self, request, pk=None):
        """Revoke a certificate."""
        certificate = self.get_object()
        reason = request.data.get('reason', 'Revoked by authority')
        certificate.status = 'REVOKED'
        certificate.revoked_at = timezone.now()
        certificate.revocation_reason = reason
        certificate.save(update_fields=['status', 'revoked_at', 'revocation_reason', 'updated_at'])

        return Response({
            'message': 'Certificate revoked successfully',
            'certificate': CertificateSerializer(certificate).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reactivate(self, request, pk=None):
        """Reactivate a previously revoked certificate."""
        certificate = self.get_object()
        certificate.status = 'VALID'
        certificate.revoked_at = None
        certificate.revocation_reason = ''
        certificate.save(update_fields=['status', 'revoked_at', 'revocation_reason', 'updated_at'])

        return Response({
            'message': 'Certificate reactivated successfully',
            'certificate': CertificateSerializer(certificate).data
        })

    @action(detail=False, methods=['post'], url_path='parse-sheet', permission_classes=[IsAuthenticated])
    def parse_sheet(self, request):
        """Parse uploaded Excel or CSV file and return structured recipient preview."""
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded. Please upload a .xlsx, .xls, or .csv file.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from .bulk_service import parse_recipients_file
            recipients = parse_recipients_file(uploaded_file, uploaded_file.name)
            return Response({
                'count': len(recipients),
                'filename': uploaded_file.name,
                'recipients': recipients
            })
        except Exception as e:
            return Response({'error': f'Failed to parse sheet: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-issue', permission_classes=[IsAuthenticated])
    def bulk_issue(self, request):
        """
        Generate certificates for a batch of recipients, create single ZIP file,
        and optionally send emails with attached certificate PDFs.
        """
        import json
        from datetime import datetime
        from certificate_templates.models import Template
        from .bulk_service import generate_bulk_certificates_and_zip, parse_recipients_file
        
        # 1. Template validation
        template_id = request.data.get('template')
        if not template_id:
            return Response({'error': 'Template is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            template = Template.objects.get(id=template_id)
        except Template.DoesNotExist:
            return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Private template check
        if template.is_private and getattr(request.user, 'role', '') != 'ADMIN':
            provided_pass = request.data.get('template_password', '') or request.data.get('password', '')
            if template.access_password and provided_pass.strip() != template.access_password.strip():
                return Response({'error': 'Invalid access password for this private template.'}, status=status.HTTP_403_FORBIDDEN)

        # 2. Extract recipients
        recipients = []
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            recipients = parse_recipients_file(uploaded_file, uploaded_file.name)
        elif 'recipients' in request.data:
            rec_data = request.data.get('recipients')
            if isinstance(rec_data, str):
                try:
                    recipients = json.loads(rec_data)
                except Exception:
                    recipients = []
            elif isinstance(rec_data, list):
                recipients = rec_data

        if not recipients:
            return Response({'error': 'No recipients found to generate certificates for.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Common details
        common_data = {
            'title': request.data.get('title') or request.data.get('event_name') or 'Certificate of Achievement',
            'achievement': request.data.get('achievement') or 'Outstanding Achievement',
            'organization_name': request.data.get('organization_name') or 'CertiGen Platform',
            'institute_subtitle': request.data.get('institute_subtitle', ''),
            'signatory_name': request.data.get('signatory_name') or 'Dr. Rajesh Kumar',
            'signatory_title': request.data.get('signatory_title') or 'Dean of Academic Affairs',
            'second_signatory_name': request.data.get('second_signatory_name', 'Prof. Vikram Singh'),
            'second_signatory_title': request.data.get('second_signatory_title', 'Director of Certification'),
            'primary_color': request.data.get('primary_color'),
            'secondary_color': request.data.get('secondary_color'),
            'accent_color': request.data.get('accent_color'),
            'institute_logo_base64': request.data.get('institute_logo_base64', ''),
            'issue_date': request.data.get('issue_date', datetime.now().strftime('%Y-%m-%d')),
        }

        # 4. Email flag
        send_emails = request.data.get('send_email') in [True, 'true', 'True', '1', 1]
        base_url = request.META.get('HTTP_ORIGIN') or getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

        # 5. Process batch
        try:
            result = generate_bulk_certificates_and_zip(
                user=request.user,
                template=template,
                recipients=recipients,
                common_data=common_data,
                send_emails=send_emails,
                base_url=base_url
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Bulk issuance failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='download-batch-zip', permission_classes=[IsAuthenticated])
    def download_batch_zip(self, request):
        """Download batch certificates ZIP file."""
        zip_filename = request.query_params.get('filename')
        if not zip_filename:
            return Response({'error': 'Filename is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        safe_name = os.path.basename(zip_filename)
        zip_path = os.path.join(settings.MEDIA_ROOT, 'batches', safe_name)
        if not os.path.exists(zip_path):
            return Response({'error': 'Batch ZIP archive not found.'}, status=status.HTTP_404_NOT_FOUND)

        with open(zip_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="{safe_name}"'
            return response

