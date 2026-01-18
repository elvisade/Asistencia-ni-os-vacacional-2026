const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/refs/heads/main/ninos.csv";

let alumnos = [];
let registrosGuardados = [];

fetch(CSV_URL)
  .then(r => r.text())
  .then(texto => {
    const filas = texto.trim().split("\n").slice(1);

    filas.forEach(f => {
      const [educador, grupo, nombres, apellidos] = f.split(",");
      alumnos.push({
        educador: educador.trim(),
        grupo: grupo.trim(),
        nombre: `${nombres.trim()} ${apellidos.trim()}`
      });
    });

    cargarEducadores();
  });

function cargarEducadores() {
  const sel = document.getElementById("educador");
  const educadores = [...new Set(alumnos.map(a => a.educador))];

  sel.innerHTML = `<option value="">Seleccione educador</option>`;
  educadores.forEach(e => sel.innerHTML += `<option value="${e}">${e}</option>`);

  sel.onchange = cargarGrupos;
}

function cargarGrupos() {
  const educador = document.getElementById("educador").value;
  const selGrupo = document.getElementById("grupo");
  const tbody = document.getElementById("tabla");
  tbody.innerHTML = "";
  
  const grupos = [...new Set(alumnos.filter(a => a.educador === educador).map(a => a.grupo))];

  selGrupo.innerHTML = `<option value="">Seleccione grupo</option>`;
  grupos.forEach(g => selGrupo.innerHTML += `<option value="${g}">${g}</option>`);

  selGrupo.onchange = cargarTabla;
}

function cargarTabla() {
  const educador = document.getElementById("educador").value;
  const grupo = document.getElementById("grupo").value;
  const tbody = document.getElementById("tabla");

  tbody.innerHTML = "";

  alumnos.filter(a => a.educador === educador && a.grupo === grupo)
    .forEach((a, i) => {
      tbody.innerHTML += `
        <tr>
          <td>${a.nombre}</td>
          <td>${a.grupo}</td>
          <td>
            <select id="a${i}">
              <option value="">-</option>
              <option value="A">A</option>
              <option value="T">T</option>
              <option value="J">J</option>
              <option value="F">F</option>
            </select>
          </td>
        </tr>`;
    });
}

function guardar() {
  const fecha = document.getElementById("fecha").value;
  const educador = document.getElementById("educador").value;
  const grupo = document.getElementById("grupo").value;

  if (!fecha || !educador || !grupo) {
    alert("Seleccione educador, grupo y fecha");
    return;
  }

  alumnos.filter(a => a.educador === educador && a.grupo === grupo)
    .forEach((a, i) => {
      const estado = document.getElementById(`a${i}`).value;
      if (estado) {
        registrosGuardados.push({
          fecha,
          educador,
          alumno: a.nombre,
          grupo: a.grupo,
          asistencia: estado
        });
      }
    });

  alert("Asistencia registrada ✔");
}

function verMensual() {
  const educador = prompt("Educador:");
  const grupo = prompt("Grupo:");
  const mes = prompt("Mes y año (MM/YYYY):", "01/2026");
  if (!educador || !grupo || !mes) return;

  const [m, y] = mes.split("/").map(Number);

  const lista = registrosGuardados.filter(r => {
    const d = new Date(r.fecha);
    return r.educador === educador &&
           r.grupo === grupo &&
           d.getMonth() + 1 === m &&
           d.getFullYear() === y;
  });

  const cont = document.getElementById("reporte");
  cont.innerHTML = "";

  if (lista.length === 0) {
    cont.innerHTML = `<p>No hay registros para ${mes}</p>`;
    return;
  }

  cont.innerHTML = `
    <h3>Asistencia ${mes} - Educador: ${educador} - Grupo: ${grupo}</h3>
    <table style="border-collapse:collapse; width:100%; background:rgba(0,0,0,.6);">
      <tr><th>Fecha</th><th>Alumno</th><th>Asistencia</th></tr>
      ${lista.map(r => `
        <tr>
          <td>${r.fecha}</td>
          <td>${r.alumno}</td>
          <td>${r.asistencia}</td>
        </tr>
      `).join('')}
    </table>
  `;
}
