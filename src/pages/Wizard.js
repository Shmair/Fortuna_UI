import { useEffect, useState } from 'react';
import { toast } from "sonner";
import ResultsStep from '../components/ResultsStep';
import SmartQuestionnaireStep from '../components/SmartQuestionnaireStep';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import UploadStep from '../components/UploadStep';

import PersonalDetailsStep from './PersonalDetailsStep';

// String constants
const API_BASE = 'http://localhost:4000';
const API_PROFILE = API_BASE + '/api/profile';
const API_POLICY = API_BASE + '/api/policy';
const LOCALSTORAGE_EMAIL = 'user_email';
const CONTENT_TYPE_JSON = 'application/json';
const ERROR_MISSING_EMAIL = "חסר אימייל: אנא הזן כתובת אימייל תקינה.";
const ERROR_PROFILE_SAVE = "שגיאה בשמירת הפרופיל: ";
const ERROR_GENERAL_PROFILE = "שגיאה כללית: אירעה שגיאה בשמירת הפרופיל.";
const ERROR_POLICY_SAVE = "שגיאה בשמירת הפוליסה: ";
const ERROR_GENERAL_POLICY = "שגיאה כללית: אירעה שגיאה בעיבוד הפוליסה.";
const SUCCESS_PROFILE = "הפרטים נשמרו בהצלחה. הפרופיל שלך עודכן במערכת.";




export default function Wizard() {
    const [step, setStep] = useState(0);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        email: "",
        date_of_birth: "",
        gender: "",
        //insurance_provider: "",
        children_ages: [],
        is_pregnant: false,
        planning_pregnancy: false,
        is_smoker: false
    });
    
    const [fullAnalysis, setFullAnalysis] = useState([]);
    const [results, setResults] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [existingPolicyFile, setExistingPolicyFile] = useState(null);

    useEffect(() => {
        const loadUser = async () => {debugger;
            try {
                const email = window.localStorage.getItem(LOCALSTORAGE_EMAIL);
                if (!email) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
                const params = new URLSearchParams({ email });
                const response = await fetch(`${API_PROFILE}?${params.toString()}`);
                const result = await response.json();
                if (!response.ok || !result.success || !result.profile) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const currentUser = result.profile;
                setUser(currentUser);
                setUserData({
                    date_of_birth: currentUser.date_of_birth || '',
                    gender: currentUser.gender || '',
                    children_ages: currentUser.children_ages || [],
                    is_pregnant: currentUser.is_pregnant || false,
                    planning_pregnancy: currentUser.planning_pregnancy || false,
                    is_smoker: currentUser.is_smoker || false,
                });
            } catch (e) { /* User not logged in */ }
            finally { setIsLoading(false); }
        };
        loadUser();
    }, []);

    const handlePersonalDetailsNext = async () => {
        // Save or update user profile via backend API
        try {
            const email = userData.email || user?.email;
            if (!email) {
                toast.error(ERROR_MISSING_EMAIL);
                return;
            }
            const response = await fetch(API_PROFILE, {
                method: 'POST',
                headers: { 'Content-Type': CONTENT_TYPE_JSON },
                body: JSON.stringify({
                    email,
                    date_of_birth: userData.date_of_birth,
                    gender: userData.gender,
                    children_ages: userData.children_ages,
                    is_pregnant: userData.is_pregnant,
                    planning_pregnancy: userData.planning_pregnancy,
                    is_smoker: userData.is_smoker
                })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                toast.error(ERROR_PROFILE_SAVE + (result.message || ''));
                return;
            }
            window.localStorage.setItem(LOCALSTORAGE_EMAIL, email);
            setUser(result.profile || null);
            toast.success(SUCCESS_PROFILE);
            setStep(1);
        } catch (e) {
            toast.error(ERROR_GENERAL_PROFILE);
        }
    };
    
    const handlePolicyUpload = async (file) => {
        setIsUploading(true);
        try {debugger; // consider removing this code
            const email = userData.email || user?.email;
            if (!email) {
                toast.error(ERROR_MISSING_EMAIL);
                setIsUploading(false);
                return;
            }
            // Send file and email as FormData to backend
            const formData = new FormData();
            formData.append('file', file);
            formData.append('email', email);
            const response = await fetch(API_POLICY, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                toast.error(ERROR_POLICY_SAVE + (result.message || ''));
                setIsUploading(false);
                return;
            }
            // If duplicate, show existing file name and questions
            if (result.duplicate) {
                setExistingPolicyFile(result.file_name);
                setFullAnalysis(result.coverage_analysis || []);
                setStep(1);
                setIsUploading(false);
                return;
            }
            // If new, show questions from analysis
            setExistingPolicyFile(result.file_name);
            setFullAnalysis(result.coverage_analysis || []);
            setStep(1);
            setIsUploading(false);
        } catch (error) {
            toast.error(ERROR_GENERAL_POLICY);
            setIsUploading(false);
        }
    }
    // Wizard step rendering logic
    if (isLoading) {
    // ...existing code...
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>הגשת בקשת החזר ביטוח</CardTitle>
                    <CardDescription>מלא את הפרטים והעלה את הפוליסה שלך</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={step * 33} max={100} />
                    {step === 0 && (
                        <PersonalDetailsStep
                            userData={userData}
                            setUserData={setUserData}
                            onNext={handlePersonalDetailsNext}
                            isLoading={isLoading}
                        />
                    )}
                    {step === 1 && (
                        <UploadStep
                            isUploading={isUploading}
                            existingPolicyFile={existingPolicyFile}
                            onUpload={handlePolicyUpload}
                            email={userData.email || user?.email}
                        />
                    )}
                    {step === 2 && (
                        <SmartQuestionnaireStep
                            questions={fullAnalysis}
                            userData={userData}
                            setUserData={setUserData}
                            onNext={() => setStep(3)}
                        />
                    )}
                    {step === 3 && (
                        <ResultsStep
                            results={results}
                            userData={userData}
                        />
                    )}
                </CardContent>
                <CardFooter>
                    {/* Navigation buttons or summary can go here */}
                </CardFooter>
            </Card>
        </div>
    );
}
