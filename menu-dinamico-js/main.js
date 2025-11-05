document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menu-container");
  let menuData = datosMenu;

  function crearMenu(menuArray) {
    const ul = document.createElement("ul");
    for (const item of menuArray) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = item.nombre;
      a.href = item.enlace || "#";
      a.dataset.id = item.id;
      li.appendChild(a);

      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        document.querySelector("#contenido p").textContent = `Has seleccionado: ${item.nombre}`;
      });

      if (item.submenus && item.submenus.length > 0) {
        li.appendChild(crearMenu(item.submenus));
      }

      ul.appendChild(li);
    }
    return ul;
  }

  function renderizarMenu() {
    menuContainer.innerHTML = "";
    menuContainer.appendChild(crearMenu(menuData.menu));
  }

  function crearFormulario() {
    const section = document.createElement("section");
    section.classList.add("container", "mt-5", "mb-4");

    section.innerHTML = `
      <div class="card bg-dark text-light shadow-lg p-4">
        <h3 class="text-center mb-4 text-success">Agregar nueva opción al menú</h3>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input id="nombre" class="form-control" placeholder="Ej: Blog" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Enlace</label>
            <input id="enlace" class="form-control" placeholder="Ej: #blog" />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input class="form-check-input" type="checkbox" id="tieneSubmenu">
          <label class="form-check-label" for="tieneSubmenu">Agregar submenús</label>
        </div>

        <div id="submenuContainer" class="mt-3" style="display:none;">
          <label class="form-label">Submenús (uno por línea, formato: Nombre,#enlace)</label>
          <textarea id="submenuTexto" rows="4" class="form-control" placeholder="Ejemplo:
Submenu1,#sub1
Submenu2,#sub2"></textarea>
        </div>

        <div class="text-center mt-4">
          <button id="agregar" class="btn btn-success px-4">Agregar opción</button>
        </div>
      </div>

      <div class="card bg-dark text-light shadow-lg p-4 mt-4">
        <h4 class="text-center text-success mb-3">Forma de visualización</h4>
        <div class="d-flex justify-content-center gap-3">
          <button id="modoHorizontal" class="btn btn-outline-success">Horizontal</button>
          <button id="modoVertical" class="btn btn-outline-success">Vertical</button>
        </div>
      </div>
    `;

    document.body.appendChild(section);

    // mostrar textarea de submenús
    document.getElementById("tieneSubmenu").addEventListener("change", (e) => {
      document.getElementById("submenuContainer").style.display = e.target.checked ? "block" : "none";
    });

    // agregar opción
    document.getElementById("agregar").addEventListener("click", () => {
      const nombre = document.getElementById("nombre").value.trim();
      const enlace = document.getElementById("enlace").value.trim();
      const tieneSub = document.getElementById("tieneSubmenu").checked;
      const subTexto = document.getElementById("submenuTexto").value.trim();

      if (!nombre || !enlace) {
        alert("Completa nombre y enlace");
        return;
      }

      const nuevoId = Date.now();
      const nuevaOpcion = { id: nuevoId, nombre, enlace };

      if (tieneSub && subTexto) {
        const lineas = subTexto.split("\n").filter(x => x.trim() !== "");
        nuevaOpcion.submenus = lineas.map((linea, i) => {
          const [nombreSub, enlaceSub] = linea.split(",");
          return {
            id: nuevoId + (i + 1),
            nombre: nombreSub.trim(),
            enlace: enlaceSub?.trim() || "#"
          };
        });
      }

      menuData.menu.push(nuevaOpcion);
      localStorage.setItem("menuData", JSON.stringify(menuData));
      renderizarMenu();

      alert("Opción agregada correctamente.");
      document.getElementById("nombre").value = "";
      document.getElementById("enlace").value = "";
      document.getElementById("submenuTexto").value = "";
      document.getElementById("tieneSubmenu").checked = false;
      document.getElementById("submenuContainer").style.display = "none";
    });

    // eventos para cambio de vista
    document.getElementById("modoHorizontal").addEventListener("click", () => {
      menuContainer.classList.remove("vertical");
      menuContainer.classList.add("horizontal");
      document.querySelector("main").style.marginLeft = "0";
    });

    document.getElementById("modoVertical").addEventListener("click", () => {
      menuContainer.classList.remove("horizontal");
      menuContainer.classList.add("vertical");
      document.querySelector("main").style.marginLeft = "240px";
    });
  }

  // cargar datos
  const almacenado = localStorage.getItem("menuData");
  if (almacenado) {
    try { menuData = JSON.parse(almacenado); } catch {}
  }

  renderizarMenu();
  crearFormulario();
});
