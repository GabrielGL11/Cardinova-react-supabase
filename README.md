# Sistema de Agendamiento Médico - Cardinova

Aplicación web desarrollada para la gestión y el agendamiento de citas médicas. El sistema permite filtrar médicos por especialidad, gestionar el estado de las citas y registrar nuevos pacientes mediante una interfaz sencilla e intuitiva. Los datos se almacenan en **Supabase**.

**Versión publicada:** https://dfez6xsgo6ub2.cloudfront.net

---

## 🚀 Tecnologías utilizadas

* **React**: Biblioteca principal para la construcción de la interfaz de usuario.
* **TypeScript**: Proporciona tipado estático para mejorar la seguridad y mantenibilidad del código.
* **Vite**: Herramienta de desarrollo rápida para proyectos React.
* **React Router**: Permite la navegación entre las diferentes vistas de la aplicación.
* **Supabase**: Base de datos (PostgreSQL) y API de la aplicación.
* **Docker + nginx**: Empaquetado de la aplicación en una imagen.
* **AWS (S3 + CloudFront)** y **GitHub Actions**: Publicación y despliegue automático.

---

## 📂 Estructura del proyecto

El proyecto está organizado para mantener una separación clara entre la lógica de negocio, los datos y la interfaz.

```text
src/
│── assets/        # Imágenes de la aplicación
│── components/    # Componentes reutilizables (formulario de cita, tablas, etc.)
│── context/       # Estado global: sesión (AuthContext) y citas (CitasContext)
│── layout/        # Estructura y páginas: Navbar, Footer, Home, Login, Registro
│── lib/           # Conexión con Supabase, interfaces, tipos y funciones auxiliares
│── styles/        # Archivos CSS organizados por componente
```

### Descripción de las carpetas

* **`src/components/`**
  Componentes principales de la aplicación, como `FormularioCita`, `MisRegistros`, `TablaCitas` y `DetalleCita`. Todos están desarrollados con **React + TypeScript** (`.tsx`).

* **`src/context/`**
  Contextos de React que comparten el estado de la sesión del usuario y de las citas entre las pantallas.

* **`src/layout/`**
  Estructura general y páginas de la aplicación: navegación, pie de página, inicio, inicio de sesión y registro de pacientes.

* **`src/lib/`**
  Cliente de Supabase, interfaces, tipos de datos y funciones auxiliares.

* **`src/styles/`**
  Hojas de estilo CSS organizadas por componente.

---

## ✨ Características implementadas

* 📅 **Agendamiento de citas en tres pasos**: especialidad, médico y horario antes de confirmar la cita.
* 🔍 **Filtro por especialidad médica** en la sección **Mis Registros**.
* 🏥 **Información completa del médico**, incluyendo ciudad y hospital.
* 👥 **Roles de paciente y médico**, cada uno con sus propias pantallas.
* 🔄 **Actualización del estado de las citas** con datos guardados en Supabase.
* 🔐 **Contraseñas almacenadas con hash** (pgcrypto) en la base de datos.
* 🚧 **Secciones en construcción** con mensaje "Próximamente".
* 📄 **Código documentado**, con comentarios para facilitar el mantenimiento.

---

## ⚙️ Instalación y ejecución

### 1. Instalar las dependencias

```bash
npm install
```

### 2. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con los datos de tu proyecto de Supabase:

```text
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_KEY=tu_clave_publishable
```

> Usa únicamente la clave pública (*anon* o *publishable*). Nunca pongas una clave `service_role` o `sb_secret_` en el frontend. El archivo `.env` está en `.gitignore` y no se debe subir al repositorio.

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 4. Abrir la aplicación

Abre el navegador en la dirección que muestra la consola, normalmente:

```text
http://localhost:5173
```

> **Nota:** El puerto puede variar si el predeterminado ya está en uso.

---

## 🐳 Docker

La aplicación se empaqueta en una imagen con nginx (puerto 8080). Las variables de Supabase se incrustan al compilar, por eso se pasan como `--build-arg`.

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co \
  --build-arg VITE_SUPABASE_KEY=tu_clave_publishable \
  -t cardinova .

docker run --rm -p 8080:8080 --name cardinova-test cardinova
```

Abrir: http://localhost:8080

> No subas el archivo `.env` al repositorio. Ya está en `.gitignore` y `.dockerignore`.

La imagen se probó en local y se publicó en Amazon ECR (región us-east-2) como evidencia de la contenerización.

---

## ☁️ Despliegue

Rama de trabajo: `devops-nube-practica`.

La aplicación se publica como sitio estático en **AWS**: los archivos compilados se guardan en un bucket privado de **Amazon S3** y **Amazon CloudFront** los entrega por HTTPS. Se eligió esta opción porque ECS Express Mode, que ejecutaría el contenedor, necesita un balanceador de carga que la política de la organización de la cuenta bloquea.

### Despliegue automático (GitHub Actions)

Cada `git push` a la rama `devops-nube-practica` ejecuta el flujo `.github/workflows/deploy-s3.yml`, que:

1. Instala las dependencias y compila la aplicación con las variables de Supabase.
2. Sincroniza la carpeta `dist` con el bucket de S3.
3. Invalida la caché de CloudFront para publicar la nueva versión.

Secretos necesarios en el repositorio (*Settings → Secrets and variables → Actions*):

| Secreto | Contenido |
|---|---|
| `AWS_ACCESS_KEY_ID` | Clave de acceso del usuario de IAM para el despliegue |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta de ese usuario |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_KEY` | Clave pública de Supabase |

### Rollback

Para volver a una versión anterior, se crea un commit que deshace el cambio y se sube; el mismo flujo vuelve a publicar la versión previa:

```bash
git revert HEAD --no-edit
git push
```

> El rollback solo afecta al frontend. Los cambios en la base de datos de Supabase no se revierten con Git.

### Evitar costos

Al terminar las pruebas se deben eliminar los recursos creados (distribución de CloudFront, buckets de S3, repositorio de ECR y claves de acceso de IAM).