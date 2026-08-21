from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import VerificationLog
from .serializers import VerificationLogSerializer


class VerificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VerificationLog.objects.all()
    serializer_class = VerificationLogSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_certificate_view(request, certificate_id):
    """Verify a certificate publicly"""
    try:
        from certificates.models import Certificate
        certificate = Certificate.objects.get(verification_id=certificate_id)
        from .models import VerificationLog
        VerificationLog.objects.create(
            certificate_id=str(certificate.verification_id),
            verified_by_ip=request.META.get('REMOTE_ADDR'),
            verified_by_user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            is_valid=True
        )
        return Response({
            'certificate': {
                'id': certificate.id,
                'certificate_number': certificate.certificate_number,
                'title': certificate.title,
                'description': certificate.description,
                'recipient_name': certificate.recipient_name,
                'recipient_email': certificate.recipient_email,
                'issued_at': certificate.issued_at.isoformat(),
                'verified': certificate.verified
            },
            'valid': True,
            'verified_at': certificate.issued_at.isoformat()
        })
    except Certificate.DoesNotExist:
        return Response({
            'error': 'Certificate not found',
            'valid': False
        }, status=status.HTTP_404_NOT_FOUND)
