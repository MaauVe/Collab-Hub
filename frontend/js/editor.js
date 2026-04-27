//Lógica para mandar/recibir texto (Tu responsabilidad principal, Rol 3)

// Esperar a que el HTML cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor-texto');

    // Función para ajustar la altura automáticamente
    const autoExpand = () => {
        // Reiniciamos la altura para recalcular
        editor.style.height = 'auto';
        
        // La nueva altura será el scrollHeight (todo el contenido interno)
        const newHeight = editor.scrollHeight;
        editor.style.height = newHeight + 'px';

        // Si llega al límite definido en CSS (60vh), activamos el scroll
        if (newHeight >= (window.innerHeight * 0.6)) {
            editor.style.overflowY = 'auto';
        } else {
            editor.style.overflowY = 'hidden';
        }
    };


    // 1. ESCUCHAR TUS CAMBIOS (Lo que tú escribes)
    // El evento 'input' detecta cualquier cambio instantáneamente (teclas, pegar texto, borrar)
    editor.addEventListener('input', (event) => {
        // 1. Ajustar tamaño visual
        autoExpand();

        const textoActual = event.target.value;
        
        // Por ahora lo vemos en consola. 
        console.log("Enviando al servidor:", textoActual);

        /* TODO (FASE 3): Cuando el backend esté listo, descomenta esto para enviarlo
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                tipo: 'actualizacion_texto',
                contenido: textoActual
            }));
        }
        */
    });

    // Ejecutar una vez al cargar por si hay texto previo
    autoExpand();

    // 2. RECIBIR CAMBIOS DE LOS DEMÁS (Lo que manda el servidor)
    function recibirActualizacion(nuevoTexto) {
        // Obtenemos la posición del cursor para que no salte al inicio al actualizarse
        const cursorPosition = editor.selectionStart;
        
        editor.value = nuevoTexto;
        
        // Restaurar la posición del cursor
        editor.setSelectionRange(cursorPosition, cursorPosition);
    }

    // --- PREPARACIÓN PARA WEBSOCKETS (Para cuando FastAPI esté listo) ---
    /*
    // Cambiarán 'localhost:8000' por la ruta que les dé el equipo de backend
    const socket = new WebSocket('ws://localhost:8000/ws/editor');

    socket.onopen = () => {
        console.log("Conectado al servidor central de Collab-Hub");
    };

    socket.onmessage = (event) => {
        const mensaje = JSON.parse(event.data);
        
        // Si el mensaje es de texto, actualizamos el editor
        if (mensaje.tipo === 'actualizacion_texto') {
            recibirActualizacion(mensaje.contenido);
        }
    };

    socket.onerror = (error) => {
        console.error("Error en la conexión:", error);
    };
    */
});