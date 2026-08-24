"""
URL configuration for certigen_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from certigen_backend.views import health_check
from rest_framework.routers import DefaultRouter
from accounts import views as account_views
from categories import views as category_views
from certificate_templates import views as template_views
from certificates import views as certificate_views

router = DefaultRouter()
router.register(r'accounts', account_views.UserViewSet, basename='account')
router.register(r'categories', category_views.CategoryViewSet, basename='category')
router.register(r'templates', template_views.TemplateViewSet, basename='template')
router.register(r'certificates', certificate_views.CertificateViewSet, basename='certificate')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    # Auth endpoints
    path('api/accounts/register/', account_views.register_view, name='register'),
    path('api/accounts/login/', account_views.login_view, name='login'),
    path('api/accounts/profile/', account_views.profile_view, name='profile'),
    path('api/accounts/profile/update/', account_views.profile_update_view, name='profile-update'),
    path('api/accounts/refresh/', account_views.token_refresh_view, name='token-refresh'),
    # Verification endpoint
    path('api/verify/<str:certificate_id>/', certificate_views.CertificateViewSet.as_view({'get': 'verify'}), name='verify-certificate'),
    
    # Router endpoints (CRUD)
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)