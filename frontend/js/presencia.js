// ==========================================
// 1. OBTENER LOS ELEMENTOS DEL HTML
// ==========================================
const inputNombre = document.getElementById('input-nombre');
const btnEntrar = document.getElementById('btn-entrar');
const indicadorEstado = document.getElementById('indicador-estado');
const listaUsuariosHTML = document.getElementById('lista-usuarios');
const editorTexto = document.getElementById('editor-texto'); 

let socket = null;

// ==========================================
// 2. LÓGICA DE CONEXIÓN AL SERVIDOR
// ==========================================
btnEntrar.addEventListener('click', () => {
    const nombreUsuario = inputNombre.value.trim();

    if (nombreUsuario === "") {
        alert("Por favor, escribe tu nombre antes de unirte.");
        return;
    }

    indicadorEstado.textContent = "🟡 Conectando...";
    btnEntrar.disabled = true;
    inputNombre.disabled = true;

    // Ruta hacia el backend (se ajustará cuando el servidor esté listo)
    socket = new WebSocket(`ws://localhost:8000/ws?nombre=${nombreUsuario}`);

    // --- A. Cuando la conexión es exitosa ---
    socket.onopen = () => {
        indicadorEstado.textContent = "🟢 Conectado";
        editorTexto.disabled = false; // Se activa la zona de Mauricio
        editorTexto.placeholder = "Escribe algo brillante...";
    };

    // --- B. Cuando el servidor nos manda un mensaje ---
    socket.onmessage = (evento) => {
        const datos = JSON.parse(evento.data);

        if (datos.tipo === "actualizacion_usuarios") {
            renderizarUsuarios(datos.usuarios);
        }
        else if (datos.tipo === "notificacion") {
            mostrarToast(datos.mensaje);
        }
    };

    // --- C. Cuando se pierde la conexión ---
    socket.onclose = () => {
        indicadorEstado.textContent = "🔴 Desconectado";
        editorTexto.disabled = true;
        editorTexto.placeholder = "Conéctate para empezar a escribir...";
        btnEntrar.disabled = false;
        inputNombre.disabled = false;
        listaUsuariosHTML.innerHTML = ""; 
        alert("Se perdió la conexión con el servidor.");
    };
});

// ==========================================
// 3. FUNCIÓN PARA PINTAR LOS USUARIOS
// ==========================================
function renderizarUsuarios(usuarios) {
    listaUsuariosHTML.innerHTML = ""; 
    
    usuarios.forEach(user => {
        const li = document.createElement('li');
        // Ahora mostramos el nombre y el estado
        li.textContent = `${user.nombre} - ${user.estado}`;
        
        // Usamos la clase CSS de Mauricio para mantener el diseño Premium
        li.classList.add("usuario-activo"); 
        
        // Cambiar el estilo si está inactivo
        if (user.estado.includes("Inactivo")) {
            li.style.opacity = "0.6";
        }
        
        listaUsuariosHTML.appendChild(li);
    });
}

// ==========================================
// 4. DETECTOR DE INACTIVIDAD
// ==========================================
let timeoutInactividad;
const TIEMPO_INACTIVO = 5000; // 5 segundos para pruebas (luego se puede subir a 30000)

function reiniciarTemporizador() {
    // Si no estamos conectados, no hacemos nada
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // Avisamos al servidor que estamos activos
    socket.send(JSON.stringify({
        tipo: "cambio_estado",
        estado: "Activo"
    }));

    clearTimeout(timeoutInactividad);

    // Si pasan 5 segundos sin actividad, mandamos estado inactivo
    timeoutInactividad = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                tipo: "cambio_estado",
                estado: "Inactivo"
            }));
        }
    }, TIEMPO_INACTIVO);
}

// ==========================================
// 5. FUNCIÓN PARA DIBUJAR EL TOAST
// ==========================================
function mostrarToast(mensaje) {
    const container = document.getElementById('toast-container');
    if (!container) return; 
    
    // Creamos el div de la notificación
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = mensaje;
    
    // Lo agregamos a la pantalla
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// Escuchamos cualquier movimiento o tecla para mantener al usuario "Activo"
window.addEventListener('mousemove', reiniciarTemporizador);
window.addEventListener('keydown', reiniciarTemporizador);