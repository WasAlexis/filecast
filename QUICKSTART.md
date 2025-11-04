# 🚀 FileCast - Guía de Inicio Rápido

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar Dependencias
```bash
cd server
npm install
```

### 2️⃣ Configurar Variables de Entorno (Opcional)
```bash
cp .env.example .env
```

Edita `.env` si quieres cambiar el puerto u otras configuraciones.

### 3️⃣ Iniciar el Servidor
```bash
npm run dev
```

### 4️⃣ Abrir en Navegador
Abre tu navegador en: `http://localhost:3000`

### 5️⃣ ¡Listo! 🎉
- Abre la misma URL en otro dispositivo de tu red local
- Selecciona un dispositivo haciendo clic en él
- Arrastra un archivo o usa el botón para seleccionarlo
- Haz clic en el botón de enviar ➤

---

## 📱 Conectar Desde Otro Dispositivo

1. Averigua la IP de tu computadora:
   - Windows: `ipconfig` en CMD
   - Mac/Linux: `ifconfig` o `ip addr`

2. En el otro dispositivo, abre:
   ```
   http://TU_IP:3000
   ```
   Por ejemplo: `http://192.168.1.100:3000`

3. Ambos dispositivos deben estar en la misma red WiFi

---

## 🎯 Características Principales

### ✨ Lo Que Puedes Hacer

- ✅ **Transferir archivos** entre dispositivos sin internet
- ✅ **Arrastrar y soltar** archivos para enviar
- ✅ **Ver progreso** en tiempo real con velocidad
- ✅ **Cambiar tu nombre** para identificarte fácilmente
- ✅ **Conexión automática** si pierdes WiFi temporalmente

### 🔒 Seguridad

- ✅ Los archivos van **directo de dispositivo a dispositivo** (P2P)
- ✅ El servidor **solo coordina la conexión**, no ve tus archivos
- ✅ **Sin nubes ni servidores externos**
- ✅ Protección contra spam y ataques

### 🎨 Interfaz

- 📱 **Responsive** - funciona en móvil y desktop
- 🎨 **Moderna** - diseño limpio y profesional
- 🔔 **Notificaciones** - feedback visual de todo
- 📊 **Progreso detallado** - sabes exactamente qué está pasando

---

## 🎮 Cómo Usar

### Cambiar Tu Nombre
1. Escribe en el campo "Mostrarme como"
2. Haz clic fuera del campo
3. Tu nombre se guarda automáticamente

### Enviar un Archivo
1. **Selecciona un dispositivo** haciendo clic en él
2. **Elige un archivo**:
   - Arrastra el archivo a la ventana, O
   - Haz clic en el ícono 📄 para seleccionar
3. **Envía** haciendo clic en el botón ➤
4. Espera a que termine (verás la barra de progreso)

### Recibir un Archivo
1. Simplemente espera
2. Cuando alguien te envíe, verás:
   - Notificación "Recibiendo: nombre_archivo"
   - Barra de progreso
3. El archivo se descarga automáticamente cuando termina

---

## 🛠️ Configuración Avanzada

### Variables de Entorno (`.env`)

```env
# Puerto del servidor (default: 3000)
PORT=3000

# Host (0.0.0.0 para aceptar de toda la red)
HOST=0.0.0.0

# Logs detallados (debug/info/warn/error)
LOG_LEVEL=info
```

### Límites Configurables

En `server/config/config.js` puedes ajustar:

```javascript
// Tamaño máximo de archivo (default: 2GB)
maxFileSize: 2 * 1024 * 1024 * 1024

// Conexiones por IP (default: 5)
maxConnectionsPerIP: 5

// Dispositivos totales (default: 100)
maxDevices: 100

// Mensajes por minuto (default: 60)
messagesPerMinute: 60
```

---

## 🐛 Solución de Problemas

### No Puedo Conectarme

**Problema**: La página no carga
- ✅ Verifica que el servidor esté corriendo
- ✅ Confirma el puerto (default: 3000)
- ✅ Revisa el firewall de Windows

**Problema**: Otro dispositivo no se conecta
- ✅ Ambos deben estar en la misma red WiFi
- ✅ Usa la IP correcta (no `localhost`)
- ✅ Verifica el firewall no bloquee el puerto

### No Veo Otros Dispositivos

- ✅ Espera unos segundos (actualización automática)
- ✅ Recarga la página (F5)
- ✅ Verifica que el otro dispositivo esté conectado
- ✅ Revisa la consola del navegador (F12) para errores

### El Archivo No Se Envía

- ✅ Selecciona un dispositivo primero
- ✅ Espera a que se establezca la conexión (5-10 segundos)
- ✅ Verifica que el archivo no sea demasiado grande (>2GB)
- ✅ Revisa las notificaciones por mensajes de error

### Conexión Lenta

- ✅ Acércate al router WiFi
- ✅ Archivos muy grandes toman tiempo
- ✅ Cierra otras apps que usen WiFi
- ✅ Verifica la velocidad de tu WiFi

---

## 📊 Información Técnica

### Tecnologías Usadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + WebSockets (ws)
- **P2P**: WebRTC (RTCPeerConnection, DataChannel)
- **UUID**: Identificadores únicos v4

### Flujo de Trabajo

1. **Cliente se conecta** → WebSocket al servidor
2. **Servidor asigna ID** → UUID único
3. **Cliente aparece en lista** → Broadcast a todos
4. **Seleccionar dispositivo** → Iniciar WebRTC
5. **Establecer P2P** → Intercambio de SDP/ICE
6. **Canal abierto** → Transferencia directa
7. **Archivo enviado** → Sin pasar por servidor

### Puertos Usados

- **3000** (HTTP/WebSocket) - Configurable en `.env`
- **Random** (WebRTC) - Asignado por el navegador

---

## 📚 Documentación Completa

- **`README.md`** - Visión general del proyecto
- **`RESUMEN.md`** - Resumen completo de mejoras
- **`IMPROVEMENTS.md`** - Detalles técnicos (inglés)
- **`QUICKSTART.md`** - Esta guía

---

## 💡 Tips y Trucos

### Rendimiento

- 📱 **Móviles**: Funciona perfectamente
- 💻 **Desktop**: Mejor rendimiento
- 🌐 **Navegadores**: Chrome, Firefox, Safari, Edge
- ⚡ **Velocidad**: Depende de tu WiFi (puede ser muy rápido!)

### Mejores Prácticas

1. **Nombra tu dispositivo** para identificarte fácilmente
2. **Espera la conexión** antes de enviar (5-10 segundos)
3. **Usa WiFi 5GHz** si está disponible (más rápido)
4. **Cierra pestañas** que no uses (libera memoria)

### Atajos

- **Drag & Drop**: Arrastra archivos directamente
- **F5**: Recargar si algo falla
- **F12**: Consola para debugging

---

## 🎯 Casos de Uso

### 📸 Fotos del Móvil al PC
1. Abre FileCast en ambos
2. Selecciona tu PC desde el móvil
3. Arrastra la foto
4. ¡Listo! Sin cables ni apps

### 📄 Documentos entre PCs
1. Ideal para oficina/casa
2. Sin USB ni correos
3. Archivos grandes sin problema

### 🎬 Videos entre Dispositivos
1. Video del móvil a tablet
2. Calidad original preservada
3. Sin reducción de calidad

---

## 🚀 Producción (Deployment)

### Para Uso Local

El setup actual es perfecto para:
- Casa
- Oficina
- Red local
- Eventos

### Para Internet (Opcional)

Si quieres acceso desde internet:

1. **HTTPS obligatorio**
   ```bash
   # Usa nginx como reverse proxy con SSL
   # O usa servicio como ngrok para testing
   ```

2. **Dominio**
   - Registra un dominio
   - Configura DNS
   - Obtén certificado SSL (Let's Encrypt)

3. **Servidor dedicado**
   - VPS (DigitalOcean, AWS, etc.)
   - Firewall configurado
   - PM2 para mantener corriendo

---

## ⚠️ Limitaciones

### Actuales

- 📦 **Tamaño máximo**: 2GB por archivo (configurable)
- 👥 **Dispositivos**: 100 simultáneos (configurable)
- 🔄 **Transferencias**: 1 a la vez por conexión
- 📱 **Plataformas**: Requiere navegador moderno

### No Soportado (Por Ahora)

- ❌ Múltiples archivos simultáneos
- ❌ Carpetas/directorios
- ❌ Chat entre usuarios
- ❌ Historial de transferencias
- ❌ Compresión automática

---

## 🎓 Siguientes Pasos

### Como Usuario

1. Prueba enviar diferentes tipos de archivos
2. Conecta varios dispositivos
3. Experimenta con el drag & drop
4. Personaliza tu nombre de dispositivo

### Como Desarrollador

1. Lee `IMPROVEMENTS.md` para entender el código
2. Revisa `server/config/config.js` para configuraciones
3. Experimenta con los límites y timeouts
4. Considera añadir features (ver RESUMEN.md)

---

## 🆘 ¿Necesitas Ayuda?

### Recursos

1. **Logs del servidor**: Muy informativos
2. **Consola del navegador**: Errores del cliente
3. **GitHub Issues**: Reporta problemas
4. **Documentación**: Lee los archivos .md

### Debugging

```bash
# Logs detallados
LOG_LEVEL=debug npm run dev

# Ver todas las conexiones
# Revisa la consola del servidor
```

---

## 🎉 ¡Listo Para Comenzar!

```bash
cd server
npm install
npm run dev
```

Abre `http://localhost:3000` y disfruta de FileCast mejorado! 🚀

**¡Feliz transferencia de archivos!** 📁✨
