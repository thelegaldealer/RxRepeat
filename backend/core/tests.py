from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import User, ActiveSession, University, Course, Module, FeeWaiver, ChatGroup, ChatMember, ChatInvite, ChatMessage, MessageReport, Ticket, TicketReply
from datetime import timedelta
from django.utils import timezone

class AuthAndRoleTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student@test.com', email='student@test.com', password='password123', role='student'
        )
        self.super_admin = User.objects.create_superuser(
            username='admin@test.com', email='admin@test.com', password='password123', role='super_admin'
        )
        self.university = University.objects.create(name="Test Uni")
        self.course = Course.objects.create(university=self.university, name="Math 101", code="M101")
        self.module = Module.objects.create(course=self.course, title="Algebra", order=1)

    def test_single_session_invalidation(self):
        """Test that logging in twice invalidates the first token."""
        url = reverse('token_obtain_pair')
        
        # Login 1
        resp1 = self.client.post(url, {'email': 'student@test.com', 'password': 'password123'})
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        token1 = resp1.data['access']
        
        # Login 2
        resp2 = self.client.post(url, {'email': 'student@test.com', 'password': 'password123'})
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        token2 = resp2.data['access']
        
        # Attempt to use Token 1 -> Should fail
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token1)
        module_url = '/api/modules/'
        resp_fail = self.client.get(module_url)
        self.assertEqual(resp_fail.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp_fail.data['code'], 'session_invalidated')
        
        # Attempt to use Token 2 -> Should work
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token2)
        resp_success = self.client.get(module_url)
        self.assertEqual(resp_success.status_code, status.HTTP_200_OK)

    def test_fee_waiver_access(self):
        """Test that students can only see modules for waived courses."""
        url = '/api/modules/'
        
        # Login
        resp = self.client.post(reverse('token_obtain_pair'), {'email': 'student@test.com', 'password': 'password123'})
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        # Initially 0 modules (no waiver or sub)
        resp_empty = self.client.get(url)
        self.assertEqual(len(resp_empty.data), 0)
        
        # Grant fee waiver
        waiver = FeeWaiver.objects.create(user=self.student, expiry_date=timezone.now() + timedelta(days=365))
        waiver.courses.add(self.course)
        
        # Now should see 1 module
        resp_granted = self.client.get(url)
        self.assertEqual(len(resp_granted.data), 1)
        self.assertEqual(resp_granted.data[0]['title'], "Algebra")

    def test_super_admin_role(self):
        """Super Admin can see all modules without waiver."""
        resp = self.client.post(reverse('token_obtain_pair'), {'email': 'admin@test.com', 'password': 'password123'})
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        url = '/api/modules/'
        resp_all = self.client.get(url)
        self.assertEqual(len(resp_all.data), 1)

class CommunityAndTicketTests(APITestCase):
    def setUp(self):
        self.student1 = User.objects.create_user(username='stu1', email='stu1@test.com', password='pass', role='student')
        self.student2 = User.objects.create_user(username='stu2', email='stu2@test.com', password='pass', role='student')
        self.student3 = User.objects.create_user(username='stu3', email='stu3@test.com', password='pass', role='student')
        self.student4 = User.objects.create_user(username='stu4', email='stu4@test.com', password='pass', role='student')
        self.admin = User.objects.create_user(username='admin', email='admin@test.com', password='pass', role='admin')
        self.super_admin = User.objects.create_superuser(username='sadmin', email='sadmin@test.com', password='pass', role='super_admin')
        
        self.uni = University.objects.create(name="Test Uni")
        self.course1 = Course.objects.create(university=self.uni, name="Math 101", code="M101")
        self.course2 = Course.objects.create(university=self.uni, name="Physics 101", code="P101")
        
        # Subscribe student1, student2, student3 to Math 101
        FeeWaiver.objects.create(user=self.student1, expiry_date=timezone.now() + timedelta(days=365)).courses.add(self.course1)
        FeeWaiver.objects.create(user=self.student2, expiry_date=timezone.now() + timedelta(days=365)).courses.add(self.course1)
        FeeWaiver.objects.create(user=self.student3, expiry_date=timezone.now() + timedelta(days=365)).courses.add(self.course1)
        
        # Subscribe student4 to Physics 101 (Different Course)
        FeeWaiver.objects.create(user=self.student4, expiry_date=timezone.now() + timedelta(days=365)).courses.add(self.course2)
        
        # Login helper
        def login(email):
            return self.client.post(reverse('token_obtain_pair'), {'email': email, 'password': 'pass'}).data['access']
        
        self.t1 = login('stu1@test.com')
        self.t2 = login('stu2@test.com')
        self.t4 = login('stu4@test.com')
        self.t_admin = login('admin@test.com')
        self.t_sadmin = login('sadmin@test.com')

    def test_chat_boundaries(self):
        """Test cross-course blocks and 2-chat limits."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.t1)
        
        # Attempt cross course invite (Student 1 -> Student 4)
        resp_cross = self.client.post('/api/chat-invites/', {'receiver': self.student4.id, 'course': self.course1.id})
        self.assertEqual(resp_cross.status_code, status.HTTP_403_FORBIDDEN)
        
        # Valid invite (Student 1 -> Student 2)
        resp_valid1 = self.client.post('/api/chat-invites/', {'receiver': self.student2.id, 'course': self.course1.id})
        self.assertEqual(resp_valid1.status_code, status.HTTP_201_CREATED)
        
        # Valid invite (Student 1 -> Student 3)
        resp_valid2 = self.client.post('/api/chat-invites/', {'receiver': self.student3.id, 'course': self.course1.id})
        self.assertEqual(resp_valid2.status_code, status.HTTP_201_CREATED)
        
        # Third invite should fail (Max 2 chats reached)
        # Note: If we had a 5th student, we'd test it. Let's create one dynamically.
        s5 = User.objects.create_user(username='stu5', email='stu5@test.com', password='pass', role='student')
        FeeWaiver.objects.create(user=s5, expiry_date=timezone.now() + timedelta(days=365)).courses.add(self.course1)
        resp_overflow = self.client.post('/api/chat-invites/', {'receiver': s5.id, 'course': self.course1.id})
        self.assertEqual(resp_overflow.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Maximum', str(resp_overflow.data))

    def test_moderation_auto_hide(self):
        """Test that 3 unique reports hide a message."""
        group = ChatGroup.objects.create(course=self.course1)
        ChatMember.objects.create(group=group, user=self.student1)
        ChatMember.objects.create(group=group, user=self.student2)
        ChatMember.objects.create(group=group, user=self.student3)
        ChatMember.objects.create(group=group, user=self.student4) # Added just to report
        
        msg = ChatMessage.objects.create(group=group, sender=self.student1, body="Bad words")
        self.assertFalse(msg.is_hidden)
        
        MessageReport.objects.create(message=msg, reporter=self.student2)
        msg.refresh_from_db()
        self.assertFalse(msg.is_hidden)
        
        MessageReport.objects.create(message=msg, reporter=self.student3)
        msg.refresh_from_db()
        self.assertFalse(msg.is_hidden)
        
        MessageReport.objects.create(message=msg, reporter=self.student4)
        msg.refresh_from_db()
        self.assertTrue(msg.is_hidden)

    def test_ticket_privacy(self):
        """Test Admin vs Super Admin serializer output."""
        ticket = Ticket.objects.create(user=self.student1, category="suggestion", body="Details", status="open")
        
        # Admin View
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.t_admin)
        resp_admin = self.client.get(f'/api/tickets/{ticket.id}/')
        self.assertNotIn('email', str(resp_admin.data))
        self.assertNotIn('first_name', str(resp_admin.data))
        
        # Super Admin View
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.t_sadmin)
        resp_sadmin = self.client.get(f'/api/tickets/{ticket.id}/')
        self.assertIn('user', resp_sadmin.data)
        self.assertEqual(resp_sadmin.data['user']['email'], 'stu1@test.com')
