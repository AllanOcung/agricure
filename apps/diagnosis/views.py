import random
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image
import os
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from .forms import DiagnosisForm
from .models import Diagnosis
from datetime import datetime, timedelta
from django.utils import timezone
from apps.recommendations.models import Notification

# List of class names in the same order as model output
DISEASE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# Expanded info mapping for all classes
DISEASE_INFO = {
    "Apple___Apple_scab": {
        "description": "Fungal disease causing scab-like lesions on apple leaves and fruit.",
        "recommendations": [
            "Remove and destroy fallen leaves and infected fruit.",
            "Apply appropriate fungicides during the growing season.",
            "Promote air circulation by proper pruning."
        ]
    },
    "Apple___Black_rot": {
        "description": "Fungal disease causing black rot on apples and leaf spots.",
        "recommendations": [
            "Remove and destroy infected branches and fruit.",
            "Apply fungicides at petal fall and cover sprays.",
            "Avoid tree injuries and maintain tree vigor."
        ]
    },
    "Apple___Cedar_apple_rust": {
        "description": "Fungal disease causing yellow-orange spots on leaves and fruit.",
        "recommendations": [
            "Remove nearby juniper hosts if possible.",
            "Apply fungicides early in the season.",
            "Plant resistant apple varieties."
        ]
    },
    "Apple___healthy": {
        "description": "No disease detected. Apple plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Blueberry___healthy": {
        "description": "No disease detected. Blueberry plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "description": "Fungal disease causing white powdery growth on leaves and fruit.",
        "recommendations": [
            "Apply sulfur-based fungicides.",
            "Prune to improve air circulation.",
            "Remove and destroy infected plant parts."
        ]
    },
    "Cherry_(including_sour)___healthy": {
        "description": "No disease detected. Cherry plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "description": "Fungal disease causing gray spots on leaves, leading to blight.",
        "recommendations": [
            "Remove and destroy infected plant debris.",
            "Apply fungicides as a protective measure.",
            "Rotate crops and practice good field sanitation."
        ]
    },
    "Corn_(maize)___Common_rust_": {
        "description": "Fungal disease causing reddish-brown pustules on leaves.",
        "recommendations": [
            "Plant resistant corn varieties.",
            "Apply fungicides at the early sign of infection.",
            "Practice crop rotation and avoid monoculture."
        ]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "description": "Fungal disease causing long, grayish-green lesions on leaves.",
        "recommendations": [
            "Remove and destroy infected leaves.",
            "Apply fungicides to protect against infection.",
            "Practice crop rotation and plant resistant varieties."
        ]
    },
    "Corn_(maize)___healthy": {
        "description": "No disease detected. Corn plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Grape___Black_rot": {
        "description": "Fungal disease causing dark, sunken lesions on grapes.",
        "recommendations": [
            "Remove and destroy infected grapes and leaves.",
            "Apply fungicides during the growing season.",
            "Practice good vineyard sanitation."
        ]
    },
    "Grape___Esca_(Black_Measles)": {
        "description": "Fungal disease causing leaf and wood symptoms, leading to vine decline.",
        "recommendations": [
            "Remove and destroy infected vines.",
            "Avoid pruning during wet weather.",
            "Maintain vine health through proper care."
        ]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "description": "Fungal disease causing angular, water-soaked spots on leaves.",
        "recommendations": [
            "Remove and destroy infected leaves.",
            "Apply fungicides to protect against infection.",
            "Practice crop rotation and vineyard sanitation."
        ]
    },
    "Grape___healthy": {
        "description": "No disease detected. Grape vine appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "description": "Bacterial disease causing yellowing of leaves and fruit drop in citrus.",
        "recommendations": [
            "Remove and destroy infected trees.",
            "Preventative bactericide applications.",
            "Control psyllid vectors that spread the disease."
        ]
    },
    "Peach___Bacterial_spot": {
        "description": "Bacterial disease causing dark, sunken spots on peach leaves and fruit.",
        "recommendations": [
            "Remove and destroy infected plant parts.",
            "Apply copper-based bactericides.",
            "Avoid overhead irrigation to reduce leaf wetness."
        ]
    },
    "Peach___healthy": {
        "description": "No disease detected. Peach tree appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Pepper,_bell___Bacterial_spot": {
        "description": "Bacterial disease causing water-soaked spots on pepper leaves and fruit.",
        "recommendations": [
            "Remove and destroy infected plants.",
            "Apply appropriate bactericides.",
            "Practice crop rotation and avoid overhead watering."
        ]
    },
    "Pepper,_bell___healthy": {
        "description": "No disease detected. Bell pepper plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Potato___Early_blight": {
        "description": "Fungal disease causing dark, concentric rings on potato leaves.",
        "recommendations": [
            "Remove and destroy infected leaves and tubers.",
            "Apply fungicides as a protective measure.",
            "Practice crop rotation and avoid planting potatoes in the same area consecutively."
        ]
    },
    "Potato___Late_blight": {
        "description": "Fungal disease causing large, irregularly shaped lesions on leaves and stems.",
        "recommendations": [
            "Remove and destroy infected plants immediately.",
            "Apply fungicides at the first sign of infection.",
            "Practice good field sanitation and crop rotation."
        ]
    },
    "Potato___healthy": {
        "description": "No disease detected. Potato plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Raspberry___healthy": {
        "description": "No disease detected. Raspberry plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Soybean___healthy": {
        "description": "No disease detected. Soybean plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Squash___Powdery_mildew": {
        "description": "Fungal disease causing white, powdery spots on squash leaves.",
        "recommendations": [
            "Apply sulfur or potassium bicarbonate fungicides.",
            "Improve air circulation around plants.",
            "Remove and destroy infected plant debris."
        ]
    },
    "Strawberry___Leaf_scorch": {
        "description": "Physiological disorder causing marginal leaf scorch, not a disease.",
        "recommendations": [
            "Ensure adequate watering, especially during dry periods.",
            "Apply mulch to retain soil moisture.",
            "Avoid high nitrogen fertilizers that can exacerbate scorch."
        ]
    },
    "Strawberry___healthy": {
        "description": "No disease detected. Strawberry plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    },
    "Tomato___Bacterial_spot": {
        "description": "Bacterial disease causing dark, water-soaked spots on tomato leaves and fruit.",
        "recommendations": [
            "Remove and destroy infected plants.",
            "Apply copper-based bactericides.",
            "Practice crop rotation and avoid overhead irrigation."
        ]
    },
    "Tomato___Early_blight": {
        "description": "Fungal disease causing dark, concentric rings on tomato leaves.",
        "recommendations": [
            "Remove and destroy infected leaves and fruit.",
            "Apply fungicides as a protective measure.",
            "Practice crop rotation and avoid planting tomatoes in the same area consecutively."
        ]
    },
    "Tomato___Late_blight": {
        "description": "Fungal disease causing large, dark lesions on leaves, stems, and fruit.",
        "recommendations": [
            "Remove and destroy infected plants immediately.",
            "Apply fungicides at the first sign of infection.",
            "Practice good garden hygiene and crop rotation."
        ]
    },
    "Tomato___Leaf_Mold": {
        "description": "Fungal disease causing yellow-green fuzzy growth on the undersides of tomato leaves.",
        "recommendations": [
            "Improve air circulation around plants.",
            "Avoid overhead watering to reduce humidity.",
            "Apply fungicides to affected plants."
        ]
    },
    "Tomato___Septoria_leaf_spot": {
        "description": "Fungal disease causing small, round spots with dark centers on tomato leaves.",
        "recommendations": [
            "Remove and destroy infected leaves.",
            "Apply fungicides to protect against infection.",
            "Practice crop rotation and avoid planting tomatoes in the same location each year."
        ]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "description": "Mite infestation causing stippling, webbing, and leaf drop on tomatoes.",
        "recommendations": [
            "Increase humidity around plants to deter mites.",
            "Apply miticides or insecticidal soaps.",
            "Introduce beneficial insects like ladybugs."
        ]
    },
    "Tomato___Target_Spot": {
        "description": "Fungal disease causing dark, target-like spots on tomato leaves and fruit.",
        "recommendations": [
            "Remove and destroy infected plant parts.",
            "Apply fungicides to protect against infection.",
            "Practice crop rotation and good garden hygiene."
        ]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "description": "Viral disease causing yellowing and curling of tomato leaves.",
        "recommendations": [
            "Remove and destroy infected plants.",
            "Control whitefly vectors that spread the virus.",
            "Practice crop rotation and avoid planting tomatoes in the same location each year."
        ]
    },
    "Tomato___Tomato_mosaic_virus": {
        "description": "Viral disease causing mottling and discoloration of tomato leaves.",
        "recommendations": [
            "Remove and destroy infected plants.",
            "Control aphid vectors that spread the virus.",
            "Practice good garden hygiene and crop rotation."
        ]
    },
    "Tomato___healthy": {
        "description": "No disease detected. Tomato plant appears healthy.",
        "recommendations": [
            "Continue regular monitoring.",
            "Maintain good cultural practices."
        ]
    }
}

# --- PyTorch model setup (copied from your notebook) ---
def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
              nn.BatchNorm2d(out_channels),
              nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)

class ImageClassificationBase(nn.Module):
    def training_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        return loss

    def validation_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        _, preds = torch.max(out, dim=1)
        acc = torch.tensor(torch.sum(preds == labels).item() / len(preds))
        return {'val_loss': loss.detach(), 'val_acc': acc}

    def validation_epoch_end(self, outputs):
        batch_losses = [x['val_loss'] for x in outputs]
        epoch_loss = torch.stack(batch_losses).mean()
        batch_accs = [x['val_acc'] for x in outputs]
        epoch_acc = torch.stack(batch_accs).mean()
        return {'val_loss': epoch_loss.item(), 'val_acc': epoch_acc.item()}

    def epoch_end(self, epoch, result):
        print("Epoch [{}], train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
            epoch, result['train_loss'], result['val_loss'], result['val_acc']))

class CNN_NeuralNet(ImageClassificationBase):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(
            nn.MaxPool2d(4),
            nn.Flatten(),
            nn.Linear(512, num_diseases)
        )

    def forward(self, x):
        out = self.conv1(x)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'plant_disease_model.pth')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = CNN_NeuralNet(3, len(DISEASE_CLASSES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()
model.to(device)

def predict_disease(image_file):
    img = Image.open(image_file).convert('RGB')
    img = img.resize((256, 256))  # <-- Change to 256x256 to match training
    img_array = np.array(img) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))  # HWC to CHW
    img_tensor = torch.tensor(img_array, dtype=torch.float32).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(img_tensor)
        preds = torch.softmax(outputs, dim=1)
        idx = int(torch.argmax(preds, dim=1).item())
        confidence = float(torch.max(preds).item()) * 100
    disease_name = DISEASE_CLASSES[idx]
    info = DISEASE_INFO.get(disease_name, {})
    return {
        "disease_name": disease_name.replace('_', ' '),
        "severity": "High" if confidence > 90 else "Medium",
        "affected_plant_part": "Leaves",
        "confidence": round(confidence, 2),
        "description": info.get("description", ""),
        "recommendations_list": info.get("recommendations", []),
    }

@login_required
def dashboard_view(request):
    # Handle AJAX POST requests for diagnosis
    if request.method == 'POST':
        form = DiagnosisForm(request.POST, request.FILES)
        if form.is_valid():
            diagnosis = form.save(commit=False)
            diagnosis.user = request.user

            # Use real AI prediction
            prediction = predict_disease(request.FILES['image'])

            diagnosis.disease_name = prediction['disease_name']
            diagnosis.severity = prediction['severity']
            diagnosis.affected_plant_part = prediction['affected_plant_part']
            diagnosis.confidence = prediction['confidence']
            diagnosis.description = prediction['description']
            diagnosis.recommendations = "\n".join(prediction['recommendations_list'])

            diagnosis.save()

            # Create an ALERT if a disease (not healthy) is detected
            if 'healthy' not in diagnosis.disease_name.lower():
                Notification.objects.create(
                    user=request.user,
                    title=f"Disease Detected: {diagnosis.disease_name}",
                    message=f"{diagnosis.description}\n\nRecommendations:\n{diagnosis.recommendations}",
                    type='ALERT'
                )

            # Always create a RECOMMENDATION notification if recommendations exist
            if diagnosis.recommendations.strip():
                Notification.objects.create(
                    user=request.user,
                    title=f"Recommendations for {diagnosis.disease_name}",
                    message=f"{diagnosis.recommendations}",
                    type='RECOMMENDATION'
                )

            # --- START: Recalculate stats after saving ---
            user_diagnoses = Diagnosis.objects.filter(user=request.user)
            last_30_days = timezone.now() - timedelta(days=30)
            updated_stats = {
                'diagnoses_this_month': user_diagnoses.filter(created_at__gte=last_30_days).count(),
                'accuracy_rate': 95, # This can remain static for now
                'diseases_detected': user_diagnoses.values('disease_name').distinct().count()
            }
            # --- END: Recalculate stats after saving ---

            # Prepare data to be sent back as JSON
            diagnosis_data = {
                'disease_name': diagnosis.disease_name,
                'severity': diagnosis.severity,
                'affected_plant_part': diagnosis.affected_plant_part,
                'confidence': diagnosis.confidence,
                'description': diagnosis.description,
                'recommendations_list': diagnosis.recommendations.splitlines(),
            }

            # Combine diagnosis and stats into a single response
            response_data = {
                'diagnosis': diagnosis_data,
                'stats': updated_stats
            }

            return JsonResponse(response_data)
        else:
            # Return form errors as JSON with a 400 status
            return JsonResponse({'errors': form.errors}, status=400)

    # Handle standard GET requests (initial page load)
    user_diagnoses = Diagnosis.objects.filter(user=request.user)
    last_30_days = timezone.now() - timedelta(days=30)

    # Get the latest diagnosis confidence for the user, if any
    latest_confidence = None
    latest_diag = user_diagnoses.order_by('-created_at').first()
    if latest_diag:
        latest_confidence = latest_diag.confidence

    stats = {
        'diagnoses_this_month': user_diagnoses.filter(created_at__gte=last_30_days).count(),
        'accuracy_rate': latest_confidence if latest_confidence is not None else 0,
        'diseases_detected': user_diagnoses.values('disease_name').distinct().count()
    }

    # Calculate unread alert notifications for the user
    unread_alerts = 0
    if request.user.is_authenticated:
        unread_alerts = request.user.notifications.filter(type='ALERT', is_read=False).count()

    context = {
        'form': DiagnosisForm(), # Always provide an empty form for the initial page
        'stats': stats,
        'diagnosis': None, # The initial page has no diagnosis result
        'unread_alerts': unread_alerts
    }

    title = "Dashboard - Agricure"

    # Handle AJAX requests for page navigation
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('diagnosis/_dashboard_partial.html', context, request=request)
        return JsonResponse({'html': html, 'title': title})

    context['title'] = title
    return render(request, 'diagnosis/dashboard.html', context)

@login_required
def diagnosis_history_view(request):
    diagnoses = Diagnosis.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'diagnosis/diagnosis_history.html', {'diagnoses': diagnoses})