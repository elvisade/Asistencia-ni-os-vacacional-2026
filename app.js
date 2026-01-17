import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Cargar niños desde CSV
const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/main/ninos.csv";
  .then(res => res.text())
  .then(data => {
    const filas = data.split("\n");
    const select = document.getElementById("grupo");
    filas.forEach(fila => {
      if (fila.trim() !== "") {
        const option = document.createElement("option");
        option.textContent = fila;
        select.appendChild(option);
      }
    });
  });

window.registrarAsistencia = async () => {
  const educador = educadorEl().value;
  const horario = horarioEl().value;
  const grupo = grupoEl().value;

  if (!educador || !horario || !grupo) {
    alert("Complete todos los campos");
    return;
  }

  await addDoc(collection(db, "asistencias"), {
    educador,
    horario,
    grupo,
    fecha: new Date()
  });

  alert("Asistencia registrada ✔");
};

window.activarAdmin = async () => {
  const pin = prompt("Ingrese PIN administrador");

  if (pin !== "99999") {
    alert("PIN incorrecto");
    return;
  }

  document.getElementById("adminPanel").classList.remove("hidden");

  const registrosDiv = document.getElementById("registros");
  registrosDiv.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "asistencias"));
  querySnapshot.forEach(doc => {
    const d = doc.data();
    registrosDiv.innerHTML += `
      <p>
        ${d.fecha.toDate().toLocaleString()} - 
        ${d.educador} - 
        ${d.horario} - 
        ${d.grupo}
      </p>
    `;
  });
};

const educadorEl = () => document.getElementById("educador");
const horarioEl = () => document.getElementById("horario");
const grupoEl = () => document.getElementById("grupo");
