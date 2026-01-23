// ===============================
// Firebase SDK (CDN - module)
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
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// Firebase CONFIG (TU PROYECTO)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBm2_VJXtZNPhs76ROV60s16hMXmgxNiIA",
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
// DOM
// ===============================
const loginBtn = document.getElementById("loginBtn");
const userP = document.getElementById("user");
const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");
const saveBtn = document.getElementById("saveBtn");
const resumenTotal = document.getElementById("resumenTotal");

// ===============================
// Estado
// ===============================
let usuario = null;

// ===============================
// Login Google
// ===============================
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    alert("Error al iniciar sesión");
  }
};

// ===============================
// Estado de sesión
// ===============================
onAuthStateChanged(auth, async (user) => {
  usuario = user;

  if (user) {
    userP.textContent = `Usuario: ${user.email}`;
    await cargarResumen();
  } else {
    userP.textContent = "";
    resumenTotal.textContent = "0.00";
  }
});

// ===============================
// Calcular total en tiempo real
// ===============================
function calcularTotal() {
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (cantidad > 0 && precio > 0) {
    const total = cantidad * precio;
    totalSpan.textContent = total.toFixed(2);
  } else {
    totalSpan.textContent = "0.00";
  }
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ===============================
// Guardar acción
// ===============================
saveBtn.onclick = async () => {
  if (!usuario) {
    alert("Debes iniciar sesión primero");
    return;
  }

  const nombre = nombreInput.value.trim();
  const tipo = tipoSelect.value;
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);
  const total = cantidad * precio;

  if (!nombre || cantidad <= 0 || precio <= 0) {
    alert("Datos incorrectos");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      uid: usuario.uid,
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
  } catch (e) {
    console.error(e);
    alert("Error al guardar la acción");
  }
};

// ===============================
// Resumen total (ANTI-NaN)
// ===============================
async function cargarResumen() {
  let total = 0;

  const q = query(
    collection(db, "acciones"),
    where("uid", "==", usuario.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const t = Number(doc.data().total);
    if (!isNaN(t)) total += t;
  });

  resumenTotal.textContent = total.toFixed(2);
}
