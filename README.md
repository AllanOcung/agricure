# Agricure - AI-Powered Crop Diagnosis Dashboard

A modern Django-based web application for crop disease diagnosis and agricultural monitoring with AI-powered analysis, real-time IoT data visualization, and expert recommendations.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Django](https://img.shields.io/badge/django-v4.0+-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-v3.0+-blue.svg)

## 🌟 Features

### 🔍 Crop Disease Diagnosis
- **AI-Powered Analysis**: Upload crop images and get instant disease identification
- **Detailed Results**: Confidence scores, severity levels, and affected plant parts
- **Treatment Recommendations**: AI-generated treatment suggestions
- **Save & Track**: Save diagnoses for future reference

### 📊 Real-Time IoT Dashboard
- **Environmental Monitoring**: Temperature, humidity, soil moisture, and light intensity
- **Interactive Charts**: Visual data representation with Chart.js
- **Historical Data**: Time-range selection (24h, 7d, 30d)
- **Smart Recommendations**: Context-aware agricultural advice

### 🔔 Recommendations & Notifications
- **Expert Opinions**: Connect with agricultural experts
- **Disease Alerts**: Regional disease outbreak notifications
- **Weather Insights**: Weather-based agricultural recommendations
- **Notification System**: Toast notifications and alert management

### 👤 User Management
- **Authentication**: Secure login/registration system
- **Role-Based Access**: Admin, Farmer, and Agronomist roles
- **Profile Management**: User settings and preferences
- **Session Management**: Secure logout and session handling

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **AJAX Navigation**: Smooth page transitions without full reloads
- **Interactive Elements**: Dynamic forms, dropdowns, and modals
- **Professional Styling**: Modern design with Lucide icons

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.0+
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: Django's built-in auth system
- **File Handling**: Django's media handling for image uploads

### Frontend
- **CSS Framework**: TailwindCSS 3.0+
- **Icons**: Lucide Icons
- **Charts**: Chart.js for data visualization
- **JavaScript**: Vanilla ES6+ with modular architecture

### Architecture
- **Design Pattern**: Model-View-Template (MVT)
- **App Structure**: Modular Django apps (diagnosis, iot, recommendations, users)
- **Static Assets**: Organized JavaScript modules for each app
- **AJAX**: Dynamic content loading without page refreshes

## 📁 Project Structure

```
agricure/
├── agricure/                   # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                      # Django applications
│   ├── diagnosis/             # Crop diagnosis functionality
│   ├── iot/                   # IoT sensor data management
│   ├── recommendations/       # Notifications and recommendations
│   ├── users/                 # User authentication and management
│   └── history/               # Diagnosis history tracking
├── static/                    # Static files
│   └── js/                    # JavaScript modules
│       ├── diagnosis/         # Diagnosis-specific JS
│       ├── iot/              # IoT dashboard JS
│       ├── recommendations/   # Recommendations JS
│       ├── shared/           # Shared utilities
│       └── users/            # Authentication JS
├── templates/                 # HTML templates
│   └── base.html             # Base template with navbar
├── media/                     # User uploads
│   └── diagnoses/            # Diagnosis images
├── requirements.txt          # Python dependencies
└── manage.py                 # Django management script
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd agricure
```

### 2. Create Virtual Environment
```bash
python -m venv env
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate
```

### 3. Install Dependencies
```bash
pip install django
pip install pillow  # For image handling
pip install python-dotenv  # For environment variables
```

### 4. Environment Setup
Create a `.env` file in the project root:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### 5. Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run Development Server
```bash
python manage.py runserver
```

Visit `http://localhost:8000` to access the application.

## 📱 Usage

### Getting Started
1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: Access the main diagnosis dashboard
3. **Upload Image**: Drag & drop or select a crop image
4. **Get Analysis**: Click "Analyze Crop" for AI-powered diagnosis
5. **View Results**: Review disease identification and recommendations
6. **Save Diagnosis**: Save results for future reference
7. **Expert Opinion**: Connect with agricultural experts for advanced advice

### Navigation
- **Dashboard**: Main crop diagnosis interface
- **Recommendations**: View notifications, alerts, and expert advice
- **History**: Access past diagnoses and tracking
- **IoT Data**: Monitor real-time environmental sensors

## 🔧 Configuration

### Django Settings
Key settings in `agricure/settings.py`:
- `MEDIA_ROOT`: Directory for uploaded images
- `STATIC_URL`: Static files configuration
- `DATABASES`: Database configuration

### Static Files
- JavaScript modules are organized by app
- TailwindCSS loaded via CDN
- Icons provided by Lucide

### Environment Variables
- `DEBUG`: Development mode toggle
- `SECRET_KEY`: Django secret key
- Database credentials (for production)

## 📊 Features in Detail

### Diagnosis Dashboard
- **Image Upload**: Drag & drop or file selection
- **Real-time Analysis**: AI processing with loading states
- **Results Display**: Disease name, confidence, severity, recommendations
- **Action Buttons**: Save diagnosis, get expert opinion, refresh results
- **Statistics**: Monthly diagnosis count, accuracy rate, diseases detected

### IoT Dashboard
- **Sensor Data**: Temperature, humidity, soil moisture, light intensity
- **Time Controls**: Switch between 24h, 7d, 30d views
- **Charts**: Interactive line charts with dual y-axes
- **Status Indicators**: Optimal/Warning/Critical status for each sensor
- **Recommendations**: Context-aware agricultural advice

### Notifications System
- **Tabbed Interface**: Disease alerts, recommendations, weather insights
- **Real-time Updates**: Dynamic content loading
- **Interactive Cards**: View details, mark as read functionality
- **Regional Maps**: Disease outbreak visualization (placeholder)

## 🔒 Security Features

- **CSRF Protection**: All forms include CSRF tokens
- **User Authentication**: Secure login/logout system
- **File Upload Validation**: Image type and size restrictions
- **SQL Injection Protection**: Django ORM prevents SQL injection
- **XSS Protection**: Template auto-escaping enabled

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend**: Modern responsive UI with TailwindCSS
- **Backend**: Django REST framework and database management
- **AI Integration**: Crop disease detection algorithms
- **IoT Integration**: Real-time sensor data processing

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG=False` in production
- [ ] Configure PostgreSQL database
- [ ] Set up static file serving (nginx/Apache)
- [ ] Configure SSL/HTTPS
- [ ] Set up environment variables
- [ ] Configure email backend for notifications
- [ ] Set up monitoring and logging

### Environment Variables for Production
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

---

Built with ❤️ for modern agriculture and crop management.
