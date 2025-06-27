from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
from django.core.mail import BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User as AuthUser
from django.template import loader
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from .forms import RegistrationForm
from .models import User
from .email_forms import EmailTestForm

def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registration successful. Please log in.')
            return redirect('users:login')
    else:
        form = RegistrationForm()
    return render(request, 'users/register.html', {'form': form})

class CustomLoginView(LoginView):
    template_name = 'users/login.html'

    def get_success_url(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == User.Role.ADMIN:
                return reverse_lazy('admin:index')
            elif user.role == User.Role.FARMER:
                return reverse_lazy('diagnosis:dashboard')
        return reverse_lazy('diagnosis:dashboard') # Default redirect for authenticated users

def logout_view(request):
    logout(request)
    messages.info(request, "You have successfully logged out.")
    return redirect('users:login')

class CustomPasswordResetView(PasswordResetView):
    template_name = 'users/password_reset.html'
    email_template_name = 'users/password_reset_email.txt'
    html_email_template_name = 'users/password_reset_email.html'
    subject_template_name = 'users/password_reset_subject.txt'
    success_url = reverse_lazy('users:password_reset_done')
    
    def send_mail(self, subject_template_name, email_template_name,
                  context, from_email, to_email, html_email_template_name=None):
        """
        Send a django.core.mail.EmailMultiAlternatives to `to_email`.
        """
        subject = loader.render_to_string(subject_template_name, context)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())
        body = loader.render_to_string(email_template_name, context)

        email_message = EmailMultiAlternatives(subject, body, from_email, [to_email])
        if html_email_template_name is not None:
            html_email = loader.render_to_string(html_email_template_name, context)
            email_message.attach_alternative(html_email, 'text/html')

        email_message.send()
    
    def form_valid(self, form):
        try:
            # Get the email from the form
            email = form.cleaned_data['email']
            
            # Check if a user with this email exists
            users = User.objects.filter(email=email)
            if users.exists():
                messages.success(
                    self.request, 
                    f"Password reset instructions have been sent to {email}. Please check your inbox and spam folder."
                )
            else:
                # Still show success message for security (don't reveal if email exists)
                messages.success(
                    self.request, 
                    f"If an account with email {email} exists, password reset instructions have been sent."
                )
            
            return super().form_valid(form)
            
        except BadHeaderError:
            messages.error(self.request, "Invalid header found. Please try again.")
            return self.form_invalid(form)
        except Exception as e:
            messages.error(self.request, "An error occurred while sending the email. Please try again later.")
            return self.form_invalid(form)

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'users/password_reset_confirm.html'
    success_url = reverse_lazy('users:password_reset_complete')
    
    def form_valid(self, form):
        messages.success(self.request, "Your password has been successfully reset. You can now log in with your new password.")
        return super().form_valid(form)

def is_admin(user):
    """Check if user is admin"""
    return user.is_authenticated and hasattr(user, 'role') and user.role == User.Role.ADMIN

@user_passes_test(is_admin)
def email_test_view(request):
    """Test email functionality - only accessible to admins"""
    if request.method == 'POST':
        form = EmailTestForm(request.POST)
        if form.is_valid():
            success, message = form.send_email()
            if success:
                messages.success(request, message)
            else:
                messages.error(request, message)
            return redirect('users:email_test')
    else:
        form = EmailTestForm()
    
    return render(request, 'users/email_test.html', {'form': form})