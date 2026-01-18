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

function abrirPanelMensual() {
  const panel = document.getElementById("panel-mensual");
  const selEd = document.getElementById("m-educador");

  panel.style.display = "block";
  selEd.innerHTML = `<option value="">Seleccione</option>`;

  const educadores = [...new Set(alumnos.map(a => a.educador))];
  educadores.forEach(e => selEd.innerHTML += `<option value="${e}">${e}</option>`);

  selEd.onchange = cargarGruposMensual;
}

function cargarGruposMensual() {
  const ed = document.getElementById("m-educador").value;
  const selGrupo = document.getElementById("m-grupo");

  const grupos = [...new Set(alumnos.filter(a => a.educador === ed).map(a => a.grupo))];

  selGrupo.innerHTML = `<option value="">Seleccione</option>`;
  grupos.forEach(g => selGrupo.innerHTML += `<option value="${g}">${g}</option>`);
}

function generarCalendario() {
  const educador = document.getElementById("m-educador").value;
  const grupo = document.getElementById("m-grupo").value;
  const mesInput = document.getElementById("m-mes").value;
  const cont = document.getElementById("calendario");

  if (!educador || !grupo || !mesInput) {
    alert("Seleccione educador, grupo y mes");
    return;
  }

  const [y, m] = mesInput.split("-").map(Number);

  const lista = registrosGuardados.filter(r => {
    const d = new Date(r.fecha);
    return r.educador === educador &&
           r.grupo === grupo &&
           d.getMonth() + 1 === m &&
           d.getFullYear() === y;
  });

  const diasMes = new Date(y, m, 0).getDate();
  let html = `<h4>Asistencia: ${mesInput} – ${educador} – Grupo ${grupo}</h4>`;
  html += `<table><tr>`;

  for (let dia = 1; dia <= diasMes; dia++) {
    const fecha = `${y}-${String(m).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const registros = lista.filter(r => r.fecha === fecha);

    let marca = registros.map(r => `<span class="asistencia-${r.asistencia}">${r.asistencia}</span>`).join("<br>");

    html += `<td><strong>${dia}</strong><br>${marca || "-"}</td>`;
    if (dia % 7 === 0) html += `</tr><tr>`;
  }

  html += `</tr></table>`;
  cont.innerHTML = html;
}
