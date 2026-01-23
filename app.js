// ===============================
// FIREBASE SDK (CDN - MODULE)
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
// FIREBASE CONFIG (TU PROYECTO)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHqk8P0gU8ROevKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// ===============================
// INIT FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ===============================
// DOM ELEMENTS
// ===============================
const loginBtn = document.getElementById("loginBtn");
const userTxt = document.getElementById("user");

const nombreInput = document.getElementById("nombre");
const tipoSelect = document.getElementById("tipo");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");

const totalSpan = document.getElementById("total");
const saveBtn = document.getElementById("saveBtn");
const resumenP = document.getElementById("resumen");

// ===============================
// AUTH - GOOGLE LOGIN
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
// AUTH STATE
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    userTxt.textContent = `Usuario: ${user.email}`;
    loginBtn.style.display = "none";
    cargarResumen(user.uid);
  } else {
    userTxt.textContent = "";
    loginBtn.style.display = "block";
  }
});

// ===============================
// CALCULAR TOTAL
// ===============================
function calcularTotal() {
  const cantidad = Number(cantidadInput.value);
  const precio = Number(precioInput.value);

  if (cantidad > 0 && precio > 0) {
    const total = cantidad * precio;
    totalSpan.textContent = total.toFixed(2) + " €";
    return total;
  } else {
    totalSpan.textContent = "0 €";
    return 0;
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
      valor: tipo === "Compra" ? total : -total,
      fecha: serverTimestamp()
    });

    nombreInput.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    totalSpan.textContent = "0 €";

    cargarResumen(user.uid);
  } catch (err) {
    console.error(err);
    alert("Error al guardar");
  }
});

// ===============================
// RESUMEN
// ===============================
async function cargarResumen(uid) {
  const q = query(collection(db, "acciones"), where("uid", "==", uid));
  const snapshot = await getDocs(q);

  let total = 0;
  snapshot.forEach(doc => {
    total += doc.data().valor;
  });

  resumenP.textContent = `Resultado total: ${total.toFixed(2)} €`;
}
