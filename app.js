// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://mpezhcqiwjbbmnpksyou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nspbW2ThzB7pVDmBkVKrOw_j7K8n_u1w9Y'; // Tu clave publicable real
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_KEY = 'brazaletes_auxilio_data_v1';
let profiles = [];
let currentProfileId = null;

const DEFAULT_AVATARS = {
    portador: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%2364748b'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>",
    mama: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23db2777'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>",
    papa: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%232563eb'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>"
};

const SAMPLE_PROFILE = {
    id: 'sample-01',
    pin: '1234',
    tipo: 'persona',
    nombre: 'Mateo',
    apellido: 'González',
    edad: '7',
    discapacidad: 'Autismo (TEA - Sensibilidad auditiva)',
    direccion: 'Calle Principal 456, San Rafael',
    fotoPortador: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300&auto=format&fit=crop&q=80',
    mamaNombre: 'Laura Pérez',
    mamaTel: '+5492604123456',
    fotoMama: DEFAULT_AVATARS.mama,
    papaNombre: 'Carlos González',
    papaTel: '+5492604654321',
    fotoPapa: DEFAULT_AVATARS.papa,
    auxNombre: 'Roberto González (Abuelo)',
    auxTel: '+5492604555444'
};

function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash && !splash.classList.contains('fade-out')) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 500);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadFromSupabase();
    if (profiles.length === 0) {
        profiles.push(SAMPLE_PROFILE);
        await saveToSupabase(SAMPLE_PROFILE);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');

    if (sharedId) {
        const found = profiles.find(p => p.id === sharedId);
        currentProfileId = found ? found.id : profiles[0].id;
        const adminHeader = document.getElementById('admin-header');
        if (adminHeader) adminHeader.style.display = 'none';
        switchTab('preview');
    } else {
        currentProfileId = profiles[0].id;
        switchTab('register');
    }

    updateSelectOptions();
    renderEmergencyView(currentProfileId);

    setTimeout(hideSplashScreen, 1000);
});

async function loadFromSupabase() {
    try {
        const { data, error } = await supabaseClient.from('perfil').select('*');
        if (error) throw error;
        
        profiles = (data || []).map(item => ({
            id: item.id,
            pin: item.pin,
            tipo: item.tipo,
            nombre: item.nombre,
            apellido: item.apellido,
            edad: item.edad,
            discapacidad: item.discapacidad,
            direccion: item.direccion,
            fotoPortador: item.foto_portador || DEFAULT_AVATARS.portador,
            mamaNombre: item.mama_nombre,
            mamaTel: item.mama_tel,
            fotoMama: item.foto_mama || DEFAULT_AVATARS.mama,
            papaNombre: item.papa_nombre,
            papaTel: item.papa_tel,
            fotoPapa: item.foto_papa || DEFAULT_AVATARS.papa,
            auxNombre: item.aux_nombre,
            auxTel: item.aux_tel
        }));
    } catch (e) {
        console.error("Error cargando de Supabase:", e);
        const stored = localStorage.getItem(STORAGE_KEY);
        profiles = stored ? JSON.parse(stored) : [];
    }
}

async function saveToSupabase(profileObj) {
    try {
        const dbRecord = {
            id: profileObj.id,
            pin: profileObj.pin,
            tipo: profileObj.tipo,
            nombre: profileObj.nombre,
            apellido: profileObj.apellido,
            edad: profileObj.edad,
            discapacidad: profileObj.discapacidad,
            direccion: profileObj.direccion,
            foto_portador: profileObj.fotoPortador,
            mama_nombre: profileObj.mamaNombre,
            mama_tel: profileObj.mamaTel,
            foto_mama: profileObj.fotoMama,
            papa_nombre: profileObj.papaNombre,
            papa_tel: profileObj.papaTel,
            foto_papa: profileObj.fotoPapa,
            aux_nombre: profileObj.auxNombre,
            aux_tel: profileObj.auxTel
        };

        const { error } = await supabaseClient.from('perfil').upsert(dbRecord);
        if (error) throw error;
    } catch (e) {
        console.error("Error guardando en Supabase:", e);
        alert("Atención: No se pudo guardar en la nube, se guardó localmente.");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
}

async function uploadImageToSupabase(file, profileId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profileId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('fotos')
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from('fotos').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (e) {
        console.error("Error subiendo imagen:", e);
        alert("No se pudo subir la foto al servidor de nube.");
        return null;
    }
}

async function uploadImage(event, previewId, hiddenInputId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("Por favor selecciona una imagen menor a 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        document.getElementById(previewId).src = e.target.result;
    };
    reader.readAsDataURL(file);

    const tempId = document.getElementById('field-persona-id').value || document.getElementById('field-mascota-id').value || 'temp_' + Date.now();
    const publicUrl = await uploadImageToSupabase(file, tempId);
    if (publicUrl) {
        document.getElementById(hiddenInputId).value = publicUrl;
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const section = document.getElementById(`view-${tabId}`);
    const btn = document.getElementById(`btn-tab-${tabId}`);

    if (section) section.classList.add('active');
    if (btn) btn.classList.add('active');

    if (tabId === 'qr') {
        updateSelectOptions();
        if (currentProfileId) {
            const p = profiles.find(item => item.id === currentProfileId);
            if (p) generateQR(p);
        }
    } else if (tabId === 'preview') {
        updateSelectOptions();
        renderEmergencyView(currentProfileId);
    }
}

function openForm(tipo, id = null) {
    if (tipo === 'persona') {
        document.getElementById('form-persona-element').reset();
        document.getElementById('field-persona-id').value = '';
        document.getElementById('preview-p-portador').src = '';
        document.getElementById('data-portador-p').value = '';
        document.getElementById('form-persona-title').textContent = '👤 Registrar Perfil de Persona';
        
        if (id) {
            const p = profiles.find(item => item.id === id);
            if (p) {
                document.getElementById('field-persona-id').value = p.id;
                document.getElementById('field-p-nombre').value = p.nombre;
                document.getElementById('field-p-apellido').value = p.apellido;
                document.getElementById('field-p-edad').value = p.edad;
                document.getElementById('field-p-discapacidad').value = p.discapacidad;
                document.getElementById('field-p-direccion').value = p.direccion;
                document.getElementById('data-portador-p').value = p.fotoPortador;
                document.getElementById('preview-p-portador').src = p.fotoPortador;
                document.getElementById('field-p-mama-nombre').value = p.mamaNombre;
                document.getElementById('field-p-mama-tel').value = p.mamaTel;
                document.getElementById('field-p-papa-nombre').value = p.papaNombre || '';
                document.getElementById('field-p-papa-tel').value = p.papaTel || '';
                document.getElementById('field-p-aux-nombre').value = p.auxNombre || '';
                document.getElementById('field-p-aux-tel').value = p.auxTel || '';
                document.getElementById('field-p-pin').value = p.pin;
                document.getElementById('form-persona-title').textContent = `✏️ Editar Perfil de ${p.nombre}`;
            }
        }
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-form-persona').classList.add('active');
    } else if (tipo === 'mascota') {
        document.getElementById('form-mascota-element').reset();
        document.getElementById('field-mascota-id').value = '';
        document.getElementById('preview-m-portador').src = '';
        document.getElementById('data-portador-m').value = '';
        document.getElementById('form-mascota-title').textContent = '🐾 Registrar QR para Mascota';

        if (id) {
            const p = profiles.find(item => item.id === id);
            if (p) {
                document.getElementById('field-mascota-id').value = p.id;
                document.getElementById('field-m-nombre').value = p.nombre;
                let razaClean = p.apellido ? p.apellido.replace(/[()]/g, '') : '';
                document.getElementById('field-m-raza').value = razaClean;
                document.getElementById('field-m-edad').value = p.edad;
                document.getElementById('field-m-cuidados').value = p.discapacidad;
                document.getElementById('field-m-dir').value = p.direccion;
                document.getElementById('field-m-dueno').value = p.mamaNombre;
                document.getElementById('field-m-tel').value = p.mamaTel;
                document.getElementById('data-portador-m').value = p.fotoPortador;
                document.getElementById('preview-m-portador').src = p.fotoPortador;
                document.getElementById('field-m-pin').value = p.pin;
                document.getElementById('form-mascota-title').textContent = `✏️ Editar Mascota ${p.nombre}`;
            }
        }
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-form-mascota').classList.add('active');
    }
}

async function handleFormSubmit(event, tipo) {
    event.preventDefault();

    let id, pin, newProfile;

    if (tipo === 'persona') {
        id = document.getElementById('field-persona-id').value || 'id_' + Date.now();
        pin = document.getElementById('field-p-pin').value.trim();

        if (pin.length !== 4) {
            alert("El PIN de seguridad debe tener exactamente 4 dígitos numéricos.");
            return;
        }

        newProfile = {
            id: id,
            pin: pin,
            tipo: 'persona',
            nombre: document.getElementById('field-p-nombre').value.trim(),
            apellido: document.getElementById('field-p-apellido').value.trim(),
            edad: document.getElementById('field-p-edad').value.trim(),
            discapacidad: document.getElementById('field-p-discapacidad').value.trim(),
            direccion: document.getElementById('field-p-direccion').value.trim(),
            fotoPortador: document.getElementById('data-portador-p').value || DEFAULT_AVATARS.portador,
            mamaNombre: document.getElementById('field-p-mama-nombre').value.trim(),
            mamaTel: document.getElementById('field-p-mama-tel').value.trim(),
            fotoMama: DEFAULT_AVATARS.mama,
            papaNombre: document.getElementById('field-p-papa-nombre').value.trim(),
            papaTel: document.getElementById('field-p-papa-tel').value.trim(),
            fotoPapa: DEFAULT_AVATARS.papa,
            auxNombre: document.getElementById('field-p-aux-nombre').value.trim(),
            auxTel: document.getElementById('field-p-aux-tel').value.trim()
        };
    } else {
        id = document.getElementById('field-mascota-id').value || 'id_' + Date.now();
        pin = document.getElementById('field-m-pin').value.trim();

        if (pin.length !== 4) {
            alert("El PIN de seguridad debe tener exactamente 4 dígitos numéricos.");
            return;
        }

        newProfile = {
            id: id,
            pin: pin,
            tipo: 'mascota',
            nombre: document.getElementById('field-m-nombre').value.trim(),
            apellido: `(${document.getElementById('field-m-raza').value.trim()})`,
            edad: document.getElementById('field-m-edad').value.trim(),
            discapacidad: document.getElementById('field-m-cuidados').value.trim(),
            direccion: document.getElementById('field-m-dir').value.trim(),
            fotoPortador: document.getElementById('data-portador-m').value || DEFAULT_AVATARS.portador,
            mamaNombre: document.getElementById('field-m-dueno').value.trim(),
            mamaTel: document.getElementById('field-m-tel').value.trim(),
            fotoMama: DEFAULT_AVATARS.mama,
            papaNombre: '',
            papaTel: '',
            fotoPapa: '',
            auxNombre: '',
            auxTel: ''
        };
    }

    const index = profiles.findIndex(p => p.id === id);
    if (index >= 0) {
        profiles[index] = newProfile;
    } else {
        profiles.push(newProfile);
    }

    await saveToSupabase(newProfile);
    currentProfileId = id;
    switchTab('qr');
}

function updateSelectOptions() {
    const select = document.getElementById('select-active-profile');
    const selectQR = document.getElementById('select-qr-profile');
    
    [select, selectQR].forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '';
        profiles.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nombre} ${p.apellido || ''} (${p.tipo === 'mascota' ? 'Mascota' : 'Persona'})`;
            sel.appendChild(opt);
        });
        if (currentProfileId) {
            sel.value = currentProfileId;
        }
    });
}

function changeActiveProfile(id) {
    currentProfileId = id;
    renderEmergencyView(id);
    const p = profiles.find(item => item.id === id);
    if (p) generateQR(p);
}

function renderEmergencyView(id) {
    const p = profiles.find(item => item.id === id);
    const screen = document.getElementById('emergency-mobile-view');

    if (!screen) return;

    if (!p) {
        screen.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Selecciona un perfil válido.</div>`;
        return;
    }

    const isMascota = p.tipo === 'mascota';

    screen.innerHTML = `
        <div class="emergency-header">
            <span class="emergency-badge">✚ ${isMascota ? 'AUXILIO MASCOTA PERDIDA' : 'PERFIL DE AUXILIO ID'}</span>
            <h2>¡${isMascota ? 'ESTOY PERDIDO' : 'NECESITO AYUDA'}!</h2>
            <p>${isMascota ? 'Por favor comunícate con mi familia.' : 'Por favor contacta a mi familia de inmediato.'}</p>
        </div>

        <div class="profile-hero">
            <div class="avatar-container">
                <img src="${p.fotoPortador}" class="avatar-img" onerror="this.src='${DEFAULT_AVATARS.portador}'">
                <span class="avatar-tag">${isMascota ? 'MI FOTO' : 'ESTE SOY YO'}</span>
            </div>
            <h3 class="profile-name">${p.nombre} ${p.apellido || ''}</h3>
            <p class="profile-age">${p.edad || ''}</p>
        </div>

        <div class="disability-box">
            <div class="disability-icon">⚠️</div>
            <div>
                <div class="disability-title">${isMascota ? 'Cuidados / Observaciones:' : 'Condición / Diagnóstico:'}</div>
                <div class="disability-desc">${p.discapacidad}</div>
            </div>
        </div>

        <div class="contacts-stack">
            <div class="contact-card mama-card">
                <div class="contact-header">
                    <img src="${p.fotoMama || DEFAULT_AVATARS.mama}" class="contact-avatar" onerror="this.src='${DEFAULT_AVATARS.mama}'">
                    <div class="contact-info">
                        <span class="contact-role role-mama">${isMascota ? 'DUEÑO / RESPONSABLE' : 'MAMÁ'}</span>
                        <div class="contact-name">${p.mamaNombre}</div>
                        <div class="contact-phone">${p.mamaTel}</div>
                    </div>
                </div>
                <a href="tel:${p.mamaTel}" class="btn-call btn-mama">📞 LLAMAR A ${isMascota ? 'RESPONSABLE' : 'MAMÁ'}</a>
            </div>

            ${!isMascota && p.papaNombre ? `
            <div class="contact-card papa-card">
                <div class="contact-header">
                    <img src="${p.fotoPapa || DEFAULT_AVATARS.papa}" class="contact-avatar" onerror="this.src='${DEFAULT_AVATARS.papa}'">
                    <div class="contact-info">
                        <span class="contact-role role-papa">PAPÁ</span>
                        <div class="contact-name">${p.papaNombre}</div>
                        <div class="contact-phone">${p.papaTel}</div>
                    </div>
                </div>
                <a href="tel:${p.papaTel}" class="btn-call btn-papa">📞 LLAMAR A PAPÁ</a>
            </div>` : ''}

            ${!isMascota && p.auxNombre ? `
            <div class="contact-card aux-card">
                <div style="font-size: 0.65rem; font-weight: 800; color: #92400e; text-align: center; margin-bottom: 0.4rem; text-transform: uppercase;">
                    Contacto familiar secundario:
                </div>
                <div style="text-align: center; margin-bottom: 0.5rem;">
                    <div class="contact-name" style="font-size: 1rem;">${p.auxNombre}</div>
                    <div class="contact-phone" style="font-weight: 700; color: #78350f;">${p.auxTel}</div>
                </div>
                <a href="tel:${p.auxTel}" class="btn-call btn-aux">📲 LLAMAR A CONTACTO DE AUXILIO</a>
            </div>` : ''}
        </div>

        <div class="address-box">
            <label>🏠 ${isMascota ? 'Domicilio / Dirección del Responsable' : 'Dirección de Residencia'}</label>
            <p>${p.direccion}</p>
        </div>

        <div style="margin: 1.25rem 1rem 0 1rem; padding-top: 1rem; border-top: 2px dashed #cbd5e1;">
            <div style="font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center; margin-bottom: 0.75rem;">
                🚨 Teléfonos Directos de Emergencia Pública
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <a href="tel:911" class="btn-call" style="background-color: #0284c7; padding: 0.5rem; font-size: 0.75rem;">
                    🚓 POLICÍA (911)
                </a>
                <a href="tel:107" class="btn-call" style="background-color: #16a34a; padding: 0.5rem; font-size: 0.75rem;">
                    AMBULANCIA (107)
                </a>
            </div>
        </div>
    `;
}

function generateQR(profile) {
    const qrCanvas = document.getElementById('qrcode-canvas');
    const printQr = document.getElementById('print-qr');

    if (!qrCanvas) return;

    qrCanvas.innerHTML = '';
    if (printQr) printQr.innerHTML = '';

    const baseUrl = window.location.origin + window.location.pathname;
    const qrPayload = `${baseUrl}?id=${profile.id}`;

    new QRCode(qrCanvas, {
        text: qrPayload,
        width: 180,
        height: 180,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    if (printQr) {
        new QRCode(printQr, {
            text: qrPayload,
            width: 200,
            height: 200,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    const printName = document.getElementById('print-name');
    const printCond = document.getElementById('print-condition');
    if (printName) printName.textContent = `Brazalete de Auxilio: ${profile.nombre} ${profile.apellido || ''}`;
    if (printCond) printCond.textContent = `Condición: ${profile.discapacidad}`;
}