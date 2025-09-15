export const API_BASE =  process.env.REACT_APP_API_BASE;
export const API_PROFILE = API_BASE + '/api/profile';
export const API_POLICY = API_BASE + '/api/policy';
export const LOCALSTORAGE_EMAIL = 'user_email';
export const CONTENT_TYPE_JSON = 'application/json';

export const ERRORS = {
    MISSING_EMAIL: "חסר אימייל: אנא הזן כתובת אימייל תקינה.",
    PROFILE_SAVE: "שגיאה בשמירת הפרופיל: ",
    GENERAL_PROFILE: "שגיאה כללית: אירעה שגיאה בשמירת הפרופיל.",
    POLICY_SAVE: "שגיאה בשמירת הפוליסה: ",
    GENERAL_POLICY: "שגיאה כללית: אירעה שגיאה בעיבוד הפוליסה."
};
export const SUCCESS_PROFILE = "הפרטים נשמרו בהצלחה. הפרופיל שלך עודכן במערכת.";
