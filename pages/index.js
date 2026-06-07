import { useState, useRef, useEffect } from 'react';

const FARMACOS = ["Acenocumarol","Acido acetilsalicilico","Acido valproico","Allopurinol","Alprazolam","Amiodarona","Amitriptilina","Amlodipino","Amoxicilina","Atenolol","Atorvastatina","Azitromicina","Bisoprolol","Candesartan","Captopril","Carbamazepina","Carvedilol","Ciprofloxacino","Citalopram","Claritromicina","Clonazepam","Clopidogrel","Dabigatran","Digoxina","Diltiazem","Duloxetina","Enalapril","Escitalopram","Esomeprazol","Espironolactona","Fluconazol","Fluoxetina","Furosemida","Gabapentina","Ibuprofeno","Insulina","Lansoprazol","Levetiracetam","Levofloxacino","Levotiroxina","Lisinopril","Litio","Lorazepam","Losartan","Metformina","Metotrexato","Metoprolol","Metronidazol","Morfina","Naproxeno","Omeprazol","Oxcarbazepina","Paracetamol","Paroxetina","Fenitoina","Prednisona","Pregabalina","Propranolol","Quetiapina","Ramipril","Rifampicina","Risperidona","Rivaroxaban","Rosuvastatina","Sertralina","Simvastatina","Tacrolimus","Tramadol","Valsartan","Venlafaxina","Verapamilo","Warfarina","Zolpidem","Apixaban","Dapagliflozina","Empagliflozina","Semaglutida","Sitagliptina","Nebivolol","Telmisartan","Perindopril"];

const NIVEL = {
  grave: { bg:"#FCEBEB", border:"#E24B4A", text:"#791F1F", badge:"#F7C1C1", badgeText:"#501313", dot:"#E24B4A" },
  moderada: { bg:"#FAEEDA", border:"#EF9F27", text:"#633806", badge:"#FAC775", badgeText:"#412402", dot:"#EF9F27" },
  leve: { bg:"#EAF3DE", border:"#639922", text:"#27500A", badge:"#C0DD97", badgeText:"#173404", dot:"#639922" },
};
const LABEL = { grave:"Grave", moderada:"Moderada", leve:"Leve" };
const COLORES = { grave:"#E24B4A", moderada:"#EF9F27", leve:"#639922" };
function exportarCSV(registros) {
  const S = ";";
  const txt = v => `"${String(v===null||v===undefined?"":v).replace(/"/g,'""')}"`;
  const num = v => (v===null||v===undefined||v==="") ? "" : String(v);
  const fecha = ts => {
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`;
  };
  const cabecera = ["Codigo","Fecha","Localizacion","Edad","Sexo","Peso_kg","FG_mLmin","N_Farmacos","N_Total_Interacciones","N_Graves","N_Moderadas","N_Leves","N_Frecuentes","N_Ocasionales","N_Raras","Grave_Frecuente_1","Grave_Frecuente_2","Grave_Frecuente_3","Grave_Ocasional_1","Grave_Ocasional_2","Grave_Ocasional_3","Cambio_Medicacion","Comentarios"].map(txt).join(S);
  const filas = registros.map((r,i) => {
    const inter = r.interacciones||[];
    const gf = inter.filter(x=>x.gravedad==="grave"&&x.frecuencia==="frecuente");
    const go = inter.filter(x=>x.gravedad==="grave"&&x.frecuencia==="ocasional");
    const par = x => txt(`${x.farmaco1} + ${x.farmaco2}`);
    return [txt(String(i+1).padStart(3,"0")),txt(fecha(r.fecha)),txt(r.contexto||""),num(r.edad),txt(r.sexo||""),num(r.peso),num(r.fg),num(r.medicamentos?.length||0),num(inter.length),num(r.counts?.grave||0),num(r.counts?.moderada||0),num(r.counts?.leve||0),num(inter.filter(x=>x.frecuencia==="frecuente").length),num(inter.filter(x=>x.frecuencia==="ocasional").length),num(inter.filter(x=>x.frecuencia==="rara").length),gf[0]?par(gf[0]):txt(""),gf[1]?par(gf[1]):txt(""),gf[2]?par(gf[2]):txt(""),go[0]?par(go[0]):txt(""),go[1]?par(go[1]):txt(""),go[2]?par(go[2]):txt(""),txt(""),txt("")].join(S);
  });
  const contenido = ["sep=;",cabecera,...filas].join("\r\n");
  const blob = new Blob(["\uFEFF"+contenido],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=`interacciones_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function FarmacoInput({ value, onChange, placeholder }) {
  const [sugs, setSugs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handle = v => {
    onChange(v);
    if (v.length >= 2) { setSugs(FARMACOS.filter(f=>f.toLowerCase().includes(v.toLowerCase())).slice(0,8)); setOpen(true); }
    else setOpen(false);
  };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <input value={value} onChange={e=>handle(e.target.value)} onFocus={()=>value.length>=2&&setOpen(true)} placeholder={placeholder} style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/>
      {open&&sugs.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #ddd",borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,.1)",zIndex:100,maxHeight:180,overflowY:"auto",marginTop:2}}>
          {sugs.map((s,i)=><div key={i} style={{padding:"8px 12px",fontSize:13,cursor:"pointer",color:"#333"}} onMouseDown={()=>{onChange(s);setOpen(false);}}>{s}</div>)}
        </div>
      )}
    </div>
  );
}
export default function App() {
  const [tab, setTab] = useState("analisis");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [peso, setPeso] = useState("");
  const [fg, setFg] = useState("");
  const [otros, setOtros] = useState("");
  const [contexto, setContexto] = useState("");
  const [meds, setMeds] = useState([{nombre:"",dosis:"",frecuencia:"",via:""},{nombre:"",dosis:"",frecuencia:"",via:""}]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandido, setExpandido] = useState({});
  const [registros, setRegistros] = useState([]);
  const [imagen1, setImagen1] = useState(null);
  const [imagen2, setImagen2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [extrayendo, setExtrayendo] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
useEffect(() => { cargarRegistros(); }, []);

  const cargarRegistros = async () => {
    try {
      const res = await fetch("/api/registros");
      const data = await res.json();
      if(data.data) setRegistros(data.data);
    } catch(e) { console.error(e); }
  };
  const addMed = () => setMeds([...meds,{nombre:"",dosis:"",frecuencia:"",via:""}]);
  const delMed = i => setMeds(meds.filter((_,idx)=>idx!==i));
  const upd = (i,f,v) => { const a=[...meds]; a[i][f]=v; setMeds(a); };
  const toggle = k => setExpandido(e=>({...e,[k]:!e[k]}));

  const nuevaConsulta = () => {
    setEdad(""); setSexo(""); setPeso(""); setFg(""); setOtros(""); setContexto("");
    setMeds([{nombre:"",dosis:"",frecuencia:"",via:""},{nombre:"",dosis:"",frecuencia:"",via:""}]);
    setResultado(null); setError(null); setExpandido({});
    setImagen1(null); setImagen2(null); setPreview1(null); setPreview2(null);
  };

  const handleImg = (e, num) => {
    const file = e.target.files[0]; if(!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const jpeg = canvas.toDataURL('image/jpeg', 0.85);
      const data = jpeg.split(',')[1];
      URL.revokeObjectURL(objectUrl);
      if(num===1){ setImagen1({data, mediaType:'image/jpeg'}); setPreview1(jpeg); }
      else { setImagen2({data, mediaType:'image/jpeg'}); setPreview2(jpeg); }
    };
    img.src = objectUrl;
  };

  const extraerMedicamentos = async () => {
    if(!imagen1&&!imagen2) return;
    setExtrayendo(true); setError(null); setResultado(null);
    try {
      const todos = [];
      for(const img of [imagen1,imagen2].filter(Boolean)) {
        const res = await fetch("/api/analyze", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            prompt: "Extrae TODOS los medicamentos que aparecen en esta imagen sin excepcion. Incluye cada farmaco que veas aunque sea dificil de leer. Devuelve UNICAMENTE un array JSON (sin markdown ni texto adicional): [{\"nombre\":\"\",\"dosis\":\"\",\"frecuencia\":\"\",\"via\":\"\"}]. Si no puedes leer algun campo dejalo vacio. Solo el JSON.",
            imagen: img.data,
            mediaType: img.mediaType
          })
        });
        const data = await res.json();
        const text = data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(text);
        if(Array.isArray(parsed)) todos.push(...parsed);
      }
      const filtrados = todos.filter(m=>m.nombre?.trim());
      if(filtrados.length>0) {
        setMeds(filtrados);
        setImagen1(null); setImagen2(null); setPreview1(null); setPreview2(null);
      } else setError("No se detectaron medicamentos. Intenta con otra foto mas clara.");
    } catch(e) { setError("Error al procesar la imagen: "+e.message); }
    setExtrayendo(false);
  };
  const analizar = async () => {
    const mv = meds.filter(m=>m.nombre.trim());
    if(mv.length<2){setError("Añade al menos 2 medicamentos.");return;}
    if(!edad){setError("La edad es obligatoria.");return;}
    setError(null); setLoading(true); setResultado(null);
    const perfil = `Edad: ${edad} años${sexo?`, Sexo: ${sexo}`:""}${peso?`, Peso: ${peso} kg`:""}${fg?`, FG: ${fg} mL/min`:""}${contexto?`, Contexto: ${contexto}`:""}${otros?`, Condicionantes: ${otros}`:""}`;
    const lista = mv.map(m=>`- ${m.nombre}${m.dosis?" "+m.dosis:""}${m.frecuencia?" "+m.frecuencia:""}${m.via?" via "+m.via:""}`).join("\n");
    const prompt = `Eres un sistema clinico de analisis de interacciones farmacologicas. Analiza las interacciones entre los siguientes medicamentos para un paciente con el perfil indicado.\n\nPERFIL: ${perfil}\n\nMEDICAMENTOS:\n${lista}\n\nDevuelve UNICAMENTE un objeto JSON valido (sin markdown):\n{"resumen":"resumen clinico 2-3 frases","interacciones":[{"farmaco1":"nombre","farmaco2":"nombre","gravedad":"grave","mecanismo":"mecanismo","consecuencia":"consecuencia clinica","recomendacion":"recomendacion","frecuencia":"rara","referencias":["Ref1","Ref2","Ref3"]}],"alertas_paciente":["alerta"]}\n\nGravedad: exactamente grave, moderada o leve. Frecuencia: rara, ocasional o frecuente. Incluye hasta 3 referencias por interaccion. Solo incluye pares con interaccion relevante.`;
    try {
      const res = await fetch("/api/analyze", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data = await res.json();
      const text = data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(text);
      setResultado(parsed);
      const counts = {grave:0,moderada:0,leve:0};
      parsed.interacciones?.forEach(i=>{if(counts[i.gravedad]!==undefined)counts[i.gravedad]++;});
      const nuevoRegistro = {fecha:Date.now(),edad:parseInt(edad)||null,sexo:sexo||null,peso:parseFloat(peso)||null,fg:parseFloat(fg)||null,contexto:contexto||null,condicionantes:otros||null,medicamentos:mv.map(m=>m.nombre),interacciones:parsed.interacciones||[],counts,resumen:parsed.resumen};
      setRegistros(prev=>[...prev,nuevoRegistro]);
      fetch("/api/registros",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({registro:nuevoRegistro})});
    } catch(e) { setError("Error al analizar. Comprueba tu conexion."); }
    setLoading(false);
  };
const exportarPDF = () => {
    const fecha = new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const interHtml = ["grave","moderada","leve"].map(nivel=>{
      const items = resultado.interacciones?.filter(i=>i.gravedad===nivel)||[];
      if(!items.length) return "";
      const c={grave:"#E24B4A",moderada:"#EF9F27",leve:"#639922"};
      const bg={grave:"#FCEBEB",moderada:"#FAEEDA",leve:"#EAF3DE"};
      const label={grave:"GRAVE",moderada:"MODERADA",leve:"LEVE"};
      return `<h3 style="color:${c[nivel]};font-size:12px;margin:14px 0 6px;text-transform:uppercase;">${label[nivel]}</h3>`
        +items.map(i=>`<div style="background:${bg[nivel]};border-left:3px solid ${c[nivel]};border-radius:6px;padding:10px 12px;margin-bottom:7px;">
          <p style="font-weight:700;font-size:12px;margin:0 0 5px;color:${c[nivel]}">${i.farmaco1} + ${i.farmaco2} <span style="font-weight:400;font-size:10px">(${i.frecuencia})</span></p>
          <p style="font-size:11px;margin:0 0 2px;color:#333"><strong>Mecanismo:</strong> ${i.mecanismo}</p>
          <p style="font-size:11px;margin:0 0 2px;color:#333"><strong>Consecuencia:</strong> ${i.consecuencia}</p>
          <p style="font-size:11px;margin:0 0 2px;color:#333"><strong>Recomendacion:</strong> ${i.recomendacion}</p>
          ${i.referencias?.length?`<p style="font-size:10px;margin:4px 0 0;color:#666"><strong>Referencias:</strong> ${i.referencias.slice(0,3).join(" · ")}</p>`:""}
        </div>`).join("");
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe Interacciones</title>
    <style>body{font-family:Arial,sans-serif;color:#222;max-width:700px;margin:0 auto;padding:20px;font-size:12px;}
    h1{font-size:17px;color:#185FA5;margin:0 0 3px;}table{width:100%;border-collapse:collapse;margin:8px 0;}
    td,th{border:1px solid #e5e7eb;padding:6px 10px;font-size:11px;}th{background:#f0f7ff;color:#185FA5;font-weight:700;}
    .footer{font-size:9px;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:8px;}</style></head><body>
    <h1>Informe de Interacciones Farmacologicas</h1>
    <p style="color:#888;font-size:10px;margin:0 0 14px;">Generado: ${fecha}${contexto?" · Contexto: "+contexto:""}</p>
    <h3 style="font-size:12px;color:#333;margin:0 0 6px;text-transform:uppercase;">Perfil del paciente</h3>
    <table><tr><th>Edad</th><th>Sexo</th><th>Peso</th><th>FG</th><th>Condicionantes</th></tr>
    <tr><td>${edad||"—"}</td><td>${sexo||"—"}</td><td>${peso||"—"} kg</td><td>${fg||"—"} mL/min</td><td>${otros||"—"}</td></tr></table>
    <h3 style="font-size:12px;color:#333;margin:10px 0 6px;text-transform:uppercase;">Medicacion analizada</h3>
    <table><tr><th>Farmaco</th><th>Dosis</th><th>Frecuencia</th><th>Via</th></tr>
    ${meds.filter(m=>m.nombre.trim()).map(m=>`<tr><td>${m.nombre}</td><td>${m.dosis||"—"}</td><td>${m.frecuencia||"—"}</td><td>${m.via||"—"}</td></tr>`).join("")}</table>
    <h3 style="font-size:12px;color:#333;margin:10px 0 6px;text-transform:uppercase;">Resumen</h3>
    <p style="font-size:11px;line-height:1.6;margin:0 0 8px;">${resultado.resumen}</p>
    ${interHtml}
    <div class="footer">Herramienta de apoyo clinico. No sustituye el criterio del profesional sanitario.</div>
    </body></html>`;
    const blob = new Blob([html],{type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`informe_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
   const eliminarRegistro = async (i, id) => {
    setRegistros(prev=>prev.filter((_,idx)=>idx!==i));
    setConfirmDelete(null);
    if(id) {
      try {
        await fetch("/api/registros",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
      } catch(e) { console.error(e); }
    }
  };
  const counts = {grave:0,moderada:0,leve:0};
  resultado?.interacciones?.forEach(i=>{if(counts[i.gravedad]!==undefined)counts[i.gravedad]++;});
  return (
    <div style={{maxWidth:680,margin:"0 auto",fontFamily:"system-ui,sans-serif",background:"#f8f9fb",minHeight:"100vh"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#185FA5,#378ADD)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3H15M12 3V9M8 9H16C17.1 9 18 9.9 18 11V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V11C6 9.9 6.9 9 8 9Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 15H15M12 12V18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <div style={{flex:1}}>
          <h1 style={{fontSize:16,fontWeight:600,margin:"0 0 1px",color:"#111"}}>Interacciones farmacologicas</h1>
          <p style={{fontSize:11,color:"#888",margin:0}}>Analisis clinico con IA</p>
        </div>
        <div style={{background:"#E6F1FB",border:"1px solid #B5D4F4",borderRadius:20,padding:"4px 12px"}}>
          <span style={{fontSize:12,fontWeight:600,color:"#185FA5"}}>{registros.length} analisis</span>
        </div>
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex"}}>
        {[["analisis","Analisis"],["dashboard","Dashboard"],["admin","Admin"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"10px 4px",border:"none",background:"transparent",fontSize:13,fontWeight:500,cursor:"pointer",borderBottom:`2px solid ${tab===v?"#185FA5":"transparent"}`,color:tab===v?"#185FA5":"#888"}}>{l}</button>
        ))}
      </div>

      <div style={{padding:"1.25rem 1rem"}}>
        {tab==="analisis"&&(
          <>
            <div style={{background:"#E6F1FB",border:"1px solid #B5D4F4",borderRadius:12,padding:"10px 14px",marginBottom:"1rem"}}>
              <p style={{fontSize:11,color:"#0C447C",margin:0}}><strong>Aviso legal:</strong> Apoyo a la decision clinica. No sustituye el criterio del profesional sanitario. Verificar con Micromedex, ficha tecnica o Vademecum.</p>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>
              {(resultado||edad)&&<button onClick={nuevaConsulta} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>✚ Nueva consulta</button>}
             {resultado&&<button onClick={()=>exportarCSV(registros)} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>⬇ CSV</button>}
{resultado&&<button onClick={exportarPDF} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>🖨 PDF</button>}
            <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
              {[["🚨","Urgencias","#E24B4A","#FCEBEB","#F7C1C1"],["🛏","Ingreso","#EF9F27","#FAEEDA","#FAC775"],["🏠","Alta","#639922","#EAF3DE","#C0DD97"]].map(([icon,label,color,bg,border])=>{
                const active=contexto===label;
                return(<button key={label} onClick={()=>setContexto(active?"":label)} style={{flex:1,padding:"10px 8px",border:`1.5px solid ${active?color:border}`,borderRadius:10,background:active?bg:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:20}}>{icon}</span>
                  <span style={{fontSize:12,fontWeight:600,color:active?color:"#666"}}>{label}</span>
                </button>);
              })}
            </div>

            <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"1.25rem",marginBottom:"1rem"}}>
              <h2 style={{fontSize:13,fontWeight:600,margin:"0 0 12px",color:"#111"}}>Perfil del paciente</h2>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:5}}>EDAD *</label><input type="number" value={edad} onChange={e=>setEdad(e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
                <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:5}}>SEXO</label>
                  <div style={{display:"flex",gap:6}}>
                    {["M","F"].map(v=><button key={v} onClick={()=>setSexo(sexo===v?"":v)} style={{flex:1,padding:"9px 0",border:`1.5px solid ${sexo===v?"#185FA5":"#ddd"}`,borderRadius:8,background:sexo===v?"#E6F1FB":"#fff",color:sexo===v?"#185FA5":"#666",fontWeight:sexo===v?700:400,fontSize:13,cursor:"pointer"}}>{v}</button>)}
                  </div>
                </div>
                <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:5}}>PESO</label><input type="number" value={peso} onChange={e=>setPeso(e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
                <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:5}}>FG</label><input type="number" value={fg} onChange={e=>setFg(e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
              </div>
              <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:5}}>OTROS CONDICIONANTES</label><input type="text" value={otros} onChange={e=>setOtros(e.target.value)} placeholder="Insuficiencia hepatica, embarazo, alergias..." style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
            </div>

            <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"1.25rem",marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
                <h2 style={{fontSize:13,fontWeight:600,margin:0,color:"#111"}}>Medicamentos prescritos</h2>
                <span style={{marginLeft:"auto",fontSize:11,color:"#888"}}>{meds.filter(m=>m.nombre.trim()).length} con nombre</span>
              </div>
              {meds.map((m,i)=>(
                <div key={i} style={{background:"#f8f9fb",borderRadius:10,padding:"12px",marginBottom:8,border:"1px solid #e5e7eb"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#555"}}>{m.nombre||`Medicamento ${i+1}`}</span>
                    {meds.length>2&&<button onClick={()=>delMed(i)} style={{background:"transparent",border:"none",color:"#A32D2D",cursor:"pointer"}}>✕</button>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8}}>
                    <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>PRINCIPIO ACTIVO</label><FarmacoInput value={m.nombre} onChange={v=>upd(i,"nombre",v)} placeholder=""/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>DOSIS</label><input value={m.dosis} onChange={e=>upd(i,"dosis",e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>FRECUENCIA</label><input value={m.frecuencia} onChange={e=>upd(i,"frecuencia",e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:"#555",display:"block",marginBottom:4}}>VIA</label><input value={m.via} onChange={e=>upd(i,"via",e.target.value)} placeholder="" style={{width:"100%",boxSizing:"border-box",border:"1px solid #ddd",borderRadius:8,padding:"9px 12px",fontSize:13,outline:"none"}}/></div>
                  </div>
                </div>
              ))}
              <button onClick={addMed} style={{background:"transparent",border:"1px dashed #ccc",borderRadius:8,padding:"9px 16px",fontSize:13,color:"#666",cursor:"pointer",width:"100%",marginBottom:12}}>+ Añadir medicamento</button>

              <div style={{borderTop:"1px solid #e5e7eb",paddingTop:12}}>
                <p style={{fontSize:11,fontWeight:600,color:"#555",margin:"0 0 8px",textTransform:"uppercase"}}>📷 Importar desde imagen</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[[preview1,"Imagen 1 (receta)",e=>handleImg(e,1),()=>{setImagen1(null);setPreview1(null);}],[preview2,"Imagen 2 (segunda pagina)",e=>handleImg(e,2),()=>{setImagen2(null);setPreview2(null);}]].map(([preview,label,handler,clear],idx)=>(
                    <div key={idx}>
                      {!preview?(
                        <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,background:"#f0f7ff",border:"1px dashed #378ADD",borderRadius:8,padding:"10px 6px",cursor:"pointer",fontSize:11,color:"#185FA5",fontWeight:500,textAlign:"center",minHeight:60}}>
                          📷 {label}<input type="file" accept="image/jpeg,image/png,image/jpg" style={{display:"none"}} onChange={handler}/>
                        </label>
                      ):(
                        <div style={{background:"#f8f9fb",borderRadius:8,padding:6,border:"1px solid #e5e7eb"}}>
                          <img src={preview} alt="preview" style={{width:"100%",maxHeight:80,objectFit:"contain",borderRadius:4,marginBottom:4}}/>
                          <button onClick={clear} style={{width:"100%",background:"transparent",border:"none",fontSize:11,color:"#888",cursor:"pointer"}}>✕ Quitar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {(imagen1||imagen2)&&(
                  <button onClick={extraerMedicamentos} disabled={extrayendo} style={{background:extrayendo?"#B5D4F4":"#185FA5",color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontSize:13,cursor:"pointer",width:"100%",marginTop:8}}>
                    {extrayendo?"Extrayendo...":"✨ Extraer medicamentos de las imagenes"}
                  </button>
                )}
              </div>
            </div>

            {error&&<div style={{background:"#FCEBEB",border:"1px solid #E24B4A",borderRadius:10,padding:"10px 14px",marginBottom:12}}><p style={{fontSize:13,color:"#791F1F",margin:0}}>{error}</p></div>}

            <button onClick={analizar} disabled={loading} style={{background:loading?"#B5D4F4":"#185FA5",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontSize:15,fontWeight:500,cursor:loading?"not-allowed":"pointer",width:"100%",marginBottom:"1.5rem"}}>
              {loading?"Analizando...":"Analizar interacciones →"}
            </button>

            {resultado&&(
              <div>
                <div style={{display:"flex",gap:10,marginBottom:"1rem",flexWrap:"wrap"}}>
                  {[["grave","#FCEBEB","#E24B4A","#791F1F"],["moderada","#FAEEDA","#EF9F27","#633806"],["leve","#EAF3DE","#639922","#27500A"]].map(([n,bg,border,txt])=>(
                    <div key={n} style={{background:bg,border:`1px solid ${border}`,borderRadius:12,padding:"12px 16px",flex:1,textAlign:"center"}}>
                      <p style={{fontSize:20,fontWeight:600,margin:"0 0 2px",color:txt}}>{counts[n]}</p>
                      <p style={{fontSize:10,fontWeight:600,margin:0,color:txt,textTransform:"uppercase"}}>{LABEL[n]}</p>
                    </div>
                  ))}
                </div>
                <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",borderLeft:"3px solid #378ADD"}}>
                  <p style={{fontSize:11,fontWeight:600,color:"#555",margin:"0 0 6px",textTransform:"uppercase"}}>Valoracion global</p>
                  <p style={{fontSize:14,color:"#222",margin:0,lineHeight:1.65}}>{resultado.resumen}</p>
                </div>
                {resultado.alertas_paciente?.length>0&&(
                  <div style={{background:"#FAEEDA",border:"1px solid #EF9F27",borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
                    <p style={{fontSize:11,fontWeight:600,color:"#633806",margin:"0 0 8px",textTransform:"uppercase"}}>Alertas</p>
                    {resultado.alertas_paciente.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:"#EF9F27"}}>▲</span><p style={{fontSize:13,color:"#633806",margin:0}}>{a}</p></div>))}
                  </div>
                )}
                {["grave","moderada","leve"].map(nivel=>{
                  const items=resultado.interacciones?.filter(i=>i.gravedad===nivel)||[];
                  if(!items.length)return null;
                  const c=NIVEL[nivel];
                  return(<div key={nivel} style={{marginBottom:"1.25rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>
                      <h3 style={{fontSize:12,fontWeight:600,margin:0,color:c.text,textTransform:"uppercase"}}>{LABEL[nivel]} — {items.length} interaccion{items.length>1?"es":""}</h3>
                    </div>
                    {items.map((inter,idx)=>{
                      const key=`${nivel}-${idx}`;const open=expandido[key]!==false;
                      return(<div key={idx} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:14,padding:"1rem",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>toggle(key)}>
                          <div style={{flex:1}}>
                            <span style={{fontSize:13,fontWeight:600,color:c.text}}>{inter.farmaco1}</span>
                            <span style={{color:c.dot,margin:"0 6px"}}>→</span>
                            <span style={{fontSize:13,fontWeight:600,color:c.text}}>{inter.farmaco2}</span>
                            <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:c.badge,color:c.badgeText,marginLeft:8}}>{inter.frecuencia}</span>
                          </div>
                          <span style={{color:c.text}}>{open?"▲":"▼"}</span>
                        </div>
                        {open&&(<div style={{marginTop:10,display:"grid",gap:8,borderTop:`1px solid ${c.border}`,paddingTop:10}}>
                          {[["Mecanismo",inter.mecanismo],["Consecuencia",inter.consecuencia]].map(([l,v])=>(<div key={l}><p style={{fontSize:10,fontWeight:600,color:c.text,margin:"0 0 2px",textTransform:"uppercase",opacity:.7}}>{l}</p><p style={{fontSize:12,color:c.text,margin:0,lineHeight:1.5}}>{v}</p></div>))}
                          <div style={{background:"rgba(255,255,255,.6)",borderRadius:8,padding:"8px 10px"}}>
                            <p style={{fontSize:10,fontWeight:600,color:c.text,margin:"0 0 2px",textTransform:"uppercase",opacity:.7}}>Recomendacion</p>
                            <p style={{fontSize:12,color:c.text,margin:0,lineHeight:1.5}}>{inter.recomendacion}</p>
                          </div>
                          {inter.referencias?.length>0&&(
                            <div style={{background:"rgba(255,255,255,.4)",borderRadius:8,padding:"8px 10px"}}>
                              <p style={{fontSize:10,fontWeight:600,color:c.text,margin:"0 0 6px",textTransform:"uppercase",opacity:.7}}>📚 Referencias</p>
                              {inter.referencias.slice(0,3).map((r,ri)=>(<div key={ri} style={{display:"flex",gap:6,marginBottom:4}}><span style={{fontSize:11,color:c.text,opacity:.6,fontWeight:600}}>{ri+1}.</span><p style={{fontSize:11,color:c.text,margin:0,lineHeight:1.45}}>{r}</p></div>))}
                            </div>
                          )}
                        </div>)}
                      </div>);
                    })}
                  </div>);
                })}
              </div>
            )}
        )}
{tab==="dashboard"&&(
          <div>
            {registros.length===0?(
              <div style={{textAlign:"center",padding:"3rem",color:"#888"}}>
                <div style={{fontSize:40,marginBottom:12}}>📊</div>
                <p style={{fontSize:15,fontWeight:500,color:"#555",margin:"0 0 6px"}}>Sin datos todavia</p>
                <p style={{fontSize:13,margin:0}}>Realiza el primer analisis para ver estadisticas.</p>
              </div>
            ):(
              <>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                  <button onClick={()=>exportarCSV(registros)} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>⬇ Exportar CSV</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:"1rem"}}>
                  {[["Analisis",registros.length,"#185FA5","#E6F1FB"],["Interacciones",registros.reduce((a,r)=>a+(r.interacciones?.length||0),0),"#791F1F","#FCEBEB"],["Edad media",Math.round(registros.filter(r=>r.edad).reduce((a,r)=>a+r.edad,0)/registros.filter(r=>r.edad).length)||0,"#27500A","#EAF3DE"]].map(([l,v,txt,bg])=>(
                    <div key={l} style={{background:bg,borderRadius:12,padding:"14px",textAlign:"center"}}>
                      <p style={{fontSize:22,fontWeight:600,margin:"0 0 2px",color:txt}}>{v}</p>
                      <p style={{fontSize:10,fontWeight:600,margin:0,color:txt,textTransform:"uppercase"}}>{l}</p>
                    </div>
                  ))}
                </div>
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
                  <p style={{fontSize:13,fontWeight:600,color:"#333",margin:"0 0 10px"}}>Distribucion por gravedad</p>
                  {["grave","moderada","leve"].map(n=>{
                    const total=registros.reduce((a,r)=>a+(r.interacciones?.length||0),0);
                    const v=registros.reduce((a,r)=>a+(r.counts?.[n]||0),0);
                    const pct=total?Math.round(v/total*100):0;
                    return(<div key={n} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{width:70,fontSize:12,fontWeight:500,color:COLORES[n]}}>{LABEL[n]}</span>
                      <div style={{flex:1,background:"#f0f0f0",borderRadius:4,height:8,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:COLORES[n],borderRadius:4}}/></div>
                      <span style={{width:52,fontSize:12,color:"#555",textAlign:"right"}}>{v} ({pct}%)</span>
                    </div>);
                  })}
                </div>
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"1rem"}}>
                  <p style={{fontSize:13,fontWeight:600,color:"#333",margin:"0 0 12px"}}>Ultimos registros</p>
                  {[...registros].reverse().slice(0,10).map((r,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<9?"1px solid #f0f0f0":"none"}}>
                      <div style={{flex:1}}>
                        <p style={{fontSize:12,fontWeight:500,color:"#333",margin:"0 0 2px"}}>{r.medicamentos?.join(", ")||"—"}</p>
                        <p style={{fontSize:11,color:"#888",margin:0}}>{r.edad}{r.sexo?` · ${r.sexo}`:""}{r.contexto?` · ${r.contexto}`:""}</p>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        {["grave","moderada","leve"].map(n=>r.counts?.[n]>0&&(<span key={n} style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:10,background:NIVEL[n].badge,color:NIVEL[n].badgeText}}>{r.counts[n]}{n[0].toUpperCase()}</span>))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab==="admin"&&(
          <div>
            {!adminOk?(
              <div style={{maxWidth:320,margin:"3rem auto",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>🔒</div>
                <p style={{fontSize:15,fontWeight:600,color:"#333",margin:"0 0 6px"}}>Acceso restringido</p>
                <p style={{fontSize:13,color:"#888",margin:"0 0 20px"}}>Introduce la contrasena de administrador</p>
                <input type="password" value={adminPass} onChange={e=>{setAdminPass(e.target.value);setAdminError(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(adminPass==="Medicina2026")setAdminOk(true);else setAdminError(true);}}} placeholder="Contrasena" style={{width:"100%",boxSizing:"border-box",border:`1px solid ${adminError?"#E24B4A":"#ddd"}`,borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",marginBottom:8,textAlign:"center"}}/>
                {adminError&&<p style={{fontSize:12,color:"#E24B4A",margin:"0 0 10px"}}>Contrasena incorrecta</p>}
                <button onClick={()=>{if(adminPass==="Medicina2026")setAdminOk(true);else setAdminError(true);}} style={{background:"#185FA5",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontSize:14,fontWeight:500,cursor:"pointer",width:"100%"}}>Acceder</button>
              </div>
            ):(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
                  <div>
                    <p style={{fontSize:15,fontWeight:600,color:"#333",margin:"0 0 2px"}}>Gestion de registros</p>
                    <p style={{fontSize:12,color:"#888",margin:0}}>{registros.length} registro{registros.length!==1?"s":""} en esta sesion</p>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {registros.length>0&&<button onClick={()=>exportarCSV(registros)} style={{background:"#f0f0f0",border:"1px solid #ddd",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>⬇ CSV</button>}
                    <button onClick={()=>{setAdminOk(false);setAdminPass("");}} style={{fontSize:12,color:"#888",background:"transparent",border:"1px solid #ddd",borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>Cerrar sesion</button>
                  </div>
                </div>
                {registros.length===0?(
                  <div style={{textAlign:"center",padding:"3rem",color:"#888"}}><div style={{fontSize:36,marginBottom:10}}>📭</div><p>No hay registros en esta sesion.</p></div>
                ):[...registros].reverse().map((r,i)=>{
                  const realIdx=registros.length-1-i;
                  const fd=new Date(r.fecha);
                  const fecha=`${String(fd.getDate()).padStart(2,"0")}/${String(fd.getMonth()+1).padStart(2,"0")}/${String(fd.getFullYear()).slice(2)}`;
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                            {r.contexto&&<span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10,background:"#E6F1FB",color:"#185FA5"}}>{r.contexto}</span>}
                            {["grave","moderada","leve"].map(n=>r.counts?.[n]>0&&(<span key={n} style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10,background:NIVEL[n].badge,color:NIVEL[n].badgeText}}>{r.counts[n]} {LABEL[n].toLowerCase()}{r.counts[n]>1?"s":""}</span>))}
                          </div>
                          <p style={{fontSize:13,fontWeight:500,color:"#333",margin:"0 0 2px"}}>{r.medicamentos?.join(", ")||"—"}</p>
                          <p style={{fontSize:11,color:"#888",margin:0}}>{r.edad}{r.sexo?` · ${r.sexo}`:""}{r.peso?` · ${r.peso}kg`:""}{r.fg?` · FG ${r.fg}`:""}</p>
                          <p style={{fontSize:11,color:"#aaa",margin:"3px 0 0"}}>📅 {fecha}</p>
                        </div>
                        {confirmDelete===realIdx?(
                          <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                            <p style={{fontSize:11,color:"#791F1F",margin:"0 0 4px",fontWeight:500}}>Confirmar?</p>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>eliminarRegistro(realIdx,r.id)}  style={{fontSize:11,padding:"4px 10px",background:"#E24B4A",color:"#fff",border:"none",borderRadius:6,cursor:"pointer"}}>Eliminar</button>
                              <button onClick={()=>setConfirmDelete(null)} style={{fontSize:11,padding:"4px 10px",background:"#f0f0f0",color:"#555",border:"none",borderRadius:6,cursor:"pointer"}}>Cancelar</button>
                            </div>
                          </div>
                        ):<button onClick={()=>setConfirmDelete(realIdx)} style={{fontSize:11,padding:"5px 10px",background:"#FCEBEB",color:"#A32D2D",border:"1px solid #F7C1C1",borderRadius:8,cursor:"pointer"}}>🗑 Eliminar</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
