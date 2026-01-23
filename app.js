import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔴 PEGA AQUÍ SOLO LA CONFIGURACIÓN DEL PROYECTO gestor-acciones */
const firebaseConfig = {
  apiKey: "PEGA_AQUI_LA_APIKEY_DE_FIREBASE",
  authDomain: "gestor-acciones.firebaseapp.com",
  projectId: "gestor-acciones",
  storageBucket: "gestor-acciones.appspot.com",
  messagingSenderId: "682376422747",
  appId: "1:682376422747:web:XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* LOGIN */
document.getElementById("loginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Error al iniciar sesión");
    console.error(e);
  }
};

/* USUARIO LOGUEADO */
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("loginBtn").style.display = "none";
  }
});

/* CÁLCULO */
function calcular() {
  const c = Number(cantidad.value);
  const p = Number(precio.value);
  document.getElementById("total").textContent =
    "Total: " + (c * p || 0).toFixed(2) + " €";
}

cantidad.oninput = calcular;
precio.oninput = calcular;

/* GUARDAR */
document.getElementById("saveBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Inicia sesión");

  await addDoc(collection(db, "acciones"), {
    nombre: nombre.value,
    tipo: tipo.value,
    cantidad: Number(cantidad.value),
    precio: Number(precio.value),
    total: Number(cantidad.value) * Number(precio.value),
    email: user.email,
    uid: user.uid,
    fecha: serverTimestamp()
  });

  alert("Acción guardada");
};
