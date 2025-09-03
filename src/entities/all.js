export const getUserProfile = async (email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
};

export const updateUserProfile = async (email, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('email', email);
  return { data, error };
};
// Mock DB entities for local development
import { supabase } from '../utils/supabaseClient';

export const PotentialRefund = {
  async list() {
    // Return a mock list of refunds
    return [
      {
        id: 1,
        name: "החזר בדיקות דם",
        category: "בדיקות",
        description: "החזר עבור בדיקות דם שגרתיות",
        eligibility_rules: {
          min_age: 18,
          max_age: 99,
          gender: "any",
          requires_children: false
        },
        insurance_provider_pattern: "כללית|מכבי|מאוחדת|לאומית",
        required_documents: ["טופס בקשה", "הפניה מרופא"],
        max_refund_amount: 350
      }
    ];
  }
};


export const UserSubmission = {
  async filter({ user_email }) {
    // Return a mock list of submissions
    return [
      {
        id: 1,
        user_email,
        potential_refund_id: 1,
        potential_refund_name: "החזר בדיקות דם",
        status: "identified"
      }
    ];
  },
  async update(id, { status }) {
    // Mock update
    return { id, status };
  }
};

export const saveOrUpdateUserProfile = async (profileData) => {
    // profileData should include: email, full_name, date_of_birth, gender, children_ages, is_pregnant, planning_pregnancy, is_smoker, insurance_policy_id
    // Try to upsert (insert or update) the profile by email
    const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: ['email'] });
    return { data, error };
};
