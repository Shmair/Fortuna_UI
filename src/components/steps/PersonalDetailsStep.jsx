import { ArrowLeft } from 'lucide-react';
import React from 'react';
import BackButton from '../layout/BackButton';
import { Button } from '../ui/button';
import ComprehensiveUserProfileForm from '../forms/ComprehensiveUserProfileForm';


const PersonalDetailsStep = ({ userData, setUserData, onNext, onBack, isLoading }) => {
    const requiredFields = [
        "email", 
        "date_of_birth", 
        "gender",
        "full_name",
        "phone_number",
        "national_id"
    ];
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
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-center">בודקים את הפרופיל שלך...</p>
            </div>
        );
    }

    return (
        <form id="personal-details-form" className="space-y-4" onSubmit={handleNext}>
            <h3 className="text-lg font-semibold text-center">בואו נכיר</h3>
            <p className="text-sm text-gray-500 text-center">הפרטים יעזרו לנו לנתח את הפוליסה בצורה מדויקת יותר.</p>
            <ComprehensiveUserProfileForm userData={userData} setUserData={setUserData} showErrors={showErrors} />
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
