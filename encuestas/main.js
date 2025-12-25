
       //CONFIGURACION PARA GUARDADO DE DATOS EN SUPABASE
       const SUPABASE_URL = "https://fiirddumqcohrujduyij.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaXJkZHVtcWNvaHJ1amR1eWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODgzNjksImV4cCI6MjA4MTQ2NDM2OX0.3n5cmwaHnv30UU_jlc1MsXoIOR-y0KOtOMbX4XZ3il8"; 
        //CONFIGURACION PARA ENVIO DE CORREOS
        const EMAILJS_PUBLIC_KEY = "H37aYCjH5v3EpiG3p"; 
        const EMAILJS_SERVICE_ID = "service_tl2wlew"; 
        const EMAILJS_TEMPLATE_ID = "template_1xqiodq"; 

        const INITIAL_DATA = {
            participants: [
                {email:"admin@test.com", nombre:"Juan", apellido:"Admin", sexo:"Masculino", edad:30, fechaNacimiento:"1993-01-01", nacionalidad:"República Dominicana", ciudad:"Santo Domingo", direccion:"Calle 1", telefono:"809-555-5555", hasVoted:false}
            ],
            surveys: [],
            votes: []
        };

        const supabaseApi = {
            async fetchAll(table) {
                try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
                        method: 'GET',
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                    });
                    if(!res.ok) throw new Error(res.statusText);
                    return await res.json();
                } catch(e) { return null; }
            },
            async insert(table, data) {
                try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                        method: 'POST',
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                        body: JSON.stringify(data)
                    });
                    return res.ok;
                } catch(e) { return false; }
            },
            async insertParticipant(data) { return this.insert('participantes', data); },
            async getParticipants() { return this.fetchAll('participantes').then(d => ({ data: d })); },
            
            async update(table, id, data) {
                 try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                        method: 'PATCH',
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                        body: JSON.stringify(data)
                    });
                    return res.ok;
                } catch(e) { return false; }
            },
            async delete(table, id) {
                 try {
                    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                        method: 'DELETE',
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                    });
                    return res.ok;
                } catch(e) { return false; }
            }
        };

        // ---logica ---
        const app = {
            data: { participants: [], surveys: [], votes: [] },
            state: { currentUser: null, draftQuestions: [], editingId: null, assignId: null, tempAssign: new Set(), selections: {}, previousView: 'landing' },

            init: async function() {
                // 1. Cargar datos 
                this.data.participants = JSON.parse(localStorage.getItem('e_participants')) || INITIAL_DATA.participants;
                this.data.surveys = JSON.parse(localStorage.getItem('e_surveys')) || INITIAL_DATA.surveys;
                this.data.votes = JSON.parse(localStorage.getItem('e_votes')) || INITIAL_DATA.votes;
                
                if(window.emailjs) emailjs.init(EMAILJS_PUBLIC_KEY);

                // Cargar desde Supabase
                if(SUPABASE_KEY.startsWith("ey")) {
                    document.getElementById('db-status').innerHTML = '<i class="bi bi-cloud-check"></i> Conectado';
                    document.getElementById('db-status').className = "badge bg-success";
                    
                    await this.syncData(); 
                }
                
                this.save(); 

                const params = new URLSearchParams(window.location.search);
                const userLink = params.get('user');

                if (userLink) {
                    document.getElementById('loading-overlay').classList.remove('d-none');
                    setTimeout(() => {
                        this.handleLogin(userLink, false);
                        document.getElementById('loading-overlay').classList.add('d-none');
                    }, 800);
                } else {
                    this.router('landing');
                }
            },
            
            syncData: async function() {
                const p = await supabaseApi.fetchAll('participantes');
                if(p) this.data.participants = p;
                
                const s = await supabaseApi.fetchAll('encuestas');
                if(s) this.data.surveys = s;
           
                
                this.save();
                this.renderDashboard(); // Refrescar vista 
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

            // --- PARTICIPANTES ---
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

                if (originalEmail) { // Actualizar
                     const localP = this.data.participants.find(x => x.email === originalEmail);
                     if(localP && localP.id) await supabaseApi.update('participantes', localP.id, pData);
                     const idx = this.data.participants.findIndex(x => x.email === originalEmail);
                     this.data.participants[idx] = { ...this.data.participants[idx], ...pData };
                     alert("Actualizado");
                } else { // crear
                    if(this.data.participants.find(x => x.email === email)) return alert("Correo ya existe");
                    await supabaseApi.insert('participantes', pData);
                    const fresh = await supabaseApi.fetchAll('participantes');
                    if(fresh) this.data.participants = fresh; else this.data.participants.push(pData);
                    alert("Registrado");
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
            
            deleteParticipant: async function(email) {
                if(confirm("¿Eliminar?")) {
                    const p = this.data.participants.find(x => x.email === email);
                    if(p && p.id) await supabaseApi.delete('participantes', p.id);
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
            
            renderParticipants: function() {
                const tbody = document.getElementById('table-participants-body');
                tbody.innerHTML = '';
                document.getElementById('p-count').innerText = `${this.data.participants.length} registros`;
                this.data.participants.forEach(p => {
                    tbody.innerHTML += `<tr><td><div class="fw-bold text-dark">${p.nombre} ${p.apellido||''}</div><div class="small text-primary">${p.email}</div></td><td class="small text-muted"><div>${p.sexo} • ${p.edad||'?'} años</div><div>${p.nacionalidad}</div></td><td class="small text-muted"><div>${p.ciudad}</div><div class="text-truncate" style="max-width:150px">${p.direccion||''}</div></td><td class="text-end"><button onclick="app.editParticipant('${p.email}')" class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button><button onclick="app.deleteParticipant('${p.email}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button></td></tr>`;
                });
            },

            // --- ENCUESTAS ---
            saveSurvey: async function() {
                const title = document.getElementById('s-title').value;
                if(!title) return alert("Falta título");
                
                let existingAllowed = [];
                if(this.state.editingId) {
                    const existingS = this.data.surveys.find(s => s.id == this.state.editingId);
                    if(existingS) existingAllowed = existingS.allowedEmails || [];
                }

                const sData = {
                    title: title,
                    type: document.getElementById('s-type').value,
                    questions: this.state.draftQuestions,
                    allowedEmails: existingAllowed 
                };

                if(this.state.editingId) {
                     await supabaseApi.update('encuestas', this.state.editingId, sData);
                     alert("Encuesta actualizada");
                } else {
                     await supabaseApi.insert('encuestas', sData);
                     alert("Encuesta creada");
                }

                const s = await supabaseApi.fetchAll('encuestas');
                if(s) this.data.surveys = s;
                this.save();
                this.hideSurveyForm();
                this.renderSurveys();
            },

            deleteSurvey: async function(id) {
                if(confirm("¿Borrar?")) {
                    await supabaseApi.delete('encuestas', id);
                    this.data.surveys = this.data.surveys.filter(x => x.id != id);
                    this.save();
                    this.renderSurveys();
                }
            },

            renderSurveys: function() {
                const c = document.getElementById('surveys-list-container');
                c.innerHTML = '';
                this.data.surveys.forEach(s => {
                    const assigned = s.allowedEmails ? s.allowedEmails.length : 0;
                    const badge = assigned === 0 ? '<span class="badge bg-success">Pública</span>' : `<span class="badge bg-warning text-dark">Privada (${assigned})</span>`;
                    c.innerHTML += `<div class="card survey-card p-3 ${s.type.toLowerCase()}"><div class="d-flex justify-content-between"><div><h5 class="fw-bold">${s.title}</h5><span class="badge bg-light text-dark border">${s.type}</span> ${badge}</div><div><button onclick="app.openAssignModal(${s.id})" class="btn btn-sm btn-outline-dark me-1"><i class="bi bi-person-check"></i></button><button onclick="app.editSurvey(${s.id})" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button><button onclick="app.deleteSurvey(${s.id})" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button></div></div></div>`;
                });
            },
            showSurveyForm: function() { document.getElementById('surveys-list-container').classList.add('d-none'); document.getElementById('survey-form-container').classList.remove('d-none'); this.state.draftQuestions = []; this.state.editingId = null; },
            hideSurveyForm: function() { document.getElementById('surveys-list-container').classList.remove('d-none'); document.getElementById('survey-form-container').classList.add('d-none'); },
            addDraftQuestion: function() { const t = document.getElementById('q-title').value; const o = document.getElementById('q-options').value; if(!t) return; let arr = o.split(',').map(x=>x.trim()).filter(Boolean); if(arr.length===0) arr=["Si","No"]; if(!arr.includes("No sé")) arr.push("No sé"); if(!arr.includes("Ninguno")) arr.push("Ninguno"); this.state.draftQuestions.push({id: Date.now(), title: t, category: document.getElementById('q-category').value, options: arr}); this.renderDraftQ(); document.getElementById('q-title').value=''; },
            renderDraftQ: function() { document.getElementById('draft-questions-list').innerHTML = this.state.draftQuestions.map((q,i)=>`<div class="border-bottom mb-2 position-relative"><button onclick="app.removeDraftQ(${i})" class="btn btn-link text-danger position-absolute top-0 end-0 p-0"><i class="bi bi-x"></i></button><b>${q.title}</b><br><small>${q.options.join(', ')}</small></div>`).join(''); },
            removeDraftQ: function(i) { this.state.draftQuestions.splice(i,1); this.renderDraftQ(); },
            updateCategories: function() { const type = document.getElementById('s-type').value; const sel = document.getElementById('q-category'); sel.innerHTML = ''; const cats = type === 'Politica' ? ["Elección Popular", "Referéndum"] : ["General", "Satisfacción"]; cats.forEach(c => { const o = document.createElement('option'); o.value=c; o.text=c; sel.add(o); }); },
            editSurvey: function(id) { const s = this.data.surveys.find(x => x.id == id); this.showSurveyForm(); this.state.editingId = id; document.getElementById('s-title').value = s.title; document.getElementById('s-type').value = s.type; this.state.draftQuestions = [...s.questions]; this.renderDraftQ(); this.updateCategories(); },

            // --- ASIGNACIONES  ---
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

            saveAssignments: async function() {
                const idx = this.data.surveys.findIndex(s => s.id == this.state.assignId);
                const newAllowed = Array.from(this.state.tempAssign);
                
                // Update Supabase
                await supabaseApi.update('encuestas', this.state.assignId, { allowedEmails: newAllowed });
                
                // Update Local
                this.data.surveys[idx].allowedEmails = newAllowed;
                this.save();
                this.renderSurveys();
                bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
                alert("Asignación guardada");
            },

            // --- Invitaciones  ---
            renderInvites: function() {
                const term = document.getElementById('invite-search').value.toLowerCase();
                const tbody = document.getElementById('table-invites-body');
                tbody.innerHTML = '';
                this.data.participants.filter(p=>p.email.toLowerCase().includes(term)).forEach(p => {
                    const badge = p.hasVoted ? '<span class="badge bg-secondary">Votó</span>' : '<span class="badge bg-success">Pendiente</span>';
                    let btns = !p.hasVoted ? `<button onclick="app.copyLink('${p.email}')" class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-link-45deg"></i></button><button onclick="app.sendEmail('${p.email}', this)" class="btn btn-sm btn-primary me-1"><i class="bi bi-envelope"></i></button><button onclick="app.handleLogin('${p.email}', true)" class="btn btn-sm btn-warning"><i class="bi bi-play-circle"></i></button>` : '';
                    tbody.innerHTML += `<tr><td><div class="fw-bold">${p.nombre}</div><div class="small">${p.email}</div></td><td>${badge}</td><td class="text-end">${btns}</td></tr>`;
                });
            },

            copyLink: function(email) {
                const url = `${window.location.href.split('?')[0]}?user=${encodeURIComponent(email)}`;
                navigator.clipboard.writeText(url).then(()=>alert("Link copiado"));
            },

            sendEmail: function(email, btn) {
                const url = `${window.location.href.split('?')[0]}?user=${encodeURIComponent(email)}`;
                const user = this.data.participants.find(p => p.email === email);
                const name = user ? user.nombre : 'Usuario';
                
                if(window.emailjs) {
                    btn.innerHTML = '...';
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email, to_name: name, link_voto: url })
                    .then(() => { alert("Enviado"); btn.innerHTML = '<i class="bi bi-check"></i>'; });
                } else {
                    window.location.href = `mailto:${email}?body=${url}`;
                }
            },

            // ... (Resto de funciones: handleLogin, renderVotingBooth, select, submitVote, cancelVote, resetSystem igual que antes) ...
            handleLogin: function(input, fromAdmin) {
                const email = input || document.getElementById('login-email').value;
                if(!email) return;
                const user = this.data.participants.find(p => p.email.toLowerCase() === email.toLowerCase());
                if(!user) return alert("Correo no encontrado");
                if(user.hasVoted) return alert("Ya votaste");
                this.state.currentUser = user;
                this.state.previousView = fromAdmin ? 'admin' : 'landing';
                this.router('voting');
                this.renderVotingBooth();
            },
            renderVotingBooth: function() {
                document.getElementById('voter-display').textContent = this.state.currentUser.email;
                const c = document.getElementById('voting-container');
                c.innerHTML = '';
                this.state.selections = {};
                const visible = this.data.surveys.filter(s => !s.allowedEmails || s.allowedEmails.length===0 || s.allowedEmails.includes(this.state.currentUser.email));
                if(visible.length === 0) { c.innerHTML = "No hay encuestas disponibles."; return; }
                visible.forEach(s => {
                    const qs = s.questions.map(q => {
                        const opts = q.options.map(o => `<div class="form-check"><input class="form-check-input" type="radio" name="q-${q.id}" onchange="app.select('${q.id}','${o}')"><label class="form-check-label">${o}</label></div>`).join('');
                        return `<div class="card p-3 mb-3"><h6>${q.title}</h6>${opts}</div>`;
                    }).join('');
                    c.innerHTML += `<h5 class="mt-4">${s.title}</h5>${qs}`;
                });
            },
            select: function(qid, opt) { this.state.selections[qid] = opt; document.getElementById('btn-submit-final').disabled = false; },
            submitVote: async function() {
                Object.entries(this.state.selections).forEach(([k,v]) => this.data.votes.push({questionId:k, option:v, voterEmail:this.state.currentUser.email}));
                if(this.state.currentUser.id) await supabaseApi.update('participantes', this.state.currentUser.id, {hasVoted: true});
                const idx = this.data.participants.findIndex(p => p.email === this.state.currentUser.email);
                if(idx !== -1) this.data.participants[idx].hasVoted = true;
                this.save();
                alert("Voto registrado");
                this.router('landing');
            },
            cancelVote: function() { this.state.currentUser = null; this.router(this.state.previousView); },
            renderDashboard: function() {
                document.getElementById('stat-total').innerText = this.data.participants.length;
                document.getElementById('stat-surveys').innerText = this.data.surveys.length;
                const uniqueVotes = new Set(this.data.votes.map(v => v.voterEmail)).size;
                document.getElementById('stat-votes').innerText = uniqueVotes;
            },
            resetSystem: function() { if(confirm("Reset?")) { localStorage.clear(); window.location.reload(); } }
        };
        
        document.addEventListener('DOMContentLoaded', () => app.init());