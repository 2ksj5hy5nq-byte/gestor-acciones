// ===============================
// Firebase SDK (CDN - MÓDULOS)
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
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// 🔑 CONFIGURACIÓN CORRECTA
// (copiada de tu captura)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvuTNHk8P0gU8ROevKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.firebasestorage.app",
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
// ELEMENTOS DOM
// ===============================
const loginBtn = document.getElementById("loginBtn");
const userP = document.getElementById("user");
const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");
const saveBtn = document.getElementById("saveBtn");
const resumenP = document.getElementById("resumen");

// ===============================
// LOGIN CON GOOGLE
// ===============================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión");
  }
});

// ===============================
// SESIÓN ACTIVA
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    userP.textContent = `Usuario: ${user.email}`;
    cargarResumen(user.uid);
  } else {
    userP.textContent = "";
    resumenP.textContent = "Resultado total: 0 €";
  }
});

// ===============================
// CALCULAR TOTAL EN VIVO
// ===============================
function calcularTotal() {
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (cantidad > 0 && precio > 0) {
    totalSpan.textContent = (cantidad * precio).toFixed(2);
  } else {
    totalSpan.textContent = "0";
  }
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ===============================
// GUARDAR ACCIÓN
// ===============================
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const nombre = nombreInput.value.trim();
  const tipo = tipoSelect.value;
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);
  const total = cantidad * precio;

  if (!nombre || cantidad <= 0 || precio <= 0) {
    alert("Completa todos los campos");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      uid: user.uid,
      email: user.email,
      nombre,
      tipo,
      cantidad,
      precio,
      valor: total,
      fecha: serverTimestamp()
    });

    nombreInput.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    totalSpan.textContent = "0";

    cargarResumen(user.uid);
  } catch (err) {
    console.error(err);
    alert("Error al guardar");
  }
});

// ===============================
// RESUMEN TOTAL
// ===============================
async function cargarResumen(uid) {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", uid)
  );

  const snap = await getDocs(q);
  let total = 0;

  snap.forEach(doc => {
    total += doc.data().valor || 0;
  });

  resumenP.textContent = `Resultado total: ${total.toFixed(2)} €`;
}
