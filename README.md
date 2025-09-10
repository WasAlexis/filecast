# FileCast

Este proyecto es una solucion a una situacion que todos hemos pasado: **Transferir archivos inalambricamente entre dispositivos con distintos sistemas operativos**.

## Que es FileCast?
Es una herramienta que busca facilitar la transmision de archivos inalambricamente sin tener que usar algunos servicios de internet.
> Alguna vez has querido pasar unas fotos, videos, documentos, etc de tu PC (Linux, Windows) a tu iPhone o Android?

Supongo que si y para solucionarlo lo envias por **Whatsapp** o **Telegram**, o incluso subiendolo a la nube con tu proveedor de preferencia.
Eso funciona pero, no es la forma mas optima, en algunos casos te reduce la calidad del archivo al trata de comprimirlo, se pierden datos o incluso en ciertos casos
le agregan meta datos agregandole mas bytes de informacion al archivo.

## Cuales ventajas me ofrece FileCast?
Trae muchisimas ventajas a comparacion de otras alternativas mencionadas anteriormente como **Redes Sociales** o **Cloud**.
- **Privacidad:** Los archivos solo pasan de un dispositivo a otro sin pasar por servidores ni ningun otro dispositivo intermediario.
- **Velocidad:** Como se utiliza en la red local la potencia de transferencia la determina el **Modem** los proveedores de internet por lo general
  ofrecen planes de internet dentre 10Mb y 100Mb, **Filecast** no usa la velocidad de tu proveedor, usa el WiFi (No es lo mismo que internet) que suele rondar entre los 500Mbps y los 2Gbps.

| Estándar              | Año aprox. | Velocidad máx. teórica | Velocidad real típica       |
| --------------------- | ---------- | ---------------------- | --------------------------- |
| **WiFi 1 (802.11b)**  | 1999       | 11 Mbps                | 4–6 Mbps                    |
| **WiFi 2 (802.11a)**  | 1999       | 54 Mbps                | 20–30 Mbps                  |
| **WiFi 3 (802.11g)**  | 2003       | 54 Mbps                | 20–30 Mbps                  |
| **WiFi 4 (802.11n)**  | 2009       | 600 Mbps               | 100–300 Mbps                |
| **WiFi 5 (802.11ac)** | 2014       | 3.5 Gbps (en MU-MIMO)  | 500 Mbps – 1 Gbps           |
| **WiFi 6 (802.11ax)** | 2019       | 9.6 Gbps               | 1–3 Gbps                    |
| **WiFi 6E**           | 2021       | 9.6 Gbps (en 6 GHz)    | 1–3 Gbps                    |
| **WiFi 7 (802.11be)** | 2024       | 46 Gbps (teórico)      | aún en pruebas, varios Gbps |

- **Transferencia original sin perdidas ni agregados:** El archivo transferido se pasa sin modificacion alguna, conservando cada **bit** de informacion.
- **Multiplataforma:** No importa que dispositivos uses, si puede abrir un navegador moderno, podras usar esta herramienta.

## Tecnologias utilizadas:
Este proyecto esta ccnstruido con herramientas nativas de la plataforma Web, buscando la eficiencia y el maximo control de los procesos.

- **Frontend:** HTML + CSS + Javascript.
- **Backend:** Node + Web Sockets + WebRTC.

## Quiero utilizarlo:
De momento no se ha hecho deploy en una pagina web accesible, ya que el proyecto aun esta en una fase temprana de desarrollo. Pero puedes ejecutarlo localmente para usarlo por tu cuenta.

Primero debes de descargar el proyecto:
```bash
git clone https://github.com/WasAlexis/filecast.git
cd filecast/server
```

Instala las dependencia de node: (Son solo 2: ws y v4)

**Nota:** Importante estar en la ruta `filecast/server`.
```bash
npm install
```

Crear el archivo de variables de entorno:
Esto nos ayudara a poder configurar algunas cosas a nuestro gusto.
```bash
touch .env
```

En su contenido puedes agregar la variable: `PORT=#`. Reemplaza el # por el puerto que deseas usar. (Por defecto usa el puerto 3000)

Por ultimo lo ejecutaremos para poder acceder a el desde el navegador:
```bash
npm run start
```
Ahora en tu red local esta sirviendo una pagina web en la ruta `http://` la ip del equipo donde esta ejecutandose el proyecto`:` el puerto que elegiste.

**Nota:** Cualquier equipo que se encuentre en la misma red donde este conectado este equipo podra acceder al sitio web.

## Contribucion
Este proyecto es completamente **open-source** puedes tanto usar la herramienta de forma gratuita, contribuir enviando Pull-request o creando un fork para hacer los cambios que a ti te guste.

Si deseas obtener la documentacion de como esta construido, filosofia y objetivos, estoy construyendo un sitio web que contendra toda esa informacion.

Link del sitio: [Documentacion Filecast](https://alexisdevice.notion.site/FileCast-26977c7af47e80ebb0c6c363d9a12596) (Beta)
