// ===============================
// Firebase SDKs (CDN, módulo)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
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
// Firebase config (TU PROYECTO)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHqk8P0gU8R0eyKBApig7o",
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
const userInfo = document.getElementById("userInfo");

const nombreInput = document.getElementById("nombre");
const tipoInput = document.getElementById("tipo");
const numAccionesInput = document.getElementById("numAcciones");
const precioInput = document.getElementById("precio");
const totalTexto = document.getElementById("totalOperacion");
const guardarBtn = document.getElementById("guardarBtn");
const totalAcumuladoTexto = document.getElementById("totalAcumulado");

// ===============================
// LOGIN GOOGLE
// ===============================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Error login:", err);
    alert("Error al iniciar sesión con Google");
  }
});

// ===============================
// ESTADO DE SESIÓN
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userInfo.textContent = user.email;
    await cargarTotalAcumulado(user.uid);
  } else {
    userInfo.textContent = "No autenticado";
    totalAcumuladoTexto.textContent = "0.00 €";
  }
});

// ===============================
// CÁLCULO EN TIEMPO REAL
// ===============================
function calcularTotal() {
  const n = Number(numAccionesInput.value);
  const p = Number(precioInput.value);
  const total = n * p;
  totalTexto.textContent = isNaN(total) ? "0.00 €" : total.toFixed(2) + " €";
}

numAccionesInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// ===============================
// GUARDAR ACCIÓN
// ===============================
guardarBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const nombre = nombreInput.value.trim();
  const tipo = tipoInput.value;
  const numAcciones = Number(numAccionesInput.value);
  const precio = Number(precioInput.value);

  if (!nombre || numAcciones <= 0 || precio <= 0) {
    alert("Datos inválidos");
    return;
  }

  const total = numAcciones * precio;

  try {
    await addDoc(collection(db, "acciones"), {
      uid: user.uid,
      nombre,
      tipo,
      numAcciones,
      precio,
      total,
      fecha: serverTimestamp()
    });

    nombreInput.value = "";
    numAccionesInput.value = "";
    precioInput.value = "";
    totalTexto.textContent = "0.00 €";

    await cargarTotalAcumulado(user.uid);
  } catch (err) {
    console.error("Error guardando:", err);
    alert("Error al guardar");
  }
});

// ===============================
// TOTAL ACUMULADO
// ===============================
async function cargarTotalAcumulado(uid) {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", uid)
  );

  const snap = await getDocs(q);
  let suma = 0;

  snap.forEach(doc => {
    suma += doc.data().total;
  });

  totalAcumuladoTexto.textContent = suma.toFixed(2) + " €";
}
