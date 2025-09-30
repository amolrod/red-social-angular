# Red Social Angular

Este es un proyecto de red social construido con **Angular** y **Firebase**.

## 🚀 Requisitos previos
- Node.js (versión 18 o superior recomendada)  
- Angular CLI instalado globalmente:  
  ```bash
  npm install -g @angular/cli
Una cuenta de Firebase configurada con Firestore y Authentication.

⚙️ Instalación
Clona el repositorio y entra en el directorio del proyecto:

bash
Copiar código
git clone https://github.com/amolrod/red-social-angular.git
cd red-social-angular
Instala las dependencias:

bash
Copiar código
npm install
▶️ Ejecución en desarrollo
Para levantar el servidor de desarrollo:

bash
Copiar código
ng serve --open
Esto abrirá la aplicación en http://localhost:4200/.

🛠️ Construcción para producción
bash
Copiar código
ng build
Los archivos compilados estarán en la carpeta dist/.

📂 Estructura básica
src/app/core/ → Servicios y lógica principal

src/app/models/ → Modelos de datos (UserProfile, Post, etc.)

src/app/components/ → Componentes de la aplicación

src/environments/ → Configuración de entornos (añadir claves de Firebase aquí)

🔑 Configuración de Firebase
En src/environments/ crea un archivo environment.ts con tu configuración de Firebase:

ts
Copiar código
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  }
};
Para producción, usa environment.prod.ts con las credenciales correspondientes.
