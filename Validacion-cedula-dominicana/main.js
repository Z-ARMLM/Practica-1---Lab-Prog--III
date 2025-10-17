function validarEntrada(input) {
      const alerta = document.getElementById("alerta");
      const valor = input.value;

      if (/[^0-9]/.test(valor)) {
        alerta.innerHTML = '<div class="alert alert-warning p-2">⚠ Solo se permiten números (no letras ni guiones)</div>';
        input.value = valor.replace(/[^0-9]/g, '');
      } else {
        alerta.innerHTML = '';
      }

      // Validar que solo se ingresen 11 digitos
      if (input.value.length > 11) {
        input.value = input.value.slice(0, 11);
      }
    }

   //formula de luhn, modulo 10
    function validarCedula(cedula) {
      cedula = cedula.replace(/\D/g, '');

      if (cedula.length !== 11) {
        return { mensaje: "Debe tener 11 dígitos", clase: "danger" };
      }

      if (/^(\d)\1{10}$/.test(cedula)) {
        return { mensaje: "Todos los dígitos son iguales", clase: "danger" };
      }

      const digitos = cedula.split('').map(Number);
      const verificador = digitos.pop();
      let suma = 0;

      for (let i = 0; i < digitos.length; i++) {
        let multiplicador = (i % 2 === 0) ? 1 : 2;
        let resultado = digitos[i] * multiplicador;
        if (resultado >= 10) resultado -= 9;
        suma += resultado;
      }

      let resto = suma % 10;
      let digitoEsperado = (resto === 0) ? 0 : 10 - resto;

      // Exceociones de la cedula termina en 0 pero no cumple módulo 10
      if (verificador === 0 && resto !== 0) {
        return { mensaje: "Termina en 0 pero no cumple el módulo 10", clase: "danger" };
      }

      if (digitoEsperado !== verificador) {
        return { mensaje: "Dígito verificador no coincide", clase: "danger" };
      }

   
      return { mensaje: "CÉDULA ES CORRECTA", clase: "success" };
    }

    //  Resultados de la validacion
    function verificarCedula() {
      const input = document.getElementById("cedula");
      const resultadoDiv = document.getElementById("resultado");
      const cedula = input.value.trim();

      const resultado = validarCedula(cedula);

      resultadoDiv.innerHTML = `<div class="alert alert-${resultado.clase}">${resultado.mensaje}</div>`;
    }