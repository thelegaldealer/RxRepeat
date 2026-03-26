from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'super_admin')

class IsAdminUserWithPermission(permissions.BasePermission):
    permission_flag = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == 'super_admin':
            return True
            
        if request.user.role == 'admin':
            if hasattr(request.user, 'adminpermission'):
                return getattr(request.user.adminpermission, self.permission_flag, False)
                
        return False

class CanViewAnalytics(IsAdminUserWithPermission):
    permission_flag = 'can_view_analytics'

class CanEditContent(IsAdminUserWithPermission):
    permission_flag = 'can_edit_content'

class CanModerateForums(IsAdminUserWithPermission):
    permission_flag = 'can_moderate_forums'

class CanAnswerComplaints(IsAdminUserWithPermission):
    permission_flag = 'can_answer_complaints'

class IsEnrolledStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')
