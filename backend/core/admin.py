from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, University, Course, Material, PermissionRequest,
    ActiveSession, AccountDeletionQueue, AdminProfile,
    SubscriptionPlan, UserSubscription, PreApprovedWaiver,
    CourseTab, ContentNode, FlashcardSet, Flashcard, FlashcardProgress, PracticePaper,
    CourseExpert, ExpertQuestion, ExpertMessage,
    Announcement, ChatGroup, ChatMember, ChatInvite, InboxNotification,
    Ticket, TicketReply, ChatMessage, OAuthToken, CalendarEvent,
    MessageReport, AuditLog, PlatformSettings
)

admin.site.register(User)
admin.site.register(University)
admin.site.register(Course)
admin.site.register(Material)
admin.site.register(PermissionRequest)

admin.site.register(ActiveSession)
admin.site.register(AccountDeletionQueue)
admin.site.register(AdminProfile)
admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(PreApprovedWaiver)

admin.site.register(CourseTab)
admin.site.register(ContentNode)
admin.site.register(FlashcardSet)
admin.site.register(Flashcard)
admin.site.register(FlashcardProgress)
admin.site.register(PracticePaper)

admin.site.register(CourseExpert)
admin.site.register(ExpertQuestion)
admin.site.register(ExpertMessage)

admin.site.register(Announcement)
admin.site.register(ChatGroup)
admin.site.register(ChatMember)
admin.site.register(ChatInvite)
admin.site.register(InboxNotification)
admin.site.register(Ticket)
admin.site.register(TicketReply)
admin.site.register(ChatMessage)

admin.site.register(OAuthToken)
admin.site.register(CalendarEvent)
admin.site.register(MessageReport)
admin.site.register(AuditLog)
admin.site.register(PlatformSettings)
