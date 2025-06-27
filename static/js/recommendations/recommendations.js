// --- Recommendations App JavaScript ---
function initializeRecommendationsScript() {
  const pageContainer = document.getElementById("main-content");
  const tabContainer = pageContainer
    ? pageContainer.querySelector("#notification-tabs")
    : null;
  if (!tabContainer) return; // Exit if we are not on the recommendations page

  const tabContent = pageContainer.querySelector("#tab-content");
  const modal = pageContainer.querySelector("#notification-modal");
  const modalContentContainer = pageContainer.querySelector(
    "#modal-content-container"
  );
  const partialUrl = window.appConfig
    ? window.appConfig.recommendationsPartialUrl
    : "/notifications/partial/";

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

  // Use a single delegated event listener for all actions within the page container
  pageContainer.addEventListener("click", function (e) {
    const csrfToken = pageContainer.querySelector(
      "[name=csrfmiddlewaretoken]"
    )?.value;
    const tabButton = e.target.closest(".tab-button");
    const viewDetailsButton = e.target.closest(".view-details-button");
    const markAsReadButton = e.target.closest(".mark-as-read-button");

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
    } else if (viewDetailsButton) {
      e.preventDefault();
      const url = viewDetailsButton.dataset.url;
      modalContentContainer.innerHTML = '<p class="text-center">Loading...</p>';
      modal.classList.remove("hidden");
      fetch(url)
        .then((response) => response.text())
        .then((html) => {
          modalContentContainer.innerHTML = html;
          lucide.createIcons();
        });
    } else if (markAsReadButton) {
      e.preventDefault();
      const url = markAsReadButton.dataset.url;
      fetch(url, { method: "POST", headers: { "X-CSRFToken": csrfToken } })
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
    } else if (
      e.target.id === "notification-modal" ||
      e.target.closest("#close-modal-button")
    ) {
      modal.classList.add("hidden");
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeRecommendationsScript();
});
