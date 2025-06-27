// --- Navbar JavaScript functionality ---

// Initialize navbar when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Navbar JavaScript loaded"); // Debug log
  initializeNavbar();
});

function initializeNavbar() {
  // Mobile menu toggle
  initializeMobileMenu();

  // Profile dropdown
  initializeProfileDropdown();

  // Notification bell
  initializeNotificationBell();

  // Smooth navigation
  initializeSmoothNavigation();
}

function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("close-icon");

  if (mobileMenuButton && mobileMenu && menuIcon && closeIcon) {
    console.log("Mobile menu elements found"); // Debug log

    mobileMenuButton.addEventListener("click", function (e) {
      e.preventDefault();
      const isHidden = mobileMenu.classList.contains("hidden");

      if (isHidden) {
        // Open menu
        mobileMenu.classList.remove("hidden");
        menuIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
      } else {
        // Close menu
        mobileMenu.classList.add("hidden");
        menuIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
      }
    });

    // Close mobile menu when clicking on mobile nav links
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        menuIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
      });
    });
  } else {
    console.log("Mobile menu elements not found"); // Debug log
  }
}

function initializeProfileDropdown() {
  const profileMenuButton = document.getElementById("profile-menu-button");
  const profileDropdown = document.getElementById("profile-dropdown");

  if (profileMenuButton && profileDropdown) {
    console.log("Profile dropdown elements found"); // Debug log

    profileMenuButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isHidden = profileDropdown.classList.contains("hidden");
      if (isHidden) {
        profileDropdown.classList.remove("hidden");
        console.log("Profile dropdown opened"); // Debug log
      } else {
        profileDropdown.classList.add("hidden");
        console.log("Profile dropdown closed"); // Debug log
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !profileMenuButton.contains(e.target) &&
        !profileDropdown.contains(e.target)
      ) {
        profileDropdown.classList.add("hidden");
      }
    });

    // Close dropdown when clicking on dropdown links
    const dropdownLinks = profileDropdown.querySelectorAll("a, button");
    dropdownLinks.forEach((link) => {
      link.addEventListener("click", function () {
        profileDropdown.classList.add("hidden");
      });
    });
  } else {
    console.log("Profile dropdown elements not found"); // Debug log
  }
}

function initializeNotificationBell() {
  const notificationBell = document.getElementById("notification-bell");
  if (notificationBell) {
    notificationBell.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Notification bell clicked"); // Debug log
      showNotification("Notifications functionality coming soon!", "info");
    });
  }
}

function initializeSmoothNavigation() {
  // Add AJAX navigation for all data-no-ajax links
  const navLinks = document.querySelectorAll("nav a[data-no-ajax]");
  console.log(`Found ${navLinks.length} navigation links`); // Debug log

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default navigation
      console.log(`AJAX navigating to: ${this.href}`); // Debug log

      // Don't handle logout links with AJAX
      if (this.href.includes("logout")) {
        window.location.href = this.href;
        return;
      }

      // Add visual feedback
      this.style.opacity = "0.7";
      this.style.transition = "opacity 0.2s";

      // Perform AJAX navigation
      fetch(this.href, {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.text();
        })
        .then((html) => {
          // Parse the response HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Update the main content
          const newContent = doc.querySelector("#main-content");
          const currentContent = document.querySelector("#main-content");

          if (newContent && currentContent) {
            currentContent.innerHTML = newContent.innerHTML;

            // Update the page title
            const newTitle = doc.querySelector("title");
            if (newTitle) {
              document.title = newTitle.textContent;
            }

            // Update the URL without page reload
            window.history.pushState({}, "", this.href);

            // Update active navbar link
            updateActiveNavLink(this.href);

            // Re-initialize Lucide icons
            if (typeof lucide !== "undefined") {
              lucide.createIcons();
            }

            // Re-initialize page-specific scripts
            if (typeof initializePageSpecificScripts === "function") {
              initializePageSpecificScripts();
            }

            console.log(`AJAX navigation completed to: ${this.href}`);
          } else {
            // Fallback to normal navigation
            window.location.href = this.href;
          }
        })
        .catch((error) => {
          console.error("AJAX navigation failed:", error);
          // Fallback to normal navigation
          window.location.href = this.href;
        })
        .finally(() => {
          // Restore visual feedback
          setTimeout(() => {
            this.style.opacity = "1";
          }, 300);
        });
    });
  });
}

// Helper function to update active navigation link styling
function updateActiveNavLink(currentUrl) {
  const navLinks = document.querySelectorAll("nav a[data-no-ajax]");

  navLinks.forEach((link) => {
    const linkUrl = new URL(link.href);
    const currentUrlObj = new URL(currentUrl);

    // Remove active classes
    link.classList.remove("text-green-600", "bg-green-50");
    link.classList.add("text-gray-700");

    // Add active classes if this link matches current URL
    if (linkUrl.pathname === currentUrlObj.pathname) {
      link.classList.remove("text-gray-700");
      link.classList.add("text-green-600", "bg-green-50");
    }
  });
}

// Global functions for template onclick handlers
window.handleProfileClick = function (event) {
  event.preventDefault();
  console.log("Profile settings clicked"); // Debug log
  showNotification("Profile settings coming soon!", "info");

  // Close dropdown
  const dropdown = document.getElementById("profile-dropdown");
  if (dropdown) {
    dropdown.classList.add("hidden");
  }
};

window.handleLogout = function (event) {
  event.preventDefault();
  console.log("Logout clicked - new version v2"); // Debug log

  // Show loading state
  const button = event.target.closest("button");
  if (button) {
    button.disabled = true;
    button.innerHTML =
      '<i data-lucide="loader-2" class="animate-spin h-4 w-4 mr-2"></i> Signing out...';
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Get CSRF token
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]");
  const token = csrfToken ? csrfToken.value : null;

  console.log("About to POST to /accounts/logout/"); // Debug log

  // Perform logout
  fetch("/accounts/logout/", {
    method: "POST",
    headers: {
      "X-CSRFToken": token,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("Logout response:", response.status); // Debug log
      // Always redirect to login, regardless of response
      window.location.href = "/accounts/login/";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      // Fallback: redirect to logout URL
      window.location.href = "/accounts/logout/";
    });
};

// Utility function for notifications
function showNotification(message, type = "info") {
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
}

// Handle window resize
window.addEventListener("resize", function () {
  if (window.innerWidth >= 768) {
    // md breakpoint
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
      if (menuIcon) menuIcon.classList.remove("hidden");
      if (closeIcon) closeIcon.classList.add("hidden");
    }

    if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
      profileDropdown.classList.add("hidden");
    }
  }
});

// Handle browser back/forward buttons for AJAX navigation
window.addEventListener("popstate", function (event) {
  // Reload the page for back/forward navigation to ensure proper state
  window.location.reload();
});
