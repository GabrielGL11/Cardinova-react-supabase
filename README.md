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
* **Vitest**: Pruebas unitarias de la lógica de validación.
* **Docker + nginx**: Empaquetado de la aplicación en una imagen.
* **AWS (S3 + CloudFront)** y **GitHub Actions**: Integración continua y despliegue automático.

---

## 📂 Estructura del proyecto

El proyecto está organizado para mantener una separación clara entre la lógica de negocio, los datos y la interfaz.

```text
.github/workflows/
│── ci-cd.yml      # Pipeline: lint, pruebas, build y despliegue
src/
│── assets/        # Imágenes de la aplicación
│── components/    # Componentes reutilizables (formulario de cita, tablas, etc.)
│── context/       # Estado global: sesión (AuthContext) y citas (CitasContext)
│── layout/        # Estructura y páginas: Navbar, Footer, Home, Login, Registro
│── lib/           # Conexión con Supabase, tipos, validadores (y sus pruebas)
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
  Cliente de Supabase, interfaces, tipos de datos y funciones auxiliares. `validadores.ts` contiene la validación de cédula (10 dígitos) y la disponibilidad del médico por día; sus pruebas están en `validadores.test.ts`.

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
* 🧪 **Pruebas automáticas** (9 pruebas con Vitest) ejecutadas en cada cambio.
* 📄 **Código documentado**, con comentarios para facilitar el mantenimiento.

---

## ⚙️ Instalación y ejecución

**Requisitos:** Node.js 22 y npm.

### 1. Instalar las dependencias

```bash
npm ci
```

(`npm install` también sirve; `npm ci` instala exactamente lo que fija `package-lock.json`, igual que el pipeline.)

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

## 🧪 Pruebas

```bash
npm test        # ejecuta las pruebas una vez (vitest run)
npm run lint    # revisa el estilo y errores estáticos
npm run build   # comprueba tipos y genera dist/
```

Las 9 pruebas de `src/lib/validadores.test.ts` verifican:

| Función | Qué comprueba |
|---|---|
| `validarCedula` | Acepta exactamente 10 dígitos; rechaza menos, más y letras |
| `obtenerDiaSemana` | Identifica correctamente el día de una fecha (lunes, domingo) |
| `esFechaValida` | Acepta la fecha si el médico atiende ese día; rechaza si no, o si es domingo |

---

## 🔁 Integración continua y estrategia de ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable. No se modifica hasta cerrar la práctica. |
| `devops-nube-practica` | Integración y despliegue. Solo recibe cambios por pull request. |
| `feature/*` | Trabajo de cada cambio (por ejemplo, `feature/tests-ci`). |

Flujo de trabajo:

1. Crear una rama `feature/...` desde `devops-nube-practica`.
2. Hacer push: el job `ci` corre en cada push a `feature/**`.
3. Abrir un pull request hacia `devops-nube-practica`: `ci` vuelve a correr sobre el PR.
4. Un compañero revisa y aprueba el PR.
5. Al hacer merge, corre `ci` y, si pasa, `deploy` publica en AWS.

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

La imagen se probó en local y se publicó en Amazon ECR (región us-east-2) como evidencia de la contenerización. Esta es también la alternativa reproducible si no se dispone de cuenta en la nube.

---

## ☁️ Despliegue

La aplicación se publica como sitio estático en **AWS** (región us-east-2): los archivos compilados se guardan en un bucket privado de **Amazon S3** y **Amazon CloudFront** los entrega por HTTPS. Se eligió esta opción porque ECS Express Mode, que ejecutaría el contenedor, necesita un balanceador de carga que la política de la organización de la cuenta bloquea.

### Pipeline (GitHub Actions)

El flujo `.github/workflows/ci-cd.yml` ("CI/CD Cardinova") tiene dos jobs:

| Job | Cuándo corre | Qué hace |
|---|---|---|
| `ci` — Pruebas y compilación | En cada pull request a `devops-nube-practica` y en cada push a `feature/**` o `devops-nube-practica` | `npm ci`, `npm run lint`, `npm test`, comprobación de secretos y `npm run build` |
| `deploy` — Desplegar en AWS | Solo en un push a `devops-nube-practica`, y únicamente si `ci` terminó en verde (`needs: ci`) | Compila con los secretos, sincroniza `dist` con S3 e invalida la caché de CloudFront |

Si `ci` falla, `deploy` se omite: un cambio con pruebas rotas nunca llega a AWS.

### Secretos

Se configuran en el repositorio (*Settings → Secrets and variables → Actions*). El workflow los lee con `${{ secrets.NOMBRE }}`; ningún valor aparece en el código, en los logs ni en las capturas.

| Secreto | Contenido |
|---|---|
| `AWS_ACCESS_KEY_ID` | Clave de acceso del usuario de IAM para el despliegue |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta de ese usuario |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_KEY` | Clave pública de Supabase |

### Versión desplegada y registros

* **Qué versión está publicada:** la del commit de la última ejecución exitosa del job `deploy` en la rama `devops-nube-practica` (pestaña **Actions** del repositorio).
* **Registros:** en **Actions → ejecución → job → paso** se ve el log de cada paso. En AWS se comprueba la fecha de modificación de los objetos del bucket S3 y el estado *Completed* de la invalidación en CloudFront.

### Verificación del despliegue

Después de cada despliegue se prueba sobre la URL publicada:

1. **Recorrido principal:** iniciar sesión como paciente → *Agendar Cita* → elegir especialidad, ciudad, hospital y médico → completar los datos → finalizar. Resultado esperado: aviso "Cita registrada correctamente" y la cita aparece en *Mis Registros*.
2. **Caso de error:** iniciar sesión con una contraseña incorrecta. Resultado esperado: mensaje "Correo o contraseña incorrectos" y la aplicación no se abre.

### Rollback

Para volver a una versión estable, se crea un commit que deshace el cambio y se sube a la misma rama; el pipeline vuelve a probar y a publicar la versión anterior:

```bash
git revert <commit-malo> --no-edit
git push
```

> El rollback solo afecta al frontend. Los cambios en la base de datos de Supabase no se revierten con Git.

### Evitar costos

Al terminar las pruebas se deben eliminar los recursos creados (distribución de CloudFront, buckets de S3, repositorio de ECR y claves de acceso de IAM).