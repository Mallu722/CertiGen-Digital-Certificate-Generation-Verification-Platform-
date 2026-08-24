import os
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.conf import settings
from .models import Certificate
from .serializers import CertificateSerializer, CertificateCreateSerializer, CertificateVerifySerializer
from verification.models import VerificationLog


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'issue']:
            return CertificateCreateSerializer
        return CertificateSerializer
    
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'verify':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='verify/(?P<certificate_id>[^/.]+)')
    def verify(self, request, certificate_id=None):
        """Verify a certificate by ID"""
        try:
            certificate = Certificate.objects.get(verification_id=certificate_id)
            VerificationLog.objects.create(
                certificate_id=str(certificate.verification_id),
                verified_by_ip=request.META.get('REMOTE_ADDR'),
                verified_by_user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                is_valid=True
            )
            return Response({
                'certificate': CertificateSerializer(certificate).data,
                'valid': True,
                'verified_at': certificate.issued_at.isoformat()
            })
        except Certificate.DoesNotExist:
            return Response({
                'error': 'Certificate not found',
                'valid': False
            }, status=status.HTTP_404_NOT_FOUND)
