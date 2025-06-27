# JavaScript Organization Structure

This document outlines the reorganized JavaScript structure for the Agricure project, following separation of concerns principles.

## Directory Structure

```
static/js/
├── app.js                 # Main app entry point with dynamic loading
├── README.md              # Documentation
├── shared/
│   ├── common.js          # Shared utilities and common functions
│   └── navbar.js          # Navbar interactions (mobile menu, dropdowns)
├── diagnosis/
│   └── dashboard.js       # Dashboard functionality (image upload, analysis)
├── recommendations/
│   └── recommendations.js # Notifications/recommendations tab functionality
├── iot/
│   └── dashboard.js       # IoT dashboard with charts and real-time data
├── history/
│   └── history.js         # History page functionality
└── users/
    └── auth.js            # Authentication forms (login, register, etc.)
```

## How It Works

### 1. Main Entry Point (`app.js`)

- Detects which page is currently loaded based on DOM elements
- Dynamically loads only the relevant JavaScript files
- Initializes Lucide icons globally
- Prevents loading unnecessary scripts

### 2. Shared Utilities (`shared/common.js`)

- Common utility functions used across multiple apps
- CSRF token helpers
- Loading state management
- Notification system
- Loaded on every page for consistency

### 3. App-Specific Scripts

Each app has its own dedicated JavaScript file that contains only the functionality relevant to that app:

#### Diagnosis App (`diagnosis/dashboard.js`)

- Image upload and preview functionality
- Drag and drop file handling
- Form submission and validation
- Results display and statistics updates

#### Recommendations App (`recommendations/recommendations.js`)

- Tab switching functionality
- Modal handling for detailed views
- Mark as read functionality
- Dynamic content loading

#### IoT App (`iot/dashboard.js`)

- Chart.js integration for sensor data visualization
- Real-time data updates
- Time range selection
- Sensor status monitoring

#### History App (`history/history.js`)

- History listing functionality
- View details modal
- Delete diagnosis functionality
- Pagination and filtering (if implemented)

#### Users App (`users/auth.js`)

- Login form enhancements
- Registration form validation
- Password visibility toggles
- Profile form handling
- Image preview for avatars

## Benefits

1. **Performance**: Only loads JavaScript that's actually needed for the current page
2. **Maintainability**: Each app's JavaScript is isolated and easier to maintain
3. **Debugging**: Easier to identify which file contains specific functionality
4. **Development**: Team members can work on different apps without conflicts
5. **Scalability**: Easy to add new functionality without affecting existing code

## Usage in Templates

### Base Template

The base template includes:

```html
<!-- Shared utilities -->
<script src="{% static 'js/shared/common.js' %}"></script>

<!-- Main app with dynamic loading -->
<script src="{% static 'js/app.js' %}"></script>
```

### App-Specific Templates (Optional)

If you need to manually include specific scripts for certain pages, you can use:

```html
{% block extra_js %}
<script src="{% static 'js/diagnosis/dashboard.js' %}"></script>
{% endblock %}
```

## Adding New Functionality

### For New Apps

1. Create a new directory under `static/js/` with the app name
2. Create a main JavaScript file for the app
3. Add detection logic in `app.js` to identify when the app is active
4. Add the script loading logic in the `initializePageSpecificScripts()` function

### For Existing Apps

1. Add new functions to the appropriate app-specific JavaScript file
2. Follow the existing patterns for DOM event handling and initialization
3. Use the shared utilities from `common.js` where appropriate

## Shared Utilities Available

The `AgricureUtils` object provides:

- `getCsrfToken()`: Get CSRF token from the page
- `fetchWithCsrf(url, options)`: Fetch with automatic CSRF token inclusion
- `showLoading(element, text)`: Show loading state on buttons
- `hideLoading(element, originalText)`: Hide loading state
- `showNotification(message, type)`: Display notifications to users

## Migration from Previous Structure

The previous monolithic `app.js` file has been split while maintaining all existing functionality. The unused backup files have been removed to keep the codebase clean.
