from rest_framework import serializers
from .models import Template


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'category', 'image', 'image_url', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'image_url', 'created_at', 'updated_at']


class TemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'category', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']