import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase environment variables on server.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { name, email, phone, position, role, stage, experience } = req.body;

      const payload = {
        name: name || 'Unnamed Candidate',
        email: email || '',
        phone: phone || '',
        position: position || role || 'Software Engineer',
        experience: experience || '0 Years Exp',
        stage: stage || 'Screening'
      };

      const { data, error } = await supabase
        .from('candidates')
        .insert([payload])
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}