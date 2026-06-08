import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdskkfdtosgfznjscemz.supabase.co";
const supabaseKey = "sb_publishable_2L0x5Jl2Jjh5tEbloAUNxA_aYHVeBET";

export const supabase = createClient(supabaseUrl, supabaseKey);