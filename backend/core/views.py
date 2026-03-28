from rest_framework import viewsets, permissions, status, generics, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import University, Course, Material, PermissionRequest, User, Year, CourseTab, ContentNode, UserSubscription, PreApprovedWaiver, ChatMember, ChatInvite, ChatGroup, Ticket
from .permissions import IsOwner, CanManageContent, IsEnrolledStudent
from .serializers import (
    UniversitySerializer, CourseSerializer, 
    MaterialSerializer, PermissionRequestSerializer, UserSerializer, YearSerializer,
    CourseTabSerializer, ContentNodeSerializer,
    RegisterSerializer, AdministratorAnonymousTicketSerializer, SuperAdminIdentifiedTicketSerializer
)

def _get_allowed_courses_for_admin(user):
    from django.db.models import Q
    if user.role == 'owner':
        return Course.objects.all()
    if not hasattr(user, 'admin_profile'):
        return Course.objects.none()
    profile = user.admin_profile
    if profile.is_global:
        return Course.objects.all()
    
    return Course.objects.filter(
        Q(admin_profiles=profile) | Q(university__admin_profiles=profile)
    ).distinct()
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
            return [IsOwner()]
        return [permissions.AllowAny()]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = ['university', 'code']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOwner()]#
        return [permissions.AllowAny()]

class YearViewSet(viewsets.ModelViewSet):
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    filterset_fields = ['course']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOwner()]
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

class CourseTabViewSet(viewsets.ModelViewSet):
    serializer_class = CourseTabSerializer
    filterset_fields = ['course', 'tab_type']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageContent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return CourseTab.objects.none()
            
        if user.role in ['admin', 'owner']:
            allowed_courses = _get_allowed_courses_for_admin(user)
            return CourseTab.objects.filter(course__in=allowed_courses)
            
        if user.role == 'student' and user.course_id:
            return CourseTab.objects.filter(course_id=user.course_id)
            
        return CourseTab.objects.none()

class ContentNodeViewSet(viewsets.ModelViewSet):
    serializer_class = ContentNodeSerializer
    filterset_fields = ['tab', 'parent', 'node_type']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CanManageContent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ContentNode.objects.none()
            
        if user.role in ['admin', 'owner']:
            allowed_courses = _get_allowed_courses_for_admin(user)
            return ContentNode.objects.filter(tab__course__in=allowed_courses)
            
        if user.role == 'student' and user.course_id:
            return ContentNode.objects.filter(tab__course_id=user.course_id)
            
        return ContentNode.objects.none()

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
                
            # Role-aware registration completeness check
            # Owner: only needs first_name + last_name (no university/course required)
            # Admin: needs first_name + last_name + university + course
            # Student: needs first_name + last_name + university + course
            is_incomplete = False
            if not user.first_name or not user.last_name:
                is_incomplete = True
            elif user.role != 'owner' and (not user.university_id or not user.course_id):
                is_incomplete = True

            if is_incomplete:
                return Response({
                    'registration_incomplete': True,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }, status=status.HTTP_200_OK)
            
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
    permission_classes = [IsOwner]

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
        user = request.user
        if user.role in ['admin', 'owner']:
            courses = _get_allowed_courses_for_admin(user).select_related('university')
        else:
            if user.role == 'student' and user.course:
                courses = Course.objects.filter(id=user.course.id).select_related('university')
            else:
                courses = Course.objects.none()
                
        from .serializers import CourseSerializer
        return Response(CourseSerializer(courses, many=True).data)

from .models import FlashcardSet, FlashcardProgress, PracticePaper
from .serializers import FlashcardSetSerializer, FlashcardProgressSerializer, PracticePaperSerializer

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    filterset_fields = ['node']
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
    filterset_fields = ['node']
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
        
        sender_in_course = getattr(self.request.user, 'course_id', None) == target_course.id or UserSubscription.objects.filter(user=self.request.user, course=target_course, status='active').exists()
        receiver_in_course = getattr(receiver, 'course_id', None) == target_course.id or UserSubscription.objects.filter(user=receiver, course=target_course, status='active').exists()
        
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
        if self.request.user.role in ['owner', 'admin']:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.user.role == 'owner':
            return SuperAdminIdentifiedTicketSerializer
        return AdministratorAnonymousTicketSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OnboardingView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        university_id = request.data.get('university')
        course_id = request.data.get('course')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate required fields based on role
        if not first_name or not last_name:
            return Response({'error': 'First name and last name are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Only owner bypasses university/course. Admin and student both require them.
        if user.role != 'owner' and (not university_id or not course_id):
            return Response({'error': 'University and course are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.first_name = first_name
        user.last_name = last_name
        if university_id:
            user.university_id = university_id
        if course_id:
            user.course_id = course_id
            
        user.is_active = True
        user.save()
        
        from .serializers import CustomTokenObtainPairSerializer, UserSerializer
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
