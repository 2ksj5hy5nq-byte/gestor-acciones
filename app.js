console.log("🔥 app.js cargado");

// ===== Firebase CDN =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== CONFIG (LA TUYA, YA LA TENÍAS BIEN) =====
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHhqk8P0gU8ROeyKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ===== INIT =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===== DOM =====
const loginBtn = document.getElementById("loginBtn");
const userP = document.getElementById("user");

// ===== LOGIN =====
loginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Login OK", result.user.email);
  } catch (err) {
    console.error("❌ Error login:", err);
    alert(err.message);
  }
});

// ===== ESTADO USUARIO =====
onAuthStateChanged(auth, user => {
  if (user) {
    userP.textContent = `Usuario: ${user.email}`;
    loginBtn.style.display = "none";
  } else {
    userP.textContent = "";
    loginBtn.style.display = "block";
  }
});
