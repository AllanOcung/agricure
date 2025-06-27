// --- Diagnosis App JavaScript (Dashboard functionality) ---
function initializeDashboardScript() {
  const uploadForm = document.getElementById("upload-form");
  if (!uploadForm) return; // Exit if not on the dashboard page

  // Check if already initialized to prevent duplicate event listeners
  if (uploadForm.hasAttribute("data-initialized")) {
    return;
  }
  uploadForm.setAttribute("data-initialized", "true");

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

  if (fileInput) fileInput.classList.add("hidden");

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  });

  const dropArea = document.getElementById("drag-drop-area");
  if (dropArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, () =>
        dropArea.classList.add("border-green-500", "bg-green-50")
      );
    });
    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, () =>
        dropArea.classList.remove("border-green-500", "bg-green-50")
      );
    });
    dropArea.addEventListener("drop", (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
      previewImage.src = URL.createObjectURL(file);
      initialStateUI.classList.add("hidden");
      previewStateUI.classList.remove("hidden");
      analyzeBtn.disabled = false;
      formErrorsDiv.classList.add("hidden");
    }
  }

  function resetUploadUI() {
    uploadForm.reset();
    previewImage.src = "";
    initialStateUI.classList.remove("hidden");
    previewStateUI.classList.add("hidden");
  }

  resetBtn.addEventListener("click", resetUploadUI);

  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (fileInput.files.length === 0) {
      displayFormErrors({ image: ["This field is required."] });
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin h-4 w-4 mr-2"></i> Analyzing...`;
    lucide.createIcons();

    resultsPlaceholder.classList.add("hidden");
    resultsLoader.classList.remove("hidden");
    formErrorsDiv.classList.add("hidden");

    const formData = new FormData(uploadForm);

    fetch(window.location.href, {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": csrfToken,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((err) => {
          throw err;
        });
      })
      .then((data) => {
        setTimeout(() => {
          updateResultsUI(data.diagnosis);
          updateStatsUI(data.stats);
          resetUploadUI();

          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = `<i data-lucide="image" class="h-4 w-4 mr-2"></i> Analyze Crop`;
          lucide.createIcons();
        }, 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.errors) {
          displayFormErrors(error.errors);
        } else {
          displayFormErrors({
            __all__: ["An unexpected error occurred. Please try again."],
          });
        }
        resultsLoader.classList.add("hidden");
        resultsPlaceholder.classList.remove("hidden");

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<i data-lucide="image" class="h-4 w-4 mr-2"></i> Analyze Crop`;
        lucide.createIcons();
      });
  });

  function displayFormErrors(errors) {
    let errorHTML =
      '<p class="font-bold">Please correct the errors below:</p><ul class="list-disc list-inside mt-1">';
    for (const field in errors) {
      errors[field].forEach((error) => {
        errorHTML += `<li>${error}</li>`;
      });
    }
    errorHTML += "</ul>";
    formErrorsDiv.innerHTML = errorHTML;
    formErrorsDiv.classList.remove("hidden");
  }

  function updateStatsUI(stats) {
    const diagnosesElement = document.getElementById(
      "diagnoses-this-month-stat"
    );
    const accuracyElement = document.getElementById("accuracy-rate-stat");
    const diseasesElement = document.getElementById("diseases-detected-stat");

    if (diagnosesElement)
      diagnosesElement.textContent = stats.diagnoses_this_month;
    if (accuracyElement)
      accuracyElement.textContent = stats.accuracy_rate + "%";
    if (diseasesElement) diseasesElement.textContent = stats.diseases_detected;
  }

  function updateResultsUI(data) {
    const severityLower = data.severity.toLowerCase();
    let severityClass = "text-gray-600 bg-gray-100";
    if (severityLower === "low") severityClass = "text-green-600 bg-green-100";
    else if (severityLower === "medium")
      severityClass = "text-yellow-600 bg-yellow-100";
    else if (severityLower === "high")
      severityClass = "text-red-600 bg-red-100";

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
                    <p class="text-gray-700 text-sm">${data.description}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <i data-lucide="check-circle" class="h-5 w-5 text-green-600 mr-2"></i>
                        Treatment Recommendations
                    </h4>
                    <ul class="space-y-2">${recommendationsHTML}</ul>
                </div>
                <div class="flex space-x-3 pt-4 border-t border-gray-200">
                    <button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors" onclick="saveDiagnosis()">
                        Save Diagnosis
                    </button>
                    <button class="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors" onclick="getExpertOpinion()">
                        Get Expert Opinion
                    </button>
                </div>
            </div>`;

    resultsContent.innerHTML = resultsHTML;
    resultsLoader.classList.add("hidden");
    resultsPlaceholder.classList.add("hidden");

    // Show the refresh button when results are displayed
    const refreshBtn = document.getElementById("refresh-results-btn");
    if (refreshBtn) {
      refreshBtn.classList.remove("hidden");
    }

    lucide.createIcons();
  }

  // Function to save diagnosis
  window.saveDiagnosis = function () {
    // Show nice success notification
    showNotification("Diagnosis saved successfully!", "success");
  };

  // Function to get expert opinion
  window.getExpertOpinion = function () {

     window.location.href = "/notifications/";
//     // Show notification
//     showNotification("Redirecting to expert recommendations...", "info");

//     // Small delay to show the notification before redirecting
//     setTimeout(() => {
//       // Redirect to recommendations page
      
//     }, 500);
  };

  // Function to refresh results panel
  window.refreshResults = function () {
    resetResultsToInitialState();
  };

  // Function to show nice notifications
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    const bgColor =
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";
    const icon =
      type === "success"
        ? "check-circle"
        : type === "error"
        ? "x-circle"
        : "info";

    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 transform translate-x-full transition-transform duration-300 ease-out`;
    notification.innerHTML = `
      <i data-lucide="${icon}" class="h-5 w-5"></i>
      <span class="font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
        <i data-lucide="x" class="h-4 w-4"></i>
      </button>
    `;

    document.body.appendChild(notification);

    // Initialize lucide icons for the notification
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    // Slide in
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add("translate-x-full");
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  }

  // Function to reset results container to initial state
  function resetResultsToInitialState() {
    const resultsContent = document.getElementById("results-content");
    const resultsPlaceholder = document.getElementById("results-placeholder");
    const resultsLoader = document.getElementById("results-loader");
    const refreshBtn = document.getElementById("refresh-results-btn");

    if (resultsContent && resultsPlaceholder && resultsLoader) {
      // Hide loader
      resultsLoader.classList.add("hidden");

      // Hide refresh button
      if (refreshBtn) {
        refreshBtn.classList.add("hidden");
      }

      // Show placeholder with fade-in effect
      resultsContent.innerHTML = `
        <div class="text-center py-12 animate-fade-in" id="results-placeholder">
          <i data-lucide="image" class="h-16 w-16 text-gray-300 mx-auto mb-4"></i>
          <p class="text-gray-500">Upload and analyze an image to see results</p>
        </div>
      `;

      // Reinitialize lucide icons
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  }
}

// Initialize when DOM is loaded OR when script is dynamically loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboardScript();
});

// Also initialize immediately if DOM is already loaded (for AJAX navigation)
if (document.readyState === "loading") {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initializeDashboardScript);
} else {
  // DOM is already loaded, initialize immediately
  initializeDashboardScript();
}
