import React from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, CheckCircle2, FileText, BarChart } from "lucide-react";

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="text-center">
      <div className="py-20 sm:py-28 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-inner-lg">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          אל תפספסו את מה שמגיע לכם
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          "אשף ההחזרים" עוזר לכם למצוא בקלות ובמהירות החזרים כספיים מפוליסת ביטוח הבריאות שלכם.
        </p>
        <div className="mt-10">
          <Link to={createPageUrl("Wizard")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              מצאו את ההחזרים שלכם
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            icon={<FileText size={24}/>}
            title="1. ספרו לנו עליכם"
            description="ענו על מספר שאלות קצרות לגביכם ולגבי הביטוח שלכם. אנחנו לא צריכים את הפוליסה עצמה!"
          />
          <FeatureCard 
            icon={<BarChart size={24}/>}
            title="2. קבלו רשימה מותאמת"
            description="המערכת החכמה שלנו תנתח את תשובותיכם ותציג רשימה של החזרים פוטנציאליים הרלוונטיים בדיוק לכם."
          />
          <FeatureCard 
            icon={<CheckCircle2 size={24}/>}
            title="3. הגישו בקלות"
            description="לכל החזר שמצאנו, נסביר לכם בדיוק אילו מסמכים צריך ואיך להגיש את הבקשה לחברת הביטוח."
          />
        </div>
      </div>
    </div>
  );
}