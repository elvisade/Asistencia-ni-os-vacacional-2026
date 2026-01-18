const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/refs/heads/main/ninos.csv";

let alumnos = [];

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

  let registros = [];

  alumnos
    .filter(a => a.educador === educador)
    .forEach((a, i) => {
      const estado = document.getElementById(`a${i}`).value;
      if (estado) {
        registros.push({
          fecha,
          educador,
          alumno: a.nombre,
          grupo: a.grupo,
          asistencia: estado
        });
      }
    });

  console.table(registros);
  alert("Asistencia registrada (ver consola)");
}
