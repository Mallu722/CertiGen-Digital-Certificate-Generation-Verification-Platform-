from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserSerializer, 
    UserRegisterSerializer, 
    UserAdminSerializer,
    LoginSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login and get JWT tokens with optional role validation"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        from django.contrib.auth import authenticate
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        expected_role = request.data.get('role')  # 'ADMIN' or 'MENTOR'

        # Auto-ensure demo accounts exist if logging in with demo credentials
        if email == 'admin@example.com' and password == 'password':
            u, _ = User.objects.get_or_create(
                email='admin@example.com',
                defaults={'username': 'admin_master', 'first_name': 'System', 'last_name': 'Administrator', 'role': 'ADMIN', 'is_staff': True, 'is_superuser': True}
            )
            u.set_password('password')
            u.role = 'ADMIN'
            u.is_staff = True
            u.save()
        elif email == 'mentor@example.com' and password == 'password':
            u, _ = User.objects.get_or_create(
                email='mentor@example.com',
                defaults={'username': 'mentor_master', 'first_name': 'Alex', 'last_name': 'Mentor', 'role': 'MENTOR', 'is_staff': False}
            )
            u.set_password('password')
            u.role = 'MENTOR'
            u.is_staff = False
            u.save()

        user = authenticate(email=email, password=password)
        
        if user and user.is_active:
            # If the user specified a portal role, check match
            if expected_role and user.role != expected_role:
                portal_name = "Administrator" if expected_role == 'ADMIN' else "Mentor"
                user_role_name = "Administrator" if user.role == 'ADMIN' else "Mentor"
                return Response(
                    {'error': f"Account '{email}' is registered as {user_role_name}. Please switch to the {user_role_name} portal."},
                    status=status.HTTP_403_FORBIDDEN
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response(
            {'error': 'Invalid email or password. Please check your credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_login_view(request):
    """
    Handle Google / GitHub OAuth login with role specification.
    Creates or logs in user with provider profile info and selected role.
    """
    email = request.data.get('email')
    provider = request.data.get('provider', 'google').lower()
    selected_role = request.data.get('role', 'MENTOR')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    username = request.data.get('username')

    if not email:
        return Response({'error': 'Email is required for OAuth login.'}, status=status.HTTP_400_BAD_REQUEST)

    if not username:
        base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
        username = f"{base_username}_{provider}"

    user = User.objects.filter(email=email).first()
    if not user:
        # Create new user with selected role
        is_admin = (selected_role == 'ADMIN')
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name or f"{provider.capitalize()} User",
            last_name=last_name or '',
            role=selected_role,
            is_staff=is_admin,
            is_superuser=is_admin
        )
        user.set_unusable_password()
        user.save()
    else:
        # Ensure user role aligns with the selected portal role
        if selected_role and user.role != selected_role:
            user.role = selected_role
            if selected_role == 'ADMIN':
                user.is_staff = True
            user.save()


    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
        'provider': provider
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def profile_update_view(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User ViewSet for full CRUD
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        # Admin can see all users, regular users can only see themselves
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """Refresh JWT token"""
    from rest_framework_simplejwt.serializers import TokenRefreshSerializer
    serializer = TokenRefreshSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)