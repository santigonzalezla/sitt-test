# SittTest API Documentation

Una API RESTful de autenticación construida con TypeScript, Express.js y MongoDB, desplegada en Vercel.

## 🔗 URL de Despliegue
**Base URL:** `https://sitt-test.vercel.app/`

## 🚀 Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Lenguaje:** TypeScript
- **Base de Datos:** MongoDB (MongoDB Atlas)
- **Autenticación:** JWT (Access + Refresh Tokens)
- **Despliegue:** Vercel
- **Validación:** Express Validator
- **Logging:** Winston
- **Seguridad:** Helmet, CORS, Rate Limiting

## 📁 Estructura del Proyecto

```
SittTest/
├── api/
│   └── index.ts              # Handler para Vercel (Serverless)
├── src/
│   ├── auth/
│   │   └── jwt.ts           # Generación y verificación de JWT
│   ├── config/
│   │   └── index.ts         # Configuración de variables de entorno
│   ├── controllers/
│   │   ├── authentication.ts # Controladores de autenticación
│   │   └── users.ts         # Controladores de usuarios
│   ├── database/
│   │   └── mongoose.ts      # Conexión a MongoDB
│   ├── middlewares/
│   │   ├── authenticate.ts   # Middleware de autenticación
│   │   └── errorHandler.ts  # Manejo de errores
│   ├── models/
│   │   ├── users.ts         # Modelo de usuario
│   │   └── token.ts         # Modelo de tokens
│   ├── router/
│   │   ├── index.ts         # Router principal
│   │   ├── authentication.ts # Rutas de autenticación
│   │   └── users.ts         # Rutas de usuarios
│   └── services/
│       └── user.ts          # Servicios de usuario
├── index.ts                 # Servidor local
├── package.json
├── tsconfig.json
└── vercel.json             # Configuración de Vercel
```

## 🔐 Sistema de Autenticación

El sistema utiliza **JWT con doble token**:

- **Access Token:** Token de corta duración (15 minutos) para autenticar requests
- **Refresh Token:** Token de larga duración (7 días) almacenado como cookie httpOnly

## 📝 API Endpoints

### 🔑 Autenticación

#### 1. Registro de Usuario
**POST** `/auth/register`

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mipassword123"
}
```

**Validaciones:**
- Email: válido, entre 6-64 caracteres, único
- Password: entre 2-128 caracteres

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "usuario@ejemplo.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Inicio de Sesión
**POST** `/auth/login`

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mipassword123"
}
```

**Validaciones:**
- Email: debe existir en la base de datos
- Password: debe coincidir con el hash almacenado

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "usuario@ejemplo.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Renovar Token
**POST** `/auth/refresh`

**Nota:** Requiere cookie `refreshToken` (se establece automáticamente)

**Respuesta exitosa (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Validar Token
**POST** `/auth/validate`

**Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "valid": true,
  "user": {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "usuario@ejemplo.com"
  },
  "tokenInfo": {
    "issuedAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-01-15T10:45:00.000Z"
  }
}
```

#### 5. Cerrar Sesión
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (204):** Sin contenido

### 👥 Usuarios

#### 6. Obtener Todos los Usuarios
**GET** `/users`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "65f8a1b2c3d4e5f6a7b8c9d0",
    "email": "usuario1@ejemplo.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "email": "usuario2@ejemplo.com",
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
]
```

#### 7. Obtener Usuario por ID
**GET** `/users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "email": "usuario@ejemplo.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 8. Actualizar Usuario
**PATCH** `/users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "email": "nuevoemail@ejemplo.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "email": "nuevoemail@ejemplo.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z"
}
```

#### 9. Eliminar Usuario
**DELETE** `/users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "id": "65f8a1b2c3d4e5f6a7b8c9d0",
  "email": "usuario@ejemplo.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Guía de Pruebas

### Con cURL

#### 1. Registrar un nuevo usuario
```bash
curl -X POST https://sitt-test.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 2. Iniciar sesión
```bash
curl -X POST https://sitt-test.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Obtener usuarios (requiere token)
```bash
curl -X GET https://sitt-test.vercel.app/users \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

#### 4. Renovar token
```bash
curl -X POST https://sitt-test.vercel.app/refresh \
  -b cookies.txt
```

#### 5. Cerrar sesión
```bash
curl -X POST https://sitt-test.vercel.app/auth/logout \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -b cookies.txt
```

### Con Postman

1. **Configuración inicial:**
    - Base URL: `https://sitt-test.vercel.app/`
    - En Settings → Enable "Automatically follow redirects"
    - En Settings → Enable "Send cookies with requests"

2. **Flujo recomendado de pruebas:**
    1. POST `/auth/register` → Guarda el `accessToken`
    2. GET `/users` → Usa el token en Authorization: Bearer
    3. POST `/auth/refresh` → Obtén nuevo token si expira
    4. POST `/auth/logout` → Cierra sesión

3. **Variables de entorno en Postman:**
   ```
   baseUrl: https://sitt-test.vercel.app/
   accessToken: {{token_obtenido_del_login}}
   ```

### Con Thunder Client (VS Code)

1. Crear una nueva collection "SittTest API"
2. Configurar variable de entorno:
   ```json
   {
     "baseUrl": "https://sitt-test.vercel.app/"
   }
   ```
3. Seguir el mismo flujo que con Postman

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos o faltantes |
| 401 | Unauthorized - Token inválido, expirado o faltante |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Email ya existe (registro) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

### Ejemplos de respuestas de error:

**400 - Validación fallida:**
```json
{
  "code": "ValidationError",
  "errors": {
    "email": {
      "msg": "Please provide a valid email address",
      "param": "email",
      "location": "body"
    }
  }
}
```

**401 - Token expirado:**
```json
{
  "code": "AuthenticationError",
  "message": "Token expired"
}
```

**404 - Usuario no encontrado:**
```json
{
  "code": "NotFound",
  "message": "User with email \"test@example.com\" not found."
}
```

## 🔒 Notas de Seguridad

- **Rate Limiting:** 100 requests por 15 minutos por IP
- **CORS:** Configurado para permitir credentials
- **Helmet:** Headers de seguridad habilitados
- **Cookies:** httpOnly, secure en producción, sameSite: strict
- **Passwords:** Hasheados con salt usando HMAC-SHA256
- **JWT Secrets:** Variables de entorno seguras

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Modo desarrollo
npm run dev

# Compilar
npm run build

# Producción local
npm start
```

## 📄 Variables de Entorno Requeridas

```env
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
JWT_ACCESS_SECRET=tu_secret_super_seguro
JWT_REFRESH_SECRET=otro_secret_diferente
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
```