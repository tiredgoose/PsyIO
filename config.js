// Global scoreboard settings (Supabase).
// Fill these in from your Supabase project: Project Settings -> API Keys.
// Use the publishable key (sb_publishable_...), NEVER the secret key.
// The "anon" / publishable key is meant to be public; the database's
// row-level security (see supabase/schema.sql) decides what it may do.
// Leave them empty to run the game without a global scoreboard.
window.PSYIO_CONFIG = {
  supabaseUrl: "https://iyxnamfegwteltepzszu.supabase.co",
  supabaseAnonKey: "sb_publishable_12bxlIyUwXNbl9hNKuR8zg_SJAK0Ed2", // publishable (public) key
};
