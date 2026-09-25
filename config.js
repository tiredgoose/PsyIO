// Global scoreboard settings (Supabase).
// Fill these in from your Supabase project: Project Settings -> API.
// The "anon" / publishable key is meant to be public; the database's
// row-level security (see supabase/schema.sql) decides what it may do.
// Leave them empty to run the game without a global scoreboard.
window.PSYIO_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",  // the long "anon public" key
};
