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



import Header from '../components/Header';

export default function Wizard() {
    const [step, setStep] = useState(0);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        email: "",
        date_of_birth: "",
        gender: "",
        children_ages: [],
        is_pregnant: false,
        planning_pregnancy: false,
        is_smoker: false
    });
    
    const [fullAnalysis, setFullAnalysis] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
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
                    email: currentUser.email || '',
                    full_name: currentUser.full_name || '',
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

    const handleSavePersonalDetails = async () => {
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

    const handlePolicyFileUpload = async (file) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
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
            // Simulate progress for now (replace with SSE/WebSocket for real-time updates)
            setUploadProgress(10);
            // fetch file's data from policy_metadata
            const response = await fetch(API_POLICY, {
                method: 'POST',
                body: formData
            });
            setUploadProgress(80);
            const result = await response.json();
            setUploadProgress(100);

            if (!response.ok || !result.success) {
                toast.error(ERROR_POLICY_SAVE + (result.message || ''));
                setIsUploading(false);
                return;
            }
            setFullAnalysis(result.coverage_analysis || []);
            setStep(2);
            setIsUploading(false);
        } catch (error) {
            toast.error(ERROR_GENERAL_POLICY);
            setIsUploading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="flex flex-col items-center justify-center pt-24 pb-12 min-h-[80vh]">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold" style={{ color: '#63cf80ff' }}>בדיקת החזר ביטוח</CardTitle>
                            <CardDescription className="text-blue-500">מלא את הפרטים והעלה את הפוליסה שלך</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={step * 33} max={100} />
                            {step === 0 && (
                                <PersonalDetailsStep
                                    userData={userData}
                                    setUserData={setUserData}
                                    onNext={handleSavePersonalDetails}
                                    isLoading={isLoading}
                                    onBack={() => window.history.back()}
                                />
                            )}
                            {step === 1 && (
                                <>
                                    <UploadStep
                                        isUploading={isUploading}
                                        onUpload={handlePolicyFileUpload}
                                        email={userData.email || user?.email}
                                        uploadProgress={uploadProgress}
                                        onBack={() => setStep(0)}
                                    />

                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <SmartQuestionnaireStep
                                        questions={fullAnalysis}
                                        userData={userData}
                                        setUserData={setUserData}
                                        onNext={() => setStep(3)}
                                        onBack={() => setStep(1)}
                                    />
                                </>
                            )}
                            {step === 3 && (
                                <ResultsStep
                                    results={results}
                                    userData={userData}
                                    onBack={() => setStep(2)}
                                />
                            )}
                        </CardContent>
                        <CardFooter>
                            {/* Navigation buttons or summary can go here */}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
