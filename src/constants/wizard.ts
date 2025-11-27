export const WIZARD_TITLE = 'בדיקת החזר ביטוח';
export const WIZARD_DESCRIPTION = 'מלא את הפרטים והעלה את הפוליסה שלך';
export const LOCALSTORAGE_EMAIL = 'user_email';

// Import API constants from dedicated file
export { API_ENDPOINTS, HEADERS } from './api';

export const ERRORS = {
    MISSING_EMAIL: "חסר אימייל: אנא הזן כתובת אימייל תקינה.",
    MISSING_USER_ID: "לא נמצא מזהה משתמש. אנא התחבר מחדש.",
    PROFILE_SAVE: "שגיאה בשמירת הפרופיל: ",
    GENERAL_PROFILE: "שגיאה כללית: אירעה שגיאה בשמירת הפרופיל.",
    POLICY_SAVE: "שגיאה בשמירת הפוליסה: ",
    GENERAL_POLICY: "שגיאה כללית: אירעה שגיאה בעיבוד הפוליסה."
};
export const SUCCESS_PROFILE = "הפרטים נשמרו בהצלחה. הפרופיל שלך עודכן במערכת.";
