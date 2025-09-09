import { ArrowLeft } from 'lucide-react';
import React from 'react';
import BackButton from '../components/BackButton.js';
import { Button } from '../components/ui/button';
import UserProfileForm from '../components/UserProfileForm.js';


const PersonalDetailsStep = ({ userData, setUserData, onNext, onBack }) => {
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
            onNext(); 
        }
    };
    return (
        <form id="personal-details-form" className="space-y-4" onSubmit={handleNext}>
            <h3 className="text-lg font-semibold text-center">בואו נכיר</h3>
            <p className="text-sm text-gray-500 text-center">הפרטים יעזרו לנו לנתח את הפוליסה בצורה מדויקת יותר.</p>
            <UserProfileForm userData={userData} setUserData={setUserData} showErrors={showErrors} />
            <div className="mt-6 flex justify-center">
                <Button type="submit" className="flex items-center gap-2 font-bold text-base px-6 py-3 rounded-lg shadow-none" >
                    המשך להעלאת פוליסה <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
            </div>
            <div className="mt-4 flex w-full">
                <BackButton onClick={onBack} />
            </div>
        </form>
    );
};

export default PersonalDetailsStep;
