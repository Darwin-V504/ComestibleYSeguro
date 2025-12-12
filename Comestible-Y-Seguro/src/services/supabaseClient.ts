
//tarea: implementar .env
//ahora el archivo .env se podrá usarse en la app, en donde toda la información que se use en AuthContext como 
//register y login deberían de guardar datos en el supabase creado

import { createClient } from "@supabase/supabase-js";

// Usar variables de entorno
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    //Si no lo encuentra o es distinto tirar error de que faltan detalles de Supabase
  throw new Error("Missing Supabase environment variables");
}
//exportar con createClient las constantes que guardan info del .env como string
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);