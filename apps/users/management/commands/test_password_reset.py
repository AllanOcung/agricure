from django.core.management.base import BaseCommand
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Test password reset email sending exactly like the view does'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address to test password reset for')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                self.stdout.write(f'User found: {user.username} ({user.email})')
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'No user found with email: {email}'))
                return
            
            # Use Django's built-in password reset form
            form = PasswordResetForm({'email': email})
            
            if form.is_valid():
                self.stdout.write('Form is valid, attempting to send email...')
                
                # This mimics exactly what the password reset view does
                form.save(
                    domain_override=None,
                    subject_template_name='users/password_reset_subject.txt',
                    email_template_name='users/password_reset_email.html',
                    use_https=False,
                    token_generator=None,
                    from_email=None,
                    request=None,
                    html_email_template_name=None,
                    extra_email_context=None,
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Password reset email sent successfully to {email}!')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'Form validation failed: {form.errors}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error sending password reset email: {str(e)}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
