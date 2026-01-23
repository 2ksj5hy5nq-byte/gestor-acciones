// ===============================
// Firebase SDK (v9 - CDN)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===============================
// Firebase config (TU CONFIG)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHHqk8P0gU8ROeyKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ===============================
// Init Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ===============================
// DOM
// ===============================
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");
const nameInput = document.getElementById("nombre");
const typeInput = document.getElementById("tipo");
const qtyInput = document.getElementById("cantidad");
const priceInput = document.getElementById("precio");
const totalEl = document.getElementById("total");
const resumenEl = document.getElementById("resumen");

let currentUser = null;

// ===============================
// AUTH
// ===============================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    alert("Error al iniciar sesión");
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loginBtn.textContent = user.email;
    await cargarAcciones();
  } else {
    currentUser = null;
    loginBtn.textContent = "Iniciar sesión con Google";
    resumenEl.textContent = "Resultado total: 0 €";
  }
});

// ===============================
// CALCULAR TOTAL
// ===============================
function calcularTotal() {
  const qty = Number(qtyInput.value) || 0;
  const price = Number(priceInput.value) || 0;
  const total = qty * price;
  totalEl.textContent = `Total: ${total.toFixed(2)} €`;
  return total;
}

qtyInput.addEventListener("input", calcularTotal);
priceInput.addEventListener("input", calcularTotal);

// ===============================
// GUARDAR ACCIÓN
// ===============================
saveBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Debes iniciar sesión");
    return;
  }

  const total = calcularTotal();

  try {
    await addDoc(collection(db, "acciones"), {
      uid: currentUser.uid,
      nombre: nameInput.value,
      tipo: typeInput.value,
      cantidad: Number(qtyInput.value),
      precio: Number(priceInput.value),
      total,
      fecha: new Date()
    });

    nameInput.value = "";
    qtyInput.value = "";
    priceInput.value = "";
    totalEl.textContent = "Total: 0 €";

    await cargarAcciones();
  } catch (e) {
    console.error(e);
    alert("Error al guardar");
  }
});

// ===============================
// CARGAR ACCIONES
// ===============================
async function cargarAcciones() {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", currentUser.uid),
    orderBy("fecha", "desc")
  );

  const snap = await getDocs(q);

  let total = 0;
  snap.forEach(doc => {
    total += doc.data().total;
  });

  resumenEl.textContent = `Resultado total: ${total.toFixed(2)} €`;
}
