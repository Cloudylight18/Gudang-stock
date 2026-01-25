import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Pastikan dotenv dipanggil agar bisa membaca file .env
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Validasi: Jika variabel env kosong, hentikan aplikasi dengan pesan yang jelas
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase Environment Variables! Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ada di file .env"
  );
}

// Sekarang TypeScript tahu bahwa supabaseUrl dan supabaseKey pasti bertipe string
export const supabase = createClient(supabaseUrl, supabaseKey);