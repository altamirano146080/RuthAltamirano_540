# Twitch Analytics

Este proyecto corresponde al reto técnico para una posición en 540. El objetivo es construir una pequeña API que interactúe con Twitch para recuperar información sobre usuarios y streams en directo.

---

## 🧾 Especificaciones

### 🎯 Objetivo del reto
Se deben implementar dos endpoints que interactúen con la API pública de Twitch:

1. **Consultar información de un usuario de Twitch por su ID**
2. **Consultar los streams que están en directo actualmente**

Además, la API debe:
- Gestionar correctamente la autenticación vía OAuth
- Manejar errores esperables
- Devolver respuestas con estructura fija

---

### 📡 Endpoints a implementar

#### **1. GET /analytics/user?id={id}**

Permite obtener información de un streamer usando su ID.

**Flujo esperado:**
1. Validar parámetro `id` — si está ausente o es inválido → `400`
2. Verificar token OAuth — si es inválido o expirado → `401`
3. Consultar API de Twitch
    - Si el usuario no existe → `404`
4. Si todo funciona → devolver datos del usuario → `200`

**Respuestas esperadas:**
- `200 OK`: retorna datos del usuario con los campos exactamente definidos
- `400 Bad Request`: `{"error": "Invalid or missing 'id' parameter."}`
- `401 Unauthorized`: `{"error": "Unauthorized. Twitch access token is invalid or has expired."}`
- `404 Not Found`: `{"error": "User not found."}`
- `500 Internal Server Error`: `{"error": "Internal server error."}`

---

#### **2. GET /analytics/streams**

Permite obtener una lista de streams que están en vivo en Twitch.

**Flujo esperado:**
1. Verificar token OAuth — si es inválido o expirado → `401`
2. Consultar API de Twitch
3. Si todo funciona → devolver lista de streams → `200`

**Respuestas esperadas:**
- `200 OK`: retorna una lista con campos `{ title, user_name }`
- `401 Unauthorized`: `{"error": "Unauthorized. Twitch access token is invalid or has expired."}`
- `500 Internal Server Error`: `{"error": "Internal server error."}`

---

### 🔐 Autenticación con Twitch

Para obtener el token OAuth se proporciona una aplicación ya registrada:

- **Client ID:** `dlkwq9i2okmcofq0420dba20reo4uw`
- **Client Secret:** `8c0ky0ee4nj92xj8fvk1bq0l8v46lp`

El token debe ser válido para realizar peticiones a la API de Twitch.

---

### 🧩 Priorización funcional (según negocio)

En caso de limitar tiempo, el desarrollo debe priorizarse en este orden:

1. **Happy paths funcionando correctamente** (`200`)
2. **Gestión de tokens** (`401`)
3. **Casos límite** como usuario no encontrado (`404`)
4. **Validaciones y errores generales** (`400` y `500`)

---

### ⏱ Tiempo estimado

La prueba no debería superar **8 horas**. Si algo queda fuera, debe explicarse.

---

### 📝 Entregables

- Código en un repositorio público o privado compartido
- README con:
    - Instrucciones de ejecución
    - Decisiones técnicas y trade-offs
    - Dudas o hipótesis
    - Explicación del enfoque (como en un PR real)

---

### 👩‍💻 Proceso del reto

El reto tiene dos fases:
1. Desarrollo individual
2. Revisión conjunta con parte del equipo técnico de 540

En la revisión se discutirá la implementación y las decisiones tomadas.

---
