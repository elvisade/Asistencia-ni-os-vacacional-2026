import { db } from "./firebase.js";
import { doc, setDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/refs/heads/main/ninos.csv";

let alumnos = [];

fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const filas = text.trim().split("\n").slice(1);
    filas.forEach(f => {
      const [educador, grupo, nombres, apellidos] = f.split(",");
      alumnos.push({
        educador: educador.trim(),
        grupo: grupo.trim(),
        nombre: `${nombres.trim()} ${apellidos.trim()}`.trim()
      });
    });
    cargarEducadores();
    cargarMeses();
    cargarAnios();
  });

function cargarEducadores() {
  const sel = document.getElementById("educador");
  const educadores = [...new Set(alumnos.map(a => a.educador))];
  sel.innerHTML = `<option value="">Educador</option>`;
  educadores.forEach(e => sel.innerHTML += `<option>${e}</option>`);
  sel.onchange = cargarGrupos;
}

function cargarGrupos() {
  const educador = document.getElementById("educador").value;
  const sel = document.getElementById("grupo");
  sel.innerHTML = `<option value="">Grupo</option>`;
  const grupos = [...new Set(alumnos.filter(a => a.educador === educador).map(a => a.grupo))];
  grupos.forEach(g => sel.innerHTML += `<option>${g}</option>`);
  sel.onchange = mostrarCalendario;
}

function cargarMeses() {
  const sel = document.getElementById("mes");
  sel.innerHTML = `<option value="">Mes</option>`;
  for (let i=1; i<=12; i++) sel.innerHTML += `<option value="${i}">${i}</option>`;
  sel.onchange = mostrarCalendario;
}

function cargarAnios() {
  const sel = document.getElementById("anio");
  sel.innerHTML = `<option value="">Año</option>`;
  for (let y=2024; y<=2030; y++) sel.innerHTML += `<option>${y}</option>`;
  sel.onchange = mostrarCalendario;
}

async function mostrarCalendario() {
  const educador = educador.value;
  const grupo = grupo.value;
  const mes = mes.value;
  const anio = anio.value;

  if (!educador || !grupo || !mes || !anio) return;

  const lista = alumnos.filter(a => a.educador === educador && a.grupo === grupo);
  const diasDelMes = new Date(anio, mes, 0).getDate();

  let html = `<table><thead><tr><th>Alumno</th>`;
  for (let d = 1; d <= diasDelMes; d++) html += `<th>${d}</th>`;
  html += `</tr></thead><tbody>`;

  lista.forEach(n => {
    html += `<tr><td class="nombre">${n.nombre}</td>`;
    for (let d = 1; d <= diasDelMes; d++) {
      const fechaISO = `${anio}-${String(mes).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      html += `<td class="dia" data-nino="${n.nombre}" data-fecha="${fechaISO}"></td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  contenedorCalendario.innerHTML = html;

  await cargarAsistenciasMes(lista, anio, mes);
}

async function cargarAsistenciasMes(lista, anio, mes) {
  const q = query(collection(db, "asistencias"));
  const snap = await getDocs(q);

  snap.forEach(docu => {
    const { nino, fecha, letra } = docu.data();
    const [Y, M] = fecha.split("-");

    if (+Y === +anio && +M === +mes && lista.some(n => n.nombre === nino)) {
      const celda = document.querySelector(`[data-fecha="${fecha}"][data-nino="${nino}"]`);
      if (celda) pintarCelda(celda, letra);
    }
  });
}

document.addEventListener("click", async e => {
  if (!e.target.classList.contains("dia")) return;

  const opciones = ["A", "T", "J", "F", "NO", ""];
  let actual = e.target.textContent;
  let idx = opciones.indexOf(actual);
  idx = (idx + 1) % opciones.length;
  let letra = opciones[idx];

  const nino = e.target.dataset.nino;
  const fecha = e.target.dataset.fecha;

  if (letra === "") {
    pintarCelda(e.target, "");
    await setDoc(doc(db, "asistencias", `${nino}_${fecha}`), { nino, fecha, letra:null }, { merge:true });
    return;
  }

  pintarCelda(e.target, letra);

  await setDoc(doc(db, "asistencias", `${nino}_${fecha}`), {
    nino, fecha, letra, ts:Date.now()
  });
});

function pintarCelda(celda, letra) {
  celda.className = "dia " + letra;
  celda.textContent = letra;
}
