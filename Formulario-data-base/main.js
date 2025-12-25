  // --- 1. CONFIGURACIÓN FIREBASE (ES Modules) ---
        // Manteniendo versiones estables 10.8.0 para asegurar compatibilidad con el resto del código
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";        import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
        import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        // TUS CREDENCIALES (Configuración Personal)
        const firebaseConfig = {
            apiKey: "AIzaSyAqc0vSb1NtF8O87ebsCCDd47rzbd17NuE",
            authDomain: "formulario-database.firebaseapp.com",
            projectId: "formulario-database",
            storageBucket: "formulario-database.firebasestorage.app",
            messagingSenderId: "657078588096",
            appId: "1:657078588096:web:3d22ba3384c21e02231325",
            measurementId: "G-RH0LRRCYJ4"
        };
        
        // Inicializar
        const appFirebase = initializeApp(firebaseConfig);
        const auth = getAuth(appFirebase);
        const db = getFirestore(appFirebase);
        const COLLECTION_NAME = 'patients_vanilla';

        let currentUser = null;
        let allRecords = []; // Almacén local de datos

        // --- 2. AUTHENTICATION ---
        async function initAuth() {
            try {
                // Autenticación anónima directa contra tu proyecto
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Auth Error:", error);
                document.getElementById('authStatus').innerHTML = '<span class="text-red-500 font-bold">Error Auth: Revisa la consola</span>';
                
                // Tip para el usuario
                if(error.code === 'auth/operation-not-allowed') {
                    alert("IMPORTANTE: Debes habilitar 'Anónimo' en la sección Authentication > Sign-in method de tu consola Firebase.");
                }
            }
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                document.getElementById('authStatus').innerHTML = `
                    <div class="h-2 w-2 rounded-full bg-green-500"></div>
                    <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Conectado</span>
                `;
                initDataListener(); // Iniciar escucha de datos al conectarse
            } else {
                currentUser = null;
            }
        });

        // --- 3. GESTIÓN DE DATOS (LISTENER EN VIVO) ---
        function initDataListener() {
            // Usamos una ruta simple en la raíz de tu base de datos
            const q = query(collection(db, COLLECTION_NAME));
            
            onSnapshot(q, (snapshot) => {
                allRecords = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                renderTable(); // Re-renderizar tabla cuando cambian los datos
            }, (error) => {
                console.error("Error fetching data:", error);
                
                let errorMsg = "Error al cargar datos.";
                if (error.code === 'permission-denied') {
                    errorMsg = "Permiso denegado: Revisa las 'Reglas' en Firestore Database.";
                }

                document.getElementById('tableBody').innerHTML = `
                    <tr><td colspan="4" class="p-8 text-center text-red-500">${errorMsg}</td></tr>
                `;
            });
        }

        // --- 4. RENDERIZADO UI ---
        function renderTable() {
            const tbody = document.getElementById('tableBody');
            const searchVal = document.getElementById('searchInput').value.toLowerCase();
            
            // Filtrar
            const filtered = allRecords.filter(r => {
                const nombre = (r.nombre || '') + ' ' + (r.apellido || '');
                const razon = r.razonSocial || '';
                const id = r.identificacion || r.rnc || '';
                const email = r.email || '';
                
                return nombre.toLowerCase().includes(searchVal) || 
                       razon.toLowerCase().includes(searchVal) ||
                       id.includes(searchVal) || 
                       email.toLowerCase().includes(searchVal);
            });

            document.getElementById('recordCount').innerText = `Mostrando ${filtered.length} de ${allRecords.length} registros`;

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="p-12 text-center text-slate-400">
                            <div class="flex flex-col items-center gap-2">
                                <i data-lucide="alert-circle" class="w-8 h-8 text-slate-300"></i>
                                <span>No se encontraron registros.</span>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = filtered.map(r => {
                    const esPersona = r.tipoEntidad === 'persona';
                    const icon = esPersona ? 'user' : 'building-2';
                    const colorClass = esPersona ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600';
                    const mainName = esPersona ? `${r.nombre} ${r.apellido}` : r.razonSocial;
                    const subId = esPersona ? r.identificacion : r.rnc;
                    const tag = r.aseguradora ? `<span class="inline-block text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold mb-1 border border-emerald-200">${r.aseguradora}</span>` : '';

                    return `
                        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}">
                                        <i data-lucide="${icon}" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-slate-900">${mainName || 'Sin Nombre'}</div>
                                        <div class="text-xs text-slate-500 font-mono mt-0.5">${subId || 'N/A'}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-slate-800">${r.ciudad || 'N/A'}</div>
                                <div class="text-xs text-slate-500">${r.sector || ''}</div>
                            </td>
                            <td class="px-6 py-4">
                                ${tag}
                                <div class="text-xs text-slate-400 truncate max-w-[150px]">${r.email || ''}</div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-1">
                                    <button onclick="app.editRecord('${r.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="app.deleteRecord('${r.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
            lucide.createIcons(); // Refrescar iconos
        }

        // --- 5. LÓGICA UI & FORMULARIO ---
        
        // Objeto global 'app' para funciones accesibles desde el HTML (onclick)
        window.app = {
            openForm: (isEdit = false) => {
                document.getElementById('listView').classList.add('hidden');
                document.getElementById('formView').classList.remove('hidden');
                
                const title = document.getElementById('formTitle');
                const btn = document.getElementById('btnSaveText');
                
                if (isEdit) {
                    title.innerHTML = '<i data-lucide="edit" class="text-amber-500 w-6 h-6"></i> Editar Registro';
                    btn.innerText = 'Actualizar Cambios';
                } else {
                    document.getElementById('mainForm').reset();
                    document.getElementById('recordId').value = '';
                    app.toggleEntityType(); // Resetear visibilidad de campos
                    title.innerHTML = '<i data-lucide="user-plus" class="text-blue-500 w-6 h-6"></i> Nuevo Registro';
                    btn.innerText = 'Guardar Registro';
                }
                lucide.createIcons();
            },

            closeForm: () => {
                document.getElementById('formView').classList.add('hidden');
                document.getElementById('listView').classList.remove('hidden');
            },

            toggleEntityType: () => {
                const tipo = document.querySelector('input[name="tipoEntidad"]:checked').value;
                const fieldsPersona = document.getElementById('fieldsPersona');
                const fieldsEmpresa = document.getElementById('fieldsEmpresa');
                const sectionSalud = document.getElementById('sectionSalud');

                if (tipo === 'persona') {
                    fieldsPersona.classList.remove('hidden');
                    fieldsEmpresa.classList.add('hidden');
                    sectionSalud.classList.remove('hidden');
                } else {
                    fieldsPersona.classList.add('hidden');
                    fieldsEmpresa.classList.remove('hidden');
                    sectionSalud.classList.add('hidden');
                }
            },

            editRecord: (id) => {
                const record = allRecords.find(r => r.id === id);
                if (!record) return;

                app.openForm(true);
                
                // Llenar formulario
                const form = document.getElementById('mainForm');
                document.getElementById('recordId').value = id;
                
                // Setear radio
                if (record.tipoEntidad) {
                    const radio = form.querySelector(`input[name="tipoEntidad"][value="${record.tipoEntidad}"]`);
                    if (radio) {
                        radio.checked = true;
                        app.toggleEntityType();
                    }
                }

                // Llenar inputs simples
                ['nombre', 'apellido', 'identificacion', 'email', 'telefono', 'ciudad', 'sector', 'calle', 'razonSocial', 'rnc', 'contactoEmpresa'].forEach(field => {
                    if (form[field] && record[field]) form[field].value = record[field];
                });

                // Selects
                ['sexo', 'nacionalidad', 'aseguradora'].forEach(field => {
                    if (form[field]) form[field].value = record[field] || "";
                });
            },

            deleteRecord: async (id) => {
                if(!confirm('¿Estás seguro de eliminar este registro?')) return;
                try {
                    // Usamos la misma referencia simplificada que en initDataListener
                    await deleteDoc(doc(db, COLLECTION_NAME, id));
                    // No hace falta llamar a renderTable(), el listener onSnapshot lo hará solo
                } catch (e) {
                    console.error(e);
                    alert('Error al eliminar: ' + e.message);
                }
            }
        };

        // EVENT: Submit Form
        document.getElementById('mainForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const recordId = document.getElementById('recordId').value;
            
            // Corrección de campos según tipo
            if (data.tipoEntidad === 'empresa') {
                delete data.nombre; delete data.apellido; delete data.identificacion;
            } else {
                delete data.razonSocial; delete data.rnc; delete data.contactoEmpresa;
            }

            const btn = document.getElementById('btnSave');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Guardando...';

            try {
                // Usamos la colección raíz
                const collectionRef = collection(db, COLLECTION_NAME);
                
                if (recordId) {
                    // Update
                    await updateDoc(doc(collectionRef, recordId), { ...data, updatedAt: Date.now() });
                } else {
                    // Create
                    await addDoc(collectionRef, { ...data, createdAt: Date.now() });
                }
                
                app.closeForm();
                
            } catch (err) {
                console.error(err);
                alert('Error al guardar: ' + err.message + '\n\nRevisa si tienes permisos de escritura en Firestore.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
                lucide.createIcons();
            }
        });

        // EVENT: Search Input
        document.getElementById('searchInput').addEventListener('input', renderTable);

        // START
        initAuth();
        lucide.createIcons();