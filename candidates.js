import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const clientApiKey = req.headers['x-api-key'];

      if (!clientApiKey || clientApiKey !== process.env.CRM_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
      }

      const { name, email, phone, position, role, stage, experience } = req.body;

      const payload = {
        name: name || 'Unnamed',
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
        console.error('Supabase Error:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Server Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}