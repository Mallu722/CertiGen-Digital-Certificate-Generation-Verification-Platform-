from rest_framework import serializers
from .models import Template


class TemplateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'purpose', 'title_prefix', 'subtitle', 
            'presentation_line', 'wording_pattern', 'primary_color', 'secondary_color', 
            'accent_color', 'badge_text', 'category', 'category_name', 'image', 'image_url', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'image_url', 'category_name', 'created_at', 'updated_at']


class TemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'purpose', 'title_prefix', 'subtitle', 
            'presentation_line', 'wording_pattern', 'primary_color', 'secondary_color', 
            'accent_color', 'badge_text', 'category', 'image', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']