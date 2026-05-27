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

        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' or email '{email}' already exists."))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully!"))
