import React from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UserProfileForm from '../components/UserProfileForm.js';


const PersonalDetailsStep = ({ userData, setUserData, onNext }) => {
    const requiredFields = ["email", "date_of_birth", "gender"];
    React.useEffect(() => {
        if (!userData.gender) {
            setUserData({ ...userData, gender: 'female' });
        }
    }, []);
    const isValid = requiredFields.every(field => !!userData[field]);
    const [showErrors, setShowErrors] = React.useState(false);
    const handleNext = (e) => {
        e.preventDefault();
        setShowErrors(true);
        if (isValid) {
            // Save profile before advancing
            if (userData.email) {debugger;
            //     fetch('/api/profile', {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify(userData)
            //     })
            //     .then(res => res.json())
            //     .then(({ error }) => {
            //         if (!error) {
            //             toast.success("הפרטים נשמרו בהצלחה. הפרופיל שלך עודכן במערכת.");
            //         } else {
            //             toast.error("שגיאה בשמירת הפרופיל: " + error.message);
            //         }
            //         onNext();
            //     })
            //     .catch(() => {
            //         toast.error("שגיאה בשמירת הפרופיל.");
            //         onNext();
            //     });
            // } else {
                onNext();
            }
        }
    };
    return (
        <form id="personal-details-form" className="space-y-4" onSubmit={handleNext}>
            <h3 className="text-lg font-semibold text-center">בואו נכיר</h3>
            <p className="text-sm text-gray-500 text-center">הפרטים יעזרו לנו לנתח את הפוליסה בצורה מדויקת יותר.</p>
            <UserProfileForm userData={userData} setUserData={setUserData} showErrors={showErrors} />
            <Button type="submit" className="w-full">
                המשך להעלאת פוליסה <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
        </form>
    );
};

export default PersonalDetailsStep;
