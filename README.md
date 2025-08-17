# FileCast

Es una aplicación web para transferir archivos de forma simple y rápida, con la experiencia de AirDrop pero en versión multiplataforma.

## Características principales

- **Transferencia directa**: los archivos viajan de un dispositivo a otro usando **WebRTC**.
- **Descubrimiento automático**: si varios usuarios tienen FileCast abierto en la misma red, aparecerán en una lista de “dispositivos disponibles”.
- **Privado y seguro**: los archivos no se almacenan en ningún servidor.
- **Sin instalaciones**: solo necesitas abrir la página web.

## Tecnologías

- **Frontend**
  - HTML + CSS + JavaScript.

- **Backend**
  - Node.js.
  - WebSocket (para señalización y descubrimiento de usuarios en la red).

- **Comunicación P2P**
  - WebRTC (DataChannel para enviar archivos de forma directa).


## Flujo de uso

1. El **emisor** abre FileCast y selecciona un archivo.
2. Los dispositivos que tengan FileCast abierto en la misma red aparecen en una lista.
3. El emisor selecciona el dispositivo de destino.
4. Se establece un canal **P2P con WebRTC**.
5. El archivo se transfiere directamente al receptor.
