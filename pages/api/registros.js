import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { registro } = req.body;
    const inter = registro.interacciones||[];
    const gf = inter.filter(x=>x.gravedad==="grave"&&x.frecuencia==="frecuente");
    const go = inter.filter(x=>x.gravedad==="grave"&&x.frecuencia==="ocasional");
    const d = new Date(registro.fecha);
    const fecha = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getFullYear()).slice(2)}`;
    const fila = {
      fecha,
      localizacion: registro.contexto||"",
      edad: registro.edad||null,
      sexo: registro.sexo||"",
      peso: registro.peso||null,
      fg: registro.fg||null,
      condicionantes: registro.condicionantes||"",
      n_farmacos: registro.medicamentos?.length||0,
      n_total_interacciones: inter.length,
      n_graves: registro.counts?.grave||0,
      n_moderadas: registro.counts?.moderada||0,
      n_leves: registro.counts?.leve||0,
      n_frecuentes: inter.filter(x=>x.frecuencia==="frecuente").length,
      n_ocasionales: inter.filter(x=>x.frecuencia==="ocasional").length,
      n_raras: inter.filter(x=>x.frecuencia==="rara").length,
      grave_frecuente_1: gf[0]?`${gf[0].farmaco1} + ${gf[0].farmaco2}`:"",
      grave_frecuente_2: gf[1]?`${gf[1].farmaco1} + ${gf[1].farmaco2}`:"",
      grave_frecuente_3: gf[2]?`${gf[2].farmaco1} + ${gf[2].farmaco2}`:"",
      grave_ocasional_1: go[0]?`${go[0].farmaco1} + ${go[0].farmaco2}`:"",
      grave_ocasional_2: go[1]?`${go[1].farmaco1} + ${go[1].farmaco2}`:"",
      grave_ocasional_3: go[2]?`${go[2].farmaco1} + ${go[2].farmaco2}`:"",
      cambio_medicacion: "",
      comentarios: "",
      medicamentos: registro.medicamentos||[],
      interacciones: registro.interacciones||[],
      resumen: registro.resumen||""
    };
    try {
      const { data, error } = await supabase.from('registros').insert([fila]);
      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('registros').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      const { error } = await supabase.from('registros').delete().eq('id', id);
      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end();
  }
}
