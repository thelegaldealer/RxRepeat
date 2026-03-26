from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, University, Course, Material, PermissionRequest,
    ActiveSession, AccountDeletionQueue, AdminPermission,
    SubscriptionPlan, UserSubscription, FeeWaiver,
    Module, ContentPage, FlashcardSet, Flashcard, FlashcardProgress, PracticePaper,
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
admin.site.register(AdminPermission)
admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(FeeWaiver)

admin.site.register(Module)
admin.site.register(ContentPage)
admin.site.register(FlashcardSet)
admin.site.register(Flashcard)
admin.site.register(FlashcardProgress)
admin.site.register(PracticePaper)

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
