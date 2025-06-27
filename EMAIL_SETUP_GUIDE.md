# Email Configuration Guide for Agricure

This guide will help you set up real email sending for password reset functionality in Agricure.

## Prerequisites

1. A Gmail account for sending emails
2. Gmail App Password (more secure than using your regular Gmail password)

## Step 1: Set up Gmail App Password

### For Gmail accounts:

1. **Enable 2-Factor Authentication** (if not already enabled):

   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate an App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Scroll down and click on "App passwords"
   - Select "Mail" as the app and your device
   - Google will generate a 16-character password (like: `abcd efgh ijkl mnop`)
   - **Important**: Copy this password - you won't be able to see it again!

## Step 2: Configure Environment Variables

1. **Edit the `.env` file** in your project root:

   ```
   EMAIL_HOST_USER=your-gmail-address@gmail.com
   EMAIL_HOST_PASSWORD=your-16-character-app-password
   DEFAULT_FROM_EMAIL=Agricure <your-gmail-address@gmail.com>
   ```

2. **Example configuration**:
   ```
   EMAIL_HOST_USER=agricure.support@gmail.com
   EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
   DEFAULT_FROM_EMAIL=Agricure Support <agricure.support@gmail.com>
   ```

## Step 3: Test Email Configuration

### Option 1: Using Management Command

```bash
python manage.py test_email recipient@example.com
```

### Option 2: Using Django Shell

```bash
python manage.py shell
```

Then in the shell:

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email from Agricure',
    'This is a test message.',
    settings.DEFAULT_FROM_EMAIL,
    ['recipient@example.com'],
    fail_silently=False,
)
```

### Option 3: Test Password Reset Flow

1. Start your development server: `python manage.py runserver`
2. Go to: `http://127.0.0.1:8000/users/password-reset/`
3. Enter an email address of an existing user
4. Check the recipient's email inbox

## Step 4: Troubleshooting

### Common Issues:

1. **"Authentication failed"**:

   - Verify your Gmail address and app password are correct
   - Make sure 2FA is enabled and you're using an app password (not your regular password)

2. **"Connection refused"**:

   - Check your internet connection
   - Ensure Gmail SMTP is not blocked by your firewall

3. **"Bad credentials"**:

   - Make sure there are no extra spaces in your credentials
   - Verify the app password is correct (16 characters without spaces)

4. **"Less secure app access"**:
   - Use App Passwords instead of enabling "Less secure app access"

### Enable Debug Mode for Email Testing:

To see detailed email errors, you can temporarily switch back to console backend:

In `settings.py`, comment out the SMTP settings and uncomment:

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

This will print emails to the console instead of sending them.

## Step 5: Production Considerations

1. **Use environment variables**: Never commit email credentials to version control
2. **Consider email services**: For production, consider services like:

   - SendGrid
   - Mailgun
   - Amazon SES
   - These offer better deliverability and analytics

3. **Security**:
   - Regularly rotate app passwords
   - Monitor for unusual email activity
   - Consider rate limiting for password reset attempts

## Testing Checklist

- [ ] Environment variables are set correctly in `.env`
- [ ] Gmail app password is generated and configured
- [ ] Test email command works
- [ ] Password reset flow sends emails successfully
- [ ] Email templates display correctly
- [ ] Links in emails work and direct to the correct pages

## Email Templates

The system uses these templates:

- `users/password_reset_email.html` - The main email template
- `users/password_reset_subject.txt` - Email subject line

You can customize these templates to match your branding.

## Support

If you encounter issues:

1. Check the Django development server logs
2. Verify your Gmail settings
3. Test with the management command first
4. Check spam folders for test emails
