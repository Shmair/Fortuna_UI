export const API_BASE = process.env.REACT_APP_API_BASE;
export const POLICY_CHAT = {
  API_URL: `${API_BASE}/api/policy/query`,
  BOT_GREETING: (userName) => `שלום ${userName ? userName + ', ' : ''}אני העוזר הדיגיטלי שלך. שאל אותי כל דבר על פוליסת הביטוח שלך.`,
  ERROR: 'מצטערים, אירעה שגיאה. נסה שוב.',
  TITLE: "צ'אט עם הפוליסה",
  DESCRIPTION: "שאל כל שאלה על הפוליסה שלך בשפה חופשית.",
  INPUT_PLACEHOLDER: "כתוב את שאלתך כאן...",
  BACK: "חזור"
};
