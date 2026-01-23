// ===============================
// Firebase SDKs (v10+ modular)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// ⚠️ CONFIGURACIÓN FIREBASE REAL
// ===============================
// 🔴 ESTE apiKey DEBE SER EL DE:
// Firebase Console → Configuración del proyecto → SDK web
const firebaseConfig = {
  apiKey: "PEGA_AQUI_EL_API_KEY_DE_FIREBASE", // 🔴 NO Google Cloud API
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ===============================
// Inicializar Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ===============================
// LOGIN GOOGLE
// ===============================
const loginBtn = document.getElementById("loginBtn");
const userInfo = document.getElementById("user");

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error login:", error);
    alert("Error al iniciar sesión con Google");
  }
});

// ===============================
// Estado de sesión
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `Sesión iniciada: ${user.email}`;
    loginBtn.style.display = "none";
  } else {
    userInfo.textContent = "";
    loginBtn.style.display = "block";
  }
});

// ===============================
// CÁLCULO TOTAL
// ===============================
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");

function calcularTotal() {
  const cantidad = Number(cantidadInput.value) || 0;
  const precio = Number(precioInput.value) || 0;
  const total = cantidad * precio;
  totalSpan.textContent = total.toFixed(2) + " €";
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ===============================
// GUARDAR ACCIÓN
// ===============================
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("Debes iniciar sesión");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const tipo = document.getElementById("tipo").value;
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (!nombre || cantidad <= 0 || precio <= 0) {
    alert("Datos incorrectos");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      uid: auth.currentUser.uid,
      nombre,
      tipo,
      cantidad,
      precio,
      total: cantidad * precio,
      fecha: new Date()
    });

    alert("Acción guardada correctamente");
  } catch (error) {
    console.error("Error guardando:", error);
    alert("Error al guardar la acción");
  }
});
