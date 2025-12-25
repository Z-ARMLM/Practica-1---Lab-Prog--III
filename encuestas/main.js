
        const SUPABASE_URL = "https://fiirddumqcohrujduyij.supabase.co";
        const SUPABASE_KEY = "TU_CLAVE_ANON_AQUI"; 

        const EMAILJS_PUBLIC_KEY = "H37aYCjH5v3EpiG3p"; 
        const EMAILJS_SERVICE_ID = "service_tl2wlew"; 
        const EMAILJS_TEMPLATE_ID = "template_1xqiodq"; 

        const INITIAL_DATA = {
            participants: [
                {email:"admin@test.com", nombre:"Juan", 
                    apellido:"Admin", 
                    sexo:"Masculino", 
                    edad:30, 
                    fechaNacimiento:"1993-01-01", 
                    nacionalidad:"República Dominicana", 
                    ciudad:"Santo Domingo", 
                    direccion:"Calle 1", 
                    telefono:"809-555-5555", 
                    hasVoted:false}
            ],
            surveys: [],
            votes: []
        };

        const supabaseApi = {
            async insertParticipant(participantData) {
                try {
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/participantes`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(participantData)
                    });
                    if (!response.ok) {
                        const err = await response.text();
                        return { error: `Status ${response.status}: ${err}` };
                    }
                    return { success: true };
                } catch (e) {
                    return { error: e.message };
                }
            },

            async getParticipants() {
                try {
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/participantes?select=*`, {
                        method: 'GET',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        }
                    });
                    if (!response.ok) return { error: response.statusText };
                    const data = await response.json();
                    return { data };
                } catch (e) {
                    return { error: e.message };
                }
            }
        };

        const app = {
            data: { participants: [], surveys: [], votes: [] },
            state: { currentUser: null, draftQuestions: [], editingId: null, assignId: null, tempAssign: new Set(), selections: {}, previousView: 'landing' },

            init: async function() {
                // Cargar datos locales iniciales
                this.data.participants = JSON.parse(localStorage.getItem('e_participants')) || INITIAL_DATA.participants;
                this.data.surveys = JSON.parse(localStorage.getItem('e_surveys')) || INITIAL_DATA.surveys;
                this.data.votes = JSON.parse(localStorage.getItem('e_votes')) || INITIAL_DATA.votes;
                
                // Iniciar EmailJS
                if(EMAILJS_PUBLIC_KEY && window.emailjs) {
                    emailjs.init(EMAILJS_PUBLIC_KEY);
                    console.log("EmailJS iniciado");
                }

                // Supabase Status Check
                if(SUPABASE_KEY.startsWith("ey")) {
                    const statusEl = document.getElementById('db-status');
                    if(statusEl) {
                        statusEl.className = "badge bg-success";
                        statusEl.innerHTML = '<i class="bi bi-cloud-check"></i> Conectado';
                    }
                    // Intentar actualizar participantes desde nube para que el login funcione
                    const { data } = await supabaseApi.getParticipants();
                    if(data && data.length > 0) {
                        this.data.participants = data; // Actualizar con DB real
                        this.save();
                    }
                }

                //  LÓGICA DE RUTEO INICIAL - DEFAULT A LANDING
                this.router('landing');

                const params = new URLSearchParams(window.location.search);
                const userLink = params.get('user');

                if (userLink) {
                    // Si hay link, intentar login directo a votación
                    document.getElementById('loading-overlay').classList.remove('d-none');
                    // Pequeño delay para asegurar carga
                    setTimeout(() => {
                        this.handleLogin(userLink, false);
                        document.getElementById('loading-overlay').classList.add('d-none');
                    }, 500);
                } 
            },

            save: function() {
                localStorage.setItem('e_participants', JSON.stringify(this.data.participants));
                localStorage.setItem('e_surveys', JSON.stringify(this.data.surveys));
                localStorage.setItem('e_votes', JSON.stringify(this.data.votes));
            },

            router: function(view) {
                document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
                document.getElementById(`view-${view}`).classList.add('active');
                if(view === 'landing') {
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-error').classList.add('d-none');
                }
            },

            adminRouter: function(subView) {
                this.router('admin');
                document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
                document.getElementById(`admin-${subView}`).classList.remove('d-none');
                document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
                document.getElementById(`nav-${subView}`).classList.add('active');

                if(subView === 'dashboard') this.renderDashboard();
                if(subView === 'participants') this.renderParticipants();
                if(subView === 'surveys') this.renderSurveys();
                if(subView === 'invites') this.renderInvites();
            },

            goToLanding: function() { this.router('landing'); },

            renderDashboard: function() {
                const uniqueVotes = new Set(this.data.votes.map(v => v.voterEmail)).size;
                document.getElementById('stat-total').innerText = this.data.participants.length;
                document.getElementById('stat-votes').innerText = uniqueVotes;
                document.getElementById('stat-surveys').innerText = this.data.surveys.length;
                const container = document.getElementById('results-container');
                container.innerHTML = '';
                this.data.surveys.forEach(s => {
                    let qHtml = '';
                    s.questions.forEach(q => {
                        const qVotes = this.data.votes.filter(v => v.questionId == q.id);
                        const counts = {};
                        q.options.forEach(o => counts[o] = 0);
                        qVotes.forEach(v => { if(counts[v.option] !== undefined) counts[v.option]++ });
                        let bars = '';
                        q.options.forEach(opt => {
                            const val = counts[opt];
                            const pct = qVotes.length ? Math.round((val / qVotes.length)*100) : 0;
                            bars += `<div class="mb-2"><div class="d-flex justify-content-between small mb-1"><span>${opt}</span><span class="fw-bold">${val} (${pct}%)</span></div><div class="progress" style="height: 8px;"><div class="progress-bar" style="width:${pct}%"></div></div></div>`;
                        });
                        qHtml += `<div class="col-md-6 mb-3"><div class="card p-3 h-100 border"><div class="badge bg-light text-secondary mb-2 w-auto align-self-start border">${q.category}</div><h6 class="fw-bold">${q.title}</h6>${bars}<small class="text-end text-muted mt-2 d-block">${qVotes.length} votos</small></div></div>`;
                    });
                    const card = document.createElement('div');
                    card.className = 'col-12';
                    card.innerHTML = `<div class="card bg-white p-3"><h4 class="text-primary border-bottom pb-2 mb-3"><i class="bi bi-folder2-open"></i> ${s.title}</h4><div class="row">${qHtml}</div></div>`;
                    container.appendChild(card);
                });
            },

            renderParticipants: function() {
                const tbody = document.getElementById('table-participants-body');
                tbody.innerHTML = '';
                document.getElementById('p-count').innerText = `${this.data.participants.length} registros`;
                this.data.participants.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><div class="fw-bold text-dark">${p.nombre} ${p.apellido||''}</div><div class="small text-primary">${p.email}</div></td><td class="small text-muted"><div>${p.sexo} • ${p.edad||'?'} años</div><div>${p.nacionalidad}</div></td><td class="small text-muted"><div>${p.ciudad}</div><div class="text-truncate" style="max-width:150px">${p.direccion||''}</div></td><td class="text-end"><button onclick="app.editParticipant('${p.email}')" class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button><button onclick="app.deleteParticipant('${p.email}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button></td>`;
                    tbody.appendChild(tr);
                });
            },

            handleSaveParticipant: async function(e) {
                e.preventDefault();
                const email = document.getElementById('p-email').value;
                const originalEmail = document.getElementById('p-original-email').value;
                const pData = {
                    email: email, nombre: document.getElementById('p-nombre').value, apellido: document.getElementById('p-apellido').value,
                    sexo: document.querySelector('input[name="p-sexo"]:checked').value, nacionalidad: document.getElementById('p-nacionalidad').value,
                    edad: document.getElementById('p-edad').value, fechaNacimiento: document.getElementById('p-fecha').value,
                    ciudad: document.getElementById('p-ciudad').value, direccion: document.getElementById('p-direccion').value,
                    telefono: document.getElementById('p-telefono').value, hasVoted: false
                };
                if (originalEmail) {
                    const idx = this.data.participants.findIndex(x => x.email === originalEmail);
                    pData.hasVoted = this.data.participants[idx].hasVoted;
                    this.data.participants[idx] = pData;
                    alert("Participante actualizado localmente");
                } else {
                    if(this.data.participants.find(x => x.email === email)) return alert("Correo ya existe");
                    if(SUPABASE_KEY.startsWith("ey")) {
                        const res = await supabaseApi.insertParticipant(pData);
                        if(res.error) alert("Error Supabase: " + res.error);
                    }
                    this.data.participants.push(pData);
                    alert("Participante registrado");
                }
                this.save();
                this.clearParticipantForm();
                this.renderParticipants();
            },

            editParticipant: function(email) {
                const p = this.data.participants.find(x => x.email === email);
                document.getElementById('p-email').value = p.email;
                document.getElementById('p-email').disabled = true;
                document.getElementById('p-original-email').value = p.email;
                document.getElementById('p-nombre').value = p.nombre;
                document.getElementById('p-apellido').value = p.apellido;
                document.querySelector(`input[name="p-sexo"][value="${p.sexo}"]`).checked = true;
                document.getElementById('p-nacionalidad').value = p.nacionalidad;
                document.getElementById('p-edad').value = p.edad;
                document.getElementById('p-fecha').value = p.fechaNacimiento;
                document.getElementById('p-ciudad').value = p.ciudad;
                document.getElementById('p-direccion').value = p.direccion;
                document.getElementById('p-telefono').value = p.telefono;
                document.getElementById('form-p-title').innerHTML = "Editar Participante";
                document.getElementById('btn-save-p').innerHTML = "Actualizar";
                document.getElementById('btn-cancel-edit-p').classList.remove('d-none');
                window.scrollTo({top:0, behavior:'smooth'});
            },

            deleteParticipant: function(email) {
                if(confirm("¿Eliminar?")) {
                    this.data.participants = this.data.participants.filter(x => x.email !== email);
                    this.save();
                    this.renderParticipants();
                }
            },

            clearParticipantForm: function() {
                document.getElementById('form-participant').reset();
                document.getElementById('p-email').disabled = false;
                document.getElementById('p-original-email').value = "";
                document.getElementById('form-p-title').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Registrar Nuevo Participante';
                document.getElementById('btn-save-p').innerHTML = '<i class="bi bi-save"></i> Guardar Participante';
                document.getElementById('btn-cancel-edit-p').classList.add('d-none');
            },

            renderSurveys: function() {
                const container = document.getElementById('surveys-list-container');
                container.innerHTML = '';
                this.data.surveys.forEach(s => {
                    const assigned = s.allowedEmails ? s.allowedEmails.length : 0;
                    const badge = assigned === 0 ? '<span class="badge bg-success">Pública</span>' : `<span class="badge bg-warning text-dark">Privada (${assigned})</span>`;
                    const div = document.createElement('div');
                    div.className = `card survey-card p-3 ${s.type.toLowerCase()}`;
                    div.innerHTML = `<div class="d-flex justify-content-between align-items-start"><div><h5 class="fw-bold mb-1">${s.title}</h5><div class="mb-2">
                    <span class="badge bg-light text-dark border me-1">${s.type}</span> ${badge}</div>
                    <div class="small text-muted ps-2 border-start border-3">${s.questions.length} preguntas vinculadas</div></div><div>
                    <button onclick="app.openAssignModal(${s.id})" class="btn btn-sm btn-outline-dark me-1"><i class="bi bi-person-check">Asignar</i>
                    </button><button onclick="app.editSurvey(${s.id})" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil">Editar</i>
                    </button><button onclick="app.deleteSurvey(${s.id})" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i>Eliminar</button></div></div>`;
                    container.appendChild(div);
                });
            },

            showSurveyForm: function() {
                document.getElementById('surveys-list-container').classList.add('d-none');
                document.getElementById('survey-form-container').classList.remove('d-none');
                this.state.draftQuestions = [];
                this.state.editingId = null;
                document.getElementById('s-title').value = '';
                document.getElementById('s-id').value = '';
                this.renderDraftQ();
                this.updateCategories();
            },

            hideSurveyForm: function() {
                document.getElementById('surveys-list-container').classList.remove('d-none');
                document.getElementById('survey-form-container').classList.add('d-none');
            },

            updateCategories: function() {
                const type = document.getElementById('s-type').value;
                const sel = document.getElementById('q-category');
                sel.innerHTML = '';
                const cats = type === 'Politica' ? ["Elección Popular", "Referéndum", "Interna"] : type === 'Comercial' ? ["Estudio Mercado", "Satisfacción", "Producto"] : ["General", "Evento", "Otro"];
                cats.forEach(c => { const o = document.createElement('option'); o.value=c; o.text=c; sel.add(o); });
            },

            addDraftQuestion: function() {
                const title = document.getElementById('q-title').value;
                const opts = document.getElementById('q-options').value;
                if(!title) return alert("Escribe una pregunta");
                let arr = opts.split(',').map(x=>x.trim()).filter(Boolean);
                if(arr.length === 0) arr = ["Opción A", "Opción B"];
                if(!arr.includes("No sé")) arr.push("No sé");
                if(!arr.includes("Ninguno")) arr.push("Ninguno");
                this.state.draftQuestions.push({ id: Date.now() + Math.random(), title: title, category: document.getElementById('q-category').value, options: arr });
                document.getElementById('q-title').value = '';
                document.getElementById('q-options').value = '';
                this.renderDraftQ();
            },

            renderDraftQ: function() {
                const c = document.getElementById('draft-questions-list');
                c.innerHTML = '';
                this.state.draftQuestions.forEach((q, i) => {
                    const div = document.createElement('div');
                    div.className = 'bg-white p-2 mb-2 rounded border position-relative';
                    div.innerHTML = `<button onclick="app.removeDraftQ(${i})" class="btn btn-link p-0 text-danger position-absolute top-0 end-0 me-2 mt-1"><i class="bi bi-x"></i></button><div class="question-badge text-primary">${q.category}</div><div class="fw-bold small">${q.title}</div><div class="text-muted small">${q.options.length} opciones</div>`;
                    c.appendChild(div);
                });
            },

            removeDraftQ: function(i) { this.state.draftQuestions.splice(i,1); this.renderDraftQ(); },

            saveSurvey: function() {
                const title = document.getElementById('s-title').value;
                if(!title || this.state.draftQuestions.length === 0) return alert("Falta título o preguntas");
                const id = this.state.editingId;
                const newS = { id: id || Date.now(), title: title, type: document.getElementById('s-type').value, questions: this.state.draftQuestions, allowedEmails: [] };
                if(id) {
                    const idx = this.data.surveys.findIndex(s => s.id == id);
                    newS.allowedEmails = this.data.surveys[idx].allowedEmails;
                    this.data.surveys[idx] = newS;
                } else {
                    this.data.surveys.push(newS);
                }
                this.save();
                this.hideSurveyForm();
                this.renderSurveys();
            },

            editSurvey: function(id) {
                const s = this.data.surveys.find(x => x.id == id);
                this.showSurveyForm();
                this.state.editingId = id;
                document.getElementById('s-title').value = s.title;
                document.getElementById('s-type').value = s.type;
                this.updateCategories();
                this.state.draftQuestions = [...s.questions];
                this.renderDraftQ();
            },

            deleteSurvey: function(id) {
                if(confirm("¿Borrar?")) {
                    this.data.surveys = this.data.surveys.filter(x => x.id != id);
                    this.save();
                    this.renderSurveys();
                }
            },

            openAssignModal: function(id) {
                this.state.assignId = id;
                const s = this.data.surveys.find(x => x.id == id);
                this.state.tempAssign = new Set(s.allowedEmails || []);
                this.renderAssignList();
                new bootstrap.Modal(document.getElementById('assignModal')).show();
            },

            renderAssignList: function() {
                const c = document.getElementById('assign-list');
                const isPublic = this.state.tempAssign.size === 0;
                document.getElementById('assign-status').innerHTML = isPublic ? '<span class="text-success">Pública</span>' : `<span class="text-warning">Privada (${this.state.tempAssign.size})</span>`;
                c.innerHTML = '';
                this.data.participants.forEach(p => {
                    const div = document.createElement('div');
                    const checked = this.state.tempAssign.has(p.email) ? 'checked' : '';
                    div.className = 'form-check border-bottom py-2';
                    div.innerHTML = `<input class="form-check-input" type="checkbox" ${checked} onchange="app.toggleAssign('${p.email}')"><label class="form-check-label w-100"><span class="fw-bold">${p.nombre} ${p.apellido||''}</span><br><small class="text-muted">${p.email}</small></label>`;
                    c.appendChild(div);
                });
            },

            toggleAssign: function(email) {
                if(this.state.tempAssign.has(email)) this.state.tempAssign.delete(email);
                else this.state.tempAssign.add(email);
                this.renderAssignList();
            },

            toggleAllAssign: function() {
                if(this.state.tempAssign.size === this.data.participants.length) this.state.tempAssign.clear();
                else this.data.participants.forEach(p => this.state.tempAssign.add(p.email));
                this.renderAssignList();
            },

            saveAssignments: function() {
                const idx = this.data.surveys.findIndex(s => s.id == this.state.assignId);
                this.data.surveys[idx].allowedEmails = Array.from(this.state.tempAssign);
                this.save();
                this.renderSurveys();
                bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
            },

            renderInvites: function() {
                const term = document.getElementById('invite-search').value.toLowerCase();
                const tbody = document.getElementById('table-invites-body');
                tbody.innerHTML = '';
                this.data.participants.filter(p => p.email.toLowerCase().includes(term) || p.nombre.toLowerCase().includes(term)).forEach(p => {
                    const badge = p.hasVoted ? '<span class="badge bg-secondary">Votó</span>' : '<span class="badge bg-success">Pendiente</span>';
                    let btns = !p.hasVoted ? `<button onclick="app.copyLink('${p.email}')" class="btn btn-sm btn-outline-secondary"><i class="bi bi-link-45deg"></i>Copiar link</button>
                    <button onclick="app.sendEmail('${p.email}', this)" class="btn btn-sm btn-primary"><i class="bi bi-envelope"></i>Enviar</button>
                    <button onclick="app.handleLogin('${p.email}', true)" class="btn btn-sm btn-warning"><i class="bi bi-play-circle"></i>Previsualizar</button>` : '';
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><div class="fw-bold">${p.nombre}</div><div class="small text-muted">${p.email}</div></td><td>${badge}</td><td class="text-end">${btns}</td>`;
                    tbody.appendChild(tr);
                });
            },

            copyLink: function(email) {
                const url = `${window.location.href.split('?')[0]}?user=${encodeURIComponent(email)}`;
                navigator.clipboard.writeText(url).then(()=>alert("Link copiado"));
            },

            sendEmail: function(email, btnElement) {
                const url = `${window.location.href.split('?')[0]}?user=${encodeURIComponent(email)}`;
                const user = this.data.participants.find(p => p.email === email);
                const name = user ? `${user.nombre} ${user.apellido || ''}` : 'Participante';

                if(EMAILJS_PUBLIC_KEY && window.emailjs) {
                    const originalContent = btnElement.innerHTML;
                    btnElement.disabled = true;
                    btnElement.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                    const templateParams = { to_email: email, to_name: name, link_voto: url, message: `Hola ${name}, ingresa aquí para votar: ${url}`, reply_to: "no-reply@plataforma.com" };
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(() => { alert(`Correo enviado a ${email}`); btnElement.innerHTML = '<i class="bi bi-check"></i>'; })
                    .catch((err) => { console.error('EmailJS Error:', err); alert("Error EmailJS. Usando mailto."); this.openMailClient(email, url, name); })
                    .finally(() => { setTimeout(() => { btnElement.disabled = false; btnElement.innerHTML = originalContent; }, 3000); });
                } else {
                    this.openMailClient(email, url, name);
                }
            },

            openMailClient: function(email, url, name) {
                window.location.href = `mailto:${email}?subject=${encodeURIComponent("Invitación a Votar")}&body=${encodeURIComponent(`Hola ${name},\n\nVota aquí:\n${url}`)}`;
            },

            handleLogin: function(emailInput, fromAdmin=false) {
                const email = emailInput || document.getElementById('login-email').value;
                if(!email) return;
                const user = this.data.participants.find(p => p.email.toLowerCase() === email.toLowerCase());
                const err = document.getElementById('login-error');
                if(!user) { if(err) { err.textContent="Correo no encontrado"; err.classList.remove('d-none'); } else alert("Correo no encontrado"); return; }
                if(user.hasVoted) { if(err) { err.textContent="Ya votaste"; err.classList.remove('d-none'); } else alert("Ya votaste"); return; }
                this.state.currentUser = user;
                this.state.previousView = fromAdmin ? 'admin' : 'landing';
                this.router('voting');
                this.renderVotingBooth();
            },

            renderVotingBooth: function() {
                document.getElementById('voter-display').textContent = this.state.currentUser.email;
                const container = document.getElementById('voting-container');
                container.innerHTML = '';
                this.state.selections = {};
                const mySurveys = this.data.surveys.filter(s => !s.allowedEmails || s.allowedEmails.length===0 || s.allowedEmails.includes(this.state.currentUser.email));
                if(mySurveys.length === 0) { container.innerHTML = '<div class="alert alert-info">No tienes encuestas.</div>'; document.getElementById('btn-submit-final').disabled = true; return; }
                
                mySurveys.forEach(s => {
                    const header = document.createElement('div');
                    header.className = "mb-3 border-bottom pb-2 mt-4";
                    header.innerHTML = `<span class="badge bg-primary me-2">${s.type}</span><span class="h5 fw-bold">${s.title}</span>`;
                    container.appendChild(header);
                    s.questions.forEach(q => {
                        const card = document.createElement('div');
                        card.className = "card mb-3 border-start border-4 border-primary";
                        let opts = '';
                        q.options.forEach(o => {
                            const rid = `q${q.id}-${o.replace(/\s/g,'')}`;
                            opts += `<div class="form-check p-3 border rounded mb-2" style="cursor:pointer" onclick="document.getElementById('${rid}').click()"><input class="form-check-input" type="radio" name="q-${q.id}" id="${rid}" value="${o}" onchange="app.selectOption('${q.id}', '${o}')"><label class="form-check-label fw-bold ms-2" style="cursor:pointer">${o}</label></div>`;
                        });
                        card.innerHTML = `<div class="card-body"><h6 class="fw-bold mb-3">${q.title}</h6>${opts}</div>`;
                        container.appendChild(card);
                    });
                });
                this.checkVote();
            },

            selectOption: function(qid, opt) { this.state.selections[qid] = opt; this.checkVote(); },

            checkVote: function() {
                const mySurveys = this.data.surveys.filter(s => !s.allowedEmails || s.allowedEmails.length===0 || s.allowedEmails.includes(this.state.currentUser.email));
                const allQ = mySurveys.flatMap(s => s.questions.map(q => q.id));
                const answered = Object.keys(this.state.selections).length;
                document.getElementById('btn-submit-final').disabled = answered < allQ.length;
            },

            submitVote: function() {
                Object.entries(this.state.selections).forEach(([qid, opt]) => { this.data.votes.push({ questionId: qid, option: opt, voterEmail: this.state.currentUser.email, timestamp: new Date().toISOString() }); });
                const uIdx = this.data.participants.findIndex(p => p.email === this.state.currentUser.email);
                this.data.participants[uIdx].hasVoted = true;
                this.save();
                alert("Voto depositado correctamente. Gracias por su participación.");
                this.router('landing');
            },

            cancelVote: function() { this.state.currentUser = null; this.router(this.state.previousView); },
            resetSystem: function() { if(confirm("¿BORRAR TODO?")) { localStorage.clear(); window.location.reload(); } }
        };

        document.addEventListener('DOMContentLoaded', () => app.init());
    