import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// บรรทัดนี้จะช่วยเช็คใน Console (F12)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ หาค่า URL หรือ Key ในไฟล์ .env ไม่เจอครับ! เช็คตำแหน่งไฟล์และชื่อตัวแปรด้วย");
} else {
  console.log("✅ เชื่อมต่อ Supabase URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)