// --- Users App JavaScript ---

// Initialize Users/Authentication functionality
function initializeUsersScript() {
  const pageContainer =
    document.getElementById("main-content") || document.body;

  // Login form enhancements
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    initializeLoginForm(loginForm);
  }

  // Registration form enhancements
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    initializeRegisterForm(registerForm);
  }

  // Password reset form enhancements
  const passwordResetForm = document.getElementById("password-reset-form");
  if (passwordResetForm) {
    initializePasswordResetForm(passwordResetForm);
  }

  // Profile form enhancements
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    initializeProfileForm(profileForm);
  }
}

// Initialize login form
function initializeLoginForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton ? submitButton.textContent : "Login";

  form.addEventListener("submit", function (e) {
    if (submitButton) {
      AgricureUtils.showLoading(submitButton, "Logging in...");
    }

    // Let the form submit naturally, but provide visual feedback
    setTimeout(() => {
      if (submitButton) {
        AgricureUtils.hideLoading(submitButton, originalButtonText);
      }
    }, 2000);
  });

  // Add password visibility toggle if password field exists
  const passwordField = form.querySelector('input[type="password"]');
  if (passwordField) {
    addPasswordToggle(passwordField);
  }
}

// Initialize registration form
function initializeRegisterForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Register";

  form.addEventListener("submit", function (e) {
    if (submitButton) {
      AgricureUtils.showLoading(submitButton, "Creating account...");
    }
  });

  // Add password visibility toggles
  const passwordFields = form.querySelectorAll('input[type="password"]');
  passwordFields.forEach((field) => {
    addPasswordToggle(field);
  });

  // Add password confirmation validation
  const password1 = form.querySelector('input[name="password1"]');
  const password2 = form.querySelector('input[name="password2"]');

  if (password1 && password2) {
    password2.addEventListener("blur", function () {
      if (
        password1.value &&
        password2.value &&
        password1.value !== password2.value
      ) {
        password2.setCustomValidity("Passwords do not match");
        password2.reportValidity();
      } else {
        password2.setCustomValidity("");
      }
    });
  }
}

// Initialize password reset form
function initializePasswordResetForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Reset Password";

  form.addEventListener("submit", function (e) {
    if (submitButton) {
      AgricureUtils.showLoading(submitButton, "Sending reset email...");
    }
  });
}

// Initialize profile form
function initializeProfileForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton
    ? submitButton.textContent
    : "Update Profile";

  form.addEventListener("submit", function (e) {
    if (submitButton) {
      AgricureUtils.showLoading(submitButton, "Updating profile...");
    }
  });

  // Add image preview for avatar upload if present
  const avatarInput = form.querySelector(
    'input[type="file"][name*="avatar"], input[type="file"][name*="image"]'
  );
  if (avatarInput) {
    addImagePreview(avatarInput);
  }
}

// Add password visibility toggle
function addPasswordToggle(passwordField) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  passwordField.parentNode.insertBefore(wrapper, passwordField);
  wrapper.appendChild(passwordField);

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className =
    "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600";
  toggleButton.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i>';

  toggleButton.addEventListener("click", function () {
    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    toggleButton.innerHTML = isPassword
      ? '<i data-lucide="eye-off" class="h-5 w-5"></i>'
      : '<i data-lucide="eye" class="h-5 w-5"></i>';

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });

  wrapper.appendChild(toggleButton);

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Add image preview functionality
function addImagePreview(fileInput) {
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        let preview = document.getElementById("image-preview");
        if (!preview) {
          preview = document.createElement("img");
          preview.id = "image-preview";
          preview.className = "mt-2 h-20 w-20 object-cover rounded-full border";
          fileInput.parentNode.appendChild(preview);
        }
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeUsersScript();
});
