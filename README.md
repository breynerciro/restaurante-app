# Sistema de Administración y Reservas de Restaurantes

Este proyecto consiste en un sistema completo para la administración y reservas de restaurantes, compuesto por:

## Estructura del Proyecto

```
restaurante-app/
├── backend/                 # API REST en Flask
│   ├── app/
│   ├── requirements.txt
│   └── run.py
├── frontend/               # App móvil en React Native
│   ├── src/
│   ├── package.json
│   └── App.js
└── README.md
```

## Backend (Flask)

### Características:
- API REST para gestión de restaurantes (CRUD)
- API REST para gestión de reservas
- Validaciones de negocio:
  - Máximo 15 mesas por restaurante
  - Máximo 15 reservas por día por restaurante
  - Máximo 20 reservas totales por día

### Instalación y ejecución:
```bash
cd backend
pip install -r requirements.txt
python run.py
```

## Frontend (React Native con Expo)

### Características:
- App móvil para administración de restaurantes
- App móvil para gestión de reservas
- Interfaz intuitiva y moderna con React Native Paper
- Filtros por letra inicial y ciudad
- Navegación con bottom tabs

### Instalación y ejecución:
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start

# Para Android:
npx expo start --android

# Para iOS:
npx expo start --ios

# Para web:
npx expo start --web
```

## Endpoints de la API

### Restaurantes:
- `GET /api/restaurantes` - Listar todos los restaurantes
- `GET /api/restaurantes/<id>` - Obtener restaurante por ID
- `POST /api/restaurantes` - Crear restaurante
- `PUT /api/restaurantes/<id>` - Actualizar restaurante
- `DELETE /api/restaurantes/<id>` - Eliminar restaurante
- `GET /api/restaurantes/filtrar?letra=X&ciudad=Y` - Filtrar restaurantes

### Reservas:
- `GET /api/reservas` - Listar todas las reservas
- `POST /api/reservas` - Crear reserva
- `DELETE /api/reservas/<id>` - Cancelar reserva
- `GET /api/reservas/restaurante/<id>` - Reservas por restaurante

## Funcionalidades del Sistema

### Administración de Restaurantes:
- ✅ Crear restaurantes con nombre, descripción, dirección, ciudad y URL de foto
- ✅ Listar todos los restaurantes
- ✅ Editar información de restaurantes
- ✅ Eliminar restaurantes
- ✅ Filtrar por letra inicial del nombre
- ✅ Filtrar por ciudad

### Gestión de Reservas:
- ✅ Crear reservas para restaurantes específicos
- ✅ Validación de límites (15 por restaurante, 20 total por día)
- ✅ Listar todas las reservas
- ✅ Cancelar reservas
- ✅ Validación de fechas (no fechas pasadas)

## Validaciones de Negocio

El sistema implementa las siguientes validaciones:

1. **Límite de mesas por restaurante**: Máximo 15 reservas por día por restaurante
2. **Límite total de reservas**: Máximo 20 reservas totales por día
3. **Fechas válidas**: No se permiten reservas para fechas pasadas
4. **Campos requeridos**: Validación de todos los campos obligatorios

## Tecnologías Utilizadas

### Backend:
- **Flask**: Framework web para Python
- **SQLAlchemy**: ORM para base de datos
- **SQLite**: Base de datos ligera
- **Flask-CORS**: Soporte para CORS

### Frontend:
- **React Native**: Framework para apps móviles
- **Expo**: Plataforma de desarrollo para React Native
- **React Navigation**: Navegación entre pantallas
- **React Native Paper**: Componentes de Material Design
- **Axios**: Cliente HTTP para llamadas a la API

## Estructura de la Base de Datos

### Tabla: restaurantes
- `id` (Primary Key)
- `nombre` (String)
- `descripcion` (Text)
- `direccion` (String)
- `ciudad` (String)
- `url_foto` (String)
- `fecha_creacion` (DateTime)

### Tabla: reservas
- `id` (Primary Key)
- `restaurante_id` (Foreign Key)
- `nombre_cliente` (String)
- `email_cliente` (String)
- `telefono_cliente` (String)
- `fecha` (Date)
- `hora` (String)
- `numero_personas` (Integer)
- `fecha_creacion` (DateTime)

## Solución de Problemas

### Backend:
- **Error de puerto ocupado**: Cambiar el puerto en `run.py`
- **Error de base de datos**: Verificar que SQLite esté habilitado
- **Error de CORS**: Verificar que Flask-CORS esté instalado

### Frontend:
- **Error de conexión a la API**: Verificar la URL en `api.js`
- **Error de Expo**: Ejecutar `npx expo start --clear`
- **Error de dependencias**: Eliminar `node_modules` y ejecutar `npm install` 