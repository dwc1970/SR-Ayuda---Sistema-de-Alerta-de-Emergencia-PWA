const STORAGE_KEY = 'brazaletes_auxilio_data_v1';
let profiles = [];
let currentProfileId = null;

// SVGs por defecto
const DEFAULT_AVATARS = {
    portador: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%2364748b'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>",
    mama: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23db2777'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>",
    papa: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%232563eb'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.66 3.33-2.57 5.05-2.57s5.02.91 5.05 2.57C15.8 19.15 14.03 20 12 20z'/></svg>"
};

// Perfil inicial de demostración
const SAMPLE_PROFILE = {
    id: 'sample-01',
    pin: '1234',
    nombre: 'Mateo',
    apellido: 'González',
    edad: '7',
    discapacidad: 'Autismo (TEA - Sensibilidad auditiva)',
    direccion: 'Calle Principal 456, San Rafael',
    fotoPortador: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300&auto=format&fit=crop&q=80',
    mamaNombre: 'Laura Pérez',
    mamaTel: '+5492604123456',
    fotoMama: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    papaNombre: 'Carlos González',
    papaTel: '+5492604654321',
    fotoPapa: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    auxNombre: 'Roberto González (Abuelo)',
    auxTel: '+5492604555444'
};

window.onload = function() {
    loadFromStorage();
    if (profiles.length === 0) {
        profiles.push(SAMPLE_PROFILE);
        saveToStorage();
    }
    currentProfileId = profiles[0].id;
    renderProfilesList();
    updateSelectOptions();
    renderEmergencyView(currentProfileId);
};

// Almacenamiento Local
function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        profiles = stored ? JSON.parse(stored) : [];
    } catch (e) {
        profiles = [];
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
        alert("Atención: No se pudieron guardar los datos localmente.");
    }
}

// Navegación por Pestañas
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`view-${tabId}`).classList.add('active');
    document.getElementById(`btn-tab-${tabId}`).classList.add('active');

    if (tabId === 'list') {
        renderProfilesList();
    } else if (tabId === 'preview') {
        updateSelectOptions();
        renderEmergencyView(currentProfileId);
    }
}

// Subida de imágenes locales
function uploadImage(event, previewId, hiddenInputId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        alert("Por favor selecciona una imagen menor a 3MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const result = e.target.result;
        document.getElementById(previewId).src = result;
        document.getElementById(hiddenInputId).value = result;
    };
    reader.readAsDataURL(file);
}

// Formulario: Guardar o Editar
function handleFormSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('field-id').value || 'id_' + Date.now();
    const pin = document.getElementById('field-pin').value.trim();

    if (pin.length !== 4) {
        alert("El PIN de seguridad debe tener exactamente 4 dígitos numéricos.");
        return;
    }

    const newProfile = {
        id: id,
        pin: pin,
        nombre: document.getElementById('field-nombre').value.trim(),
        apellido: document.getElementById('field-apellido').value.trim(),
        edad: document.getElementById('field-edad').value.trim(),
        discapacidad: document.getElementById('field-discapacidad').value.trim(),
        direccion: document.getElementById('field-direccion').value.trim(),

        fotoPortador: document.getElementById('data-portador').value || DEFAULT_AVATARS.portador,

        mamaNombre: document.getElementById('field-mama-nombre').value.trim(),
        mamaTel: document.getElementById('field-mama-tel').value.trim(),
        fotoMama: document.getElementById('data-mama').value || DEFAULT_AVATARS.mama,

        papaNombre: document.getElementById('field-papa-nombre').value.trim(),
        papaTel: document.getElementById('field-papa-tel').value.trim(),
        fotoPapa: document.getElementById('data-papa').value || DEFAULT_AVATARS.papa,

        auxNombre: document.getElementById('field-aux-nombre').value.trim(),
        auxTel: document.getElementById('field-aux-tel').value.trim()
    };

    const index = profiles.findIndex(p => p.id === id);
    if (index >= 0) {
        profiles[index] = newProfile;
    } else {
        profiles.push(newProfile);
    }

    saveToStorage();
    clearForm();
    currentProfileId = id;
    switchTab('preview');
}

function clearForm() {
    document.getElementById('profile-form').reset();
    document.getElementById('field-id').value = '';
    document.getElementById('field-pin').value = '';
    document.getElementById('data-portador').value = '';
    document.getElementById('data-mama').value = '';
    document.getElementById('data-papa').value = '';
    document.getElementById('preview-portador').src = DEFAULT_AVATARS.portador;
    document.getElementById('preview-mama').src = DEFAULT_AVATARS.mama;
    document.getElementById('preview-papa').src = DEFAULT_AVATARS.papa;
    document.getElementById('form-header-title').textContent = '✍️ Registrar Perfil de Usuario';
}

function requestPinAndEdit(id) {
    const p = profiles.find(item => item.id === id);
    if (!p) return;

    const enteredPin = prompt(`Ingrese el PIN de 4 dígitos para editar el perfil de ${p.nombre}:`);
    if (enteredPin === null) return; // Cancelado

    if (enteredPin !== p.pin) {
        alert("PIN incorrecto. Acceso denegado.");
        return;
    }

    editProfile(id);
}

function requestPinAndDelete(id) {
    const p = profiles.find(item => item.id === id);
    if (!p) return;

    const enteredPin = prompt(`Ingrese el PIN de 4 dígitos para ELIMINAR el perfil de ${p.nombre}:`);
    if (enteredPin === null) return; // Cancelado

    if (enteredPin !== p.pin) {
        alert("PIN incorrecto. No se pudo eliminar el perfil.");
        return;
    }

    if (confirm("¿Estás completamente seguro de eliminar este perfil de auxilio?")) {
        profiles = profiles.filter(item => item.id !== id);
        saveToStorage();
        currentProfileId = profiles.length > 0 ? profiles[0].id : null;
        renderProfilesList();
    }
}

function editProfile(id) {
    const p = profiles.find(item => item.id === id);
    if (!p) return;

    document.getElementById('field-id').value = p.id;
    document.getElementById('field-pin').value = p.pin;
    document.getElementById('field-nombre').value = p.nombre;
    document.getElementById('field-apellido').value = p.apellido;
    document.getElementById('field-edad').value = p.edad;
    document.getElementById('field-discapacidad').value = p.discapacidad;
    document.getElementById('field-direccion').value = p.direccion;

    document.getElementById('data-portador').value = p.fotoPortador;
    document.getElementById('preview-portador').src = p.fotoPortador;

    document.getElementById('field-mama-nombre').value = p.mamaNombre;
    document.getElementById('field-mama-tel').value = p.mamaTel;
    document.getElementById('data-mama').value = p.fotoMama;
    document.getElementById('preview-mama').src = p.fotoMama;

    document.getElementById('field-papa-nombre').value = p.papaNombre;
    document.getElementById('field-papa-tel').value = p.papaTel;
    document.getElementById('data-papa').value = p.fotoPapa;
    document.getElementById('preview-papa').src = p.fotoPapa;

    document.getElementById('field-aux-nombre').value = p.auxNombre;
    document.getElementById('field-aux-tel').value = p.auxTel;

    document.getElementById('form-header-title').textContent = `✏️ Editar Perfil de ${p.nombre}`;
    switchTab('register');
}

// Renderizado de Lista de Perfiles
function renderProfilesList() {
    const container = document.getElementById('profiles-container');
    container.innerHTML = '';

    if (profiles.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <p>No hay perfiles guardados.</p>
                <button class="btn-action btn-primary" style="width: auto; margin: 1rem auto 0 auto;" onclick="switchTab('register')">Crear Primer Perfil</button>
            </div>
        `;
        return;
    }

    profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <div class="profile-card-header">
                <img src="${p.fotoPortador}" class="profile-card-avatar" onerror="this.src='${DEFAULT_AVATARS.portador}'">
                <div>
                    <h3 style="font-size: 1rem; font-weight: 800;">${p.nombre} ${p.apellido}</h3>
                    <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${p.edad} años • ${p.discapacidad}</p>
                </div>
            </div>
            <div class="profile-card-actions">
                <button class="btn-sm btn-edit" style="flex:1;" onclick="viewProfile('${p.id}')">📱 Escanear / QR</button>
                <button class="btn-sm btn-edit" onclick="requestPinAndEdit('${p.id}')">✏️ Editar</button>
                <button class="btn-sm btn-delete" onclick="requestPinAndDelete('${p.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function viewProfile(id) {
    currentProfileId = id;
    switchTab('preview');
}

function updateSelectOptions() {
    const select = document.getElementById('select-active-profile');
    select.innerHTML = '';
    profiles.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} ${p.apellido} (${p.discapacidad})`;
        select.appendChild(opt);
    });
    if (currentProfileId) {
        select.value = currentProfileId;
    }
}

function changeActiveProfile(id) {
    currentProfileId = id;
    renderEmergencyView(id);
}

// RENDERIZADO DE LA VISTA DE EMERGENCIA PARA CELULAR
function renderEmergencyView(id) {
    const p = profiles.find(item => item.id === id);
    const screen = document.getElementById('emergency-mobile-view');

    if (!p) {
        screen.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Selecciona un perfil válido.</div>`;
        return;
    }

    screen.innerHTML = `
        <!-- ENCABEZADO DE EMERGENCIA -->
        <div class="emergency-header">
            <span class="emergency-badge">✚ PERFIL DE AUXILIO ID</span>
            <h2>¡NECESITO AYUDA!</h2>
            <p>Por favor contacta a mi familia de inmediato.</p>
        </div>

        <!-- FOTO "ESTE SOY YO" Y DATOS DEL PORTADOR -->
        <div class="profile-hero">
            <div class="avatar-container">
                <img src="${p.fotoPortador}" class="avatar-img" onerror="this.src='${DEFAULT_AVATARS.portador}'">
                <span class="avatar-tag">ESTE SOY YO</span>
            </div>
            <h3 class="profile-name">${p.nombre} ${p.apellido}</h3>
            <p class="profile-age">${p.edad} AÑOS</p>
        </div>

        <!-- CONDICIÓN O DISCAPACIDAD -->
        <div class="disability-box">
            <div class="disability-icon">⚠️</div>
            <div>
                <div class="disability-title">Condición / Diagnóstico:</div>
                <div class="disability-desc">${p.discapacidad}</div>
            </div>
        </div>

        <!-- BOTONES DE CONTACTO DIRECTO DE LA FAMILIA -->
        <div class="contacts-stack">
            <!-- MAMÁ -->
            <div class="contact-card mama-card">
                <div class="contact-header">
                    <img src="${p.fotoMama}" class="contact-avatar" onerror="this.src='${DEFAULT_AVATARS.mama}'">
                    <div class="contact-info">
                        <span class="contact-role role-mama">MAMÁ</span>
                        <div class="contact-name">${p.mamaNombre}</div>
                        <div class="contact-phone">${p.mamaTel}</div>
                    </div>
                </div>
                <a href="tel:${p.mamaTel}" class="btn-call btn-mama">📞 LLAMAR A MAMÁ</a>
            </div>

            <!-- PAPÁ -->
            <div class="contact-card papa-card">
                <div class="contact-header">
                    <img src="${p.fotoPapa}" class="contact-avatar" onerror="this.src='${DEFAULT_AVATARS.papa}'">
                    <div class="contact-info">
                        <span class="contact-role role-papa">PAPÁ</span>
                        <div class="contact-name">${p.papaNombre}</div>
                        <div class="contact-phone">${p.papaTel}</div>
                    </div>
                </div>
                <a href="tel:${p.papaTel}" class="btn-call btn-papa">📞 LLAMAR A PAPÁ</a>
            </div>

            <!-- AUXILIO -->
            <div class="contact-card aux-card">
                <div style="font-size: 0.65rem; font-weight: 800; color: #92400e; text-align: center; margin-bottom: 0.4rem; text-transform: uppercase;">
                    Contacto familiar secundario:
                </div>
                <div style="text-align: center; margin-bottom: 0.5rem;">
                    <div class="contact-name" style="font-size: 1rem;">${p.auxNombre}</div>
                    <div class="contact-phone" style="font-weight: 700; color: #78350f;">${p.auxTel}</div>
                </div>
                <a href="tel:${p.auxTel}" class="btn-call btn-aux">📲 LLAMAR A CONTACTO DE AUXILIO</a>
            </div>
        </div>

        <!-- DIRECCIÓN DE HOGAR -->
        <div class="address-box">
            <label>🏠 Dirección de Residencia</label>
            <p>${p.direccion}</p>
        </div>

        <!-- TELÉFONOS DE SERVICIOS PÚBLICOS DE EMERGENCIA -->
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
                <a href="tel:100" class="btn-call" style="background-color: #ea580c; padding: 0.5rem; font-size: 0.75rem; grid-column: span 2;">
                    🚒 BOMBEROS (100)
                </a>
            </div>
        </div>
    `;

    generateQR(p);
}

// Generar Código QR
function generateQR(profile) {
    const qrCanvas = document.getElementById('qrcode-canvas');
    const printQr = document.getElementById('print-qr');
    qrCanvas.innerHTML = '';
    printQr.innerHTML = '';

    const qrPayload = `BRAZALETE DE AUXILIO:\nNombre: ${profile.nombre} ${profile.apellido}\nCondicion: ${profile.discapacidad}\nMama: ${profile.mamaTel}\nPapa: ${profile.papaTel}\nAuxilio: ${profile.auxTel}`;

    new QRCode(qrCanvas, {
        text: qrPayload,
        width: 150,
        height: 150,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    new QRCode(printQr, {
        text: qrPayload,
        width: 200,
        height: 200,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('print-name').textContent = `Brazalete de Auxilio: ${profile.nombre} ${profile.apellido}`;
    document.getElementById('print-condition').textContent = `Condición: ${profile.discapacidad}`;
}