// ===============================
// Firebase SDKs (CDN)
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
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// Firebase Config (TU PROYECTO)
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
// Init
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ===============================
// Login Google
// ===============================
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión");
  }
});

// ===============================
// Estado de sesión
// ===============================
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("loginBtn").style.display = "none";
  }
});

// ===============================
// Guardar acción
// ===============================
document.getElementById("saveBtn").addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const tipo = document.getElementById("tipo").value;
  const cantidad = Number(document.getElementById("cantidad").value);
  const precio = Number(document.getElementById("precio").value);

  if (!nombre || !cantidad || !precio) {
    alert("Completa todos los campos");
    return;
  }

  await addDoc(collection(db, "acciones"), {
    nombre,
    tipo,
    cantidad,
    precio,
    total: cantidad * precio,
    fecha: serverTimestamp()
  });

  alert("Acción guardada");
});
