const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/refs/heads/main/ninos.csv";

let alumnos = [];
let registrosGuardados = []; // Para simular la base de datos local

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
  educadores.forEach(e => {
    sel.innerHTML += `<option value="${e}">${e}</option>`;
  });

  sel.onchange = cargarTabla;
}

function cargarTabla() {
  const educador = document.getElementById("educador").value;
  const tbody = document.getElementById("tabla");
  tbody.innerHTML = "";

  alumnos.filter(a => a.educador === educador)
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

  if (!fecha || !educador) {
    alert("Seleccione educador y fecha");
    return;
  }

  alumnos.filter(a => a.educador === educador)
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

  console.table(registrosGuardados);
  alert("Asistencia registrada ✔ (ver consola para detalles)");
}

function verMensual() {
  const mes = prompt("Ingrese mes y año a consultar (MM/YYYY)", "01/2026");
  if (!mes) return;

  const [m, y] = mes.split("/").map(Number);
  if (!m || !y) { alert("Formato incorrecto"); return; }

  // Filtrar registros por mes y agrupar por grupo
  const porGrupo = {};

  registrosGuardados.forEach(r => {
    const fecha = new Date(r.fecha);
    if (fecha.getMonth() + 1 === m && fecha.getFullYear() === y) {
      if (!porGrupo[r.grupo]) porGrupo[r.grupo] = [];
      porGrupo[r.grupo].push(r);
    }
  });

  console.log(`=== Asistencia mensual ${mes} ===`);
  for (const grupo in porGrupo) {
    console.log(`Grupo: ${grupo}`);
    porGrupo[grupo].forEach(r => {
      console.log(`${r.fecha} - ${r.alumno} - ${r.asistencia}`);
    });
  }

  alert("Revisa la consola para ver asistencia mensual por grupo");
}
