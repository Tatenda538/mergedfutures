const SUPABASE_URL = 'https://bimxzxpamkrxdvieltsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbXh6eHBhbWtyeGR2aWVsdHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjAyMzAsImV4cCI6MjA5NzAzNjIzMH0.U4r48YoQM5-1Nouz227tgfMTvvgBPEv6X0-35pycWvI';

let _client = null;

function initClient() {
  if (_client) return _client;
  _client = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

export const supabase = initClient();
