from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
        # Mentors and other authenticated users can read (list, retrieve, unlock)
        if self.action in ['list', 'retrieve', 'unlock']:
            return [IsAuthenticated()]
        # Only Admins can create, update, partial_update, or destroy templates
        return [IsAdmin()]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unlock(self, request, pk=None):
        """Validate access password for a private template."""
        template = self.get_object()
        
        # Admin can always access
        if getattr(request.user, 'role', '') == 'ADMIN':
            return Response({'status': 'unlocked', 'message': 'Admin bypass granted.'})
            
        if not template.is_private:
            return Response({'status': 'unlocked', 'message': 'Template is public.'})
            
        provided_password = request.data.get('password', '').strip()
        if template.access_password and provided_password == template.access_password.strip():
            return Response({'status': 'unlocked', 'message': 'Template unlocked successfully.'})
            
        return Response(
            {'error': 'Invalid access password for this private template. Please contact an Administrator.'},
            status=status.HTTP_403_FORBIDDEN
        )


