"""
URL configuration for unimaster_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from rest_framework.routers import DefaultRouter
from core.views import (
    UniversityViewSet, CourseViewSet, 
    MaterialViewSet, PermissionRequestViewSet, RegisterView,
    CustomTokenObtainPairView, UserViewSet, YearViewSet, CheckEmailView, ActivateAdminView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

"""
URL configuration for unimaster_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from rest_framework.routers import DefaultRouter
from core.views import (
    UniversityViewSet, CourseViewSet, 
    MaterialViewSet, PermissionRequestViewSet, RegisterView,
    CustomTokenObtainPairView, UserViewSet, YearViewSet, CheckEmailView, ActivateAdminView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from core.views_ai import chat_with_ai

router = DefaultRouter()
router.register(r'universities', UniversityViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'permissions', PermissionRequestViewSet)
router.register(r'users', UserViewSet)
router.register(r'years', YearViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/check-email/', CheckEmailView.as_view(), name='check_email'),
    path('api/activate-admin/', ActivateAdminView.as_view(), name='activate_admin'),
    path('api/chat-ai/', chat_with_ai, name='chat_with_ai'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
