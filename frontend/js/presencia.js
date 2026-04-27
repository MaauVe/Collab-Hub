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
        li.textContent = `${user.nombre}`;
        
        // Usamos la clase CSS de Mauricio para mantener el diseño Premium
        li.classList.add("usuario-activo"); 
        
        listaUsuariosHTML.appendChild(li);
    });
}