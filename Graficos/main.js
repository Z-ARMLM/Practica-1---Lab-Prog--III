        let isEditing = false; 
        let chartData = { 
            labels: ['Categoría 1', 'Categoría 2', 'Categoría 3', 'Categoría 4', 'Categoría 5', 'Categoría 6'],
            data: [15000, 22000, 18500, 30100, 25500, 28000],
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)', 
                'rgba(54, 162, 235, 0.8)', 
                'rgba(255, 206, 86, 0.8)', 
                'rgba(75, 192, 192, 0.8)', 
                'rgba(153, 102, 255, 0.8)', 
                'rgba(255, 159, 64, 0.8)'  
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            hoverOffset: 4
        };

        // Almacena las instancias de los gráficos
        let barChartInstance = null;
        let pieChartInstance = null;
        
        // Colores y configuración específicos para el tema oscuro en Chart.js
        const darkThemeChartConfig = {
            color: '#a0aec0', 
            borderColor: '#4a5568', 
            grid: {
                color: '#4a5568', 
                borderColor: '#4a5568'
            }
        };


        /**
         * Inicializa y dibuja ambos gráficos usando los datos actuales de chartData.
         */
        function renderCharts() {
            if (barChartInstance) barChartInstance.destroy();
            if (pieChartInstance) pieChartInstance.destroy();

            if (chartData.labels.length === 0) return;

            const ctxBar = document.getElementById('barChart').getContext('2d');
            barChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Valor Numérico',
                        data: chartData.data,
                        backgroundColor: chartData.backgroundColor.slice(0, chartData.data.length),
                        borderColor: chartData.borderColor.slice(0, chartData.data.length),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { 
                            display: true, 
                            text: 'Gráfico de Barras: Valores por Categoría', 
                            font: { size: 16, color: '#e2e8f0' } 
                        },
                        legend: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            title: { display: true, text: 'Valor', color: darkThemeChartConfig.color },
                            ticks: { color: darkThemeChartConfig.color },
                            grid: darkThemeChartConfig.grid
                        },
                        x: { 
                            title: { display: true, text: 'Categoría', color: darkThemeChartConfig.color },
                            ticks: { color: darkThemeChartConfig.color },
                            grid: darkThemeChartConfig.grid
                        }
                    }
                }
            });

            // --- GRÁFICO DE PASTEL  ---
            const ctxPie = document.getElementById('pieChart').getContext('2d');
            pieChartInstance = new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Proporción',
                        data: chartData.data,
                        backgroundColor: chartData.backgroundColor.slice(0, chartData.data.length),
                        borderColor: '#2d3748', 
                        borderWidth: 1,
                        hoverOffset: chartData.hoverOffset
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { 
                            display: true, 
                            text: 'Gráfico de Pastel: Distribución Proporcional', 
                            font: { size: 16, color: '#e2e8f0' } 
                        },
                        legend: {
                            labels: { color: darkThemeChartConfig.color }
                        }
                    }
                }
            });
        }

        /**
         * Función para poblar el formulario con los datos, ajustando la visibilidad y editabilidad.
         */
        function populateDataForm() {
            const dataList = document.getElementById('dataList');
            dataList.innerHTML = ''; 

            const toggleButton = document.getElementById('toggleEditButton');
            const updateButton = document.getElementById('updateDataButton');
            const addButton = document.getElementById('addDataButton');
            
            if (isEditing) {
                toggleButton.textContent = 'Guardar Cambios';
                toggleButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                toggleButton.classList.add('bg-green-600', 'hover:bg-green-700');
                updateButton.classList.remove('hidden');
                addButton.classList.remove('hidden'); // Botón Agregar
            } else {
                toggleButton.textContent = 'Editar Datos';
                toggleButton.classList.remove('bg-green-600', 'hover:bg-green-700');
                toggleButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
                updateButton.classList.add('hidden');
                addButton.classList.add('hidden'); // Ocultar Agregar
            }

            chartData.labels.forEach((label, index) => {
                const row = document.createElement('div');
                row.className = 'flex items-center bg-gray-700 p-3 rounded-lg mb-2 shadow-sm space-x-2';
                
                row.innerHTML = `
                    <!-- Botón de Eliminar (Trash Icon) -->
                    <button type="button" onclick="deleteDataRow(${index})" 
                            class="${isEditing ? 'block' : 'hidden'} p-1 text-red-400 hover:text-red-500 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                            title="Eliminar Categoría">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3"></path>
                        </svg>
                    </button>
                    <!-- Input de Etiqueta (flex-grow) -->
                    <input type="text" id="label-input-${index}" value="${label}"
                           placeholder="Nombre de Etiqueta"
                           class="flex-grow p-1 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-800 text-gray-100"
                           data-index="${index}" ${isEditing ? '' : 'disabled'}>
                    <!-- Input de Valor (w-24 para evitar desbordamiento) -->
                    <input type="number" id="value-input-${index}" value="${chartData.data[index]}"
                           placeholder="Valor"
                           class="w-24 p-1 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right text-sm bg-gray-800 text-gray-100"
                           data-index="${index}" ${isEditing ? '' : 'disabled'}>
                `;
                dataList.appendChild(row);
            });
        }

       
        function toggleEditMode() {
            if (isEditing) {
                updateData(); 
            }
            
            isEditing = !isEditing;
            populateDataForm(); // Re-renderiza el formulario 
        }
        
        /**
         * Captura las nuevas etiquetas y valores del formulario y actualiza los datos.
         */
        function updateData() {
            const newLabels = [];
            const newValues = [];
            
            const dataRows = document.getElementById('dataList').children;
            
            for (let i = 0; i < dataRows.length; i++) {
                const labelElement = document.getElementById(`label-input-${i}`);
                const valueElement = document.getElementById(`value-input-${i}`);
                
                if (labelElement && valueElement) {
                    const newLabel = labelElement.value.trim() || `Sin Etiqueta ${i + 1}`;
                    newLabels.push(newLabel);

                    const value = parseFloat(valueElement.value) || 0;
                    newValues.push(value);
                }
            }

            chartData.labels = newLabels;
            chartData.data = newValues;

            renderCharts();

            const message = document.getElementById('message');
            message.textContent = isEditing ? 'Gráficos actualizados con la última vista.' : '¡Datos guardados y gráficos actualizados con éxito!';
            message.classList.remove('hidden', 'bg-red-100', 'text-red-700');

            message.classList.add('bg-green-800/50', 'text-green-300');
            setTimeout(() => {
                message.classList.add('hidden');
            }, 3000);
        }

        /**
         * Elimina una fila de datos (etiqueta y valor) por su índice.
         * @param {number} index 
         */
        function deleteDataRow(index) {
            if (chartData.labels.length <= 1) {
                const message = document.getElementById('message');
                message.textContent = 'Debe quedar al menos una categoría para el gráfico.';
                message.classList.remove('hidden', 'bg-green-800/50', 'text-green-300');

                message.classList.add('bg-red-800/50', 'text-red-300');
                setTimeout(() => {
                    message.classList.add('hidden');
                }, 3000);
                return;
            }

            chartData.labels.splice(index, 1);
            chartData.data.splice(index, 1);

            populateDataForm(); 
            
            renderCharts();

            const message = document.getElementById('message');
            message.textContent = 'Categoría eliminada con éxito.';
            message.classList.remove('hidden', 'bg-red-800/50', 'text-red-300');
            message.classList.add('bg-green-800/50', 'text-green-300');
            setTimeout(() => {
                message.classList.add('hidden');
            }, 3000);
        }

        /**
         * Añade una nueva fila de datos (Categoría y Valor 0) al final.
         */
        function addDataRow() {
            const newLabel = `Nueva Categoría ${chartData.labels.length + 1}`;
            const newValue = 0; 

            chartData.labels.push(newLabel);
            chartData.data.push(newValue);

            populateDataForm();

            renderCharts();

            const message = document.getElementById('message');
            message.textContent = `Se agregó la "${newLabel}".`;
            message.classList.remove('hidden', 'bg-red-800/50', 'text-red-300');
            message.classList.add('bg-green-800/50', 'text-green-300');
            setTimeout(() => {
                message.classList.add('hidden');
            }, 3000);
        }


        window.onload = function() {
            // Adjuntar listeners a los botones
            document.getElementById('toggleEditButton').addEventListener('click', toggleEditMode);
            document.getElementById('updateDataButton').addEventListener('click', updateData);
            document.getElementById('addDataButton').addEventListener('click', addDataRow);
            
            populateDataForm(); // Carga los datos en el "formulario"
            renderCharts();     // Dibuja los gráficos iniciales
        };