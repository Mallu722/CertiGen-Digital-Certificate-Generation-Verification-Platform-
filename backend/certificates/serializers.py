from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField()
    recipient_email = serializers.EmailField()
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'title', 'description', 'template',
            'recipient_name', 'recipient_email', 'issued_by', 'issued_at',
            'verified', 'verification_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'issued_by', 'issued_at', 'verified', 'verification_id', 'created_at', 'updated_at']


class CertificateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = [
            'certificate_number', 'title', 'description', 'template',
            'recipient_name', 'recipient_email'
        ]


class CertificateVerifySerializer(serializers.Serializer):
    certificate_id = serializers.CharField()
