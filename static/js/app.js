// --- Main App JavaScript - Loads app-specific scripts dynamically ---

// Main initializer - loads only the necessary scripts based on current page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons globally
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Initialize app-specific scripts based on page content
  initializePageSpecificScripts();
});

function initializePageSpecificScripts() {
  const pageContainer =
    document.getElementById("main-content") || document.body;

  // Check for recommendations page
  if (pageContainer.querySelector("#notification-tabs")) {
    loadScript("/static/js/recommendations/recommendations.js", function () {
      if (typeof initializeRecommendationsScript === "function") {
        initializeRecommendationsScript();
      }
    });
  }

  // Check for diagnosis dashboard page
  if (pageContainer.querySelector("#upload-form")) {
    loadScript("/static/js/diagnosis/dashboard.js", function () {
      // Call initialization function after script loads or if already loaded
      if (typeof initializeDashboardScript === "function") {
        initializeDashboardScript();
      }
    });
  }

  // Check for IoT dashboard page
  if (pageContainer.querySelector("#tempHumidityChart")) {
    loadScript("/static/js/iot/dashboard.js", function () {
      if (typeof initializeIoTScript === "function") {
        initializeIoTScript();
      }
    });
  }

  // Check for history page
  if (pageContainer.querySelector(".history-container, .diagnosis-history")) {
    loadScript("/static/js/history/history.js", function () {
      if (typeof initializeHistoryScript === "function") {
        initializeHistoryScript();
      }
    });
  }

  // Check for user/auth forms
  if (
    pageContainer.querySelector(
      "#login-form, #register-form, #password-reset-form, #profile-form"
    )
  ) {
    loadScript("/static/js/users/auth.js");
  }
}

function loadScript(src, callback) {
  // Check if script is already loaded
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    // Script already exists, call callback immediately
    if (callback) callback();
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.onload = function () {
    if (callback) callback();
  };
  script.onerror = function () {
    console.warn(`Failed to load script: ${src}`);
  };
  document.head.appendChild(script);
}
