from rest_framework import viewsets, permissions, status, generics, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import University, Course, Material, PermissionRequest, User, Year, Module, ContentPage, UserSubscription, FeeWaiver, ChatMember, ChatInvite, ChatGroup, Ticket
from .permissions import IsSuperAdmin, CanEditContent, IsEnrolledStudent
from .serializers import (
    UniversitySerializer, CourseSerializer, 
    MaterialSerializer, PermissionRequestSerializer, UserSerializer, YearSerializer,
    ModuleSerializer, ContentPageSerializer,
    RegisterSerializer, AdministratorAnonymousTicketSerializer, SuperAdminIdentifiedTicketSerializer
)
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    filterset_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.AllowAny()]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = ['university', 'code']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.AllowAny()]

class YearViewSet(viewsets.ModelViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    filterset_fields = ['course']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.AllowAny()]

class CheckEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response({'exists': True})
        return Response({'exists': False})

class ActivateAdminView(APIView):
    permission_classes = [permissions.AllowAny] # In real app, verify token

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.is_active = True
            user.save()
            return Response({'status': 'activated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['course', 'file_type', 'status']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        material = self.get_object()
        material.status = 'approved'
        material.save()
        return Response({'status': 'material approved'})

class PermissionRequestViewSet(viewsets.ModelViewSet):
    queryset = PermissionRequest.objects.all()
    serializer_class = PermissionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .models import ActiveSession
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            raw_token = auth_header.split(' ')[1]
            try:
                access_token = AccessToken(raw_token)
                jti = access_token['jti']
                ActiveSession.objects.filter(user=request.user, session_token=jti).delete()
            except Exception:
                pass
        return Response({'status': 'logged out successfully'}, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    filterset_fields = ['course']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Module.objects.none()
            
        if user.role in ['admin', 'super_admin']:
            return Module.objects.all()
            
        from django.utils import timezone
        now = timezone.now()
        subs = UserSubscription.objects.filter(
            user=user, status='active', current_period_end__gte=now
        ).values_list('course_id', flat=True)
        
        waivers = FeeWaiver.objects.filter(
            user=user, expiry_date__gte=now
        ).values_list('courses__id', flat=True)
        
        allowed_course_ids = set(list(subs) + list(waivers))
        return Module.objects.filter(course_id__in=allowed_course_ids)

class ContentPageViewSet(viewsets.ModelViewSet):
    serializer_class = ContentPageSerializer
    filterset_fields = ['module', 'content_type']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ContentPage.objects.none()
            
        if user.role in ['admin', 'super_admin']:
            return ContentPage.objects.all()
            
        from django.utils import timezone
        now = timezone.now()
        subs = UserSubscription.objects.filter(
            user=user, status='active', current_period_end__gte=now
        ).values_list('course_id', flat=True)
        
        waivers = FeeWaiver.objects.filter(
            user=user, expiry_date__gte=now
        ).values_list('courses__id', flat=True)
        
        allowed_course_ids = set(list(subs) + list(waivers))
        return ContentPage.objects.filter(module__course_id__in=allowed_course_ids)

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from .models import VerificationCode, User
        email = request.data.get('email')
        code = request.data.get('code')
        try:
            user = User.objects.get(email=email)
            verification = VerificationCode.objects.get(user=user, code=code)
            
            if timezone.now() > verification.created_at + timedelta(minutes=15):
                return Response({'error': 'Code expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            user.is_active = True
            user.save()
            verification.delete()
            return Response({'status': 'verified'})
            
        except (User.DoesNotExist, VerificationCode.DoesNotExist):
            return Response({'error': 'Invalid code or email'}, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        import os
        from rest_framework_simplejwt.tokens import RefreshToken
        from .serializers import UserSerializer

        token = request.data.get('id_token')
        if not token:
            return Response({'error': 'id_token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client_id = os.environ.get('GOOGLE_CLIENT_ID', 'placeholder')
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
            
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
                'username': email
            })
            
            if created:
                user.set_unusable_password()
                user.save()
            elif not user.is_active:
                user.is_active = True
                user.save()
            
            from .serializers import CustomTokenObtainPairSerializer
            from .models import ActiveSession
            from rest_framework_simplejwt.tokens import AccessToken
            from datetime import datetime, timezone

            refresh = CustomTokenObtainPairSerializer.get_token(user)
            access = str(refresh.access_token)
            
            access_token_obj = AccessToken(access)
            jti = access_token_obj['jti']
            expires_at = datetime.fromtimestamp(access_token_obj['exp'], tz=timezone.utc)
            
            ActiveSession.objects.filter(user=user).delete()
            ActiveSession.objects.create(user=user, session_token=jti, expires_at=expires_at)

            return Response({
                'access': access,
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class SuperadminSubscriberView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.utils import timezone
        now = timezone.now()
        from .models import User
        
        subscribers = User.objects.filter(
            subscriptions__status='active', 
            subscriptions__current_period_end__gte=now
        ).distinct()
        
        data = []
        for user in subscribers:
            subs = user.subscriptions.filter(status='active', current_period_end__gte=now).select_related('course__university')
            course_titles = [f"{s.course.university.name} - {s.course.name}" for s in subs]
            data.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'subscribed_courses': course_titles
            })
            
        return Response(data)

class MyCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        now = timezone.now()
        user = request.user
        
        subs = UserSubscription.objects.filter(
            user=user, status='active', current_period_end__gte=now
        ).values_list('course_id', flat=True)
        
        waivers = FeeWaiver.objects.filter(
            user=user, expiry_date__gte=now
        ).values_list('courses__id', flat=True)
        
        allowed_course_ids = set(list(subs) + list(waivers))
        
        courses = Course.objects.filter(id__in=allowed_course_ids).select_related('university')
        from .serializers import CourseSerializer
        return Response(CourseSerializer(courses, many=True).data)

from .models import FlashcardSet, FlashcardProgress, PracticePaper
from .serializers import FlashcardSetSerializer, FlashcardProgressSerializer, PracticePaperSerializer

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    filterset_fields = ['module']
    permission_classes = [permissions.IsAuthenticated]

class FlashcardProgressViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardProgressSerializer
    filterset_fields = ['card']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FlashcardProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PracticePaperViewSet(viewsets.ModelViewSet):
    queryset = PracticePaper.objects.all()
    serializer_class = PracticePaperSerializer
    filterset_fields = ['module']
    permission_classes = [permissions.IsAuthenticated]

from .models import ChatGroup, ChatMember, ChatInvite, InboxNotification, Announcement
from .serializers import ChatInviteSerializer, InboxNotificationSerializer, AnnouncementSerializer
from rest_framework.decorators import action

class AnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Announcement.objects.all().order_by('-created_at')

class InboxNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = InboxNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InboxNotification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'read'})

class ChatInviteViewSet(viewsets.ModelViewSet):
    serializer_class = ChatInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatInvite.objects.filter(receiver=self.request.user)

    def perform_create(self, serializer):
        receiver = serializer.validated_data['receiver']
        target_course = serializer.validated_data['course']
        
        sender_in_course = UserSubscription.objects.filter(user=self.request.user, course=target_course, status='active').exists() or FeeWaiver.objects.filter(user=self.request.user, courses=target_course).exists()
        receiver_in_course = UserSubscription.objects.filter(user=receiver, course=target_course, status='active').exists() or FeeWaiver.objects.filter(user=receiver, courses=target_course).exists()
        
        if not (sender_in_course and receiver_in_course):
            raise exceptions.PermissionDenied("Cross-course invites are forbidden.")
            
        sender_chats = ChatMember.objects.filter(user=self.request.user, group__course=target_course).count() + ChatInvite.objects.filter(sender=self.request.user, status='pending').count()
        if sender_chats >= 2:
            raise exceptions.ValidationError("Maximum number of private chats reached.")
            
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()
        if invite.receiver != request.user:
            return Response({'error': 'Unauthorized'}, status=403)
        invite.status = 'accepted'
        invite.save()
        
        group = ChatGroup.objects.create(type='private', course=invite.course)
        ChatMember.objects.create(user=invite.sender, group=group)
        ChatMember.objects.create(user=invite.receiver, group=group)
        
        InboxNotification.objects.filter(user=request.user, notification_type='chat_invite', reference_id=invite.id).update(is_read=True)
        return Response({'status': 'accepted', 'group_id': group.id})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invite = self.get_object()
        if invite.receiver != request.user:
            return Response({'error': 'Unauthorized'}, status=403)
        invite.status = 'rejected'
        invite.save()
        InboxNotification.objects.filter(user=request.user, notification_type='chat_invite', reference_id=invite.id).update(is_read=True)
        return Response({'status': 'rejected'})

class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['super_admin', 'admin']:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.user.role == 'super_admin':
            return SuperAdminIdentifiedTicketSerializer
        return AdministratorAnonymousTicketSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
