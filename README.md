# FileCast

FileCast es una solución a un problema que todos en algún momento nos hemos enfrentado: **transferir archivos de manera rápida y sin cables**, manteniendo el archivo **original**, sin pérdidas de datos ni añadidos innecesarios.

Con FileCast puedes enviar archivos entre dispositivos usando solo la red local, de manera **eficiente, segura y confiable**, inspirado en la experiencia de AirDrop pero totalmente web.

## Funcionalidades

* Transferencia de archivos rápida y directa en la red local.
* Mantiene la integridad del archivo original.
* Perfil de usuario para identificarse durante la transferencia.
* Soporte para múltiples dispositivos en la misma sesión.
* Basado en tecnologías web estándar (WebRTC, WebSockets).

## Tecnologías

* **Frontend:** HTML, CSS, JavaScript.
* **Backend:** Node.js + Express + WebSocket.
* **Transferencia de archivos:** WebRTC DataChannels.

## Instalación y ejecución local

1. **Clona el repositorio:**

```bash
git clone https://github.com/WasAlexis/filecast.git
cd filecast
```

Creamos un archivo en la ruta filecast/server llamado ".env", en su contenido debe tener un "port=" al puerto de tu computador que deseas usar.

2. **Instala dependencias:**

```bash
npm install
```

3. **Ejecuta el servidor:**

```bash
npm run start
```

4. **Abre la aplicación en tu navegador:**

Ve a `http://{ip}:3000` y empieza a transferir archivos.
Puedes cambiar el puerto desde el archivo .env si asi lo deseas por defecto usa el 3000.
```
port= (indica aqui el puerto que deseas usar)
```


## Despliegue

Si quieres hacer que FileCast esté disponible en tu red local o públicamente:

1. Configura tu servidor en la nube o máquina local con Node.js.
2. Abre el puerto necesario para WebSockets y WebRTC.
3. Sube los archivos del proyecto y ejecuta el servidor como en la sección anterior.
4. Accede desde cualquier dispositivo conectado a la misma red (o vía internet si el servidor es público) usando la URL de tu servidor.

> ⚠️ Para WebRTC en internet se recomienda usar HTTPS para evitar problemas de seguridad y compatibilidad en algunos navegadores.

## Cómo contribuir

Si quieres aportar a FileCast:

* Revisa los **issues** abiertos o crea uno nuevo con ideas o mejoras.
* Haz un **fork** del repositorio, agrega tus cambios y abre un **pull request**.
* Comparte tus sugerencias de optimización en la sección de **Discusiones**.

**Nota:** Hay un documento que se llama Roadmap.md que contiene una lista de ideas pendiente por desarrollar, si deseas tomar unas de esas tareas, eres bienvenido.
