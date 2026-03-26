from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('super_admin', 'Super Admin'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)

    def __str__(self):
        return self.email

class VerificationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_code')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.code}"

class University(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='university_logos/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Year(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='years')
    year_number = models.IntegerField()

    class Meta:
        unique_together = ('course', 'year_number')
        ordering = ['year_number']

    def __str__(self):
        return f"{self.course.code} - Year {self.year_number}"

class Material(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    TYPE_CHOICES = (
        ('lecture', 'Lecture Notes'),
        ('exam', 'Exam Paper'),
        ('assignment', 'Assignment'),
        ('other', 'Other'),
    )

    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='materials/')
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class PermissionRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    proof_file = models.FileField(upload_to='proofs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.university.name}"

# --- AUTH & ACCOUNT MODELS ---
class ActiveSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    session_token = models.CharField(max_length=255, unique=True)
    last_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Session for {self.user.email}"

class AccountDeletionQueue(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='deletion_queue')
    scheduled_deletion_date = models.DateTimeField()
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Deletion scheduled for {self.user.email} on {self.scheduled_deletion_date}"

# --- ROLES & PERMISSIONS ---
class AdminPermission(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_permissions')
    can_view_content = models.BooleanField(default=False)
    can_edit_content = models.BooleanField(default=False)
    can_view_complaints = models.BooleanField(default=False)
    can_answer_complaints = models.BooleanField(default=False)
    can_moderate_forums = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=False)

    def __str__(self):
        return f"Permissions for {self.user.email}"

# --- BILLING & SUBSCRIPTIONS ---
class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    stripe_price_id = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interval = models.CharField(max_length=20, choices=[('month', 'Monthly'), ('year', 'Yearly')])

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('canceling', 'Canceling'),
        ('canceled', 'Canceled'),
        ('past_due', 'Past Due'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='subscriptions')
    stripe_sub_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_period_end = models.DateTimeField()

    def __str__(self):
        return f"{self.user.email} -> {self.course.name} ({self.status})"

class FeeWaiver(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fee_waivers')
    courses = models.ManyToManyField(Course, related_name='fee_waivers')
    start_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()

    def __str__(self):
        return f"Waiver for {self.user.email} until {self.expiry_date}"

# --- COURSES EXTENSIONS ---
class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.code} - {self.title}"

# --- CONTENT & STUDY MODELS ---
class ContentPage(models.Model):
    TYPE_CHOICES = (
        ('content', 'Content'),
        ('condensed_notes', 'Condensed Notes'),
    )
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='pages')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    content_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='content')
    title = models.CharField(max_length=255)
    body_json = models.JSONField(default=dict)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} (Module: {self.module.title})"

class FlashcardSet(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='flashcard_sets')
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Flashcard(models.Model):
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='cards')
    front = models.TextField()
    back = models.TextField()

    def __str__(self):
        return f"Card: {self.front[:20]}..."

class FlashcardProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_progress')
    card = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='progress')
    is_starred = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    last_reviewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'card')

    def __str__(self):
        return f"Progress {self.user.email} -> Card {self.card.id}"

class PracticePaper(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='practice_papers')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField(null=True, blank=True)
    tag = models.CharField(max_length=100, blank=True)
    file_url = models.URLField(max_length=500)
    answer_key_url = models.URLField(max_length=500, blank=True, null=True)
    timed_attempt_duration = models.IntegerField(null=True, blank=True, help_text="Duration in minutes")

    def __str__(self):
        return self.title

# --- INBOX & COMMUNITY MODELS ---
class Announcement(models.Model):
    SCOPE_CHOICES = (
        ('everyone', 'Everyone'),
        ('specific_universities', 'Specific Universities'),
        ('specific_courses', 'Specific Courses'),
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    audience_type = models.CharField(max_length=50, choices=SCOPE_CHOICES, default='everyone')
    target_universities = models.ManyToManyField(University, blank=True)
    target_courses = models.ManyToManyField(Course, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ChatGroup(models.Model):
    TYPE_CHOICES = (
        ('course', 'Course Wide'),
        ('private', 'Private Chat'),
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chat_groups')

    def __str__(self):
        return f"{self.type} - {self.course.code}"

class ChatMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'group')

class ChatInvite(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invites')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invites')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver', 'status')

class InboxNotification(models.Model):
    TYPE_CHOICES = (
        ('chat_invite', 'Chat Invite'),
        ('system', 'System Alert'),
        ('ticket_reply', 'Ticket Reply'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='system')
    reference_id = models.IntegerField(null=True, blank=True)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email}"

class Ticket(models.Model):
    CATEGORY_CHOICES = (
        ('suggestion', 'Suggestion'),
        ('complaint', 'Complaint'),
    )
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

class TicketReply(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='replies')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    attachment_url = models.URLField(max_length=500, blank=True, null=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# --- CALENDAR & OAUTH MODELS ---
class OAuthToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_tokens')
    provider = models.CharField(max_length=50, default='microsoft')
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField()

class CalendarEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=255)
    start = models.DateTimeField()
    end = models.DateTimeField()
    is_external = models.BooleanField(default=False)
    external_id = models.CharField(max_length=255, blank=True, null=True)

# --- MODERATION & AUDIT MODELS ---
class MessageReport(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.message.reports.count() >= 3:
            self.message.is_hidden = True
            self.message.save()

    class Meta:
        unique_together = ('message', 'reporter')

class AuditLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100)
    target_id = models.IntegerField(null=True, blank=True)
    changes_before = models.JSONField(blank=True, null=True)
    changes_after = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class PlatformSettings(models.Model):
    is_maintenance_mode = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Platform Settings"
