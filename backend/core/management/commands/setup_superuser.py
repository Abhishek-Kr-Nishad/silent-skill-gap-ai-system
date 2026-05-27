import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser from environment variables if it does not exist.'

    def handle(self, *args, **options):
        User = get_user_model()
        
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'Abhishek2118')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'abhishekkumarnishad21@gmail.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Abhishek@123')

        if not username or not email or not password:
            self.stdout.write(self.style.WARNING("Superuser credentials not fully provided in environment. Skipping."))
            return

        try:
            user = User.objects.get(username=username)
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.email = email
            user.save()
            self.stdout.write(self.style.SUCCESS(f"User '{username}' already exists. Upgraded to superuser and reset password successfully!"))
        except User.DoesNotExist:
            try:
                # Try checking by email just in case
                user = User.objects.get(email=email)
                user.is_staff = True
                user.is_superuser = True
                user.set_password(password)
                user.username = username
                user.save()
                self.stdout.write(self.style.SUCCESS(f"User with email '{email}' already exists. Upgraded to superuser and reset password successfully!"))
            except User.DoesNotExist:
                User.objects.create_superuser(username=username, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully!"))
