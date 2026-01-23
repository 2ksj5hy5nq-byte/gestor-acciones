// ================================
// Firebase SDK (CDN - ES MODULES)
// ================================
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

// ================================
// 🔴 PEGA AQUÍ TU firebaseConfig REAL
// (Firebase > Configuración del proyecto > App web > CDN)
// ================================
const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:XXXXXXXXXXXX"
};

// ================================
// Inicializar Firebase
// ================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ================================
// DOM
// ================================
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");

const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");

const totalSpan = document.getElementById("total");
const resumenP = document.getElementById("resumen");

// ================================
// Login con Google
// ================================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión");
  }
});

// ================================
// Estado de sesión
// ================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("user").textContent = user.email;
    await cargarResumen(user.uid);
  } else {
    document.getElementById("user").textContent = "";
    resumenP.textContent = "Resultado total: 0 €";
  }
});

// ================================
// Calcular total en tiempo real
// ================================
function calcularTotal() {
  const cantidad = Number(cantidadInput.value) || 0;
  const precio = Number(precioInput.value) || 0;
  const total = cantidad * precio;
  totalSpan.textContent = `Total: ${total.toFixed(2)} €`;
  return total;
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ================================
// Guardar acción en Firestore
// ================================
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
  const total = calcularTotal();

  if (!nombre || cantidad <= 0 || precio <= 0) {
    alert("Datos inválidos");
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
    totalSpan.textContent = "Total: 0 €";

    await cargarResumen(user.uid);
  } catch (error) {
    console.error(error);
    alert("Error al guardar la acción");
  }
});

// ================================
// Cargar resumen total
// ================================
async function cargarResumen(uid) {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);
  let suma = 0;

  snapshot.forEach(doc => {
    suma += Number(doc.data().valor) || 0;
  });

  resumenP.textContent = `Resultado total: ${suma.toFixed(2)} €`;
}
