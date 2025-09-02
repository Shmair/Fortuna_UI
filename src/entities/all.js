// Mock DB entities for local development

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

export const User = {
  async me() {
    // Return a mock user
    return {
      id: 1,
      full_name: "משתמש לדוגמה",
      email: "demo@example.com",
      date_of_birth: "1990-01-01",
      gender: "female",
      children_ages: [5, 8],
      is_pregnant: false,
      planning_pregnancy: false,
      is_smoker: false,
      insurance_provider: "כללית"
    };
  },
  async updateMyUserData(data) {
    // Simulate update
    return { success: true, ...data };
  },
  async login() {
    // Simulate login
    window.alert("התחברת בהצלחה!");
  },
  async logout() {
    // Simulate logout
    window.alert("התנתקת בהצלחה!");
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
