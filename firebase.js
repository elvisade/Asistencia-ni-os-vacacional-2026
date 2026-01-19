import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, query, where, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXvwmQQLvbKgKk2-m2nVb_ADoFlm9BmXs",
  authDomain: "asistencia-ninos-orquestando.firebaseapp.com",
  projectId: "asistencia-ninos-orquestando",
  storageBucket: "asistencia-ninos-orquestando.firebasestorage.app",
  messagingSenderId: "193901360592",
  appId: "1:193901360592:web:9e345008bdbeb46820f5d5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Guardar asistencia online
export async function guardarAsistencia(r) {
  const ref = doc(db, "asistencia", `${r.fecha}_${r.alumno}`);
  await setDoc(ref, r, { merge:true });
}

// Leer asistencia mensual
export async function leerMensual(educador,grupo,mes,anio) {
  const q = query(
    collection(db,"asistencia"),
    where("educador","==",educador),
    where("grupo","==",grupo)
  );
  const snap = await getDocs(q);
  const lista = [];
  snap.forEach(d => lista.push(d.data()));
  return lista.filter(r => {
    const f = new Date(r.fecha);
    return f.getMonth()+1===mes && f.getFullYear()===anio;
  });
}
