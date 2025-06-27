// --- History App JavaScript ---

// Initialize History page functionality
function initializeHistoryScript() {
  const pageContainer = document.getElementById("main-content");
  if (!pageContainer) return;

  // Check if we're on the history page
  const historyContainer = pageContainer.querySelector(
    ".history-container, .diagnosis-history"
  );
  if (!historyContainer) return;

  // Add event listeners for history page interactions
  pageContainer.addEventListener("click", function (e) {
    const viewDetailsButton = e.target.closest(".view-details-button");
    const deleteButton = e.target.closest(".delete-diagnosis-button");

    if (viewDetailsButton) {
      e.preventDefault();
      handleViewDetails(viewDetailsButton);
    } else if (deleteButton) {
      e.preventDefault();
      handleDeleteDiagnosis(deleteButton);
    }
  });

  // Handle view details functionality
  function handleViewDetails(button) {
    const url = button.dataset.url;
    if (!url) return;

    // Create or show modal
    let modal = document.getElementById("diagnosis-detail-modal");
    if (!modal) {
      modal = createDetailModal();
    }

    const modalContent = modal.querySelector("#modal-content");
    modalContent.innerHTML = '<p class="text-center">Loading...</p>';
    modal.classList.remove("hidden");

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        modalContent.innerHTML = html;
        if (typeof lucide !== "undefined") {
          lucide.createIcons();
        }
      })
      .catch((error) => {
        console.error("Error fetching diagnosis details:", error);
        modalContent.innerHTML =
          '<p class="text-center text-red-600">Error loading details</p>';
      });
  }

  // Handle delete diagnosis functionality
  function handleDeleteDiagnosis(button) {
    const url = button.dataset.url;
    const diagnosisId = button.dataset.diagnosisId;

    if (!url || !confirm("Are you sure you want to delete this diagnosis?")) {
      return;
    }

    const csrfToken = AgricureUtils.getCsrfToken();

    fetch(url, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrfToken,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Remove the diagnosis item from the DOM
          const diagnosisItem = button.closest("[data-diagnosis-id]");
          if (diagnosisItem) {
            diagnosisItem.remove();
          }
          AgricureUtils.showNotification(
            "Diagnosis deleted successfully",
            "success"
          );
        } else {
          AgricureUtils.showNotification("Error deleting diagnosis", "error");
        }
      })
      .catch((error) => {
        console.error("Error deleting diagnosis:", error);
        AgricureUtils.showNotification("Error deleting diagnosis", "error");
      });
  }

  // Create detail modal
  function createDetailModal() {
    const modal = document.createElement("div");
    modal.id = "diagnosis-detail-modal";
    modal.className =
      "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden";

    modal.innerHTML = `
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Diagnosis Details</h3>
          <button id="close-detail-modal" class="text-gray-400 hover:text-gray-600">
            <i data-lucide="x" class="h-6 w-6"></i>
          </button>
        </div>
        <div id="modal-content">
          <!-- Content will be loaded here -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add close functionality
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("#close-detail-modal")) {
        modal.classList.add("hidden");
      }
    });

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return modal;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeHistoryScript();
});
