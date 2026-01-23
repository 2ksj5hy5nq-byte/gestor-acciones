// =======================
// Firebase SDKs (CDN)
// =======================
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
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// Firebase config (SDK WEB)
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHkq8P0gU8ROeyKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.firebasestorage.app",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// =======================
// Init Firebase
// =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// =======================
// DOM
// =======================
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");

const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");
const resumenP = document.getElementById("resumen");

// =======================
// Auth
// =======================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    alert("Error al iniciar sesión");
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.textContent = `Conectado: ${user.email}`;
  }
});

// =======================
// Total cálculo
// =======================
function actualizarTotal() {
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);
  const total = cantidad * precio;
  totalSpan.textContent = isNaN(total) ? "0 €" : `${total.toFixed(2)} €`;
}

cantidadInput.addEventListener("input", actualizarTotal);
precioInput.addEventListener("input", actualizarTotal);

// =======================
// Guardar acción
// =======================
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (!nombreInput.value || !cantidad || !precio) {
    alert("Completa todos los campos");
    return;
  }

  const valor = cantidad * precio * (tipoSelect.value === "Venta" ? -1 : 1);

  await addDoc(collection(db, "acciones"), {
    uid: user.uid,
    email: user.email,
    nombre: nombreInput.value,
    tipo: tipoSelect.value,
    cantidad,
    precio,
    valor,
    fecha: serverTimestamp()
  });

  resumenP.textContent = "Acción guardada correctamente";
});
