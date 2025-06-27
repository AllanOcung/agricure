// --- Shared/Common JavaScript functionality ---

// Initialize Lucide icons when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons globally
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// Common utility functions can be added here
window.AgricureUtils = {
  // CSRF token helper
  getCsrfToken: function () {
    const token = document.querySelector("[name=csrfmiddlewaretoken]");
    return token ? token.value : null;
  },

  // Common fetch helper with CSRF
  fetchWithCsrf: function (url, options = {}) {
    const csrfToken = this.getCsrfToken();
    const headers = {
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  },

  // Show loading state helper
  showLoading: function (element, text = "Loading...") {
    if (element) {
      element.innerHTML = `<i data-lucide="loader-2" class="animate-spin h-4 w-4 mr-2"></i> ${text}`;
      element.disabled = true;
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  },

  // Hide loading state helper
  hideLoading: function (element, originalText = "Submit") {
    if (element) {
      element.innerHTML = originalText;
      element.disabled = false;
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  },

  // Simple notification helper
  showNotification: function (message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-200"
        : type === "error"
        ? "bg-red-100 text-red-800 border border-red-200"
        : type === "warning"
        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
        : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  },
};
