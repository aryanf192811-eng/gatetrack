const SUPABASE_URL = "https://ftmfgyrnvzrtavdizppm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bWZneXJudnpydGF2ZGl6cHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODkzMTYsImV4cCI6MjA4ODg2NTMxNn0.kj-auB8ION0ay3_6g5KA8FpKK8SKXK8nmFAuJHkEWF8";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);