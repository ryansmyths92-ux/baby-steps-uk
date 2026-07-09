# Database setup

Run the files in `migrations/` **in order** (0001 → 0006) against your Supabase project.

Simplest way: open the Supabase dashboard → SQL Editor → paste each file's contents → Run, one at a time, in filename order.

(If you'd rather use the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
