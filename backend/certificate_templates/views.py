from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Template
from .serializers import TemplateSerializer, TemplateCreateSerializer
from accounts.permissions import IsAdmin


class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TemplateCreateSerializer
        return TemplateSerializer
    
    def get_permissions(self):
        # Mentors and other authenticated users can read (list, retrieve)
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Only Admins can create, update, partial_update, or destroy templates
        return [IsAdmin()]

