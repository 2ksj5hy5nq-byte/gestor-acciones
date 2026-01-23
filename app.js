// ===============================
// 🔥 Firebase SDK (v9 modular)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===============================
// 🔐 Firebase config (TU PROYECTO)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBm2_VJXtZNPhs76ROV60s16hMXmgxNIlA",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ===============================
// 🚀 Init Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// 🎯 DOM
// ===============================
const loginBtn = document.getElementById("loginBtn");
const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");
const saveBtn = document.getElementById("saveBtn");
const resumenP = document.getElementById("resumen");

// ===============================
// 👤 Usuario actual
// ===============================
let currentUser = null;

// ===============================
// 🔑 Login con Google
// ===============================
loginBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión");
  }
});

// ===============================
// 👀 Escuchar sesión
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = "none";
    await cargarResumen();
  } else {
    currentUser = null;
    loginBtn.style.display = "block";
    resumenP.textContent = "Resultado total: 0 €";
  }
});

// ===============================
// 🧮 Calcular total en tiempo real
// ===============================
function calcularTotal() {
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);
  const total = cantidad * precio;

  totalSpan.textContent = isNaN(total) ? "0.00" : total.toFixed(2);
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ===============================
// 💾 Guardar acción
// ===============================
saveBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Debes iniciar sesión");
    return;
  }

  const nombre = nombreInput.value.trim();
  const tipo = tipoSelect.value;
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);
  const total = cantidad * precio;

  if (!nombre || isNaN(total)) {
    alert("Datos incorrectos");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      uid: currentUser.uid,
      nombre,
      tipo,
      cantidad,
      precio,
      total,
      fecha: serverTimestamp()
    });

    nombreInput.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    totalSpan.textContent = "0.00";

    await cargarResumen();
  } catch (err) {
    console.error(err);
    alert("Error al guardar");
  }
});

// ===============================
// 📊 Resumen acumulado
// ===============================
async function cargarResumen() {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);
  let suma = 0;

  snapshot.forEach(doc => {
    suma += doc.data().total;
  });

  resumenP.textContent = `Resultado total: ${suma.toFixed(2)} €`;
}
