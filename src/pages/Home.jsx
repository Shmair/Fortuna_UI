import { BarChart, CheckCircle2, FileText } from "lucide-react";
import React from "react";
import FeatureSteps from "../components/home/FeatureSteps";
import HeroCallToAction from "../components/home/HeroCallToAction";

const FEATURE_STEPS = [
  {
    title: "1. ספרו לנו עליכם",
    description: "אם אתם רוצים ייעוץ מותאם אישית, ענו על מספר שאלות קצרות לגביכם ולגבי הביטוח שלכם!",
    icon: <FileText size={24} color="var(--color-secondary)" />
  },
  {
    title: "2. קבלו רשימה מותאמת",
    description: "המערכת החכמה שלנו תנתח את תשובותיכם ותציג רשימה של החזרים פוטנציאליים הרלוונטיים בדיוק לכם.",
    icon: <BarChart size={24} color="var(--color-secondary)" />
  },
  {
    title: "3. הגישו בקלות",
    description: "לכל החזר שמצאנו, נסביר לכם בדיוק אילו מסמכים צריך ואיך להגיש את הבקשה לחברת הביטוח.",
    icon: <CheckCircle2 size={24} color="var(--color-secondary)" />
  }
];

export default function Home({ isAuthenticated, setShowAuth }) {
  const featureSteps = FEATURE_STEPS;

  return (
    <React.Fragment>
      <div className="text-center px-2 sm:px-0">
        <div className="hero-stripe border border-white/70">
          <div className="hero-content py-10 sm:py-20 md:py-28 px-4 sm:px-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>
              <span style={{ fontFamily:'Karantina', fontWeight: 700, letterSpacing: '0.06em' }}>
                אל תפספסו את מה שמגיע לכם
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-xs sm:max-w-2xl mx-auto text-lg sm:text-2xl text-white font-semibold">
              פורטונה עוזרת לכם למצוא בקלות ובמהירות החזרים כספיים מפוליסת ביטוח הבריאות שלכם.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
              <HeroCallToAction
                isAuthenticated={isAuthenticated}
                setShowAuth={setShowAuth}
              />
            </div>
          </div>
        </div>
        <FeatureSteps steps={featureSteps} />
      </div>
    </React.Fragment>
  );
}