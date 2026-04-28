from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
from abc import ABC, abstractmethod

app = FastAPI()

# Definición de Interfaces (Arquitectura)
class IPresenceManager(ABC):
    """
    Interfaz formal para el Componente de Conciencia de Grupo (Group Awareness).
    Garantiza el desacoplamiento del módulo en la arquitectura colaborativa.
    """
    @abstractmethod
    async def conectar(self, websocket: WebSocket, nombre: str):
        pass

    @abstractmethod
    def desconectar(self, websocket: WebSocket):
        pass

    @abstractmethod
    async def broadcast_usuarios(self):
        pass

# Implementación del Componente B
class GestorDePresencia(IPresenceManager):
    def __init__(self):
        self.conexiones_activas: List[Dict] = []

    async def conectar(self, websocket: WebSocket, nombre: str):
        await websocket.accept()
        self.conexiones_activas.append({"ws": websocket, "nombre": nombre, "estado": "Activo"})
        await self.broadcast_usuarios()

    def desconectar(self, websocket: WebSocket):
        self.conexiones_activas = [conn for conn in self.conexiones_activas if conn["ws"] != websocket]

    async def broadcast_usuarios(self):
        lista_usuarios = [{"nombre": conn["nombre"], "estado": conn["estado"]} for conn in self.conexiones_activas]
        
        mensaje = {
            "tipo": "actualizacion_usuarios",
            "usuarios": lista_usuarios
        }
        
        for conexion in self.conexiones_activas:
            try:
                await conexion["ws"].send_json(mensaje)
            except Exception as e:
                print(f"Error en broadcast para {conexion['nombre']}: {e}")

presence_component = GestorDePresencia()

# Módulo de Integración (Core Application)
@app.websocket("/ws")
async def websocket_presencia(websocket: WebSocket, nombre: str = "Anónimo"):
    """
    Endpoint del Middleware Colaborativo para la gestión de presencia.
    """
    await presence_component.conectar(websocket, nombre)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        presence_component.desconectar(websocket)
        await presence_component.broadcast_usuarios()