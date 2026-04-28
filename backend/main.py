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

    async def broadcast_notificacion(self, mensaje: str):
        evento = {
            "tipo": "notificacion",
            "mensaje": mensaje
        }
        for conexion in self.conexiones_activas:
            try:
                await conexion["ws"].send_json(evento)
            except Exception:
                pass

    async def conectar(self, websocket: WebSocket, nombre: str):
        await websocket.accept()
        self.conexiones_activas.append({"ws": websocket, "nombre": nombre, "estado": "Activo"})
        
        await self.broadcast_notificacion(f"{nombre} se ha unido a la sala")
        await self.broadcast_usuarios()

    def desconectar(self, websocket: WebSocket) -> str:
        # Buscamos el nombre antes de borrarlo para la notificación
        nombre_salida = "Alguien"
        for conn in self.conexiones_activas:
            if conn["ws"] == websocket:
                nombre_salida = conn["nombre"]
                break
                
        self.conexiones_activas = [conn for conn in self.conexiones_activas if conn["ws"] != websocket]
        return nombre_salida

    async def actualizar_estado(self, websocket: WebSocket, nuevo_estado: str):
        for conn in self.conexiones_activas:
            if conn["ws"] == websocket:
                conn["estado"] = nuevo_estado
                break
        await self.broadcast_usuarios()

    async def broadcast_usuarios(self):
        lista_usuarios = [{"nombre": conn["nombre"], "estado": conn["estado"]} for conn in self.conexiones_activas]

        mensaje = {
            "tipo": "actualizacion_usuarios",
            "usuarios": lista_usuarios
        }

        for conexion in self.conexiones_activas:
            try:
                await conexion["ws"].send_json(mensaje)
            except Exception:
                pass

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
            data = await websocket.receive_json()

            if data.get("tipo") == "cambio_estado":
                nuevo_estado = data.get("estado")
                await presence_component.actualizar_estado(websocket, nuevo_estado)
                
    except WebSocketDisconnect:
        nombre_salida = presence_component.desconectar(websocket)
        await presence_component.broadcast_notificacion(f"{nombre_salida} ha abandonado la sala")
        await presence_component.broadcast_usuarios()