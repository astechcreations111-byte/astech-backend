/**
 * ============================================
 * DIAGNÓSTICO DIGITAL - LÓGICA DE FORMULARIO
 * ============================================
 * Sistema de formulario condicional avanzado
 * con validación y generación de JSON
 */

// ============================================
// ESTADO GLOBAL DEL FORMULARIO
// ============================================

let estadoFormulario = {
    seccionActual: 0,
    secciones: ['seccion1', 'seccion2', 'final'],
    bloqueCondicional: null,
    datos: {}
};

// Archivo seleccionados
let archivosSeleccionados = [];

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    configurarEventos();
    
    // Configuración del botón de inicio
    const btnSolicitar = document.getElementById('btnSolicitarDiagnostico');
    const startContainer = document.getElementById('start-container');
    const formPrincipal = document.getElementById('formPrincipal');

    btnSolicitar.addEventListener('click', function() {
        startContainer.style.display = 'none';
        formPrincipal.style.display = 'block';
        formPrincipal.classList.add('fade-in-anim');
        mostrarSeccion(0);
    });
});

function inicializarFormulario() {
    const form = document.getElementById('formPrincipal');
    
    // Escuchar cambios en tipo de solución
    const radiosSolucion = document.querySelectorAll('input[name="tipoSolucion"]');
    radiosSolucion.forEach(radio => {
        radio.addEventListener('change', manejarCambioSolucion);
    });

    // Escuchar cambios en archivo
    const inputArchivos = document.getElementById('archivos');
    inputArchivos.addEventListener('change', manejarCambioArchivos);
}

function configurarEventos() {
    document.getElementById('btnSiguiente').addEventListener('click', siguientePaso);
    document.getElementById('btnAnterior').addEventListener('click', anteriorPaso);
    
    // Validación inteligente: Solo validar en tiempo real si ya hay un error visible (para limpiarlo)
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        const limpiarError = (e) => {
            const grupoForm = e.target.closest('.form-group');
            if (grupoForm && grupoForm.classList.contains('error')) {
                validarCampo(e.target);
            }
        };
        input.addEventListener('input', limpiarError);
        input.addEventListener('change', limpiarError);
    });
}

// ============================================
// NAVEGACIÓN DE SECCIONES
// ============================================

function mostrarSeccion(numero) {
    estadoFormulario.seccionActual = numero;
    
    // Ocultar todas las secciones
    const todasLasSecciones = document.querySelectorAll('.form-section');
    todasLasSecciones.forEach(sec => sec.style.display = 'none');
    
    // Ocultar bloques condicionales
    const bloquesCondicionales = document.querySelectorAll('.conditional-block');
    bloquesCondicionales.forEach(bloque => bloque.style.display = 'none');
    
    // Mostrar sección actual
    if (numero === 0) {
        document.querySelector('[data-section="seccion1"]').style.display = 'block';
        document.getElementById('btnAnterior').style.display = 'none';
        document.getElementById('btnSiguiente').textContent = 'Siguiente';
    } 
    else if (numero === 1) {
        document.querySelector('[data-section="seccion2"]').style.display = 'block';
        document.getElementById('btnAnterior').style.display = 'block';
        document.getElementById('btnSiguiente').textContent = 'Siguiente';
        
        // Mostrar bloque condicional si existe selección
        const tipoSolucion = document.querySelector('input[name="tipoSolucion"]:checked');
        if (tipoSolucion) {
            mostrarBloqueCondicional(tipoSolucion.value);
        }
    }
    else if (numero === 2) {
        document.querySelector('[data-section="final"]').style.display = 'block';
        document.getElementById('btnAnterior').style.display = 'block';
        document.getElementById('btnSiguiente').textContent = 'Enviar Diagnóstico';
    }

    // Scroll automático para posicionar el formulario visible debajo del header
    const formContainer = document.querySelector('.form-container');
    const header = document.querySelector('.header');
    
    if (formContainer) {
        const headerHeight = header ? header.offsetHeight : 0;
        const elementPosition = formContainer.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function manejarCambioSolucion(e) {
    const tipoSolucion = e.target.value;
    
    // Ocultar todos los bloques condicionales
    const bloquesCondicionales = document.querySelectorAll('.conditional-block');
    bloquesCondicionales.forEach(bloque => bloque.style.display = 'none');
    
    // Mostrar el bloque correspondiente
    mostrarBloqueCondicional(tipoSolucion);
    
    estadoFormulario.bloqueCondicional = tipoSolucion;
}

function mostrarBloqueCondicional(tipo) {
    const bloqueActivo = document.querySelector(`.conditional-block[data-type="${tipo}"]`);
    if (bloqueActivo) {
        bloqueActivo.style.display = 'block';
    }
}

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Muestra u oculta el mensaje de error para un grupo de formulario.
 * @param {HTMLElement} grupoForm El elemento .form-group.
 * @param {boolean} esValido Si el campo es válido.
 * @param {string} mensajeError El mensaje a mostrar si no es válido.
 */
function manejarEstadoError(grupoForm, esValido, mensajeError) {
    if (!grupoForm) return;
    const errorMsg = grupoForm.querySelector('.error-msg');

    if (!esValido) {
        grupoForm.classList.add('error');
        if (errorMsg) errorMsg.textContent = mensajeError;
    } else {
        grupoForm.classList.remove('error');
        if (errorMsg) errorMsg.textContent = '';
    }
}

function validarSeccion(numeroSeccion) {
    const nombreSeccion = estadoFormulario.secciones[numeroSeccion];
    const seccionElement = document.querySelector(`.form-section[data-section="${nombreSeccion}"]`);
    
    if (!seccionElement) return true;

    // Elementos a validar en este paso (la sección principal y el bloque condicional si aplica)
    const containersAValidar = [seccionElement];

    // Para la sección 1 (índice 1), también se debe validar el bloque condicional visible
    if (numeroSeccion === 1) {
        const tipoSolucion = document.querySelector('input[name="tipoSolucion"]:checked');
        if (tipoSolucion) {
            const bloqueCondicional = document.querySelector(`.conditional-block[data-type="${tipoSolucion.value}"]`);
            if (bloqueCondicional && bloqueCondicional.style.display !== 'none') {
                containersAValidar.push(bloqueCondicional);
            }
        }
    }

    let esTodoValido = true;

    containersAValidar.forEach(container => {
        // Validar campos de texto, select, etc., que son requeridos
        const campos = container.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
        campos.forEach(campo => {
            if (!validarCampo(campo)) {
                esTodoValido = false;
            }
        });

        // Validar grupos de radio requeridos
        const radioGroups = new Set();
        container.querySelectorAll('input[type="radio"][required]').forEach(radio => {
            radioGroups.add(radio.name);
        });
        radioGroups.forEach(nombre => {
            if (!validarRadioGroup(nombre)) {
                esTodoValido = false;
            }
        });
    });

    return esTodoValido;
}

function validarCampo(campo) {
    if (!campo) return true;
    
    const esValido = campo.checkValidity();
    const grupoForm = campo.closest('.form-group');
    
    // Usar el mensaje de validación nativo del navegador para mayor especificidad.
    manejarEstadoError(grupoForm, esValido, campo.validationMessage);
    
    return esValido;
}

function validarCampoIndividual(e) {
    validarCampo(e.target);
}

function validarRadioGroup(nombre) {
    const radios = document.querySelectorAll(`input[name="${nombre}"]`);
    if (radios.length === 0) return true;

    const esValido = Array.from(radios).some(radio => radio.checked);
    const grupoForm = radios[0].closest('.form-group');
    
    manejarEstadoError(grupoForm, esValido, 'Selecciona una opción.');
    
    return esValido;
}

// La función validarBloqueCondicional ya no es necesaria, su lógica se integró en validarSeccion.

// ============================================
// NAVEGACIÓN
// ============================================

function siguientePaso(e) {
    e.preventDefault();
    
    // Validar sección actual
    if (!validarSeccion(estadoFormulario.seccionActual)) {
        console.log('Formulario inválido en sección:', estadoFormulario.seccionActual);
        return;
    }
    
    // Guardar datos
    guardarDatos();
    
    // Si es la última sección, enviar
    if (estadoFormulario.seccionActual === 2) {
        enviarFormulario();
        return;
    }
    
    // Ir a siguiente sección
    if (estadoFormulario.seccionActual < estadoFormulario.secciones.length - 1) {
        mostrarSeccion(estadoFormulario.seccionActual + 1);
    }
}

function anteriorPaso(e) {
    e.preventDefault();
    
    // Guardar datos
    guardarDatos();
    
    if (estadoFormulario.seccionActual > 0) {
        mostrarSeccion(estadoFormulario.seccionActual - 1);
    }
}

// ============================================
// RECOPILACIÓN DE DATOS
// ============================================

function guardarDatos() {
    const form = document.getElementById('formPrincipal');
    const formData = new FormData(form);
    
    for (let [nombre, valor] of formData) {
        if (valor !== '') {
            estadoFormulario.datos[nombre] = valor;
        }
    }
}

function obtenerDatosJSON() {
    guardarDatos();
    
    const json = {
        timestamp: new Date().toISOString(),
        seccion1: {
            nombre: estadoFormulario.datos.nombre || '',
            nombreNegocio: estadoFormulario.datos.nombreNegocio || '',
            industria: estadoFormulario.datos.industria || '',
            tamanio: estadoFormulario.datos.tamanio || '',
            etapa: estadoFormulario.datos.etapa || ''
        },
        seccion2: {
            tipoSolucion: estadoFormulario.datos.tipoSolucion || ''
        },
        detalles: {}
    };
    
    // Agregar detalles según tipo de solución
    const tipoSolucion = estadoFormulario.datos.tipoSolucion;
    
    if (tipoSolucion === 'movil') {
        json.detalles = {
            tipo: 'Aplicación Móvil',
            usuarios: estadoFormulario.datos.appUsuarios || '',
            login: estadoFormulario.datos.appLogin || '',
            tiposUsuario: estadoFormulario.datos.appTiposUsuario || '',
            usuariosMes: estadoFormulario.datos.appUsuariosMes || '',
            notificaciones: estadoFormulario.datos.appNotificaciones || '',
            pagos: estadoFormulario.datos.appPagos || '',
            integraciones: estadoFormulario.datos.appIntegraciones || '',
            offline: estadoFormulario.datos.appOffline || '',
            problema: estadoFormulario.datos.appProblema || '',
            solucionActual: estadoFormulario.datos.appSolucionActual || ''
        };
    } 
    else if (tipoSolucion === 'web') {
        json.detalles = {
            tipo: 'Página Web',
            tipoWeb: estadoFormulario.datos.webTipo || '',
            paginas: estadoFormulario.datos.webPaginas || '',
            blog: estadoFormulario.datos.webBlog || '',
            panel: estadoFormulario.datos.webPanel || '',
            pasarela: estadoFormulario.datos.webPasarela || '',
            productos: estadoFormulario.datos.webProductos || '',
            redesSociales: estadoFormulario.datos.webRedesSociales || '',
            dominio: estadoFormulario.datos.webDominio || '',
            seo: estadoFormulario.datos.webSEO || '',
            objetivo: estadoFormulario.datos.webObjetivo || ''
        };
    }
    else if (tipoSolucion === 'sistema') {
        json.detalles = {
            tipo: 'Sistema Interno',
            procesos: estadoFormulario.datos.sistemaProcesosProcesos || '',
            usuarios: estadoFormulario.datos.sistemaUsuarios || '',
            roles: estadoFormulario.datos.sistemaRoles || '',
            reportes: estadoFormulario.datos.sistemaReportes || '',
            exportaciones: estadoFormulario.datos.sistemaExportaciones || '',
            baseDatos: estadoFormulario.datos.sistemaBaseDatos || '',
            nube: estadoFormulario.datos.sistemaNube || '',
            errores: estadoFormulario.datos.sistemaErrores || '',
            tiempoPerdido: estadoFormulario.datos.sistemaTiempoPerdido || '',
            impacto: estadoFormulario.datos.sistemaImpacto || ''
        };
    }
    else if (tipoSolucion === 'automatizacion') {
        json.detalles = {
            tipo: 'Automatización',
            procesos: estadoFormulario.datos.autoProcesos || '',
            herramientas: estadoFormulario.datos.autoHerramientas || '',
            frecuencia: estadoFormulario.datos.autoFrecuencia || '',
            fallo: estadoFormulario.datos.autoFallo || '',
            whatsapp: estadoFormulario.datos.autoWhatsapp || '',
            email: estadoFormulario.datos.autoEmail || '',
            reportes: estadoFormulario.datos.autoReportes || '',
            metrica: estadoFormulario.datos.autoMetrica || '',
            cuellobotella: estadoFormulario.datos.autoCuellobotella || '',
            meta: estadoFormulario.datos.autoMeta || ''
        };
    }
    else if (tipoSolucion === 'asesoria') {
        json.detalles = {
            tipo: 'Asesoría Estratégica',
            situacion: estadoFormulario.datos.asesorSituacion || '',
            preocupacion: estadoFormulario.datos.asesorPreocupacion || '',
            meta: estadoFormulario.datos.asesorMeta || '',
            intentadas: estadoFormulario.datos.asesorIntentadas || '',
            noFunciono: estadoFormulario.datos.asesorNoFunciono || ''
        };
    }
    
    json.cierre = {
        consecuencias: estadoFormulario.datos.finalConecuencias || '',
        plazo: estadoFormulario.datos.finalPlazo || '',
        preferenciaContacto: estadoFormulario.datos.finalContacto || '',
        email: estadoFormulario.datos.email || '',
        whatsapp: estadoFormulario.datos.whatsapp || '',
        comentarios: estadoFormulario.datos.comentarios || '',
        archivos: archivosSeleccionados
    };
    
    return json;
}

// ============================================
// MANEJO DE ARCHIVOS
// ============================================

function manejarCambioArchivos(e) {
    const archivos = e.target.files;
    archivosSeleccionados = [];
    
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    for (let archivo of archivos) {
        archivosSeleccionados.push({
            nombre: archivo.name,
            tamaño: (archivo.size / 1024).toFixed(2) + ' KB',
            tipo: archivo.type
        });
        
        const fileItem = document.createElement('span');
        fileItem.className = 'file-item';
        fileItem.textContent = `📎 ${archivo.name} (${(archivo.size / 1024).toFixed(2)} KB)`;
        fileList.appendChild(fileItem);
    }
}

// ============================================
// ENVÍO DE FORMULARIO
// ============================================

function enviarFormulario(e) {
    if (e) e.preventDefault();
    
    // Validar última sección
    if (!validarSeccion(2)) {
        console.log('Validación fallida en sección final');
        return;
    }
    
    // Obtener datos completos
    const datosJSON = obtenerDatosJSON();
    
    // --- ENVÍO REAL AL SERVIDOR ---
    fetch('/api/enviar-diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosJSON)
    })
    .then(response => {
        if (!response.ok) {
            // Si el servidor responde con un error (ej: 500)
            throw new Error('Hubo un problema con el servidor.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data.message);
        // Mostrar modal de éxito si todo fue bien
        mostrarModalExito(datosJSON.cierre.email);
    })
    .catch(error => {
        console.error('Error al enviar el formulario:', error);
        // Opcional: Mostrar un mensaje de error al usuario
        alert('No se pudo enviar el diagnóstico. Por favor, inténtalo de nuevo más tarde.');
    });
}

function mostrarModalExito(email) {
    const modal = document.getElementById('successModal');
    const emailElement = document.getElementById('successEmail');
    
    emailElement.textContent = `Confirma tu suscripción en: ${email}`;
    modal.style.display = 'flex';
    
    // Guardar datos en localStorage para demostración
    localStorage.setItem('ultimoDiagnostico', JSON.stringify(obtenerDatosJSON()));
}

// ============================================
// UTILIDADES
// ============================================

window.descargarDatosJSON = function() {
    const datos = obtenerDatosJSON();
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostico-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ============================================
// INTERACTIVIDAD FAQ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            // Cerrar otros items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar este item
            item.classList.toggle('active');
        });
    });
});