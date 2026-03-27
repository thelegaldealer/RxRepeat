from rest_framework import serializers
from .models import User, University, Course, Material, PermissionRequest, Year, CourseTab, ContentNode

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'password', 'password_confirm', 'university', 'course')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        if not data.get('university') or not data.get('course'):
            raise serializers.ValidationError({"error": "University and course are required."})
        from better_profanity import profanity
        if profanity.contains_profanity(data.get('first_name', '')) or profanity.contains_profanity(data.get('last_name', '')):
            raise serializers.ValidationError({"error": "Inappropriate name detected."})
        return data

    def create(self, validated_data):
        import random
        from .models import VerificationCode
        validated_data.pop('password_confirm')
        user = User.objects.create(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            university=validated_data.get('university'),
            course=validated_data.get('course'),
            is_active=False
        )
        user.set_password(validated_data['password'])
        user.save()

        code = str(random.randint(100000, 999999))
        VerificationCode.objects.create(user=user, code=code)
        
        from .utils import send_transactional_email
        send_transactional_email(
            to_email=user.email,
            subject="Welcome to UniMaster!",
            body=f"Hi {user.first_name},\n\nWelcome to UniMaster. Your account has been successfully created.\n\nThanks,\nThe UniMaster Team"
        )
        return user

class ContentNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentNode
        fields = '__all__'

class CourseTabSerializer(serializers.ModelSerializer):
    nodes = ContentNodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseTab
        fields = '__all__'

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    university_name = serializers.ReadOnlyField(source='university.name')

    class Meta:
        model = Course
        fields = '__all__'

class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.ReadOnlyField(source='uploaded_by.email')
    course_name = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'status', 'created_at')

class PermissionRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    university_name = serializers.ReadOnlyField(source='university.name')

    class Meta:
        model = PermissionRequest
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        from rest_framework_simplejwt.tokens import AccessToken
        from .models import ActiveSession
        from datetime import datetime, timezone

        access_token = AccessToken(data['access'])
        jti = access_token['jti']
        expires_at = datetime.fromtimestamp(access_token['exp'], tz=timezone.utc)

        # Single session enforcement: delete all existing sessions
        ActiveSession.objects.filter(user=self.user).delete()

        # Create new active session
        ActiveSession.objects.create(
            user=self.user,
            session_token=jti,
            expires_at=expires_at
        )

        return data

from .models import FlashcardSet, Flashcard, FlashcardProgress, PracticePaper

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = '__all__'

class FlashcardSetSerializer(serializers.ModelSerializer):
    cards = FlashcardSerializer(many=True, read_only=True)
    class Meta:
        model = FlashcardSet
        fields = '__all__'

class FlashcardProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashcardProgress
        fields = '__all__'
        read_only_fields = ('user',)

class PracticePaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticePaper
        fields = '__all__'

from .models import ChatGroup, ChatMember, ChatInvite, InboxNotification, Announcement

class ChatInviteSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.first_name')
    course_name = serializers.ReadOnlyField(source='course.name')
    class Meta:
        model = ChatInvite
        fields = '__all__'
        read_only_fields = ('sender', 'status')

class InboxNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboxNotification
        fields = '__all__'
        read_only_fields = ('user',)

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

from .models import Ticket

class AdministratorAnonymousTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'category', 'body', 'status', 'created_at']

class SuperAdminIdentifiedTicketSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Ticket
        fields = '__all__'
