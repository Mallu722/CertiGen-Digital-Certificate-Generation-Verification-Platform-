from rest_framework import serializers
from .models import VerificationLog


class VerificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationLog
        fields = ['id', 'certificate_id', 'verified_by_ip', 'verified_by_user_agent', 'verified_at', 'is_valid']
        read_only_fields = ['verified_at']
