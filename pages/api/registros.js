import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { registro } = req.body;
    try {
      const { data, error } = await supabase
        .from('registros')
        .insert([registro]);
      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      const { error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end();
  }
}
