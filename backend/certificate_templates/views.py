from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Template
from .serializers import TemplateSerializer, TemplateCreateSerializer


class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TemplateCreateSerializer
        return TemplateSerializer
    
    permission_classes = [IsAuthenticated]
