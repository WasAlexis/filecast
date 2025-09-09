# Filecast Roadmap & Guía de Contribución

Este proyecto aún está en una etapa temprana de desarrollo. A continuación se muestra una lista de características faltantes o planificadas en las que los contribuidores pueden ayudar.

## Funcionalidades Planeadas

- [ ] **Notificación de presencia de usuarios**
  Mostrar en la interfaz cuando un nuevo usuario entra o sale de la sala, esto puede mostrar un icono en el centro junto con algun nombre que lo identifique.

- [ ] **Autorizar desde el otro dispositivo la tranferencia**
  Cuando se seleccione a un dispositivo, este debe de confirmar que quiere recibir el archivo.

- [ ] **Progreso de transferencia de archivos**
  Visualizar el porcentaje de subida/descarga para archivos grandes.

- [x] **Transferencia de archivos en fragmentos (chunks)**
  Implementar envío por partes para soportar archivos de gran tamaño de manera segura.

- [ ] **Manejo de errores**
  Mensajes claros para problemas de conexión, tipos de archivo no soportados o transferencias fallidas.

- [ ] **Seguridad**
  Agregar cifrado para la transferencia de archivos.

- [ ] **Indicar cuando los dispositivos estan conectados entre si**
  Mostrar de forma intuitiva cuando el usuario esta conectado a un dispositivo y tambien se entienda a cual estas conectado.

- [ ] **Agregar efectos de sonidos**
  Para mejorar la experiencia de usuario, hacer que los eventos y acciones tengan repercusion auditiva.

- [ ] **Compatibilidad con el aspecto seleccionado del dispositivo**
  Si el sistema operativo del usuario tiene el aspecto Claro, el sitio web debe de mostrarse en modo claro, de lo contrario modo oscuro.

- [ ] **Envio de multiples archivos**
  Hacer que el input:File permita enviar mas de un archivo a la vez.

- [ ] **Opcion de envio a multiples dispositivos a la vez**
  Permitir que el usuario pueda seleccionar varios dispositivos y enviarles los mismos archivos sin tener que hacerlo manualemente uno a uno.
  
De momento esta es la lista de cosas que tengo en mente, tambien puedes aportar ideas de que otras cosas serian geniales agregar.

## Cómo Contribuir

1. Haz un fork del repositorio y clónalo localmente.  
2. Crea una nueva rama para tu funcionalidad/arreglo:  
   ```bash
   git switch -c feature/nombre-de-tu-feature
   ```
3. Manten tus commits claros y en ingles.
4. Sube tus cambios y envia un pull request.
5. Asegurate que tu codigo no rompa nada ya existente.

### Notas

1. Mantén los commits pequeños y significativos.
2. Si tienes alguna duda o quieres que te aclare algo o debatir sobre algunas practicas, puedes ir al apartado de Discussions y para conversarlo.

Ya con eso lo reviso y lo implemento en el codigo.

Gracias por leer y que la fuerza siempre este contigo.