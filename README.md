# Twitch Analytics API

API REST para consultar información de usuarios y streams en vivo de Twitch. Proyecto desarrollado como reto técnico para 540.

## 📋 Tabla de contenidos

- [Descripción](#-descripción)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Endpoints](#-endpoints)
- [Decisiones técnicas](#-decisiones-técnicas)
- [Trade-offs y consideraciones](#-trade-offs-y-consideraciones)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Posibles mejoras](#-posibles-mejoras)

## 🎯 Descripción

Este proyecto implementa una API que interactúa con la API pública de Twitch para:
- Consultar información de usuarios por ID
- Listar streams en directo actualmente

La API gestiona automáticamente la autenticación OAuth con Twitch y maneja errores según las especificaciones del reto.

## 📦 Requisitos previos

- **Node.js** v18 o superior
- **npm** o **yarn**
- Credenciales de aplicación de Twitch (Client ID y Client Secret)

## 🚀 Instalación y ejecución

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

## 📡 Endpoints

### 1. GET `/analytics/user?id={id}`

Obtiene información de un usuario de Twitch por su ID.

**Parámetros:**
- `id` (query, requerido): ID del usuario de Twitch

**Respuestas:**

- **200 OK**: Información del usuario
```json
{
  "id": "44322889",
  "login": "dallas",
  "display_name": "dallas",
  "type": "staff",
  "broadcaster_type": "",
  "description": "Just a gamer playing games...",
  "profile_image_url": "https://...",
  "offline_image_url": "https://...",
  "view_count": 191836881,
  "created_at": "2013-06-03T19:12:02Z"
}
```

- **400 Bad Request**: ID ausente o inválido
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
  {
    "title": "Playing Overwatch 2",
    "user_name": "xQc"
  },
  {
    "title": "World of Warcraft - Mythic+",
    "user_name": "Asmongold"
  }
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

## 🛠 Decisiones técnicas

### Arquitectura

**Patrón MVC adaptado:**
- **Routes**: Define los endpoints y vincula con controladores
- **Controllers**: Gestiona la lógica de negocio y validaciones
- **Services**: Encapsula la comunicación con APIs externas (Twitch)
- **Middlewares**: (Preparado para autenticación/logging futuro)

**Justificación:** Separación de responsabilidades facilita el mantenimiento, testing y escalabilidad.

### Gestión de tokens OAuth

**Caché en memoria del token:**
- El token se obtiene una vez y se reutiliza mientras sea válido
- Se almacena la fecha de expiración para renovación automática
- No requiere base de datos ni almacenamiento externo

**Justificación:** Para el alcance del reto, esta solución es simple y efectiva. Evita llamadas innecesarias al endpoint OAuth de Twitch.

### Manejo de errores

**Estrategia centralizada:**
- Cada controlador captura errores específicos (401, 404)
- Los errores inesperados caen en el catch general (500)
- Mensajes de error exactos según especificación

**Justificación:** Proporciona respuestas consistentes y predecibles al cliente.

### Validaciones

**Validación del parámetro ID:**
- Se valida presencia del parámetro antes de hacer request a Twitch
- Respuesta 400 inmediata si falta

**Justificación:** Reduce llamadas innecesarias a la API y mejora experiencia del usuario.

## ⚖️ Trade-offs y consideraciones

### 1. **Token en memoria vs Base de datos**

**Decisión:** Token en memoria  
**Pros:** Simple, rápido, sin dependencias adicionales  
**Contras:** Se pierde al reiniciar el servidor (no es problema crítico, se regenera automáticamente)  
**Alternativa considerada:** Redis/DB para persistencia - Descartado por complejidad innecesaria para el alcance del reto

### 2. **Sin middleware de autenticación propio**

**Decisión:** No implementar autenticación para consumir la API  
**Justificación:** Las especificaciones no lo requieren. La autenticación OAuth es únicamente para Twitch.  
**Nota:** El archivo `auth.middleware.js` queda preparado para implementarlo si fuera necesario en el futuro.

### 3. **Sin tests automatizados**

**Decisión:** Priorizar funcionalidad completa sobre tests  
**Justificación:** Según las especificaciones, los happy paths y manejo de errores son prioritarios. Los tests quedarían como mejora futura.  
**Testing realizado:** Manual con Postman/curl

### 4. **Transformación de respuesta en `/streams`**

**Decisión:** Mapear solo los campos `title` y `user_name`  
**Justificación:** Las especificaciones indican devolver únicamente estos campos, reduciendo payload innecesario.

### 5. **Sin paginación en `/streams`**

**Decisión:** Devolver el resultado directo de Twitch (por defecto 20 streams)  
**Justificación:** No especificado en el reto. La API de Twitch ya limita la respuesta.  
**Mejora futura:** Implementar parámetros `limit` y `cursor` para paginación.

## 📁 Estructura del proyecto

```
RuthAltamirano_540/
├── src/
│   ├── app.js                      # Configuración de Express
│   ├── controllers/
│   │   └── analytics.controller.js # Lógica de endpoints
│   ├── routes/
│   │   └── analytics.routes.js     # Definición de rutas
│   ├── services/
│   │   └── twitch.service.js       # Comunicación con Twitch API
│   ├── middlewares/
│   │   ├── auth.middleware.js      # (Preparado para futuro)
│   │   └── error.middleware.js     # (Preparado para futuro)
│   └── tests/
│       └── analytics.test.js       # (Preparado para futuro)
├── server.js                       # Punto de entrada
├── .env                            # Variables de entorno (no versionado)
├── .gitignore
├── package.json
└── README.md
```

## 🔮 Posibles mejoras

### A corto plazo
- [ ] Tests unitarios con Jest/Mocha
- [ ] Tests de integración para endpoints
- [ ] Validación más robusta de IDs (formato numérico)
- [ ] Logging estructurado con Winston/Morgan
- [ ] Rate limiting para proteger la API

### A mediano plazo
- [ ] Paginación en `/streams`
- [ ] Filtros adicionales (por juego, idioma)
- [ ] Caché de respuestas con TTL
- [ ] Documentación con Swagger/OpenAPI
- [ ] Healthcheck endpoint

### A largo plazo
- [ ] Autenticación de usuarios de la API
- [ ] Métricas y monitoreo (Prometheus)
- [ ] Despliegue en contenedores (Docker)
- [ ] CI/CD con GitHub Actions

## 🤔 Dudas e hipótesis

### Hipótesis asumidas:

1. **Formato de ID:** Asumí que el ID de usuario es cualquier string. Twitch usa IDs numéricos, pero no se especificó validación de formato.

2. **Campos del usuario:** Devolví todos los campos que retorna Twitch. Las especificaciones mencionan "campos exactamente definidos" pero no los lista. En un entorno real, consultaría con el equipo qué campos específicos se necesitan.

3. **Límite de streams:** El endpoint `/streams` retorna 20 streams por defecto (límite de Twitch). No se especificó si se requiere paginación o un límite diferente.

4. **Manejo de token expirado:** Implementé renovación automática antes de cada request. Otra opción sería renovar solo cuando falle un request (retry pattern).

### Preguntas para el equipo:

- ¿Se requiere autenticación para consumir esta API?
- ¿Hay límites de rate limiting que debamos implementar?
- ¿Los campos del usuario deben ser todos o solo algunos específicos?
- ¿Se necesita soporte para paginación en streams?
- ¿Qué estrategia de caché prefieren para producción?

## 👤 Autor

**Ruth Altamirano**  
Reto técnico para 540 - Enero 2026

---

## 📝 Notas finales

Este proyecto fue desarrollado siguiendo las prioridades funcionales especificadas:

1. ✅ Happy paths funcionando (200)
2. ✅ Gestión de tokens (401)
3. ✅ Casos límite (404)
4. ✅ Validaciones y errores (400, 500)

**Tiempo de desarrollo:** ~6 horas

La implementación está lista para revisión y discusión técnica. Estoy abierta a feedback y mejoras sugeridas por el equipo.