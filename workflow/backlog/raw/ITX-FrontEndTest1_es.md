# Front-End Test

## Resumen

Esta prueba consiste en la creación de una mini-aplicación para comprar dispositivos móviles.

- La aplicación tendrá únicamente dos vistas:
  1. Vista principal - Listado de productos
  2. Detalles del producto
- La implementación de los diseños queda a libre elección, pero deberá seguir la estructura que se ha definido en las capturas. Se valorará positivamente el nivel de detalle de la propuesta.
- Se requiere la utilización de React/Preact para el desarrollo de aplicación y se podrá complementar con otras librerías JS si se estima oportuno.
- Se permite la utilización de JS con ES6 y preferiblemente que no se realice la prueba con TypeScript.
- Se podrá utilizar un boilerplate template para la creación de la estructura del proyecto.
- La aplicación será una SPA, donde se añadirá el enrutado de las vistas en el código de cliente, sin que sea una MPA o la utilización de SSR.
- El proyecto tendrá que contener los siguientes scripts:
  1. START - Modo desarrollo
  2. BUILD - Compilación para modo producción
  3. TEST - Lanzamiento de test
  4. LINT - Comprobación de código
- El proyecto deberá presentarse en un repositorio de código abierto (Github, Gitlab, Bitbucket), con la solución al problema.
- En el repositorio hay que incluir un documento README (preferiblemente en el primer commit), donde se incluirá la explicación para ejecutar el proyecto, así como notas explicativas o información adicional necesaria.

## Descripción de las vistas

### PLP - Product List Page

- Se mostrarán todos los elementos que devuelva la petición del API.
- Permitirá el filtrado del contenido en función del criterio de búsqueda introducido por el usuario.
- Al seleccionar un producto, deberá navegar a los detalles del mismo.
- Se mostrarán un máximo de cuatro elementos por fila y será adaptativo según la resolución.

[PDP.png](./PDP.png)

### PDP - Product Details Page

- La página se dividirá en dos columnas:
  - En la primera se mostrará el componente de la imagen del producto.
  - En la segunda se mostrarán los detalles y las acciones del producto.
- Deberá mostrar un enlace para navegar de vuelta a la lista de productos.

[PLP.png](./PLP.png)

## Descripción de los componentes

### Cabecera (HEADER)

- El título o icono de la aplicación actuará como enlace a la vista principal.
- Se mostrará un breadcrumbs con la página actual y enlaces de navegación.
- En la parte derecha de la cabecera se mostrará el número de ítems añadidos al carrito.

### Barra de búsqueda (SEARCH)

- Se mostrará un input para introducir una cadena de texto.
- El usuario podrá filtrar productos comparando contra la marca y el modelo.
- El filtrado será en tiempo real.

### Elemento de lista (ITEM)

Información a mostrar:

- Imagen
- Marca
- Modelo
- Precio

### Imagen de producto (IMAGE)

- Se visualizará la imagen del producto.

### Descripción de producto (DESCRIPTION)

Se mostrarán al menos los siguientes atributos:

- Marca
- Modelo
- Precio
- CPU
- RAM
- Sistema Operativo
- Resolución de pantalla
- Batería
- Cámaras
- Dimensiones
- Peso

### Acciones de producto (ACTIONS)

- Se mostrarán dos selectores:
  - Almacenamiento
  - Colores
- Aunque solo exista una opción, se mostrará el selector y quedará seleccionado por defecto.
- Se mostrará un botón de Añadir para agregar el producto a la cesta.
- La petición de añadido deberá enviar:

```json
{
  "id": 1,
  "colorCode": 1,
  "storageCode": 2
}
```

- La respuesta devolverá el número de productos en la cesta.
- Este valor deberá persistirse y mostrarse en la cabecera de cualquier vista.

## Recursos

### Integración API

Dominio base:

`https://itx-frontend-test.onrender.com/`

#### Obtener listado de productos

**Path**

```http
GET /api/product
```

**Response**

```json
[
  {
    "id": 0001
  },
  {
    "id": 0002
  }
]
```

#### Obtener detalle de producto

**Path**

```http
GET /api/product/:id
```

**Response**

```json
{
  "id": 0001
}
```

#### Añadir producto a la cesta

**Path**

```http
POST /api/cart
```

**Body**

```json
{
  "id": 0001,
  "colorCode": 1,
  "storageCode": 2
}
```

**Response**

```json
{
  "count": 1
}
```

### Persistencia de datos

- Se almacenará la información cada vez que se solicite al API.
- La información tendrá una expiración de 1 hora.
- Una vez vencida, deberá revalidarse.
- Se podrá utilizar cualquier método de almacenamiento en cliente (navegador o memoria).
