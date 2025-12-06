# SR Ayuda 🚑 - Sistema de Alerta de Emergencia PWA

**SR Ayuda** es una aplicación web progresiva (PWA) diseñada para situaciones de emergencia. Permite a los usuarios enviar alertas rápidas a contactos de confianza mediante SMS, incluyendo su ubicación GPS exacta y mensajes dictados por voz, minimizando la fricción en situaciones de estrés.

---

## 📋 Características Principales

* **Sin conexión a Internet:** Funciona mediante el protocolo SMS y GPS nativo.
* **Dictado de Voz a Texto:** Transforma el audio del usuario en texto para el SMS.
* **Geolocalización Automática:** Obtiene coordenadas de alta precisión y genera un enlace a Google Maps.
* **Interfaz de Alta Visibilidad:** Colores de alto contraste y botones grandes basados en psicología de emergencia.
* **Botón de Pánico 911:** Acceso directo a la línea de emergencias local.

---

## 🛠️ Documentación Técnica

La aplicación sigue una arquitectura **SPA (Single Page Application)** construida con tecnologías web estándar (HTML5, CSS3, Vanilla JavaScript), sin dependencias externas pesadas para asegurar la máxima velocidad de carga.

### 1. Estructura y Diseño (HTML/CSS)

#### Diseño Mobile First
El diseño está optimizado para dispositivos móviles utilizando variables CSS globales para una paleta de colores semántica de emergencia:
* 🔴 **Rojo (`--red-sos`):** Acción crítica (Llamar al 911).
* 🟠 **Naranja (`--orange-voice`):** Acción de precaución/interacción (Micrófono).
* 🔵 **Azul / 🟢 Verde:** Diferenciación visual rápida entre contactos (Familia vs. Amigos).

#### Gestión de Vistas
La aplicación maneja dos estados principales mediante la manipulación del DOM:
1.  **`#register-screen`:** Formulario de configuración inicial. Utiliza `input type="tel"` para invocar el teclado numérico.
2.  **`#app-screen`:** Interfaz operativa con los botones de acción.
3.  **`#overlay-loader`:** Capa de bloqueo que previene interacciones erróneas mientras se procesa la voz o el GPS.

---

### 2. Lógica del Sistema (JavaScript)

El núcleo de la aplicación se divide en módulos funcionales para manejar el hardware del dispositivo desde el navegador.

#### A. Módulo de Reconocimiento de Voz (Web Speech API)
Utiliza la interfaz `webkitSpeechRecognition` para capturar audio sin enviar archivos pesados.
* **Flujo:** Escucha -> Transcribe a Texto -> Inyecta en SMS.
* **Configuración:** `continuous = false` para detener la grabación automáticamente al detectar silencio.
* **Fallback (Red de Seguridad):** Si la API de voz falla (por falta de internet o compatibilidad), el sistema captura la excepción y procede a enviar el SMS estándar, asegurando que la alerta **siempre** se envíe.

#### B. Módulo de Geolocalización (GPS)
Función asíncrona `getLocationAndSend()` optimizada para emergencias.
* **Alta Precisión:** `enableHighAccuracy: true` fuerza el uso del chip GPS del dispositivo.
* **Timeout Crítico:** Se establece un límite de **4000ms (4 segundos)**. Si el satélite no responde en ese tiempo, la app aborta la espera del GPS y envía la alerta solo con texto para no perder tiempo vital.

#### C. Construcción del Payload SMS (`prepareSMS`)
Esta función ensambla el mensaje final utilizando esquemas URI (`sms:`).
1.  **Recuperación:** Obtiene el número de destino desde `localStorage`.
2.  **Timestamp:** Agrega la hora exacta del incidente.
3.  **Contenido:** Concatena el Texto Dictado (o predeterminado) + Enlace de Google Maps.
4.  **Ejecución:**
    ```javascript
    window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`;
    ```
    Esto abre la aplicación nativa de mensajería con todo el contenido listo para enviar.

#### D. Persistencia de Datos
Utiliza `localStorage` para almacenar la configuración del usuario (nombres y teléfonos) de forma persistente en el navegador, evitando que el usuario deba reconfigurar la app cada vez que la abre.

---

## 🚀 Instalación y Despliegue

Este proyecto está listo para ser convertido en una APK de Android utilizando **PWABuilder**.

1.  **Requisitos:**
    * `index.html` (Código fuente).
    * `manifest.json` (Configuración de PWA y metadatos).
    * `sw.js` (Service Worker para funcionamiento Offline).
    * Iconos (512x512 px).

2.  **Generación de APK:**
    * Subir los archivos a un host seguro (HTTPS) como Netlify o GitHub Pages.
    * Ingresar la URL en [PWABuilder](https://www.pwabuilder.com/).
    * Generar el paquete para Android (`.aab` para Store, `.apk` para pruebas).

---

## 🔒 Privacidad y Permisos

* **Ubicación:** Solo se solicita al momento de presionar el botón de pánico. No hay rastreo en segundo plano.
* **Micrófono:** Solo se activa al presionar "Mensaje de Voz" y no almacena audio, solo lo transcribe.
* **Datos:** Los teléfonos de contacto se guardan localmente en el dispositivo del usuario, nunca se envían a servidores externos.

---
*Desarrollado con fines de seguridad y asistencia ciudadana.*
