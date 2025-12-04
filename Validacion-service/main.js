import { validarCedulaService } from './services.js';

/**
 * Para manejar la entrada del usuario, permitiendo solo números y limitando la longitud.
 * @param {HTMLInputElement} input 
 */
function validarEntrada(input) {
    const alerta = document.getElementById("alerta-input"); 
    const valor = input.value;

    if (/[^0-9]/.test(valor)) {
        alerta.innerHTML = '<div class="alert alert-warning-custom p-2 small">⚠ Solo se permiten números (no letras ni guiones)</div>';
        input.value = valor.replace(/[^0-9]/g, '');
    } else {
        alerta.innerHTML = '';
    }

    if (input.value.length > 11) {
        input.value = input.value.slice(0, 11);
    }
}

function verificarCedula() {
    const input = document.getElementById("cedula");
    const resultadoDiv = document.getElementById("resultado");
    const cedula = input.value.trim();

    // Se llama al servicio de validación
    const resultado = validarCedulaService(cedula);

  
    resultadoDiv.innerHTML = `
        <div class="alert ${resultado.clase} font-weight-bold text-center">
            ${resultado.mensaje}
        </div>
    `;
}

window.validarEntrada = validarEntrada;
window.verificarCedula = verificarCedula;