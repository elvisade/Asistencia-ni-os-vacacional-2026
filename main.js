import { guardarAsistencia, leerMensual } from "./firebase.js";

const CSV_URL = "https://raw.githubusercontent.com/elvisade/Asistencia-ni-os-vacacional-2026/refs/heads/main/ninos.csv";

let alumnos = [];
let alumnosGrupo = [];
let mesSel, anioSel;
let educadorSel, grupoSel;
let cachedMensual = [];

init();

async function init() {
  await cargarCSV();
  cargarEducadores();
  cargarMeses();
  cargarAnios();
  document.getElementById("ver").onclick = verCalendario;
}

async function cargarCSV() {
  const t = await fetch(CSV_URL).then(r=>r.text());
  const filas = t.trim().split("\n").slice(1);
  filas.forEach(f=>{
    const [edu,gru,nom,ape]=f.split(",");
    alumnos.push({
      educador: edu.trim(),
      grupo: gru.trim(),
      nombre: `${nom.trim()} ${ape.trim()}`
    });
  });
}

function cargarEducadores(){
  const s = document.getElementById("educador");
  s.innerHTML = `<option value="">Educador...</option>`;
  [...new Set(alumnos.map(a=>a.educador))].forEach(e=>{
    s.innerHTML+=`<option>${e}</option>`;
  });
  s.onchange = cargarGrupos;
}

function cargarGrupos(){
  educadorSel = document.getElementById("educador").value;
  const s = document.getElementById("grupo");
  s.innerHTML = `<option value="">Grupo...</option>`;
  [...new Set(alumnos.filter(a=>a.educador===educadorSel).map(a=>a.grupo))]
    .forEach(g=> s.innerHTML+=`<option>${g}</option>`);
}

function cargarMeses(){
  const m = document.getElementById("mes");
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  meses.forEach((x,i)=> m.innerHTML += `<option value="${i+1}">${x}</option>`);
}

function cargarAnios(){
  const a = document.getElementById("anio");
  for(let n=2023;n<=2030;n++){
    a.innerHTML+=`<option>${n}</option>`;
  }
}

async function verCalendario(){
  educadorSel = document.getElementById("educador").value;
  grupoSel = document.getElementById("grupo").value;
  mesSel = Number(document.getElementById("mes").value);
  anioSel = Number(document.getElementById("anio").value);
  alumnosGrupo = alumnos.filter(a=>a.educador===educadorSel && a.grupo===grupoSel);
  cachedMensual = await leerMensual(educadorSel,grupoSel,mesSel,anioSel);
  renderCalendario();
}

function renderCalendario(){
  const cont = document.getElementById("calendario");
  cont.innerHTML="";
  const f = new Date(anioSel,mesSel-1,1);
  const offset = f.getDay();
  const ultimo = new Date(anioSel,mesSel,0).getDate();

  for(let i=0;i<offset;i++) cont.innerHTML+=`<div></div>`;

  for(let d=1; d<=ultimo; d++){
    cont.appendChild(renderDia(d));
  }
}

function renderDia(d){
  const div = document.createElement("div");
  div.className="dia";
  div.innerHTML = `<h4>${d}</h4>`;
  alumnosGrupo.forEach(al=>{
    const key = `${anioSel}-${pad(mesSel)}-${pad(d)}`;
    const reg = cachedMensual.find(r=>r.fecha===key && r.alumno===al.nombre);
    const val = reg ? reg.asistencia : "NO";
    div.innerHTML+=`<div class="${val}">${al.nombre.split(" ")[0]}: ${val}</div>`;
  });
  div.onclick=()=> abrirModal(d);
  return div;
}

function abrirModal(d){
  const fecha = `${anioSel}-${pad(mesSel)}-${pad(d)}`;
  document.getElementById("modal-fecha").innerText=fecha;
  const cont = document.getElementById("modal-lista");
  cont.innerHTML="";

  alumnosGrupo.forEach(al=>{
    const key = fecha;
    const reg = cachedMensual.find(r=>r.fecha===key && r.alumno===al.nombre);
    const val = reg ? reg.asistencia : "";
    cont.innerHTML+=`
      <div>
        ${al.nombre} 
        <select data-nombre="${al.nombre}">
          <option value="">-</option>
          <option value="A" ${val==="A"?"selected":""}>A</option>
          <option value="T" ${val==="T"?"selected":""}>T</option>
          <option value="J" ${val==="J"?"selected":""}>J</option>
          <option value="F" ${val==="F"?"selected":""}>F</option>
        </select>
      </div>`;
  });

  document.getElementById("guardar-modal").onclick=()=> guardarModal(fecha);
  document.getElementById("modal").style.display="flex";
}

async function guardarModal(fecha){
  const selects = [...document.querySelectorAll("#modal-lista select")];
  for(const s of selects){
    const val = s.value || "NO";
    await guardarAsistencia({
      fecha,
      asistencia: val,
      educador: educadorSel,
      grupo: grupoSel,
      alumno: s.dataset.nombre
    });
  }
  cachedMensual = await leerMensual(educadorSel,grupoSel,mesSel,anioSel);
  cerrarModal();
  renderCalendario();
}

function cerrarModal(){
  document.getElementById("modal").style.display="none";
}

function pad(x){ return x<10?"0"+x:x; }
