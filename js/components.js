async function loadComponent(id, file) {
  const container = document.getElementById(id);

  if (!container) {
    console.error(`No existe el contenedor #${id}`);
    return;
  }

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${file}: ${response.status}`);
    }

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

function initNavbar() {
  const toggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const icon = document.getElementById("menu-icon");

  if (!toggle || !mobileMenu || !icon) return;

  function closeMenu() {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("flex");
    toggle.setAttribute("aria-expanded", "false");
    icon.innerHTML = "&#9776;";
  }

  toggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");

    mobileMenu.classList.toggle("hidden");
    mobileMenu.classList.toggle("flex");

    toggle.setAttribute("aria-expanded", String(!isOpen));
    icon.innerHTML = isOpen ? "&#9776;" : "&times;";
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

loadComponent("navbar", "components/navbar.html").then(initNavbar);
loadComponent("footer", "components/footer.html");

document.addEventListener("submit", (event) => {
  if (event.target.id !== "formComunidad") return;

  event.preventDefault();

  const message = document.getElementById("mensajeSuscripcion");

  if (message) {
    message.classList.remove("hidden");
  }

  event.target.reset();
});