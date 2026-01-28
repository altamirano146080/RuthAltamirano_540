# Twitch Analytics API

API REST para consultar información de usuarios y streams en vivo de Twitch. Proyecto desarrollado como reto técnico para 540.

## Tabla de contenidos

- [Descripción](#descripción)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Endpoints](#endpoints)
- [Decisiones técnicas](#decisiones-técnicas)
- [Trade-offs y consideraciones](#trade-offs-y-consideraciones)
- [Posibles mejoras](#posibles-mejoras)
- [Notas finales](#notas-finales)

## Descripción

Este proyecto implementa una API que interactúa con la API pública de Twitch para:
- Consultar información de usuarios por ID
- Listar streams en directo actualmente

La API gestiona automáticamente la autenticación OAuth con Twitch, maneja errores según las especificaciones y soporta paginación y límites de rate limit.

## Requisitos previos

- **Node.js** v18 o superior
- **npm**
- Credenciales de aplicación de Twitch (Client ID y Client Secret)

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/altamirano146080/RuthAltamirano_540.git
cd RuthAltamirano_540
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
CLIENT_ID=dlkwq9i2okmcofq0420dba20reo4uw
CLIENT_SECRET=8c0ky0ee4nj92xj8fvk1bq0l8v46lp
PORT=3000
```

### 4. Ejecutar el servidor

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

### 5. Modo desarrollo (opcional)

Para desarrollo con hot-reload:

```bash
npm run dev
```

## Endpoints

### 1. GET `/analytics/user?id={id}`

Obtiene información de un usuario de Twitch por su ID.

**Parámetros:**
- `id` (query, requerido): ID del usuario de Twitch (Twitch trata los IDs como opacos, cualquier string es válido).

**Respuestas:**

- **200 OK**: Información del usuario

- **400 Bad Request**: ID ausente
```json
{
  "error": "Invalid or missing 'id' parameter."
}
```

- **401 Unauthorized**: Token de Twitch inválido o expirado
```json
{
  "error": "Unauthorized. Twitch access token is invalid or has expired."
}
```

- **404 Not Found**: Usuario no encontrado
```json
{
  "error": "User not found."
}
```

- **500 Internal Server Error**: Error del servidor
```json
{
  "error": "Internal server error."
}
```

**Ejemplo de uso:**
```bash
curl http://localhost:3000/analytics/user?id=44322889
```

### 2. GET `/analytics/streams`

Obtiene una lista de streams en vivo actualmente en Twitch.

**Respuestas:**

- **200 OK**: Lista de streams en vivo
```json
[
  { "title": "Playing Overwatch 2", "user_name": "xQc" },
  { "title": "World of Warcraft - Mythic+", "user_name": "Asmongold" }
]
```

- **401 Unauthorized**: Token de Twitch inválido o expirado
```json
{
  "error": "Unauthorized. Twitch access token is invalid or has expired."
}
```

- **500 Internal Server Error**: Error del servidor
```json
{
  "error": "Internal server error."
}
```

**Ejemplo de uso:**
```bash
curl http://localhost:3000/analytics/streams
```

## Decisiones técnicas

### Arquitectura

**Patrón MVC adaptado:**
- **Routes**: Define los endpoints y vincula con controladores
- **Controllers**: Gestiona la lógica de negocio y validaciones
- **Services**: Encapsula la comunicación con APIs externas (Twitch)

**Justificación:** Separación de responsabilidades facilita el mantenimiento, testing y escalabilidad.

### Gestión de tokens OAuth

**Caché en memoria del token:**
- El token se obtiene una vez y se reutiliza mientras sea válido
- Se almacena la fecha de expiración para renovación automática
- No requiere base de datos ni almacenamiento externo

**Justificación:** Solución simple y efectiva, evita llamadas innecesarias al endpoint OAuth de Twitch.

### Validaciones

**Endpoint `/analytics/user`:**
- Valida presencia del parámetro `id` (cualquier string válido, Twitch trata IDs como opacos)
- Respuesta 400 inmediata si falta

**Justificación:** Reduce llamadas innecesarias y mejora experiencia del usuario.

### Manejo de errores

- Cada controlador captura errores específicos (401, 404)
- Los errores inesperados caen en el catch general (500)
- Mensajes de error exactos según especificación

**Justificación:** Respuestas consistentes y predecibles al cliente.

### Validación de parámetros

**Decisión:** No validar exhaustivamente `first` ni `after`

**Justificación:** Twitch API valida internamente estos parámetros:
- `first`: Twitch limita automáticamente valores fuera de rango (1-100)
- `after`: Twitch valida el cursor y devuelve datos vacíos si es inválido
- El servidor delega estas validaciones a Twitch para evitar lógica redundante

**Resultado:** Código más limpio, confía en validaciones upstream de Twitch.

### Rate Limits

**Cómo funciona Twitch:**
- Token-bucket algorithm: cada request consume puntos
- Si se excede límite → HTTP 429
- Headers útiles: `Ratelimit-Limit`, `Ratelimit-Remaining`, `Ratelimit-Reset`

**Nuestra implementación:**
- Propagamos el error 429 al cliente
- El cliente implementa retry con backoff
- No implementamos rate limiting interno (out of scope)
- Los errores inesperados caen en el catch general (500)
- Mensajes de error exactos según especificación

## Trade-offs y consideraciones

### Token en memoria vs Base de datos

- **Token en memoria**: simple y rápido, se pierde al reiniciar el servidor
- Persistencia en DB descartada por complejidad innecesaria

### Sin middleware de autenticación propio

- La API no requiere autenticación para consumirla, solo OAuth hacia Twitch

### Transformación de respuesta en `/streams`

- Solo se devuelven `title` y `user_name` según especificación
- Se devuelve un array simple, no un objeto wrapper

### Rate Limits delegados al cliente

- Se devuelve 429 con `retry_after`, sin retry automático

## Posibles mejoras

- [ ] Validar que `first` sea un número positivo
- [ ] Añadir validación de formato para cursor `after`
- [ ] Implementar rate limiting interno para proteger la API
- [ ] Permitir configuración de límites mediante variables de entorno
- [ ] Implementar retry automático con backoff para errores 429 (actualmente se delega al cliente)
- [ ] Mejorar documentación de paginación y parámetros para mayor claridad

## Nota sobre el archivo .env

El archivo `.env` está incluido en el repositorio únicamente para facilitar la evaluación del reto técnico, 
ya que las credenciales proporcionadas son públicas y de prueba. 
