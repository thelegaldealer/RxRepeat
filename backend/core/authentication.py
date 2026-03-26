from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from .models import ActiveSession

class SingleSessionJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        # Custom check for active session
        jti = validated_token.get('jti')
        if not ActiveSession.objects.filter(user=user, session_token=jti).exists():
            raise AuthenticationFailed(
                _('Session invalidated. Note: Logging in on a new device logs you out from the previous device.'),
                code='session_invalidated'
            )
            
        return user, validated_token
