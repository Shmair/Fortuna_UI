import { ArrowLeft, BarChart, CheckCircle2, FileText } from "lucide-react";
import React from "react";
import { Button } from "../components/ui/button";
import { createPageUrl } from "../utils";

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ background: '#e6f8f2' }}>
      {React.cloneElement(icon, { color: '#63cf80ff' })}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default function Home({ isAuthenticated, setShowAuth }) {
  return (
    <React.Fragment>
      <div className="text-center">
        <div className="py-20 sm:py-28 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-inner-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            <span style={{ fontFamily: 'Karantina, Varela Round, Arial, sans-serif', fontWeight: 700, letterSpacing: '0.06em' }}>
              אל תפספסו את מה שמגיע לכם
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            "אשף ההחזרים" עוזר לכם למצוא בקלות ובמהירות החזרים כספיים מפוליסת ביטוח הבריאות שלכם.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="main-btn"
              onMouseOver={e => e.currentTarget.classList.add('main-btn-hover')}
              onMouseOut={e => e.currentTarget.classList.remove('main-btn-hover')}
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/wizard';
                } else {
                  setShowAuth(true);
                }
              }}
            >
              מצאו את ההחזרים שלכם
              <ArrowLeft className="mr-2 h-5 w-5" style={{ color: '#38605D' }} />
            </Button>
          </div>
        </div>
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              key="about"
              icon={<FileText size={24}/>} 
              title="1. ספרו לנו עליכם" 
              description="ענו על מספר שאלות קצרות לגביכם ולגבי הביטוח שלכם. אנחנו לא צריכים את הפוליסה עצמה!" 
            />
            <FeatureCard 
              key="list"
              icon={<BarChart size={24}/>} 
              title="2. קבלו רשימה מותאמת" 
              description="המערכת החכמה שלנו תנתח את תשובותיכם ותציג רשימה של החזרים פוטנציאליים הרלוונטיים בדיוק לכם." 
            />
            <FeatureCard 
              key="submit"
              icon={<CheckCircle2 size={24}/>} 
              title="3. הגישו בקלות" 
              description="לכל החזר שמצאנו, נסביר לכם בדיוק אילו מסמכים צריך ואיך להגיש את הבקשה לחברת הביטוח." 
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}