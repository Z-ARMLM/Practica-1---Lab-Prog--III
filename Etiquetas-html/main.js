window.addEventListener('DOMContentLoaded', () => {

    // Selecciona todas las secciones con cualquiera de estas clases
    const secciones = document.querySelectorAll('.Gen-card, .Gen-card-2nd, .Gen-card-3erd');

    // Variable para conteo global
    let totalGlobal = 0;

    secciones.forEach(seccion => {
        // Encuentra el título de la sección
        const titulo = seccion.querySelector('h3').innerText;

        // Cuenta cuántas "cards" hay en esa sección
        const totalSeccion = seccion.querySelectorAll('.card').length;

        // Suma al conteo global
        totalGlobal += totalSeccion;

        // Crea un elemento para mostrar el conteo de la sección
        const contador = document.createElement('p');
        contador.innerHTML = `<b>Total de etiquetas en ${titulo}:</b> ${totalSeccion}`;
        contador.style.fontWeight = "bold";
        contador.style.marginTop = "10px";

        // Lo agrega al final de la sección
        seccion.appendChild(contador);
    });

    // Mostrar conteo global al final de la página
    const body = document.querySelector('span').parentElement; // Selecciona el body
    const globalCount = document.createElement('p');
    globalCount.innerHTML = `<b>Total de etiquetas en todo el documento:</b> ${totalGlobal}`;
    globalCount.style.fontWeight = "bold";
    globalCount.style.fontSize = "1.2rem";
    globalCount.style.marginTop = "30px";
    body.appendChild(globalCount);
});
