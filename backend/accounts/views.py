import requests
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

# ============================================================
# LOCKED ADMIN CREDENTIALS — Only this account can be Admin
# ============================================================
ADMIN_EMAIL = 'mallikarjunhiremath0722@gmail.com'
ADMIN_PASSWORD = 'Mallu@722'


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user — ADMIN role is not allowed via registration."""
    data = request.data.copy()

    # SECURITY: Nobody can self-register as ADMIN
    if data.get('role', 'MENTOR').upper() == 'ADMIN':
        return Response(
            {'error': 'Administrator accounts cannot be created via registration. Contact your system administrator.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = UserRegisterSerializer(data=data)
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
    """Login and get JWT tokens. Admin portal is restricted to one fixed account."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        from django.contrib.auth import authenticate
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        expected_role = request.data.get('role')  # 'ADMIN' or 'MENTOR'

        # ---------------------------------------------------------------
        # SECURITY GATE: Only the real admin email can access ADMIN portal
        # ---------------------------------------------------------------
        if expected_role == 'ADMIN' and email.lower() != ADMIN_EMAIL.lower():
            return Response(
                {'error': 'Access denied. Administrator portal is restricted to authorized personnel only.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Always ensure the real admin account exists with the correct credentials
        if email.lower() == ADMIN_EMAIL.lower():
            admin_user, _ = User.objects.get_or_create(
                email=ADMIN_EMAIL,
                defaults={
                    'username': 'mallikarjun_admin',
                    'first_name': 'Mallikarjun',
                    'last_name': 'Hiremath',
                    'role': 'ADMIN',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            # Always keep password and role correct
            admin_user.set_password(ADMIN_PASSWORD)
            admin_user.role = 'ADMIN'
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            admin_user.save()

        user = authenticate(request=request, email=email, password=password)
        if not user:
            user = authenticate(request=request, username=email, password=password)
        if not user:
            # Direct check fallback for custom user model
            candidate = User.objects.filter(email=email).first()
            if candidate and candidate.check_password(password):
                user = candidate
        
        if user and user.is_active:
            # If the user specified a portal role, check match
            if expected_role and user.role != expected_role:
                user_role_name = "Administrator" if user.role == 'ADMIN' else "Mentor"
                return Response(
                    {'error': f"Account '{email}' is registered as {user_role_name}. Please use the {user_role_name} portal instead."},
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
    Handle Google OAuth login with role specification.
    SECURITY: Only ADMIN_EMAIL can get the ADMIN role via OAuth.
    All other emails are forced to MENTOR regardless of selected role.
    """
    provider = request.data.get('provider', 'google').lower()
    selected_role = request.data.get('role', 'MENTOR')
    token = request.data.get('token')
    
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    username = request.data.get('username')

    if provider == 'google' and token:
        try:
            # 1. Try verifying as access_token via userinfo (headers only as per RFC 6750)
            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10
            )
            if response.status_code == 200:
                google_data = response.json()
                email = google_data.get('email') or email
                first_name = google_data.get('given_name', '') or first_name
                last_name = google_data.get('family_name', '') or last_name
            else:
                # 2. Try verifying as access_token via tokeninfo
                token_res = requests.get(
                    f'https://oauth2.googleapis.com/tokeninfo?access_token={token}',
                    timeout=10
                )
                if token_res.status_code == 200:
                    g_data = token_res.json()
                    email = g_data.get('email') or email
                else:
                    # 3. Try verifying as id_token via tokeninfo
                    id_res = requests.get(
                        f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
                        timeout=10
                    )
                    if id_res.status_code == 200:
                        id_data = id_res.json()
                        email = id_data.get('email') or email
                        first_name = id_data.get('given_name', '') or first_name
                        last_name = id_data.get('family_name', '') or last_name
        except Exception as e:
            if not email:
                return Response({'error': f'Failed to verify Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    if not email:
        return Response({'error': 'Email is required for OAuth authentication.'}, status=status.HTTP_400_BAD_REQUEST)

    # SECURITY: Only the real admin email can have ADMIN role via OAuth
    if selected_role == 'ADMIN' and email.lower() != ADMIN_EMAIL.lower():
        return Response(
            {'error': 'Administrator access via OAuth is restricted to authorized personnel only.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Force non-admin emails to MENTOR role
    if email.lower() != ADMIN_EMAIL.lower():
        selected_role = 'MENTOR'

    user = User.objects.filter(email=email).first()
    if not user:
        if not username:
            base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
            username = f"{base_username}_{provider}"

        # Collision-proof username generation
        base_candidate = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_candidate}_{counter}"
            counter += 1

        try:
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
        except Exception as e:
            return Response({'error': f'Failed to create user account: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        # Update role only if this is the admin email OR downgrade others to MENTOR
        if email.lower() == ADMIN_EMAIL.lower():
            user.role = 'ADMIN'
            user.is_staff = True
            user.is_superuser = True
        else:
            # Non-admin users always stay as MENTOR regardless of request
            user.role = 'MENTOR'
            user.is_staff = False
            user.is_superuser = False
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