
        // --- Listas de Países y Provincias RD ---
        const PAISES = [
            "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán",
            "Bahamas", "Bahréin", "Bangladés", "Barbados", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután",
            "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba",
            "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía",
            "Filipinas", "Finlandia", "Fiji", "Francia",
            "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana",
            "Haití", "Honduras", "Hungría",
            "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia",
            "Jamaica", "Japón", "Jordania",
            "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait",
            "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo",
            "Macedonia del Norte", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique",
            "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda",
            "Omán",
            "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal",
            "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumania", "Rusia",
            "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam",
            "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu",
            "Ucrania", "Uganda", "Uruguay", "Uzbekistán",
            "Vanuatu", "Venezuela", "Vietnam",
            "Yemen", "Yibuti",
            "Zambia", "Zimbabue"
        ].sort();

        const PROVINCIAS_RD = [
            "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "Elías Piña", "El Seibo", "Espaillat", 
            "Hato Mayor", "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", 
            "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Hermanas Mirabal", 
            "Samaná", "Sánchez Ramírez", "San Cristóbal", "San José de Ocoa", "San Juan", "San Pedro de Macorís", 
            "Santiago", "Santiago Rodríguez", "Santo Domingo", "Valverde"
        ].sort();

        const FOREIGN_CITY_KEY = '_EXTRANJERO_';

        let database = [];
        let currentFormData = {};
        let isEditing = false;
        let editingRecordId = null;

        let currentPage = 1;
        const totalPages = 5;
        const pages = ['page-1', 'page-2', 'page-3', 'page-4', 'page-5'];

        let messageModalInstance;


        /**
         * Inicializa los dropdowns de Nacionalidad y Ciudad.
         */
        function populateDropdowns() {
            const nacionalidadSelect = document.getElementById('nacionalidad');
            nacionalidadSelect.innerHTML = '<option value="">-- Seleccionar Nacionalidad --</option>';
            PAISES.forEach(pais => {
                const option = document.createElement('option');
                option.value = pais;
                option.textContent = pais;
                nacionalidadSelect.appendChild(option);
            });

            const ciudadSelect = document.getElementById('ciudad');
            ciudadSelect.innerHTML = '<option value="">-- Seleccionar Provincia/Ciudad --</option>';
            PROVINCIAS_RD.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia;
                option.textContent = provincia;
                ciudadSelect.appendChild(option);
            });
            const extranjeroOption = document.createElement('option');
            extranjeroOption.value = FOREIGN_CITY_KEY;
            extranjeroOption.textContent = 'Otro (País Extranjero)';
            ciudadSelect.appendChild(extranjeroOption);
        }
        
  
        function toggleForeignCity(value) {
            const inputContainer = document.getElementById('foreignCityInput');
            const input = document.getElementById('ciudadExtranjera');
            if (value === FOREIGN_CITY_KEY) {
                inputContainer.style.display = 'block';
                input.setAttribute('required', 'required');
            } else {
                inputContainer.style.display = 'none';
                input.removeAttribute('required');
                input.value = ''; 
            }
        }

        /**
         * visibilidad del formulario de condiciones de salud.
         */
        function toggleCondicionesForm() {
            const isNegado = document.getElementById('condicionesNegadas').checked;
            const formContainer = document.getElementById('condiciones-form-container');
            const listContainer = document.getElementById('condiciones-list');

            if (isNegado) {
                formContainer.classList.add('d-none');
                listContainer.classList.add('d-none');
            } else {
                formContainer.classList.remove('d-none');
                listContainer.classList.remove('d-none');
            }
        }

     
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateString;
        }

  
        function showModal(title, message) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            if (messageModalInstance) {
                messageModalInstance.show();
            }
        }

        function closeModal() {
            if (messageModalInstance) {
                messageModalInstance.hide();
            }
        }


  
        function updatePageDisplay() {
            pages.forEach((pageId, index) => {
                const pageElement = document.getElementById(pageId);
                const isActive = (index + 1) === currentPage;

                if (isActive) {
                    pageElement.classList.remove('d-none');
                    if (pageId === 'page-5') {
                        renderSummary();
                    }
                } else {
                    pageElement.classList.add('d-none');
                }
            });

            const stepButtons = document.querySelectorAll('.step-nav-button');
            stepButtons.forEach(button => {
                const step = parseInt(button.getAttribute('data-step'));
                button.classList.remove('btn-primary', 'btn-success', 'btn-secondary', 'text-white', 'fw-bold');

                if (step === currentPage) {
                    button.classList.add('btn-primary', 'text-white', 'fw-bold');
                } else if (step < currentPage) {
                    button.classList.add('btn-success', 'text-white');
                } else {
                    button.classList.add('btn-secondary', 'text-white');
                }
            });
        }

       
        function jumpToPage(targetPage) {
            if (targetPage === currentPage) return;

            if (targetPage > currentPage) {
                collectData();
                if (!validatePage()) {
                    return;
                }
            }
            
            currentPage = targetPage;
            updatePageDisplay();
        }

       
        function collectData() {
            if (currentPage === 1) {
                const ciudadSeleccionada = document.getElementById('ciudad').value;
                const ciudadFinal = ciudadSeleccionada === FOREIGN_CITY_KEY 
                    ? document.getElementById('ciudadExtranjera').value.trim() 
                    : ciudadSeleccionada;

                currentFormData.id = currentFormData.id || crypto.randomUUID();

                currentFormData.datosPersonales = {
                    Nombres: document.getElementById('Nombres').value.trim(),
                    Apellidos: document.getElementById('Apellidos').value.trim(),
                    cedula: document.getElementById('cedula').value.trim(),
                    fechaNacimiento: document.getElementById('fechaNacimiento').value,
                    nacionalidad: document.getElementById('nacionalidad').value,
                    sexo: document.getElementById('sexo').value,
                    estadoCivil: document.getElementById('estadoCivil').value,
                    tipoSangre: document.getElementById('tipoSangre').value,
                    telefono1: document.getElementById('telefono1').value.trim(),
                    telefono2: document.getElementById('telefono2').value.trim(),
                    correoElectronico: document.getElementById('correoElectronico').value.trim(),

                    ocupacion: document.getElementById('ocupacion').value.trim(),
                    empresa: document.getElementById('empresa').value.trim(),
                    telefonoEmpresa: document.getElementById('telefonoEmpresa').value.trim(),
                    
                    emergenciaNombre: document.getElementById('emergenciaNombre').value.trim(),
                    emergenciaTelefono: document.getElementById('emergenciaTelefono').value.trim(),
                    emergenciaParentesco: document.getElementById('emergenciaParentesco').value,

                    ciudad: ciudadFinal,
                    sector: document.getElementById('sector').value.trim(),
                    calle: document.getElementById('calle').value.trim(),
                    isForeignCity: ciudadSeleccionada === FOREIGN_CITY_KEY,
                };
            }
        }

   
        function validatePage() {
            if (currentPage === 1) {
                const data = currentFormData.datosPersonales;
                if (!data || !data.Nombres || !data.Apellidos || !data.fechaNacimiento || !data.nacionalidad || !data.sexo || 
                    !data.estadoCivil || !data.telefono1 || !data.emergenciaNombre || !data.emergenciaTelefono || 
                    !data.emergenciaParentesco || !data.ciudad || !data.sector || !data.calle) {
                    showModal('Campos Requeridos', 'Por favor, complete todos los campos obligatorios de Datos Personales (*).');
                    return false;
                }
                
            } else if (currentPage === 2) {
                if (!currentFormData.familiares || currentFormData.familiares.length === 0) {
                    showModal('Campos Requeridos', 'Debe añadir al menos un Familiar para continuar.');
                    return false;
                }
            } else if (currentPage === 3) {
                const isNegado = document.getElementById('condicionesNegadas').checked;
                if (isNegado) {
                    return true;
                }
                
                if (!currentFormData.condiciones || currentFormData.condiciones.length === 0) {
                    showModal('Campos Requeridos', 'Debe añadir al menos una Condición Pre-Existente de Salud o marcar la opción "Negadas".');
                    return false;
                }
                const hasDetail = currentFormData.condiciones.some(c => c.detalle && c.detalle.trim().length > 0);
                if (!hasDetail) {
                    showModal('Detalle Requerido', 'Al menos una condición debe tener un Detalle (medicamentos, observaciones, etc.).');
                    return false;
                }
            }
            return true;
        }

        function nextPage() {
            if (currentPage < totalPages) {
                collectData();
                if (!validatePage()) {
                    return;
                }

                if (currentPage === 3 && document.getElementById('condicionesNegadas').checked) {
                    currentFormData.condiciones = [];
                }

                currentPage++;
                updatePageDisplay();
            }
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                updatePageDisplay();
            }
        }

     
        function initializeCurrentFormData() {
            if (!currentFormData.familiares) currentFormData.familiares = [];
            if (!currentFormData.condiciones) currentFormData.condiciones = [];
            if (!currentFormData.internamientos) currentFormData.internamientos = [];
        }

        function renderFamiliares() {
            const list = document.getElementById('familiares-list');
            list.innerHTML = '';
            currentFormData.familiares.slice().reverse().forEach((f, index) => { // Reverse para mostrar el último arriba
                const originalIndex = currentFormData.familiares.length - 1 - index;
                const div = document.createElement('div');
                div.className = 'd-flex justify-content-between align-items-center p-3 bg-white border border-secondary-subtle rounded-3 shadow-sm';
                div.innerHTML = `
                    <p class="mb-0 small text-dark">${f.nombre} (${f.parentesco}, ${f.edad} años)</p>
                    <button type="button" onclick="removeFamiliar(${originalIndex})" class="btn btn-sm btn-outline-danger border-0 p-1">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                `;
                list.appendChild(div);
            });
            if (currentFormData.familiares.length === 0) {
                list.innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido familiares.</p>';
            }
        }

        function addFamiliar() {
            initializeCurrentFormData();
            const nombre = document.getElementById('familiar-nombre').value.trim();
            const parentesco = document.getElementById('familiar-parentesco').value;
            const edad = document.getElementById('familiar-edad').value;

            if (!nombre || !parentesco || !edad) {
                showModal('Error de Entrada', 'Por favor, complete todos los campos del familiar.');
                return;
            }

            currentFormData.familiares.push({
                nombre,
                parentesco,
                edad: parseInt(edad),
            });

            document.getElementById('familiar-nombre').value = '';
            document.getElementById('familiar-parentesco').value = '';
            document.getElementById('familiar-edad').value = '';

            renderFamiliares();
        }

        function removeFamiliar(index) {
            currentFormData.familiares.splice(index, 1);
            renderFamiliares();
        }

        function renderCondiciones() {
            const list = document.getElementById('condiciones-list');
            list.innerHTML = '';
            currentFormData.condiciones.slice().reverse().forEach((c, index) => { 
                const originalIndex = currentFormData.condiciones.length - 1 - index;
                const div = document.createElement('div');
                div.className = 'p-3 bg-white border border-secondary-subtle rounded-3 shadow-sm';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <p class="fw-bold text-dark mb-0">${c.nombre} <span class="badge text-bg-primary ms-2">${c.tiempo || 0} años</span></p>
                        <button type="button" onclick="removeCondicion(${originalIndex})" class="btn btn-sm btn-outline-danger border-0 p-1">
                            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                    <p class="small text-muted border-start border-3 border-primary ps-2 mb-0">Detalle: ${c.detalle || 'No hay detalles proporcionados.'}</p>
                `;
                list.appendChild(div);
            });
            if (currentFormData.condiciones.length === 0) {
                list.innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido condiciones de salud.</p>';
            }
        }

        function addCondicion() {
            initializeCurrentFormData();
            const nombre = document.getElementById('condicion-nombre').value.trim();
            const tiempo = document.getElementById('condicion-tiempo').value;
            const detalle = document.getElementById('condicion-detalle').value.trim();

            if (!nombre) {
                showModal('Error de Entrada', 'El nombre de la enfermedad es obligatorio.');
                return;
            }
            if (!detalle) {
                 showModal('Error de Entrada', 'Debe proporcionar al menos un Detalle de la condición (Ej: medicamentos, observaciones, etc.).');
                return;
            }

            currentFormData.condiciones.push({
                nombre,
                tiempo: parseInt(tiempo) || 0,
                detalle,
            });

            document.getElementById('condicion-nombre').value = '';
            document.getElementById('condicion-tiempo').value = '';
            document.getElementById('condicion-detalle').value = '';

            renderCondiciones();
        }

        function removeCondicion(index) {
            currentFormData.condiciones.splice(index, 1);
            renderCondiciones();
        }

        function renderInternamientos() {
            const list = document.getElementById('internamientos-list');
            list.innerHTML = '';
            currentFormData.internamientos.slice().reverse().forEach((i, index) => { 
                const originalIndex = currentFormData.internamientos.length - 1 - index;
                const div = document.createElement('div');
                div.className = 'p-3 bg-white border border-secondary-subtle rounded-3 shadow-sm';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <p class="fw-bold text-dark mb-0">${i.centroMedico} <span class="badge text-bg-primary ms-2">${formatDate(i.fecha)}</span></p>
                        <button type="button" onclick="removeInternamiento(${originalIndex})" class="btn btn-sm btn-outline-danger border-0 p-1">
                            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                    <p class="small text-muted border-start border-3 border-primary ps-2 mb-0">Diagnóstico: ${i.diagnostico || 'No especificado'}</p>
                `;
                list.appendChild(div);
            });
            if (currentFormData.internamientos.length === 0) {
                list.innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido internamientos.</p>';
            }
        }

        function addInternamiento() {
            initializeCurrentFormData();
            const fecha = document.getElementById('internamiento-fecha').value;
            const centroMedico = document.getElementById('internamiento-centro').value.trim();
            const diagnostico = document.getElementById('internamiento-diagnostico').value.trim();

            if (!fecha || !centroMedico) {
                showModal('Error de Entrada', 'Por favor, complete la Fecha y el Centro Médico.');
                return;
            }

            currentFormData.internamientos.push({
                fecha,
                centroMedico,
                diagnostico,
            });

            document.getElementById('internamiento-fecha').value = '';
            document.getElementById('internamiento-centro').value = '';
            document.getElementById('internamiento-diagnostico').value = '';

            renderInternamientos();
        }

        function removeInternamiento(index) {
            currentFormData.internamientos.splice(index, 1);
            renderInternamientos();
        }


        function renderSummary() {
            collectData();

            const display = document.getElementById('data-display');
            let html = '';
            const dp = currentFormData.datosPersonales;

            html += `<h3 class="h5 text-primary mb-3 border-bottom pb-1">Datos Personales</h3>
                     <div class="row g-2 mb-4 small">
                        <div class="col-sm-6"><span class="fw-bold text-dark">ID del Registro:</span> ${currentFormData.id}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Nombre Completo:</span> ${dp.Nombres || 'N/A'} ${dp.Apellidos || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Cédula/ID:</span> ${dp.cedula || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Fecha Nacimiento:</span> ${formatDate(dp.fechaNacimiento)}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Nacionalidad:</span> ${dp.nacionalidad || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Sexo:</span> ${dp.sexo || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Estado Civil:</span> ${dp.estadoCivil || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Tipo Sangre:</span> ${dp.tipoSangre || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Teléfono 1:</span> ${dp.telefono1 || 'N/A'}</div>
                        <div class="col-sm-6"><span class="fw-bold text-dark">Teléfono 2:</span> ${dp.telefono2 || 'N/A'}</div>
                        <div class="col-12"><span class="fw-bold text-dark">Correo Electrónico:</span> ${dp.correoElectronico || 'N/A'}</div>
                        <div class="col-12 pt-3 border-top mt-3"><span class="fw-bold text-dark">Dirección:</span> Calle ${dp.calle || 'N/A'}, Sector ${dp.sector || 'N/A'}, Ciudad ${dp.ciudad || 'N/A'}</div>
                     </div>`;
                     
            html += `<h3 class="h5 text-secondary mb-3 border-bottom pb-1">Información Laboral</h3>
                     <div class="row g-2 mb-4 small">
                        <div class="col-sm-4"><span class="fw-bold text-dark">Ocupación:</span> ${dp.ocupacion || 'N/A'}</div>
                        <div class="col-sm-4"><span class="fw-bold text-dark">Empresa:</span> ${dp.empresa || 'N/A'}</div>
                        <div class="col-sm-4"><span class="fw-bold text-dark">Teléfono Emp.:</span> ${dp.telefonoEmpresa || 'N/A'}</div>
                     </div>`;

            html += `<h3 class="h5 text-danger mb-3 border-bottom pb-1">Contacto de Emergencia</h3>
                     <div class="row g-2 mb-4 small">
                        <div class="col-sm-4"><span class="fw-bold text-dark">Nombre:</span> ${dp.emergenciaNombre || 'N/A'}</div>
                        <div class="col-sm-4"><span class="fw-bold text-dark">Teléfono:</span> ${dp.emergenciaTelefono || 'N/A'}</div>
                        <div class="col-sm-4"><span class="fw-bold text-dark">Parentesco:</span> ${dp.emergenciaParentesco || 'N/A'}</div>
                     </div>`;

            html += `<h3 class="h5 text-primary mb-3 border-bottom pb-1">Familiares (${currentFormData.familiares.length})</h3>
                     <div class="space-y-2 mb-4">`;
            if (currentFormData.familiares.length > 0) {
                currentFormData.familiares.forEach(f => {
                    html += `<p class="small bg-white p-3 rounded-3 border border-secondary-subtle mb-1"><span class="fw-semibold">${f.nombre}</span> - Parentesco: ${f.parentesco}, Edad: ${f.edad}</p>`;
                });
            } else {
                html += `<p class="small fst-italic text-muted">No se registraron familiares.</p>`;
            }
            html += `</div>`;

            html += `<h3 class="h5 text-primary mb-3 border-bottom pb-1">Condiciones de Salud</h3>
                     <div class="space-y-2 mb-4">`;
            
            if (document.getElementById('condicionesNegadas').checked) {
                html += `<p class="alert alert-info small fw-bold mb-0 text-center">EL PACIENTE HA MARCADO QUE NO PRESENTA CONDICIONES PRE-EXISTENTES.</p>`;
            } else if (currentFormData.condiciones.length > 0) {
                currentFormData.condiciones.forEach(c => {
                    html += `<div class="small bg-white p-3 rounded-3 border border-secondary-subtle">
                                <p class="mb-1"><span class="fw-semibold">${c.nombre}</span> (Tiempo: ${c.tiempo || 0} años)</p>
                                <p class="text-muted small mb-0 border-start border-3 border-secondary ps-2">Detalle: ${c.detalle || 'N/A'}</p>
                            </div>`;
                });
            } else {
                html += `<p class="small fst-italic text-muted">No se registraron condiciones pre-existentes.</p>`;
            }
            html += `</div>`;

            html += `<h3 class="h5 text-primary mb-3 border-bottom pb-1">Internamientos (${currentFormData.internamientos.length})</h3>
                     <div class="space-y-2 mb-4">`;
            if (currentFormData.internamientos.length > 0) {
                currentFormData.internamientos.forEach(i => {
                    html += `<div class="small bg-white p-3 rounded-3 border border-secondary-subtle">
                                <p class="mb-1"><span class="fw-semibold">${i.centroMedico}</span> (${formatDate(i.fecha)})</p>
                                <p class="text-muted small mb-0 border-start border-3 border-secondary ps-2">Diagnóstico: ${i.diagnostico || 'N/A'}</p>
                            </div>`;
                });
            } else {
                html += `<p class="small fst-italic text-muted">No se registraron internamientos.</p>`;
            }
            html += `</div>`;

            display.innerHTML = html;

            const saveBtn = document.getElementById('save-button');
            if (isEditing) {
                saveBtn.innerHTML = '<svg class="me-2" style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Actualizar Registro';
                saveBtn.classList.remove('btn-success');
                saveBtn.classList.add('btn-warning', 'text-white');
            } else {
                saveBtn.innerHTML = '<svg class="me-2" style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Guardar Registro';
                saveBtn.classList.add('btn-success');
                saveBtn.classList.remove('btn-warning', 'text-white');
            }
        }

        function saveRecord() {
            collectData();

            const record = { ...currentFormData };

            if (isEditing) {
                const index = database.findIndex(r => r.id === editingRecordId);
                if (index !== -1) {
                    database[index] = record;
                    showModal('Éxito', `El registro de ${record.datosPersonales.Nombres} ${record.datosPersonales.Apellidos} ha sido actualizado correctamente.`);
                } else {
                    showModal('Error', 'No se pudo encontrar el registro original para actualizar.');
                }
            } else {
                database.push(record);
                showModal('Éxito', `El nuevo registro de ${record.datosPersonales.Nombres} ${record.datosPersonales.Apellidos} ha sido guardado correctamente.`);
            }

            resetForm();
            renderSavedRecords();
        }


        function renderSavedRecords() {
            const list = document.getElementById('saved-records-list');
            list.innerHTML = '';

            if (database.length === 0) {
                list.innerHTML = '<p class="text-muted">No hay registros guardados aún.</p>';
                return;
            }

            database.forEach(record => {
                const item = document.createElement('div');
                item.className = 'p-3 bg-white border border-secondary-subtle rounded-3 shadow-sm d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div>
                        <p class="h6 fw-bold text-dark mb-1">${record.datosPersonales.Nombres} ${record.datosPersonales.Apellidos}</p>
                        <p class="small text-muted mb-0">ID: ${record.id.substring(0, 8)}...</p>
                        <p class="text-xs text-secondary mt-1 mb-0 small">Fam: ${record.familiares.length}, Cond: ${record.condiciones.length}, Intern: ${record.internamientos.length}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button onclick="editRecord('${record.id}')" class="btn btn-sm btn-warning rounded-3 shadow-sm text-white">
                            Editar
                        </button>
                        <button onclick="deleteRecord('${record.id}')" class="btn btn-sm btn-danger rounded-3 shadow-sm">
                            Eliminar
                        </button>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        function editRecord(id) {
            const record = database.find(r => r.id === id);
            if (!record) {
                showModal('Error', 'No se pudo encontrar el registro para editar.');
                return;
            }

            isEditing = true;
            editingRecordId = id;
            currentFormData = JSON.parse(JSON.stringify(record));

            const dp = currentFormData.datosPersonales;
            document.getElementById('Nombres').value = dp.Nombres || '';
            document.getElementById('Apellidos').value = dp.Apellidos || '';
            document.getElementById('cedula').value = dp.cedula || '';
            document.getElementById('fechaNacimiento').value = dp.fechaNacimiento || '';
            document.getElementById('nacionalidad').value = dp.nacionalidad || '';
            document.getElementById('sexo').value = dp.sexo || '';
            document.getElementById('estadoCivil').value = dp.estadoCivil || '';
            document.getElementById('tipoSangre').value = dp.tipoSangre || '';
            document.getElementById('telefono1').value = dp.telefono1 || '';
            document.getElementById('telefono2').value = dp.telefono2 || '';
            document.getElementById('correoElectronico').value = dp.correoElectronico || '';
            
            document.getElementById('ocupacion').value = dp.ocupacion || '';
            document.getElementById('empresa').value = dp.empresa || '';
            document.getElementById('telefonoEmpresa').value = dp.telefonoEmpresa || '';

            document.getElementById('emergenciaNombre').value = dp.emergenciaNombre || '';
            document.getElementById('emergenciaTelefono').value = dp.emergenciaTelefono || '';
            document.getElementById('emergenciaParentesco').value = dp.emergenciaParentesco || '';

            if (dp.isForeignCity) {
                document.getElementById('ciudad').value = FOREIGN_CITY_KEY;
                document.getElementById('ciudadExtranjera').value = dp.ciudad || '';
                toggleForeignCity(FOREIGN_CITY_KEY);
            } else {
                document.getElementById('ciudad').value = dp.ciudad || '';
                toggleForeignCity(''); 
            }
            
            document.getElementById('sector').value = dp.sector || '';
            document.getElementById('calle').value = dp.calle || '';


            renderFamiliares();
            renderCondiciones();
            renderInternamientos();

            const isNegado = (dp.condiciones || []).length === 0 && record.condiciones.length === 0;
            document.getElementById('condicionesNegadas').checked = isNegado;
            toggleCondicionesForm();
            
            currentPage = 1;
            updatePageDisplay();
            showModal('Modo Edición', `Comenzando la edición del registro de ${dp.Nombres} ${dp.Apellidos}. Navegue entre los pasos y presione "Actualizar" al finalizar.`);
        }

        function deleteRecord(id) {
            const index = database.findIndex(r => r.id === id);
            if (index !== -1) {
                const nombreCompleto = database[index].datosPersonales.Nombres + ' ' + database[index].datosPersonales.Apellidos;
                database.splice(index, 1);
                renderSavedRecords();
                showModal('Eliminado', `El registro de ${nombreCompleto} ha sido eliminado permanentemente.`);
                if (editingRecordId === id) {
                    resetForm();
                }
            } else {
                showModal('Error', 'No se pudo encontrar el registro para eliminar.');
            }
        }

        function resetForm() {
            currentFormData = {};
            isEditing = false;
            editingRecordId = null;
            currentPage = 1;
            initializeCurrentFormData();

            document.getElementById('multi-step-form').reset();
            document.getElementById('condicionesNegadas').checked = false;
            toggleCondicionesForm(); 

            document.getElementById('familiares-list').innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido familiares.</p>';
            document.getElementById('condiciones-list').innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido condiciones de salud.</p>';
            document.getElementById('internamientos-list').innerHTML = '<p class="text-muted small p-3 border border-2 border-dashed rounded-3 text-center">No se han añadido internamientos.</p>';
            document.getElementById('data-display').innerHTML = '<p class="text-muted text-center">Cargando datos del registro...</p>';
            
            toggleForeignCity(''); 

            updatePageDisplay();
        }

        window.onload = function() {
            populateDropdowns();
            messageModalInstance = new bootstrap.Modal(document.getElementById('message-modal'));
            initializeCurrentFormData();
            updatePageDisplay();
            renderSavedRecords();
            toggleCondicionesForm(); 
        };

   
   