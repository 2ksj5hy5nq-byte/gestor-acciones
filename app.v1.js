// 🔥 PRUEBA DE VIDA
console.log("APP NUEVA CARGADA - SI VES ESTO, ES ESTA VERSIÓN");

// Firebase SDKs (CDN OFICIAL)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ✅ CONFIG REAL (la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHHqk8P0gU8ROeyKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// 🔥 INICIALIZAR SOLO UNA VEZ
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    alert("Login OK: " + result.user.email);
  } catch (e) {
    console.error("ERROR LOGIN", e);
    alert("Error al iniciar sesión");
  }
});
