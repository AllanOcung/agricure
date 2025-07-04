from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument('recipient_email', type=str, help='Email address to send test email to')

    def handle(self, *args, **options):
        recipient_email = options['recipient_email']
        
        try:
            subject = 'Agricure Email Test'
            message = '''
Hello!

This is a test email from Agricure to verify that email configuration is working correctly.

If you receive this email, your email settings are properly configured.

Best regards,
The Agricure Team
            '''
            
            from_email = settings.DEFAULT_FROM_EMAIL
            
            self.stdout.write(self.style.SUCCESS(f'Attempting to send test email to {recipient_email}...'))
            self.stdout.write(f'From: {from_email}')
            self.stdout.write(f'Subject: {subject}')
            
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Test email successfully sent to {recipient_email}!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to send test email: {str(e)}')
            )
            self.stdout.write(
                self.style.WARNING('Please check your email configuration in settings.py and .env file')
            )
