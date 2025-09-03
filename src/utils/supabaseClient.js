import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otvgkktadrdkyhbujynd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dmdra3RhZHJka3loYnVqeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDc2NDksImV4cCI6MjA3MjM4MzY0OX0.YuuCxIJRZX8OBRzYOGPTH5rGmHtLp6axwnq7Yv7t9O0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
