document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize dashboard functionality
    initializeDashboardScript();
});

function initializeDashboardScript() {
    const uploadForm = document.getElementById("upload-form");
    if (!uploadForm) return;

    const fileInput = document.getElementById("id_image");
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
    const initialStateUI = document.getElementById("initial-state-ui");
    const previewStateUI = document.getElementById("preview-state-ui");
    const previewImage = document.getElementById("preview-image");
    const resetBtn = document.getElementById("reset-upload");
    const analyzeBtn = document.getElementById("analyze-btn");
    const resultsContent = document.getElementById("results-content");
    const resultsPlaceholder = document.getElementById("results-placeholder");
    const resultsLoader = document.getElementById("results-loader");
    const formErrorsDiv = document.getElementById("form-errors");
    const dropArea = document.getElementById("drag-drop-area");

    // Hide file input (using Tailwind class)
    fileInput.classList.add("hidden");

    // File input change handler
    fileInput.addEventListener("change", function(e) {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop functionality
    if (dropArea) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        dropArea.addEventListener("drop", handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add("border-green-500", "bg-green-50");
    }

    function unhighlight() {
        dropArea.classList.remove("border-green-500", "bg-green-50");
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFile(files[0]);
        }
    }

    function handleFile(file) {
        if (file && file.type.match('image.*')) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                displayFormErrors({ image: ['File size must be less than 10MB'] });
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                initialStateUI.classList.add("hidden");
                previewStateUI.classList.remove("hidden");
                analyzeBtn.disabled = false;
                formErrorsDiv.classList.add("hidden");
            };
            reader.readAsDataURL(file);
        } else {
            displayFormErrors({ image: ['Please select an image file (JPG, PNG, WebP)'] });
        }
    }

    function resetUploadUI() {
        uploadForm.reset();
        previewImage.src = "";
        initialStateUI.classList.remove("hidden");
        previewStateUI.classList.add("hidden");
    }

    resetBtn.addEventListener("click", resetUploadUI);

    uploadForm.addEventListener("submit", function(e) {
        e.preventDefault();

        if (!fileInput.files || fileInput.files.length === 0) {
            displayFormErrors({ image: ['Please select an image file'] });
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin h-4 w-4 mr-2"></i> Analyzing...';
        lucide.createIcons();

        resultsPlaceholder.classList.add("hidden");
        resultsLoader.classList.remove("hidden");
        formErrorsDiv.classList.add("hidden");

        const formData = new FormData(uploadForm);

        fetch(window.location.href, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": csrfToken
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(err => { throw err; });
        })
        .then(data => {
            setTimeout(() => {
                updateResultsUI(data.diagnosis);
                resetUploadUI();

                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i data-lucide="image" class="h-4 w-4 mr-2"></i> Analyze Crop';
                lucide.createIcons();
            }, 2000);
        })
        .catch(error => {
            console.error("Error:", error);
            if (error.errors) {
                displayFormErrors(error.errors);
            } else {
                displayFormErrors({ __all__: ['An unexpected error occurred. Please try again.'] });
            }
            resultsLoader.classList.add("hidden");
            resultsPlaceholder.classList.remove("hidden");
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i data-lucide="image" class="h-4 w-4 mr-2"></i> Analyze Crop';
            lucide.createIcons();
        });
    });

    function displayFormErrors(errors) {
        let errorHTML = '<p class="font-bold">Please correct the errors below:</p><ul class="list-disc list-inside mt-1">';
        for (const field in errors) {
            errors[field].forEach(error => {
                errorHTML += `<li>${error}</li>`;
            });
        }
        errorHTML += "</ul>";
        formErrorsDiv.innerHTML = errorHTML;
        formErrorsDiv.classList.remove("hidden");
    }

    function updateResultsUI(data) {
        const severityLower = data.severity.toLowerCase();
        let severityClass = "text-gray-600 bg-gray-100";
        if (severityLower === "low") severityClass = "text-green-600 bg-green-100";
        else if (severityLower === "medium") severityClass = "text-yellow-600 bg-yellow-100";
        else if (severityLower === "high") severityClass = "text-red-600 bg-red-100";

        let recommendationsHTML = "";
        data.recommendations_list.forEach((rec, index) => {
            recommendationsHTML += `
                <li class="flex items-start">
                    <span class="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">${
                        index + 1
                    }</span>
                    <span class="text-sm text-gray-700">${rec}</span>
                </li>`;
        });

        const resultsHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${
                                data.disease_name
                            }</h3>
                            <p class="text-sm text-gray-600">Affected: ${
                                data.affected_plant_part
                            }</p>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${severityClass}">
                                ${data.severity.toUpperCase()} SEVERITY
                            </span>
                            <span class="text-sm font-medium text-green-600">${
                                data.confidence
                            }% confidence</span>
                        </div>
                    </div>
                    <p class="text-gray-700 text-sm">${
                        data.description
                    }</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <i data-lucide="check-circle" class="h-5 w-5 text-green-600 mr-2"></i>
                        Treatment Recommendations
                    </h4>
                    <ul class="space-y-2">${recommendationsHTML}</ul>
                </div>
            </div>`;

        resultsContent.innerHTML = resultsHTML;
        resultsLoader.classList.add("hidden");
        lucide.createIcons();
    }
}