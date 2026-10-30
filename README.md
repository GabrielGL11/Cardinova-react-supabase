# Sistema de Agendamiento Médico - Cardinova

Aplicación web desarrollada para la gestión y el agendamiento de citas médicas. El sistema permite filtrar médicos por especialidad, gestionar el estado de las citas en tiempo real y registrar nuevos pacientes mediante una interfaz sencilla e intuitiva.

---

## 🚀 Tecnologías utilizadas

* **React**: Biblioteca principal para la construcción de la interfaz de usuario.
* **TypeScript**: Proporciona tipado estático para mejorar la seguridad y mantenibilidad del código.
* **Vite**: Herramienta de desarrollo rápida para proyectos React.
* **React Router**: Permite la navegación entre las diferentes vistas de la aplicación.

---

## 📂 Estructura del proyecto

El proyecto está organizado para mantener una separación clara entre la lógica de negocio, los datos y la interfaz.

```text
src/
│── components/    # Componentes reutilizables de la aplicación
│── data/          # Archivos JSON utilizados como base de datos local
│── lib/           # Interfaces, tipos y funciones auxiliares
│── styles/        # Archivos CSS organizados por componente
```

### Descripción de las carpetas

* **`src/components/`**
  Contiene los principales componentes de la aplicación, como `Navbar`, `FormularioCita`, `MisRegistros`, `TablaCitas`, entre otros. Todos están desarrollados con **React + TypeScript** (`.tsx`).

* **`src/data/`**
  Almacena los archivos JSON que simulan una base de datos local para médicos, pacientes y citas.

* **`src/lib/`**
  Incluye las interfaces, tipos de datos y funciones auxiliares utilizadas por la aplicación.

* **`src/styles/`**
  Contiene las hojas de estilo CSS organizadas por componente para mantener una mejor estructura del proyecto.

---

## ✨ Características implementadas

* 📅 **Agendamiento de citas en tres pasos**, permitiendo seleccionar especialidad, médico y horario antes de confirmar la cita.
* 🔍 **Filtro por especialidad médica** en la sección **Mis Registros**, facilitando la búsqueda de citas.
* 🏥 **Visualización completa de la información del médico**, incluyendo ciudad y hospital.
* 📄 **Código documentado**, utilizando comentarios estructurados para facilitar el mantenimiento y la comprensión del proyecto.
* 🔄 **Actualización dinámica del estado de las citas**, reflejando los cambios en tiempo real dentro de la aplicación.

---

## ⚙️ Instalación y ejecución

### 1. Instalar las dependencias

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 3. Abrir la aplicación

Una vez iniciado el servidor, abre tu navegador y accede a la dirección mostrada en la consola, normalmente:

```text
http://localhost:5173
```

> **Nota:** El puerto puede variar dependiendo de si el puerto predeterminado ya está siendo utilizado.

## 🐳 Docker

La app se empaqueta en una imagen con nginx (puerto 8080). Las variables de Supabase
se incrustan al compilar, por eso se pasan como `--build-arg`.

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co \
  --build-arg VITE_SUPABASE_KEY=tu_clave_publishable \
  -t cardinova .

docker run --rm -p 8080:8080 --name cardinova-test cardinova
```

Abrir: http://localhost:8080

> No subas el archivo `.env` al repositorio. Ya está en `.gitignore` y `.dockerignore`.

## ☁️ Despliegue

Rama `devops-cloud-run`: despliegue en Google Cloud Run mediante GitHub Actions
(ver `.github/workflows/deploy.yml`).