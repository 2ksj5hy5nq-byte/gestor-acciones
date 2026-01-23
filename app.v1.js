// 🔥 PRUEBA DE VIDA (si ves esto, el archivo es el correcto)
console.log("APP REAL CARGADA OK - v1");

// Firebase SDK (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ CONFIG REAL DE TU PROYECTO (la que muestras en capturas)
const firebaseConfig = {
  apiKey: "AIzaSyD3XGLrrvUTNHkq8P0gU8ROeyKBApig7o",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:ec250f93ad6219eb2ce67e"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM
const loginBtn = document.getElementById("loginBtn");
const userP = document.getElementById("user");
const cantidadInput = document.getElementById("cantidad");
const precioInput = document.getElementById("precio");
const totalSpan = document.getElementById("total");
const saveBtn = document.getElementById("saveBtn");

// LOGIN GOOGLE (ESTO ES LO QUE FALLABA ANTES)
loginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    userP.textContent = "Usuario: " + result.user.email;
  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión");
  }
});

// CÁLCULO TOTAL
function calcularTotal() {
  const c = Number(cantidadInput.value) || 0;
  const p = Number(precioInput.value) || 0;
  totalSpan.textContent = (c * p).toFixed(2);
}

cantidadInput.addEventListener("input", calcularTotal);
precioInput.addEventListener("input", calcularTotal);

// GUARDAR EN FIRESTORE
saveBtn.addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("Inicia sesión primero");
    return;
  }

  try {
    await addDoc(collection(db, "acciones"), {
      nombre: document.getElementById("nombre").value,
      tipo: document.getElementById("tipo").value,
      cantidad: Number(cantidadInput.value),
      precio: Number(precioInput.value),
      valor: Number(totalSpan.textContent),
      email: auth.currentUser.email,
      uid: auth.currentUser.uid,
      fecha: serverTimestamp()
    });

    alert("Acción guardada correctamente");
  } catch (err) {
    console.error(err);
    alert("Error al guardar");
  }
});
