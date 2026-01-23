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
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBm2_VJXtZNPhs76ROV60s16hMXmgxNilA",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");
const nombreEl = document.getElementById("nombre");
const tipoEl = document.getElementById("tipo");
const cantidadEl = document.getElementById("cantidad");
const precioEl = document.getElementById("precio");
const totalEl = document.getElementById("total");
const resumenEl = document.getElementById("resumen");

let usuario = null;

// LOGIN
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Error al iniciar sesión");
    console.error(e);
  }
};

// AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuario = user;
    await cargarResumen();
  }
});

// CALCULAR TOTAL
function calcularTotal() {
  const c = Number(cantidadEl.value) || 0;
  const p = Number(precioEl.value) || 0;
  totalEl.textContent = `Total: ${(c * p).toFixed(2)} €`;
}

cantidadEl.oninput = calcularTotal;
precioEl.oninput = calcularTotal;

// GUARDAR
saveBtn.onclick = async () => {
  if (!usuario) return alert("Inicia sesión primero");

  const cantidad = Number(cantidadEl.value);
  const precio = Number(precioEl.value);

  await addDoc(collection(db, "acciones"), {
    uid: usuario.uid,
    nombre: nombreEl.value,
    tipo: tipoEl.value,
    cantidad,
    precio,
    total: cantidad * precio,
    fecha: new Date()
  });

  nombreEl.value = "";
  cantidadEl.value = "";
  precioEl.value = "";
  totalEl.textContent = "Total: 0 €";

  await cargarResumen();
};

// RESUMEN
async function cargarResumen() {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", usuario.uid)
  );

  const snap = await getDocs(q);
  let total = 0;

  snap.forEach(d => total += d.data().total);
  resumenEl.textContent = `Resultado total: ${total.toFixed(2)} €`;
}
