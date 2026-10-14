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
    // GET: Fetch all attendance logs
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST: Record check-in / check-out / break status
    if (req.method === 'POST') {
      const clientApiKey = req.headers['x-api-key'];

      if (!clientApiKey || clientApiKey !== process.env.CRM_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert([req.body])
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
