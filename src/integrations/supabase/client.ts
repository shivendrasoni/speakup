// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uregithogychkkcmdxtq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZWdpdGhvZ3ljaGtrY21keHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNjk5MTcsImV4cCI6MjA1NDg0NTkxN30.uXZJIVO1bK82cSb5mAlKnBRIeAQmDk7T2Go7SvmS7Zg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);