# 🚀 Guía de Despliegue: Los Almeyda

Esta guía te ayudará a desplegar tu proyecto en **Render** (Backend/Frontend) y **Railway** (Base de Datos), usando **GitHub** para el código.

## 📋 Prerrequisitos
1.  Cuenta en [GitHub](https://github.com/)
2.  Cuenta en [Railway](https://railway.app/)
3.  Cuenta en [Render](https://render.com/)
4.  Git instalado en tu computadora

---

## 1️⃣ Paso 1: Preparar el Código (Ya realizado)
He configurado tu proyecto para que esté listo:
- ✅ `package.json` tiene el script de inicio correcto.
- ✅ `config/db.js` usa variables de entorno para la conexión.
- ✅ `.gitignore` creado para no subir archivos innecesarios.
- ✅ Velocidad del humo ajustada (más rápida).

---

## 2️⃣ Paso 2: Subir a GitHub
1.  Ve a [GitHub](https://github.com/new) y crea un **nuevo repositorio** (público o privado) llamado `los-almeyda-web`.
2.  Abre tu terminal en la carpeta del proyecto y ejecuta:
    ```bash
    git init
    git add .
    git commit -m "Primer commit: Sitio web listo para despliegue"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/los-almeyda-web.git
    git push -u origin main
    ```
    *(Reemplaza `TU_USUARIO` con tu usuario de GitHub)*.

---

## 3️⃣ Paso 3: Crear Base de Datos en Railway
1.  Entra a [Railway](https://railway.app/) y haz clic en **"New Project"** > **"Provision MySQL"**.
2.  Espera a que se cree. Haz clic en la tarjeta de MySQL y ve a la pestaña **"Variables"**.
3.  Copia las siguientes variables (las necesitarás para Render):
    - `MYSQLHOST`
    - `MYSQLPORT`
    - `MYSQLUSER`
    - `MYSQLPASSWORD`
    - `MYSQLDATABASE`
4.  **Importar tus datos:**
    - Necesitas exportar tu base de datos local a un archivo `.sql`.
    - Usa una herramienta como **DBeaver** o **HeidiSQL** para conectarte a tu base de datos Railway (usando los datos de la pestaña "Connect") y ejecuta el script SQL de tu base de datos local para crear las tablas y datos.

---

## 4️⃣ Paso 4: Desplegar en Render
1.  Entra a [Render](https://render.com/) y haz clic en **"New +"** > **"Web Service"**.
2.  Conecta tu cuenta de GitHub y selecciona el repositorio `los-almeyda-web`.
3.  Configura lo siguiente:
    - **Name:** `los-almeyda-web`
    - **Region:** Ohio (US East) u Oregon (US West)
    - **Branch:** `main`
    - **Runtime:** `Node`
    - **Build Command:** `npm install`
    - **Start Command:** `node server.js`
4.  **Variables de Entorno (Environment Variables):**
    Haz clic en "Advanced" o "Environment" y agrega las variables de tu base de datos Railway:
    - `DB_HOST` = (Pega el valor de `MYSQLHOST` de Railway)
    - `DB_PORT` = (Pega el valor de `MYSQLPORT` de Railway)
    - `DB_USER` = (Pega el valor de `MYSQLUSER` de Railway)
    - `DB_PASSWORD` = (Pega el valor de `MYSQLPASSWORD` de Railway)
    - `DB_NAME` = (Pega el valor de `MYSQLDATABASE` de Railway)
    - `PORT` = `10000` (Render lo usa por defecto, pero es bueno definirlo)
5.  Haz clic en **"Create Web Service"**.

---

## 🎉 ¡Listo!
Render empezará a construir tu sitio. En unos minutos, te dará una URL (ej: `https://los-almeyda-web.onrender.com`) donde tu página estará funcionando públicamente.
