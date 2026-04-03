import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjhxxncywdvprxgwscml.supabase.co';
const supabaseKey = 'sb_publishable_kSGWkvAv_BuTYe5VhfBCjw_gvLeZGuG';

export const supabase = createClient(supabaseUrl, supabaseKey);