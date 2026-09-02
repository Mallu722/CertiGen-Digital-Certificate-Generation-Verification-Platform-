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
