from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'owner')

class IsAdminUserWithPermission(permissions.BasePermission):
    permission_flag = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == 'owner':
            return True
            
        if request.user.role == 'admin':
            if hasattr(request.user, 'admin_profile'):
                return getattr(request.user.admin_profile, self.permission_flag, False)
                
        return False

class CanManageContent(IsAdminUserWithPermission):
    permission_flag = 'can_manage_content'

class CanViewExpertMessages(IsAdminUserWithPermission):
    permission_flag = 'can_view_expert_messages'

class IsEnrolledStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'student' and 
            request.user.university_id and 
            request.user.course_id
        )
