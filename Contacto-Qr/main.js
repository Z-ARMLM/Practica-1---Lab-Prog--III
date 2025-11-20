        document.getElementById('vcard-form').addEventListener('submit', function(e) {
            e.preventDefault(); // Previene el envío del formulario por defecto

            // Se obtienen los valores de los campos del formulario
            const nombreCompleto = document.getElementById('nombre').value.trim();
            const organizacion = document.getElementById('organizacion').value.trim();
            const puesto = document.getElementById('puesto').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();

            const errorMessageElement = document.getElementById('error-message');
            const qrContainer = document.getElementById('qrcode');

            // validacion de campos obligatorios
            if (!nombreCompleto || !telefono) {
                errorMessageElement.classList.remove('hidden');
                return;
            }
            errorMessageElement.classList.add('hidden');

            // 3. Preparar los componentes del nombre
            let n_parts = nombreCompleto.split(/\s+/);
            let nombre = n_parts.length > 1 ? n_parts.slice(0, -1).join(' ') : nombreCompleto;
            let apellido = n_parts.length > 1 ? n_parts[n_parts.length - 1] : '';

            // se construye la vCard
            let vcard = 'BEGIN:VCARD\n';
            vcard += 'VERSION:3.0\n';
            vcard += `N:${apellido};${nombre};;;\n`; 
            vcard += `FN:${nombreCompleto}\n`;

            if (organizacion) {
                vcard += `ORG:${organizacion}\n`;
            }
            if (puesto) {
                vcard += `TITLE:${puesto}\n`;
            }
            // Tipo de dato para que sea un telefono movil
            if (telefono) {
                vcard += `TEL;TYPE=CELL:${telefono}\n`;
            }
            if (email) {
                vcard += `EMAIL:${email}\n`;
            }
            
            vcard += 'END:VCARD';

            // Generar el codigo QR

            // Se limpia el contenedor del QR antes de generar uno nuevo
            qrContainer.innerHTML = '';
            // Hace que las clases de visualización del placeholder se remuevan
            qrContainer.classList.remove('flex', 'items-center', 'justify-center', 'text-gray-500', 'text-center');
            
            // Uso de la librería QRCode.js
            try {
                new QRCode(qrContainer, {
                    text: vcard,
                    width: 256,
                    height: 256,
                    colorDark: "#4f46e5", 
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } catch (error) {
                // forma para manejar errores
                qrContainer.innerHTML = '<p class="text-red-400">Error al generar el QR.</p>';
                console.error("Error al generar el código QR:", error);
            }
        });