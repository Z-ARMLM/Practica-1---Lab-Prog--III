// ====================================================================
// FUNCIÓN DE SERVICIO: La lógica central de validación (Algoritmo de la JCE)
// Este archivo contiene la lógica de negocio pura y no tiene dependencias de UI.
// ====================================================================

/**
 * Valida un número de cédula dominicana de 11 dígitos utilizando el Algoritmo de Luhn modificado (Módulo 10).
 * @param {string} cedula - La cadena de 11 dígitos de la cédula.
 * @returns {{mensaje: string, clase: string, valido: boolean}} Objeto con el resultado.
 */
export function validarCedulaService(cedula) {
    cedula = cedula.replace(/\D/g, ''); // Remover cualquier caracter que no sea dígito

    if (cedula.length !== 11) {
        return { mensaje: "Debe tener 11 dígitos", clase: "alert-danger", valido: false };
    }

    if (/^(\d)\1{10}$/.test(cedula)) {
        return { mensaje: "Todos los dígitos son iguales", clase: "alert-danger", valido: false };
    }

    const digitos = cedula.split('').map(Number);
    const verificador = digitos.pop(); // Último dígito es el verificador (D11
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
        let multiplicador = (i % 2 === 0) ? 1 : 2; 
        
        let resultado = digitos[i] * multiplicador;
        
        if (resultado >= 10) {
            resultado -= 9; 
        }
        
        suma += resultado;
    }

    let resto = suma % 10;
    // Dígito Esperado: 10 - (Suma Mod 10). Si es 10, se usa 0.
    let digitoEsperado = (resto === 0) ? 0 : 10 - resto;

    // Excepción de la cédula que termina en 0 pero no cumple el módulo 10
    if (verificador === 0 && resto !== 0) {
        return { mensaje: "CÉDULA INVÁLIDA. Termina en 0 pero no cumple el módulo 10", clase: "alert-danger", valido: false };
    }

    if (digitoEsperado !== verificador) {
        return { mensaje: "CÉDULA INVÁLIDA. El dígito verificador no coincide.", clase: "alert-danger", valido: false };
    }
    return { mensaje: "CÉDULA VÁLIDA y Correcta.", clase: "alert-success", valido: true };
}