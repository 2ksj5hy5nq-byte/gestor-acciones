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
  apiKey: "PEGA_AQUI_TU_BROWSER_KEY_REAL",
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

let usuario = null;

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Error al iniciar sesión");
    console.error(e);
  }
});

onAuthStateChanged(auth, user => {
  if (user) {
    usuario = user;
    document.getElementById("user").innerText = user.email;
    cargarResumen();
  }
});

const cantidad = document.getElementById("cantidad");
const precio = document.getElementById("precio");
const totalSpan = document.getElementById("total");

function recalcular() {
  const total = (Number(cantidad.value) || 0) * (Number(precio.value) || 0);
  totalSpan.innerText = total.toFixed(2);
}

cantidad.addEventListener("input", recalcular);
precio.addEventListener("input", recalcular);

document.getElementById("guardar").addEventListener("click", async () => {
  if (!usuario) {
    alert("Inicia sesión primero");
    return;
  }

  await addDoc(collection(db, "acciones"), {
    uid: usuario.uid,
    nombre: document.getElementById("nombre").value,
    tipo: document.getElementById("tipo").value,
    cantidad: Number(cantidad.value),
    precio: Number(precio.value),
    total: Number(totalSpan.innerText),
    fecha: new Date()
  });

  cargarResumen();
});

async function cargarResumen() {
  const q = query(
    collection(db, "acciones"),
    where("uid", "==", usuario.uid)
  );

  const snap = await getDocs(q);
  let suma = 0;

  snap.forEach(doc => {
    suma += doc.data().total;
  });

  document.getElementById("resumen").innerText = suma.toFixed(2);
}
