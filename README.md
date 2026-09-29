# Los Almeydas

Aplicación web para presentar y comercializar productos de una carnicería. El proyecto combina una interfaz pública para consultar el catálogo y preparar pedidos con una API Node.js/Express conectada a MySQL. Incluye registro e inicio de sesión, control de acceso por roles y una pantalla administrativa para registrar productos.

La propuesta representa a Carnes Los Almeydas, negocio con trayectoria en la comercialización de carnes, vísceras, embutidos y productos relacionados en Floridablanca y sus alrededores. La información comercial aparece en las páginas públicas del sitio.

> **Estado del proyecto:** es una base funcional de comercio electrónico, no una plataforma de pagos lista para producción. El checkout crea un pedido y descuenta inventario; los métodos de pago que se muestran son informativos y no procesan transacciones.

## Contenido

- [Funciones](#funciones)
- [Tecnologías](#tecnologías)
- [Arquitectura y flujo](#arquitectura-y-flujo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Configuración de MySQL](#configuración-de-mysql)
- [Páginas disponibles](#páginas-disponibles)
- [API REST](#api-rest)
- [Autenticación y roles](#autenticación-y-roles)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Pruebas y diagnóstico](#pruebas-y-diagnóstico)
- [Seguridad antes de publicar](#seguridad-antes-de-publicar)

## Funciones

### Para visitantes y clientes

- Consultar el catálogo. Cada producto puede mostrar nombre, descripción, precio, inventario, categoría e imagen.
- Agregar productos al carrito, aumentar o reducir cantidades y retirar artículos.
- Mantener el carrito en `localStorage` del navegador mientras se navega por el sitio.
- Crear una cuenta e iniciar sesión con correo y contraseña.
- Enviar el pedido al servidor como usuario autenticado. El servidor vuelve a comprobar el inventario, registra los detalles y descuenta las unidades disponibles.
- Consultar, mediante la API, los pedidos asociados a la cuenta autenticada.

### Para administradores

- Abrir el formulario de gestión y cargar las categorías existentes.
- Registrar productos con nombre, descripción, precio, stock, categoría y URL de imagen.
- Usar las operaciones de la API para actualizar o eliminar productos y cambiar el estado de un pedido. Estas operaciones existen en el backend, aunque no todas tienen controles en la interfaz.

## Tecnologías

| Área | Tecnología | Uso |
| --- | --- | --- |
| Servidor | Node.js y Express 5 | Sirve la web estática y expone la API bajo `/api`. |
| Base de datos | MySQL y `mysql2/promise` | Guarda usuarios, categorías, productos, pedidos y detalles. |
| Autenticación | JSON Web Token (`jsonwebtoken`) | Emite tokens de acceso con una vigencia de una hora. |
| Contraseñas | `bcryptjs` | Guarda hashes de contraseña en lugar de texto plano. |
| Configuración | `dotenv` | Carga variables desde `.env`. |
| Interfaz | HTML, CSS y JavaScript | Páginas estáticas y llamadas `fetch` a la API. |
| Estilos | Tailwind CSS CDN y CSS local | Estilos y componentes visuales. Tailwind requiere conexión a Internet en las páginas que lo cargan desde CDN. |

## Arquitectura y flujo

1. El navegador solicita una página o recurso estático al servidor Express. Los archivos públicos viven en `public/`; al visitar `/`, Express entrega `public/index.html`.
2. Los scripts de `public/js/` consultan la API en el mismo origen, por ejemplo `GET /api/productos`.
3. Las rutas Express validan la solicitud y consultan MySQL mediante el pool de conexiones de `config/db.js`.
4. Para el inicio de sesión, el servidor compara el hash con `bcryptjs` y devuelve un JWT. El navegador guarda el token y los datos básicos del usuario en `localStorage`.
5. Las operaciones protegidas envían el token en `Authorization: Bearer <token>`. Los middlewares validan el JWT y, cuando aplica, el rol.
6. Al finalizar la compra, la ruta de pedidos abre una transacción MySQL: crea el pedido, verifica stock por producto, registra cada detalle y descuenta inventario. Si una operación falla, intenta revertir la transacción.

El carrito se mantiene en el navegador; no se crea en la base de datos hasta enviar el pedido. El precio y el stock usados para registrar la compra se consultan nuevamente en el servidor, por lo que no se confía en el precio almacenado en el carrito.

## Estructura del proyecto

```text
.
├── config/
│   └── db.js                 Pool y conexión de MySQL
├── middleware/
│   ├── authenticateToken.js  Validación del JWT
│   └── authorizeRole.js      Autorización por rol
├── public/
│   ├── css/                  Hojas de estilo locales
│   ├── imag/                 Recursos gráficos (nombre histórico)
│   ├── Imagenes/             Imágenes y recursos del sitio
│   ├── js/
│   │   ├── auth.js           Registro e inicio de sesión
│   │   ├── cart.js           Carrito y creación de pedidos
│   │   ├── dashboard.js      Registro de productos
│   │   └── index.js          Catálogo y navegación
│   ├── auth.html             Registro e inicio de sesión
│   ├── carrito.html          Carrito de una versión anterior
│   ├── cart.html             Carrito y checkout actuales
│   ├── dashboard.html        Formulario administrativo de productos
│   ├── index.html            Catálogo de productos
│   ├── login.html            Login de una versión anterior
│   ├── main.html             Página de bienvenida
│   ├── nosotros.html         Información del negocio
│   ├── pagos.html            Página estática de pago
│   ├── register.html         Registro de una versión anterior
│   └── script.js             Lógica de una versión anterior
├── routes/
│   ├── categorias.js         Consulta de categorías
│   ├── pedidos.js            Consulta, creación y estado de pedidos
│   ├── productos.js          Consulta y CRUD de productos
│   └── usuarios.js           Registro, login y verificación JWT
├── .env                      Configuración local; no publicar sus secretos
├── package.json              Dependencias y comandos npm
└── server.js                 Entrada del servidor
```

Los nombres de carpetas `Imagenes` e `imag` tienen mayúsculas/minúsculas y deben conservarse tal como aparecen en las rutas, especialmente en sistemas de archivos que distinguen esas diferencias.

## Requisitos

- Node.js 18 o superior (requisito de Express 5).
- npm, incluido con Node.js.
- Un servidor MySQL accesible desde la máquina donde se ejecuta Node.js.
- Una base de datos creada y las tablas descritas en [Configuración de MySQL](#configuración-de-mysql).
- Conexión a Internet para los estilos Tailwind y algunos recursos externos cargados desde CDN.

## Instalación y ejecución

Desde la carpeta raíz del repositorio:

```bash
npm install
```

Configura las variables de entorno del siguiente apartado y prepara MySQL. Luego inicia la aplicación:

```bash
npm start
```

El servidor escucha en `http://localhost:3000` por defecto. Si se define `PORT`, utiliza ese puerto. También se pueden abrir las páginas directamente, por ejemplo:

- `http://localhost:3000/` o `http://localhost:3000/index.html`: catálogo.
- `http://localhost:3000/main.html`: bienvenida.
- `http://localhost:3000/nosotros.html`: información del negocio.
- `http://localhost:3000/auth.html`: registro e inicio de sesión.
- `http://localhost:3000/cart.html`: carrito.
- `http://localhost:3000/dashboard.html`: formulario de productos para administradores.

El proceso intenta comprobar la conexión a MySQL al cargar `config/db.js`. Un fallo de conexión se registra en consola, pero no detiene el servidor HTTP; por ello las páginas pueden abrir aunque las operaciones de la API no funcionen hasta corregir la configuración de la base de datos.

## Configuración de MySQL

Crea un archivo `.env` en la raíz del proyecto. El repositorio ya puede contener uno para el entorno local: conserva sus valores privados y no los publiques. La aplicación espera estas variables:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=los_almeydas
JWT_SECRET=reemplaza_esto_por_un_secreto_largo_y_aleatorio
```

`PORT` es opcional; las demás variables se requieren para el uso normal. `JWT_SECRET` debe ser una cadena larga, aleatoria y privada. No compartas el archivo `.env`, no pegues sus valores en incidencias y no reutilices el ejemplo en un despliegue. No se detectó un `.gitignore` en la raíz del proyecto: comprueba que `.env` esté excluido antes de versionar cambios.

El repositorio no incluye migraciones ni un archivo SQL oficial. Las consultas del backend requieren, como mínimo, tablas con las siguientes columnas. Este ejemplo es un punto de partida inferido de esas consultas; revísalo y adáptalo a las reglas de datos de tu instalación antes de usarlo en producción:

```sql
CREATE DATABASE IF NOT EXISTS los_almeydas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE los_almeydas;

CREATE TABLE CATEGORIAS (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(120) NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categorias_nombre (nombre_categoria)
) ENGINE=InnoDB;

CREATE TABLE USUARIOS (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'cliente',
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE PRODUCTOS (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  id_categoria INT NOT NULL,
  imagen_url VARCHAR(2048) NULL,
  url_imagen VARCHAR(2048) NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  KEY ix_productos_categoria (id_categoria),
  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIAS (id_categoria)
) ENGINE=InnoDB;

CREATE TABLE PEDIDOS (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha_pedido DATETIME NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (id_pedido),
  KEY ix_pedidos_usuario_fecha (id_usuario, fecha_pedido),
  CONSTRAINT fk_pedidos_usuario
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE DETALLE_PEDIDO (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_detalle),
  KEY ix_detalle_pedido (id_pedido),
  KEY ix_detalle_producto (id_producto),
  CONSTRAINT fk_detalle_pedido
    FOREIGN KEY (id_pedido) REFERENCES PEDIDOS (id_pedido),
  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS (id_producto)
) ENGINE=InnoDB;

INSERT INTO CATEGORIAS (nombre_categoria)
VALUES ('Carnes'), ('Embutidos'), ('Visceras');
```

**Nota sobre las imágenes:** las consultas del catálogo y el formulario administrativo usan `PRODUCTOS.imagen_url`, pero la consulta de detalle de pedidos usa `PRODUCTOS.url_imagen`. Por eso el esquema de ejemplo incluye ambas columnas. El CRUD actual solo escribe `imagen_url`; si se necesita mostrar imágenes en los detalles de pedidos, conviene unificar el nombre de columna en el código y el esquema o mantener ambos campos sincronizados.

La consulta de catálogo relaciona productos y categorías con un `JOIN`; por tanto, cada producto debe tener una categoría existente. El total de un pedido se calcula al consultar los detalles, no se guarda como una columna en `PEDIDOS`.

## Páginas disponibles

| Página | Descripción |
| --- | --- |
| `index.html` | Carga el catálogo desde `GET /api/productos`, muestra stock y permite agregar unidades al carrito. |
| `auth.html` | Contiene las pestañas de registro e inicio de sesión; puede abrir el login con `?tab=login`. |
| `cart.html` | Muestra y modifica el carrito local, calcula el total mostrado y envía el pedido al servidor. |
| `dashboard.html` | Formulario para registrar productos. El cliente verifica que haya un usuario con rol admin y la API vuelve a validar el token y rol. |
| `main.html` | Página de bienvenida con imágenes y enlaces informativos. |
| `nosotros.html` | Presenta información del negocio y su trayectoria. |
| `pagos.html` | Página estática heredada relacionada con el pago; no integra un proveedor de pagos. |

También existen `login.html`, `register.html`, `carrito.html` y `public/script.js`, que pertenecen a una implementación anterior. No son el flujo principal conectado en el servidor actual: ese flujo emplea `auth.html`, `cart.html` y los scripts de `public/js/`. Algunas páginas antiguas realizan llamadas a rutas como `/login` o `/products`, que no están montadas por `server.js`.

## API REST

Todas las rutas se montan bajo `/api`. Las respuestas son JSON. Las rutas protegidas esperan el encabezado:

```http
Authorization: Bearer <token>
```

### Productos

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `GET /api/productos` | Público | Devuelve productos ordenados por nombre e incluye el nombre de su categoría. |
| `GET /api/productos/:id` | Público | Devuelve un producto o `404` si no existe. |
| `POST /api/productos` | Admin | Registra un producto. Campos principales: `nombre`, `precio`, `stock`, `id_categoria`; también admite `descripcion` e `imagen_url`. |
| `PUT /api/productos/:id` | Admin | Actualiza los campos del producto. |
| `DELETE /api/productos/:id` | Admin | Elimina un producto si las restricciones de la base de datos lo permiten. |

Ejemplo de cuerpo para registrar un producto:

```json
{
  "nombre": "Costilla de res",
  "descripcion": "Corte para preparación a la parrilla",
  "precio": 25000,
  "stock": 12,
  "id_categoria": 1,
  "imagen_url": "https://ejemplo.com/costilla.jpg"
}
```

### Categorías

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `GET /api/categorias` | Público | Devuelve `id_categoria` y `nombre_categoria`, ordenados alfabéticamente. |

### Usuarios

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `POST /api/usuarios/register` | Público | Crea una cuenta. Recibe `nombre_usuario`, `email`, `contrasena` y, opcionalmente, `rol`. Si no se envía rol, usa `cliente`. |
| `POST /api/usuarios/login` | Público | Recibe `email` y `contrasena`; devuelve un JWT y los datos básicos del usuario si las credenciales son correctas. |

El token se firma con `JWT_SECRET` y expira en una hora. El formato de registro e inicio de sesión no incluye una ruta para recuperar o cambiar contraseñas.

### Pedidos

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `GET /api/pedidos` | Usuario autenticado | Devuelve los pedidos y sus productos. Para el rol `cliente`, filtra por el usuario del token; para `admin`, devuelve todos. |
| `POST /api/pedidos` | Cliente autenticado | Crea un pedido a partir de `items`, cada uno con `id_producto` y `cantidad`. Inicializa el estado como `Pendiente`. |
| `PUT /api/pedidos/:id` | Admin | Cambia el estado a `Pendiente`, `Confirmado`, `Enviado`, `Entregado` o `Cancelado`. |

Ejemplo de cuerpo para crear un pedido:

```json
{
  "items": [
    { "id_producto": 3, "cantidad": 2 },
    { "id_producto": 8, "cantidad": 1 }
  ]
}
```

El servidor calcula los precios desde `PRODUCTOS` en el momento de crear el pedido. Si un producto no existe o no tiene stock suficiente, responde con error y revierte la transacción. En una compra exitosa, responde con el identificador `id_pedido`.

## Autenticación y roles

- Los roles esperados por las rutas son `cliente` y `admin` (en minúsculas).
- El login genera un JWT con el identificador y rol del usuario.
- `authenticateToken` extrae el token del encabezado `Authorization` y coloca su contenido en `req.user`.
- `authorizeRole('cliente')` y `authorizeRole('admin')` bloquean acciones cuyo rol no coincide.
- El carrito no requiere cuenta para prepararse, pero sí para finalizar la compra.
- La visibilidad de enlaces en el navegador mejora la navegación, pero no reemplaza la protección de las rutas del servidor.

## Limitaciones conocidas

- **Alta de administradores:** el endpoint público de registro acepta el campo `rol`, y el formulario expone la opción Administrador. En el estado actual, un visitante puede solicitar ese rol al registrarse. No se debe publicar la aplicación con esta configuración; restringe la asignación de roles antes de cualquier despliegue.
- **Pagos:** Bancolombia, Nequi, PSE y DaviPlata se muestran en la página del carrito, pero no existe integración con pasarela, confirmación de pago ni conciliación. Crear un pedido no significa que haya sido pagado.
- **Buscador:** el formulario de `index.html` envía a `/buscar`, pero el servidor no declara esa ruta.
- **Historial de pedidos en la interfaz:** existe `GET /api/pedidos`, pero no hay una página actual enlazada desde el catálogo para consultar el historial del cliente. El enlace de "Mis Pedidos" está comentado en el HTML.
- **Administración parcial:** la pantalla `dashboard.html` registra productos; actualizar/eliminar productos y gestionar estados de pedidos solo están disponibles como endpoints, sin formularios administrativos completos.
- **Imagen en detalles de pedido:** existe una diferencia entre las columnas `imagen_url` y `url_imagen`; consulta [Configuración de MySQL](#configuración-de-mysql).
- **Validación de datos:** parte de las comprobaciones está en la interfaz, pero la API no valida exhaustivamente tipos, cantidades positivas, formatos de correo o límites de longitud.
- **Carrito en navegador:** no se sincroniza entre dispositivos ni con una cuenta; cerrar sesión elimina los datos guardados por los scripts actuales.
- **Pruebas automatizadas:** `package.json` solo define el comando `start`; no hay un comando de pruebas configurado en este repositorio.
- **Recursos externos:** Tailwind CSS y algunas imágenes/iconos se cargan desde Internet. Sin conexión, ciertas partes visuales pueden no estar disponibles.

## Pruebas y diagnóstico

El proyecto no trae suite automatizada. Después de iniciar el servidor, se pueden hacer comprobaciones manuales:

1. Abrir `http://localhost:3000/` y verificar que aparece la página principal.
2. Consultar `http://localhost:3000/api/categorias` y `http://localhost:3000/api/productos`. Si MySQL está listo, ambas rutas deben responder JSON.
3. Registrar un cliente desde `auth.html`, iniciar sesión y comprobar que el navegador recibe un token.
4. Agregar un producto al carrito y revisar que aparece al navegar a `cart.html`.
5. Iniciar sesión como cliente y enviar un pedido; confirmar en MySQL que se crearon `PEDIDOS` y `DETALLE_PEDIDO` y que se actualizó `PRODUCTOS.stock`.
6. Probar las operaciones de administración solo en un entorno local controlado y después de resolver la asignación insegura del rol admin.

Problemas frecuentes:

- **Error de conexión a MySQL:** revisar que el servicio esté activo, que `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` sean correctos y que el usuario tenga permisos sobre la base.
- **`Unknown database` o `table doesn't exist`:** crear la base y las tablas antes de consumir la API. Este repositorio no ejecuta migraciones automáticamente.
- **Error de JWT al iniciar sesión:** confirmar que `JWT_SECRET` existe en `.env` y que el servidor se reinició después de modificarlo.
- **Error 401:** falta el encabezado `Authorization` o no se envió el token.
- **Error 403:** el token es inválido/expirado o el rol no tiene permiso para esa operación.
- **No aparecen productos:** comprobar que haya categorías y productos asociados; el catálogo usa una unión interna con categorías.
- **La página carga pero las llamadas API fallan:** el servidor puede seguir activo aunque no haya podido conectarse a MySQL; revisar la consola donde se ejecutó `npm start`.

## Seguridad antes de publicar

Este repositorio requiere trabajo adicional antes de usarse en un entorno público o con pagos reales:

1. Eliminar el registro público de roles privilegiados y provisionar administradores de forma controlada.
2. Definir un `JWT_SECRET` fuerte y privado, y eliminar valores de respaldo inseguros. Mantenerlo fuera del control de versiones.
3. Revisar validaciones, límites y permisos en cada endpoint; no confiar en el rol guardado en `localStorage` como control de seguridad.
4. Usar HTTPS, restringir CORS al dominio autorizado y aplicar políticas adecuadas de manejo de secretos.
5. Integrar una pasarela de pagos y confirmar el pago mediante un flujo seguro del lado del servidor antes de marcar un pedido como pagado.
6. Agregar pruebas automatizadas y migraciones versionadas para el esquema de MySQL.
