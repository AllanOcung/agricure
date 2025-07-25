// --- Page-Specific Initializers ---
function initializeRecommendationsScript() {
  const pageContainer = document.getElementById("main-content");
  const tabContainer = pageContainer.querySelector("#notification-tabs");
  if (!tabContainer) return; // Exit if not on the recommendations page

  const tabContent = pageContainer.querySelector("#tab-content");
  const modal = pageContainer.querySelector("#notification-modal");
  const modalContentContainer = pageContainer.querySelector(
    "#modal-content-container"
  );
  const partialUrl = "{% url 'recommendations:partial' %}";

  const tabClasses = {
    alerts: {
      active: "border-red-500 text-red-600",
      inactive:
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    recommendations: {
      active: "border-green-500 text-green-600",
      inactive:
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    weather: {
      active: "border-blue-500 text-blue-600",
      inactive:
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
  };

  pageContainer.addEventListener("click", function (e) {
    const csrfToken = pageContainer.querySelector(
      "[name=csrfmiddlewaretoken]"
    )?.value;
    const tabButton = e.target.closest(".tab-button");
    if (tabButton) {
      e.preventDefault();
      const tabName = tabButton.dataset.tab;
      pageContainer.querySelectorAll(".tab-button").forEach((btn) => {
        const name = btn.dataset.tab;
        btn.className = `tab-button py-2 px-1 border-b-2 font-medium text-sm flex items-center ${tabClasses[name].inactive}`;
      });
      tabButton.className = `tab-button py-2 px-1 border-b-2 font-medium text-sm flex items-center ${tabClasses[tabName].active}`;
      fetch(`${partialUrl}?tab=${tabName}`)
        .then((response) => response.text())
        .then((html) => {
          tabContent.innerHTML = html;
          lucide.createIcons();
        });
      const url = new URL(window.location);
      url.searchParams.set("tab", tabName);
      window.history.pushState({}, "", url);
      return;
    }
    const viewDetailsButton = e.target.closest(".view-details-button");
    if (viewDetailsButton) {
      e.preventDefault();
      const url = viewDetailsButton.dataset.url;
      modalContentContainer.innerHTML =
        '<p class="text-center">Loading...</p>';
      modal.classList.remove("hidden");
      fetch(url)
        .then((response) => response.text())
        .then((html) => {
          modalContentContainer.innerHTML = html;
          lucide.createIcons();
        });
      return;
    }
    const markAsReadButton = e.target.closest(".mark-as-read-button");
    if (markAsReadButton) {
      e.preventDefault();
      const url = markAsReadButton.dataset.url;
      fetch(url, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const card = markAsReadButton.closest(
              "[data-notification-card-id]"
            );
            card.querySelector("[data-unread-indicator-id]")?.remove();
            markAsReadButton.remove();
          }
        });
      return;
    }
    if (
      e.target.id === "notification-modal" ||
      e.target.closest("#close-modal-button")
    ) {
      modal.classList.add("hidden");
    }
  });
}

function initializeHistoryScript() {
  const container = document.getElementById("history-container");
  if (!container) return; // Exit if not on the history page

  const listView = container.querySelector("#list-view");
  const analyticsView = container.querySelector("#analytics-view");
  const listBtn = container.querySelector("#view-list-btn");
  const analyticsBtn = container.querySelector("#view-analytics-btn");

  const monthlyTrendCanvas =
    container.querySelector("#monthlyTrendChart");
  const severityPieCanvas = container.querySelector("#severityPieChart");

  // --- View Toggling ---
  function setView(view) {
    if (view === "analytics") {
      listView.classList.add("hidden");
      analyticsView.classList.remove("hidden");
      analyticsBtn.classList.replace("bg-white", "bg-green-600");
      analyticsBtn.classList.replace("text-gray-700", "text-white");
      listBtn.classList.replace("bg-green-600", "bg-white");
      listBtn.classList.replace("text-white", "text-gray-700");
    } else {
      // list view
      analyticsView.classList.add("hidden");
      listView.classList.remove("hidden");
      listBtn.classList.replace("bg-white", "bg-green-600");
      listBtn.classList.replace("text-gray-700", "text-white");
      analyticsBtn.classList.replace("bg-green-600", "bg-white");
      analyticsBtn.classList.replace("text-white", "text-gray-700");
    }
  }

  listBtn.addEventListener("click", () => setView("list"));
  analyticsBtn.addEventListener("click", () => setView("analytics"));

  // --- Chart Rendering ---
  if (window.monthlyChartInstance) window.monthlyChartInstance.destroy();
  if (window.severityChartInstance)
    window.severityChartInstance.destroy();

  if (monthlyTrendCanvas) {
    const monthlyLabels = JSON.parse(monthlyTrendCanvas.dataset.labels);
    const monthlyData = JSON.parse(monthlyTrendCanvas.dataset.values);
    window.monthlyChartInstance = new Chart(monthlyTrendCanvas, {
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Diagnoses",
            data: monthlyData,
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
  if (severityPieCanvas) {
    const severityLabels = JSON.parse(severityPieCanvas.dataset.labels);
    const severityData = JSON.parse(severityPieCanvas.dataset.values);
    window.severityChartInstance = new Chart(severityPieCanvas, {
      type: "pie",
      data: {
        labels: severityLabels,
        datasets: [
          {
            label: "Severity",
            data: severityData,
            backgroundColor: ["#EF4444", "#10B981", "#F59E0B"],
          },
        ],
      }, // High, Low, Medium
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        maintainAspectRatio: false,
      },
    });
  }
}

function initializeDashboardScript() {
  const uploadForm = document.getElementById("upload-form");
  if (!uploadForm) return; // Exit if not on the dashboard page

  const fileInput = document.getElementById("id_image");
  const csrfToken = document.querySelector(
    "[name=csrfmiddlewaretoken]"
  )?.value;

  const initialStateUI = document.getElementById("initial-state-ui");
  const previewStateUI = document.getElementById("preview-state-ui");
  const previewImage = document.getElementById("preview-image");
  const resetBtn = document.getElementById("reset-upload");
  const analyzeBtn = document.getElementById("analyze-btn");

  const resultsContent = document.getElementById("results-content");
  const resultsPlaceholder = document.getElementById(
    "results-placeholder"
  );
  const resultsLoader = document.getElementById("results-loader");
  const formErrorsDiv = document.getElementById("form-errors");

  if (fileInput) fileInput.classList.add("hidden");

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0])
      handleFile(e.target.files[0]);
  });

  const dropArea = document.getElementById("drag-drop-area");
  if (dropArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach(
      (eventName) => {
        dropArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }
    );
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
    const diseasesElement = document.getElementById(
      "diseases-detected-stat"
    );

    if (diagnosesElement)
      diagnosesElement.textContent = stats.diagnoses_this_month;
    if (accuracyElement)
      accuracyElement.textContent = stats.accuracy_rate + "%";
    if (diseasesElement)
      diseasesElement.textContent = stats.diseases_detected;
  }

  function updateResultsUI(data) {
    const severityLower = data.severity.toLowerCase();
    let severityClass = "text-gray-600 bg-gray-100";
    if (severityLower === "low")
      severityClass = "text-green-600 bg-green-100";
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
    resultsPlaceholder.classList.add("hidden");
    lucide.createIcons();
  }
}

// --- Page-Specific Initializer for IoT Dashboard ---
function initializeIoTScript() {
  console.log("IoT: initializeIoTScript called");
  const pageContainer = document.getElementById("main-content");
  console.log("IoT: pageContainer found:", pageContainer);

  // Check if we're on the IoT dashboard page
  const tempChart = pageContainer
    ? pageContainer.querySelector("#tempHumidityChart")
    : null;
  console.log("IoT: tempHumidityChart element found:", tempChart);

  if (!tempChart) {
    console.log("IoT: Not on IoT dashboard page, exiting");
    return;
  }

  console.log(
    "IoT: Dashboard detected, Chart.js available:",
    typeof Chart !== "undefined"
  );
  if (typeof Chart === "undefined") {
    console.error("IoT: Chart.js is not loaded!");
    return;
  }

  let realTimeInterval;
  let tempHumidityChart, soilMoistureChart, lightIntensityChart;

  // Function to initialize charts
  function initializeCharts() {
    // Get historical data from the JSON script tag
    const iotDataScript = document.getElementById("iot-data");
    let historicalData = [];

    console.log("IoT: initializeCharts called");
    console.log("IoT: iotDataScript found:", iotDataScript);

    if (iotDataScript) {
      try {
        const rawData = iotDataScript.textContent;
        console.log("IoT: raw historical data:", rawData);
        historicalData = JSON.parse(rawData || "[]");
        console.log("IoT: parsed historical data:", historicalData);
      } catch (e) {
        console.error("Error parsing historical data:", e);
        historicalData = [];
      }
    }

    if (historicalData.length === 0) {
      console.warn("IoT: No historical data available");
      return;
    }

    // Temperature & Humidity Chart
    const tempCtx = document.getElementById("tempHumidityChart");
    console.log("IoT: tempCtx found:", tempCtx);
    if (tempCtx) {
      if (tempHumidityChart) tempHumidityChart.destroy();
      console.log(
        "IoT: Creating temperature chart with data:",
        historicalData.map((d) => d.temperature)
      );
      tempHumidityChart = new Chart(tempCtx, {
        type: "line",
        data: {
          labels: historicalData.map((d) => d.time),
          datasets: [
            {
              label: "Temperature (°C)",
              data: historicalData.map((d) => d.temperature),
              borderColor: "#EF4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Humidity (%)",
              data: historicalData.map((d) => d.humidity),
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });
    }

    // Soil Moisture Chart
    const soilCtx = document.getElementById("soilMoistureChart");
    if (soilCtx) {
      if (soilMoistureChart) soilMoistureChart.destroy();
      soilMoistureChart = new Chart(soilCtx, {
        type: "line",
        data: {
          labels: historicalData.map((d) => d.time),
          datasets: [
            {
              label: "Soil Moisture (%)",
              data: historicalData.map((d) => d.soil_moisture),
              borderColor: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    // Light Intensity Chart
    const lightCtx = document.getElementById("lightIntensityChart");
    if (lightCtx) {
      if (lightIntensityChart) lightIntensityChart.destroy();
      lightIntensityChart = new Chart(lightCtx, {
        type: "line",
        data: {
          labels: historicalData.map((d) => d.time),
          datasets: [
            {
              label: "Light Intensity (lux)",
              data: historicalData.map((d) => d.light_intensity),
              borderColor: "#F59E0B",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }

  // Function to change time range
  function changeTimeRange(range) {
    // Update button states
    document.querySelectorAll(".time-range-btn").forEach((btn) => {
      if (btn.dataset.range === range) {
        btn.className =
          "time-range-btn px-4 py-2 text-sm font-medium rounded-md transition-colors bg-green-600 text-white";
      } else {
        btn.className =
          "time-range-btn px-4 py-2 text-sm font-medium rounded-md transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
      }
    });

    // Fetch new data and update charts
    fetch(`/iot/api/historical/?range=${range}`)
      .then((response) => response.json())
      .then((data) => {
        // Update historical data in the script tag
        const newData = data.data;
        const iotDataScript = document.getElementById("iot-data");
        if (iotDataScript) {
          iotDataScript.textContent = JSON.stringify(newData);
        }

        // Update chart data
        if (tempHumidityChart) {
          tempHumidityChart.data.labels = newData.map((d) => d.time);
          tempHumidityChart.data.datasets[0].data = newData.map(
            (d) => d.temperature
          );
          tempHumidityChart.data.datasets[1].data = newData.map(
            (d) => d.humidity
          );
          tempHumidityChart.update();
        }

        if (soilMoistureChart) {
          soilMoistureChart.data.labels = newData.map((d) => d.time);
          soilMoistureChart.data.datasets[0].data = newData.map(
            (d) => d.soil_moisture
          );
          soilMoistureChart.update();
        }

        if (lightIntensityChart) {
          lightIntensityChart.data.labels = newData.map((d) => d.time);
          lightIntensityChart.data.datasets[0].data = newData.map(
            (d) => d.light_intensity
          );
          lightIntensityChart.update();
        }
      })
      .catch((error) =>
        console.error("Error fetching historical data:", error)
      );
  }

  // Function to update current readings
  function updateCurrentReadings() {
    fetch("/iot/api/current/")
      .then((response) => response.json())
      .then((data) => {
        // Update temperature
        const tempValue =
          pageContainer.querySelector(".temperature-value");
        const tempStatus = pageContainer.querySelector(
          ".temperature-status"
        );
        const tempRecommendation = pageContainer.querySelector(
          ".temperature-recommendation"
        );

        if (tempValue)
          tempValue.textContent = `${data.temperature.toFixed(1)}°C`;
        if (tempStatus) {
          tempStatus.textContent =
            data.temperature_status === "optimal"
              ? "Optimal"
              : data.temperature_status === "warning"
              ? "Warning"
              : "Critical";
          tempStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.temperature_status} temperature-status`;
        }
        if (tempRecommendation)
          tempRecommendation.textContent =
            data.temperature_recommendation;

        // Update humidity
        const humidityValue =
          pageContainer.querySelector(".humidity-value");
        const humidityStatus =
          pageContainer.querySelector(".humidity-status");
        const humidityRecommendation = pageContainer.querySelector(
          ".humidity-recommendation"
        );

        if (humidityValue)
          humidityValue.textContent = `${data.humidity.toFixed(1)}%`;
        if (humidityStatus) {
          humidityStatus.textContent =
            data.humidity_status === "optimal"
              ? "Optimal"
              : data.humidity_status === "warning"
              ? "Warning"
              : "Critical";
          humidityStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.humidity_status} humidity-status`;
        }
        if (humidityRecommendation)
          humidityRecommendation.textContent =
            data.humidity_recommendation;

        // Update soil moisture
        const soilValue = pageContainer.querySelector(
          ".soil-moisture-value"
        );
        const soilStatus = pageContainer.querySelector(
          ".soil-moisture-status"
        );
        const soilRecommendation = pageContainer.querySelector(
          ".soil-moisture-recommendation"
        );

        if (soilValue)
          soilValue.textContent = `${data.soil_moisture.toFixed(1)}%`;
        if (soilStatus) {
          soilStatus.textContent =
            data.soil_moisture_status === "optimal"
              ? "Optimal"
              : data.soil_moisture_status === "warning"
              ? "Warning"
              : "Critical";
          soilStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.soil_moisture_status} soil-moisture-status`;
        }
        if (soilRecommendation)
          soilRecommendation.textContent =
            data.soil_moisture_recommendation;

        // Update light intensity
        const lightValue = pageContainer.querySelector(
          ".light-intensity-value"
        );
        const lightRecommendation = pageContainer.querySelector(
          ".light-intensity-recommendation"
        );

        if (lightValue)
          lightValue.textContent = `${Math.round(
            data.light_intensity
          )} lux`;
        if (lightRecommendation)
          lightRecommendation.textContent =
            data.light_intensity_recommendation;

        // Update last updated timestamp
        const lastUpdated = pageContainer.querySelector(".last-updated");
        if (lastUpdated) {
          const now = new Date();
          lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }

        // Add a subtle flash effect to indicate update
        const cards = pageContainer.querySelectorAll(".sensor-card");
        cards.forEach((card) => {
          card.style.backgroundColor = "#f0fdf4";
          setTimeout(() => {
            card.style.backgroundColor = "";
          }, 500);
        });
      })
      .catch((error) => {
        console.error("Error fetching current IoT data:", error);
      });
  }

  // Start real-time updates every 30 seconds
  function startRealTimeUpdates() {
    // Update immediately
    updateCurrentReadings();

    // Then update every 30 seconds
    realTimeInterval = setInterval(updateCurrentReadings, 30000);
  }

  // Stop real-time updates
  function stopRealTimeUpdates() {
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      realTimeInterval = null;
    }
  }

  // Add event delegation for time range buttons
  pageContainer.addEventListener("click", function (e) {
    const timeRangeBtn = e.target.closest(".time-range-btn");
    if (timeRangeBtn) {
      e.preventDefault();
      const range = timeRangeBtn.dataset.range;
      changeTimeRange(range);
    }
  });

  // Initialize charts
  initializeCharts();

  // Initialize real-time updates
  startRealTimeUpdates();

  // Clean up when leaving the page
  window.addEventListener("beforeunload", stopRealTimeUpdates);

  // Also clean up when navigating with AJAX
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "childList" &&
        mutation.target === pageContainer
      ) {
        // Page content changed, clean up if IoT dashboard is no longer visible
        if (!pageContainer.querySelector("#tempHumidityChart")) {
          stopRealTimeUpdates();
        }
      }
    });
  });

  observer.observe(pageContainer, { childList: true });
}

// --- Global Initializer for static elements like navbar ---
function initializeGlobalScripts() {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const openIcon = document.getElementById("mobile-menu-open-icon");
  const closeIcon = document.getElementById("mobile-menu-close-icon");
  const profileMenuButton = document.getElementById(
    "profile-menu-button"
  );
  const profileMenu = document.getElementById("profile-menu");

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      openIcon.classList.toggle("hidden");
      closeIcon.classList.toggle("hidden");
    });
  }

  if (profileMenuButton) {
    profileMenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      profileMenu.classList.toggle("hidden");
    });
  }

  document.addEventListener("click", (event) => {
    if (profileMenu && !profileMenu.classList.contains("hidden")) {
      if (
        !profileMenuButton.contains(event.target) &&
        !profileMenu.contains(event.target)
      ) {
        profileMenu.classList.add("hidden");
      }
    }
  });

  // Initialize navigation active states
  updateActiveNavigation();
}

// Function to update active navigation based on current URL
function updateActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("[data-nav-item]");

  // Remove active class from all nav links
  navLinks.forEach((link) => link.classList.remove("active"));

  // Determine which nav item should be active
  let activeItem = "";
  if (currentPath.includes("/dashboard") || currentPath === "/") {
    activeItem = "dashboard";
  } else if (currentPath.includes("/notifications")) {
    activeItem = "recommendations";
  } else if (currentPath.includes("/history")) {
    activeItem = "history";
  } else if (currentPath.includes("/iot")) {
    activeItem = "iot";
  }

  // Add active class to matching nav links
  if (activeItem) {
    const activeLinks = document.querySelectorAll(
      `[data-nav-item="${activeItem}"]`
    );
    activeLinks.forEach((link) => link.classList.add("active"));
  }
}

// --- Page Content Initializer ---
function initializePageScripts() {
  lucide.createIcons();
  initializeRecommendationsScript();
  initializeHistoryScript();
  initializeDashboardScript();
  initializeIoTScript();
  // Add other page-specific initializers here
}

document.addEventListener("DOMContentLoaded", function () {
  const mainContent = document.getElementById("main-content");
  const body = document.body;

  const fetchAndLoadPage = (url, pushState = true) => {
    mainContent.style.opacity = "0.5";
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((response) => response.json())
      .then((data) => {
        mainContent.innerHTML = data.html;
        document.title = data.title;
        if (pushState) {
          history.pushState({ path: url }, data.title, url);
        }
        initializePageScripts(); // Re-run all initializers for new content
        updateActiveNavigation(); // Update active navigation state
      })
      .catch((error) => {
        console.error("AJAX navigation error:", error);
        window.location.href = url;
      })
      .finally(() => {
        mainContent.style.opacity = "1";
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          document.getElementById("mobile-menu-button").click();
        }
      });
  };

  body.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-link");
    if (link && !link.hasAttribute("data-no-ajax")) {
      e.preventDefault();
      fetchAndLoadPage(link.getAttribute("href"));
    }
  });

  // Add this new event listener for form submissions inside the main content area
  mainContent.addEventListener("submit", (e) => {
    if (e.target.id === "history-filter-form") {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const params = new URLSearchParams(formData);
      const url = `${form.action}?${params.toString()}`;
      fetchAndLoadPage(url);
    }
  });

  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.path) {
      fetchAndLoadPage(e.state.path, false);
    } else {
      // Handle direct navigation or page refresh
      updateActiveNavigation();
    }
  });

  // Run initializers on first page load
  initializeGlobalScripts();
  initializePageScripts();
});