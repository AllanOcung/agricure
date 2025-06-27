// --- IoT App JavaScript ---
function initializeIoTScript() {
  const pageContainer = document.getElementById("main-content");
  if (!pageContainer) return;

  // Check if we're on the IoT dashboard page
  const tempChart = pageContainer.querySelector("#tempHumidityChart");
  if (!tempChart) return;

  // Check if already initialized to prevent duplicate event listeners
  if (tempChart.hasAttribute("data-initialized")) {
    return;
  }
  tempChart.setAttribute("data-initialized", "true");

  if (typeof Chart === "undefined") {
    console.error("IoT: Chart.js is not loaded!");
    return;
  }

  let realTimeInterval;
  let tempHumidityChart, soilMoistureChart, lightIntensityChart;

  // Function to initialize charts
  function initializeCharts() {
    const iotDataDiv = document.getElementById("iot-data");
    let historicalData = [];

    if (iotDataDiv) {
      try {
        const rawData = iotDataDiv.dataset.historical;
        historicalData = JSON.parse(rawData || "[]");
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
    if (tempCtx) {
      if (tempHumidityChart) tempHumidityChart.destroy();
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
            y: { type: "linear", display: true, position: "left" },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              grid: { drawOnChartArea: false },
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
    document.querySelectorAll(".time-range-btn").forEach((btn) => {
      if (btn.dataset.range === range) {
        btn.className =
          "time-range-btn px-4 py-2 text-sm font-medium rounded-md transition-colors bg-green-600 text-white";
      } else {
        btn.className =
          "time-range-btn px-4 py-2 text-sm font-medium rounded-md transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
      }
    });

    fetch(`/iot/api/historical/?range=${range}`)
      .then((response) => response.json())
      .then((data) => {
        const newData = data.data;
        const iotDataDiv = document.getElementById("iot-data");
        if (iotDataDiv) {
          iotDataDiv.dataset.historical = JSON.stringify(newData);
        }

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
        const tempValue = pageContainer.querySelector(".temperature-value");
        const tempStatus = pageContainer.querySelector(".temperature-status");
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
          tempStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.temperature_status}`;
        }
        if (tempRecommendation)
          tempRecommendation.textContent = data.temperature_recommendation;

        // Update humidity
        const humidityValue = pageContainer.querySelector(".humidity-value");
        const humidityStatus = pageContainer.querySelector(".humidity-status");
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
          humidityStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.humidity_status}`;
        }
        if (humidityRecommendation)
          humidityRecommendation.textContent = data.humidity_recommendation;

        // Update soil moisture
        const soilValue = pageContainer.querySelector(".soil-moisture-value");
        const soilStatus = pageContainer.querySelector(".soil-moisture-status");
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
          soilStatus.className = `px-2 py-1 rounded-full text-xs font-medium status-${data.soil_moisture_status}`;
        }
        if (soilRecommendation)
          soilRecommendation.textContent = data.soil_moisture_recommendation;

        // Update light intensity
        const lightValue = pageContainer.querySelector(
          ".light-intensity-value"
        );
        const lightRecommendation = pageContainer.querySelector(
          ".light-intensity-recommendation"
        );

        if (lightValue)
          lightValue.textContent = `${Math.round(data.light_intensity)} lux`;
        if (lightRecommendation)
          lightRecommendation.textContent = data.light_intensity_recommendation;

        // Update last updated timestamp
        const lastUpdated = pageContainer.querySelector(".last-updated");
        if (lastUpdated) {
          const now = new Date();
          lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }

        // Add visual feedback for data update
        pageContainer.querySelectorAll(".sensor-card").forEach((card) => {
          card.style.transform = "scale(1.02)";
          setTimeout(() => {
            card.style.transform = "scale(1)";
          }, 200);
        });
      })
      .catch((error) => {
        console.error("Error fetching current IoT data:", error);
      });
  }

  // Start real-time updates every 30 seconds
  function startRealTimeUpdates() {
    updateCurrentReadings();
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

  // Initialize charts and real-time updates
  initializeCharts();
  startRealTimeUpdates();

  // Clean up when leaving the page
  window.addEventListener("beforeunload", stopRealTimeUpdates);
}

// Initialize when DOM is loaded OR when script is dynamically loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeIoTScript();
});

// Also initialize immediately if DOM is already loaded (for AJAX navigation)
if (document.readyState === "loading") {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initializeIoTScript);
} else {
  // DOM is already loaded, initialize immediately
  initializeIoTScript();
}
