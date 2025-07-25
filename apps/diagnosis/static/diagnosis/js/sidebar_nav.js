// Prevent full page reloads for sidebar navigation and use AJAX to load content

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  sidebar.addEventListener("click", function (e) {
    const link = e.target.closest("a.nav-link");
    if (
      !link ||
      link.getAttribute("href") === "#" ||
      link.hasAttribute("data-no-ajax")
    )
      return;
    e.preventDefault();
    const url = link.getAttribute("href");
    if (!url) return;

    // Optionally show a loader here
    fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(async response => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.html) {
            const main = document.querySelector('main, .main-content, #main-content');
            if (main) main.innerHTML = data.html;
            if (data.title) document.title = data.title;
          }
        } else {
          // Fallback: treat as HTML
          const html = await response.text();
          const main = document.querySelector('main, .main-content, #main-content');
          if (main) main.innerHTML = html;
        }
      })
      .catch(err => {
        console.error('Navigation error:', err);
      });
        console.error("Navigation error:", e);
      });
  });
