const SHEET_URL = "PEGAR_ACA_URL_CSV_PUBLICA";

function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/);
  const headers = rows.shift().split(",").map((header) => header.trim());

  return rows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    return headers.reduce((item, header, index) => {
      item[header] = values[index] || "";
      return item;
    }, {});
  });
}

function createExpertCard(expert) {
  return `
    <article class="expert-card">
      <div>
        <img src="${expert.imagen}" alt="${expert.nombre}" />
        <p class="text-lg mb-4">${expert.nombre}</p>
        <div class="expert-divider"></div>
        <h3 class="text-xl font-semibold mb-3">${expert.rol}</h3>
        <p class="text-sm">${expert.descripcion}</p>
      </div>

      <a href="${expert.link || "proximamente.html"}" class="expert-card-link mt-6">
        Contacto
      </a>
    </article>
  `;
}

async function loadExperts() {
  const grid = document.getElementById("expertos-grid");

  if (!grid) return;

  try {
    const response = await fetch(SHEET_URL);
    const csv = await response.text();
    const experts = parseCSV(csv).filter((expert) => expert.activo.toLowerCase() === "si");

    grid.innerHTML = experts.map(createExpertCard).join("");
  } catch (error) {
    console.error("No se pudo cargar la red de expertos:", error);
    grid.innerHTML = "<p>No se pudo cargar la red de expertos.</p>";
  }
}

loadExperts();
