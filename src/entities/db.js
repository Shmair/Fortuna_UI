import { supabase } from '../utils/supabaseClient';

// Example: get all users from 'profiles' table
export async function getAllUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data;
}

// Example: insert a new refund to 'potential_refunds' table
export async function addPotentialRefund(refund) {
  const { data, error } = await supabase.from('potential_refunds').insert([refund]);
  if (error) throw error;
  return data;
}

// Example: get all refunds
export async function getAllRefunds() {
  const { data, error } = await supabase.from('potential_refunds').select('*');
  if (error) throw error;
  return data;
}

// Example: update user profile
export async function updateUserProfile(id, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}
