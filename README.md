# AgriCure - AI-Powered Plant Disease Detection Platform

AgriCure is a comprehensive agricultural platform that combines AI-powered plant disease detection, IoT environmental monitoring, and intelligent recommendations to help farmers optimize crop health and yields.

## Features

### 🔬 AI Disease Detection

- Upload plant images for instant disease identification
- Powered by deep learning CNN models
- Detailed disease descriptions and treatment recommendations
- Confidence scoring for accurate diagnosis

### 📊 IoT Environmental Monitoring

- Real-time monitoring of temperature, humidity, soil moisture, and light intensity
- Historical data visualization with interactive charts
- Automated alerts for optimal growing conditions
- Environmental recommendations based on sensor data

### 📱 Smart Recommendations

- Personalized notifications and alerts
- Region-specific agricultural recommendations
- Treatment suggestions based on diagnosed diseases
- Weather-based farming advice

### 📈 Analytics & History

- Comprehensive diagnosis history tracking
- Visual analytics with charts and trends
- Export capabilities for record keeping
- Performance metrics and insights

## Technology Stack

- **Backend**: Django 5.2.3
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Machine Learning**: PyTorch, PIL, NumPy
- **Database**: SQLite (development), PostgreSQL (production)
- **Charts**: Chart.js
- **Icons**: Lucide Icons

## Installation

### Prerequisites

- Python 3.8+
- pip package manager
- Virtual environment (recommended)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd agricure
   ```

2. **Create and activate virtual environment**

   ```bash
   python -m venv env

   # On Windows
   env\Scripts\activate

   # On macOS/Linux
   source env/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

5. **Database Setup**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser**

   ```bash
   python manage.py createsuperuser
   ```

7. **Collect Static Files**

   ```bash
   python manage.py collectstatic
   ```

8. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

The application will be available at `http://localhost:8000`

## Project Structure

```
agricure/
├── agricure/                 # Main Django project
│   ├── settings.py          # Project settings
│   ├── urls.py              # URL routing
│   └── wsgi.py              # WSGI configuration
├── apps/                    # Django applications
│   ├── diagnosis/           # Disease detection app
│   ├── users/               # User authentication
│   ├── recommendations/     # Notifications & recommendations
│   ├── history/             # Analytics & history
│   └── iot/                 # IoT monitoring
├── templates/               # HTML templates
├── static/                  # Static files (CSS, JS, images)
├── media/                   # User uploads
├── requirements.txt         # Python dependencies
└── manage.py               # Django management script
```

## Key Applications

### 1. Users App

- Custom user authentication
- User profile management
- Password reset functionality
- Landing page

### 2. Diagnosis App

- AI-powered disease detection
- Image upload and processing
- Disease classification using CNN
- Treatment recommendations

### 3. IoT App

- Environmental sensor data collection
- Real-time monitoring dashboard
- Historical data analysis
- Alert system

### 4. Recommendations App

- Notification system
- Alert management
- Region-specific recommendations
- Weather integration

### 5. History App

- Diagnosis history tracking
- Analytics dashboard
- Data visualization
- Export functionality

## Machine Learning Model

The disease detection system uses a Convolutional Neural Network (CNN) trained on plant disease images. The model can identify:

- Apple diseases (scab, black rot, cedar apple rust)
- Corn diseases (leaf blight, rust, leaf spot)
- Tomato diseases (early blight, late blight, leaf mold, etc.)
- Grape diseases (black rot, leaf blight)
- And many more plant diseases

Model architecture:

- Input: 256x256 RGB images
- Multiple convolutional layers with batch normalization
- Residual connections for better gradient flow
- Softmax output for multi-class classification

## API Endpoints

### Disease Detection

- `POST /diagnosis/dashboard/` - Upload image for diagnosis

### IoT Data

- `GET /iot/api/current/` - Get current sensor readings
- `GET /iot/api/historical/` - Get historical data

### Recommendations

- `GET /notifications/` - Get user notifications
- `POST /notifications/mark-as-read/<id>/` - Mark notification as read

## Configuration

### Email Settings

Configure email settings in `settings.py` for notifications:

- Gmail SMTP configuration
- App-specific passwords required
- Console backend for development

### Static Files

- Static files served during development
- Use WhiteNoise for production static file serving
- Media files handled separately

### Database

- SQLite for development (included)
- PostgreSQL recommended for production
- Migrations included for all models

## Deployment

### Production Settings

1. Set `DEBUG = False`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Set up proper email backend
5. Configure static file serving
6. Set up domain and SSL

### Environment Variables

```env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/agricure
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Development

### Running Tests

```bash
python manage.py test
```

### Code Style

- Follow PEP 8 conventions
- Use meaningful variable names
- Add docstrings for functions and classes
- Comment complex logic

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Model file not found**

   - Ensure the model file is in `apps/diagnosis/model/`
   - Check file permissions

2. **Image upload errors**

   - Verify media directory permissions
   - Check file size limits

3. **Email not sending**

   - Verify email credentials
   - Check Gmail app password settings

4. **Static files not loading**
   - Run `python manage.py collectstatic`
   - Check static file configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review Django documentation

## Acknowledgments

- PyTorch team for the deep learning framework
- Django community for the web framework
- Plant Village dataset for training data
- Tailwind CSS for styling framework
