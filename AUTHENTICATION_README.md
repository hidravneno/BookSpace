# Sistema de Autenticación BookSpace

Este proyecto implementa un sistema completo de registro y login para la aplicación BookSpace usando Ionic y Angular.

## 🚀 Funcionalidades Implementadas

### ✅ Registro de Usuario
- Validación de formulario en tiempo real
- Validación de contraseña con requisitos específicos:
  - Mínimo 8 caracteres
  - Al menos una letra mayúscula
  - Al menos una letra minúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*)
- Verificación de que las contraseñas coinciden
- Validación de email
- Verificación de email único
- Indicadores visuales para todos los requisitos
- Mensaje de éxito y redirección al login

### ✅ Inicio de Sesión
- Validación de formulario
- Verificación de credenciales
- Mensaje de bienvenida personalizado
- Redirección a la página principal
- Manejo de errores de autenticación

### ✅ Gestión de Sesión
- Servicio de autenticación centralizado
- Almacenamiento de sesión en localStorage
- Guard de autenticación para proteger rutas
- Estado reactivo del usuario actual
- Función de logout

### ✅ Interfaz de Usuario
- Diseño responsivo y moderno
- Iconos de visibilidad para contraseñas
- Validación visual en tiempo real
- Notificaciones toast para feedback
- Indicadores de carga
- Navegación fluida entre páginas

## 🛠️ Arquitectura Técnica

### Servicios Creados

1. **AuthService** (`src/app/services/auth.service.ts`)
   - Manejo de registro y login
   - Almacenamiento de usuarios en localStorage
   - Estado reactivo con RxJS
   - Validación de credenciales

2. **ToastService** (`src/app/services/toast.service.ts`)
   - Notificaciones de éxito, error y advertencia
   - Configuración consistente de toasts

### Guards

1. **AuthGuard** (`src/app/guards/auth.guard.ts`)
   - Protege rutas que requieren autenticación
   - Redirige a login si no está autenticado

### Páginas Actualizadas

1. **RegisterPage**
   - Formulario completo de registro
   - Validaciones en tiempo real
   - Integración con AuthService

2. **LoginPage**
   - Formulario de inicio de sesión
   - Verificación de credenciales
   - Redirección automática si ya está autenticado

3. **HomePage**
   - Página protegida que requiere autenticación
   - Muestra información del usuario
   - Botón de logout en el header

## 🔧 Cómo Usar

### 1. Registro de Usuario
1. Abre la aplicación (se redirige automáticamente a `/login`)
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Completa el formulario:
   - Nombre completo
   - Email válido
   - Contraseña que cumpla todos los requisitos
   - Confirmar contraseña
4. Haz clic en "Registrarse"
5. Se mostrará un mensaje de éxito y serás redirigido al login

### 2. Inicio de Sesión
1. En la página de login, ingresa:
   - Email registrado
   - Contraseña correcta
2. Haz clic en "Iniciar Sesión"
3. Serás redirigido a la página principal con un mensaje de bienvenida

### 3. Página Principal
- Verás un saludo personalizado con tu nombre
- Podrás ver tu email registrado
- Tendrás acceso a las futuras funcionalidades de la app
- Botón de logout en el header superior derecho

### 4. Cerrar Sesión
1. Haz clic en el botón de logout (icono de salida) en el header
2. Serás redirigido automáticamente al login
3. La sesión se eliminará del dispositivo

## 📱 Funcionalidades de la Interfaz

### Validación Visual
- ✅ Iconos verdes para validaciones exitosas
- ❌ Iconos rojos para validaciones fallidas
- 👁️ Botones para mostrar/ocultar contraseñas
- 🔄 Indicadores de carga durante las operaciones

### Notificaciones
- Toast de éxito (verde) para operaciones exitosas
- Toast de error (rojo) para errores
- Mensajes descriptivos para cada situación

### Responsividad
- Diseño optimizado para móviles
- Interfaz adaptable a diferentes tamaños de pantalla
- Componentes Ionic nativos para mejor experiencia

## 🔐 Seguridad

### Validaciones Implementadas
- Verificación de formato de email
- Requisitos estrictos de contraseña
- Verificación de coincidencia de contraseñas
- Protección de rutas con guards
- Validación tanto en frontend como en el servicio

### Almacenamiento
- Los usuarios se almacenan en localStorage (desarrollo)
- Las contraseñas se almacenan en texto plano (solo para desarrollo)
- En producción se debería implementar hashing de contraseñas
- Tokens JWT para manejo de sesiones más seguro

## 🚧 Mejoras Futuras

1. **Seguridad**
   - Implementar hashing de contraseñas
   - Usar JWT tokens
   - Implementar refresh tokens
   - Añadir HTTPS

2. **Backend**
   - Conectar con API real
   - Base de datos para usuarios
   - Validación del lado del servidor

3. **Funcionalidades**
   - Recuperación de contraseña
   - Verificación de email
   - Autenticación con redes sociales
   - Perfiles de usuario más completos

4. **UX/UI**
   - Animaciones mejoradas
   - Modo oscuro
   - Personalización de temas
   - Mejor accesibilidad

## 🏃‍♂️ Ejecutar la Aplicación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ionic serve

# Construir para producción
ionic build

# Ejecutar en dispositivo iOS
ionic capacitor run ios

# Ejecutar en dispositivo Android
ionic capacitor run android
```

## 📝 Notas Técnicas

- La aplicación usa Angular 17+ con componentes standalone
- Ionic 7+ para la interfaz de usuario
- RxJS para manejo de estado reactivo
- TypeScript para type safety
- SCSS para estilos personalizados

El sistema está completamente funcional y listo para usar. Los usuarios pueden registrarse, iniciar sesión y navegar por la aplicación de forma segura.
