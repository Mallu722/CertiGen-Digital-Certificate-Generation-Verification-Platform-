from rest_framework import serializers
from .models import Template


class TemplateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    access_password = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'purpose', 'title_prefix', 'subtitle', 
            'presentation_line', 'wording_pattern', 'primary_color', 'secondary_color', 
            'accent_color', 'badge_text', 'category', 'category_name', 'image', 'image_url', 
            'is_active', 'is_private', 'access_password', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'image_url', 'category_name', 'access_password', 'created_at', 'updated_at']

    def get_access_password(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'ADMIN':
            return obj.access_password
        return None


class TemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'purpose', 'title_prefix', 'subtitle', 
            'presentation_line', 'wording_pattern', 'primary_color', 'secondary_color', 
            'accent_color', 'badge_text', 'category', 'image', 'is_active', 
            'is_private', 'access_password', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
