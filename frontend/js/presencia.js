//Lógica del widget de usuarios activos (Responsabilidad del Rol 4)
// ==========================================
// 1. OBTENER LOS ELEMENTOS DEL HTML
// ==========================================
const inputNombre = document.getElementById('input-nombre');
const btnEntrar = document.getElementById('btn-entrar');
const indicadorEstado = document.getElementById('indicador-estado');
const listaUsuariosHTML = document.getElementById('lista-usuarios');
const editorTexto = document.getElementById('editor-texto'); // Lo necesitamos para habilitarlo

// Variable para guardar la conexión con el servidor
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

    // Cambiamos el estado visualmente a "Conectando..."
    indicadorEstado.textContent = "🟡 Conectando...";
    btnEntrar.disabled = true;
    inputNombre.disabled = true;

    // AQUI ES DONDE TE CONECTAS AL BACKEND
    // Nota: "ws://localhost:8000/ws" es una ruta de ejemplo. 
    // Los Roles 1 y 2 te tendrán que dar la ruta real cuando terminen el servidor.
    socket = new WebSocket(`ws://localhost:8000/ws?nombre=${nombreUsuario}`);

    // --- A. Cuando la conexión es exitosa ---
    socket.onopen = () => {
        indicadorEstado.textContent = "🟢 Conectado";
        editorTexto.disabled = false; // Le habilitamos el editor a Mauricio
        editorTexto.placeholder = "Escribe aquí... (sincronizado en tiempo real)";
    };

    // --- B. Cuando el servidor nos manda un mensaje ---
    socket.onmessage = (evento) => {
        const datos = JSON.parse(evento.data);

        // Si el mensaje del servidor es sobre la lista de presencia
        if (datos.tipo === "actualizacion_usuarios") {
            renderizarUsuarios(datos.usuarios);
        }
        
        // (La parte del texto la manejará Mauricio en su archivo, 
        // pero viajará por esta misma conexión en el futuro)
    };

    // --- C. Cuando se pierde la conexión ---
    socket.onclose = () => {
        indicadorEstado.textContent = "🔴 Desconectado";
        editorTexto.disabled = true;
        btnEntrar.disabled = false;
        inputNombre.disabled = false;
        listaUsuariosHTML.innerHTML = ""; // Limpiamos la lista
        alert("Se perdió la conexión con el servidor.");
    };
});

// ==========================================
// 3. FUNCIÓN PARA PINTAR LOS USUARIOS (TU MÓDULO)
// ==========================================
function renderizarUsuarios(usuarios) {
    listaUsuariosHTML.innerHTML = ""; // Limpiamos la lista actual
    
    // Recorremos el arreglo que nos mandó el backend y creamos los elementos
    usuarios.forEach(user => {
        const li = document.createElement('li');
        
        // Mostramos el nombre y le ponemos el puntito verde de activo
        li.textContent = `${user.nombre}`;
        li.classList.add("status-online"); 
        
        listaUsuariosHTML.appendChild(li);
    });
}