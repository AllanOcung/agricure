from django import forms
from django.core.mail import send_mail
from django.conf import settings


class EmailTestForm(forms.Form):
    recipient_email = forms.EmailField(
        label="Recipient Email",
        help_text="Enter the email address to send a test email to"
    )
    subject = forms.CharField(
        max_length=200,
        initial="Agricure Email Test",
        help_text="Subject line for the test email"
    )
    message = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 6}),
        initial="This is a test email from Agricure to verify email configuration is working.",
        help_text="Message content for the test email"
    )
    
    def send_email(self):
        """Send the test email"""
        if self.is_valid():
            try:
                send_mail(
                    subject=self.cleaned_data['subject'],
                    message=self.cleaned_data['message'],
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[self.cleaned_data['recipient_email']],
                    fail_silently=False,
                )
                return True, "Email sent successfully!"
            except Exception as e:
                return False, f"Failed to send email: {str(e)}"
        return False, "Form is not valid"
