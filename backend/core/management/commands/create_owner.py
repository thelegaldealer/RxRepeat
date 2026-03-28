import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates the platform owner account from environment variables if it does not already exist.'

    def handle(self, *args, **options):
        User = get_user_model()

        email = os.environ.get('OWNER_EMAIL')
        password = os.environ.get('OWNER_PASSWORD')
        first_name = os.environ.get('OWNER_FIRST_NAME', 'Owner')
        last_name = os.environ.get('OWNER_LAST_NAME', 'Account')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'OWNER_EMAIL or OWNER_PASSWORD not set. Skipping owner creation.'
            ))
            return

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'owner',
                'is_superuser': True,
                'is_staff': True,
                'is_active': True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Owner account created: {email}'))
        else:
            # Ensure existing account has owner role
            if user.role != 'owner':
                user.role = 'owner'
                user.is_superuser = True
                user.is_staff = True
                user.is_active = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Existing account elevated to owner: {email}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Owner account already exists: {email}'))
