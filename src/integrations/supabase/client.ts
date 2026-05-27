import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hdskkfdtosgfznjscemz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2L0x5Jl2Jjh5tEbloAUNxA_aYHVeBET";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
