from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField()
    recipient_email = serializers.EmailField()
    pdf_url = serializers.SerializerMethodField()
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'title', 'description', 'template',
            'recipient_name', 'recipient_email', 'achievement', 'organization_name',
            'signatory_name', 'signatory_title', 'metadata', 'issued_by', 'issued_at',
            'status', 'revoked_at', 'revocation_reason',
            'verified', 'verification_id', 'pdf_url', 'qr_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'issued_by', 'issued_at', 'verified', 'verification_id',
            'pdf_url', 'qr_url', 'created_at', 'updated_at'
        ]

    def get_pdf_url(self, obj):
        return f"/api/certificates/{obj.id}/download/"

    def get_qr_url(self, obj):
        return f"/api/certificates/{obj.id}/qr/"


class CertificateCreateSerializer(serializers.ModelSerializer):
    certificate_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'title', 'description', 'template',
            'recipient_name', 'recipient_email', 'achievement', 'organization_name',
            'signatory_name', 'signatory_title', 'metadata', 'verification_id', 
            'issued_by', 'issued_at', 'status'
        ]
        read_only_fields = ['id', 'verification_id', 'issued_by', 'issued_at']



class CertificateVerifySerializer(serializers.Serializer):
    certificate_id = serializers.CharField()


class CertificateRevokeSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)

