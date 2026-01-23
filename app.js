import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
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

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHHqk8P0gU8ROevKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ================= DOM =================
const loginBtn = document.getElementById("loginBtn");
const userP = document.getElementById("user");
const saveBtn = document.getElementById("saveBtn");

const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");

const totalSpan = document.getElementById("total");
const resumenP = document.getElementById("resumen");

// ================= LOGIN (MÓVIL) =================
loginBtn.onclick = () => {
  signInWithRedirect(auth, provider);
};

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userP.textContent = user.email;
    await cargarResumen(user.uid);
  } else {
    userP.textContent = "";
    resumenP.textContent = "Resultado total: 0 €";
  }
});

// ================= CALCULAR TOTAL =================
[cantidadInput, precioInput, tipoSelect].forEach(el => {
  el.oninput = () => {
    const c = Number(cantidadInput.value);
    const p = Number(precioInput.value);
    if (!c || !p) {
      totalSpan.textContent = "0";
      return;
    }
    const signo = tipoSelect.value === "VENTA" ? -1 : 1;
    totalSpan.textContent = c * p * signo;
  };
});

// ================= GUARDAR =================
saveBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (!nombreInput.value || !cantidad || !precio) {
    alert("Datos incompletos");
    return;
  }

  const valor = cantidad * precio * (tipoSelect.value === "VENTA" ? -1 : 1);

  await addDoc(collection(db, "acciones"), {
    uid: user.uid,
    email: user.email,
    nombre: nombreInput.value,
    tipo: tipoSelect.value,
    valor,
    fecha: new Date()
  });

  nombreInput.value = "";
  cantidadInput.value = "";
  precioInput.value = "";
  totalSpan.textContent = "0";

  await cargarResumen(user.uid);
};

// ================= RESUMEN =================
async function cargarResumen(uid) {
  const q = query(collection(db, "acciones"), where("uid", "==", uid));
  const snap = await getDocs(q);

  let total = 0;
  snap.forEach(d => total += d.data().valor);

  resumenP.textContent = `Resultado total: ${total} €`;
}
