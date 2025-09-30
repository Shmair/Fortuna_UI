import { useEffect, useState } from 'react';
import { toast } from "sonner";
import PolicyChatStep from './PolicyChatStep';
import PolicyLoadedOptions from '../PolicyLoadedOptions';
import ResultsStep from './ResultsStep';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import UploadStep from './UploadStep';
import PersonalDetailsStep from './PersonalDetailsStep';
import ClaimStep from './ClaimStep';

import {
    API_POLICY,
    API_PROFILE,
    CONTENT_TYPE_JSON,
    ERRORS,
    SUCCESS_PROFILE,
    WIZARD_DESCRIPTION,
    WIZARD_TITLE
} from '../../constants/wizard';

export default function Wizard({ user }) {
    const [step, setStep] = useState(0);
    const [isGuidedChat, setIsGuidedChat] = useState(false);
    const [userData, setUserData] = useState({
        userId: null,
        // Basic Information
        email: "",
        full_name: "",
        phone_number: "",
        date_of_birth: "",
        gender: "",
        national_id: "",
        
        // Family Information
        children_ages: [],
        is_pregnant: false,
        planning_pregnancy: false,
        marital_status: "",
        spouse_name: "",
        spouse_date_of_birth: "",
        
        // Health Information
        is_smoker: false,
        chronic_conditions: [],
        medications: [],
        disabilities: [],
        
        // Insurance Information
        insurance_provider: "",
        policy_number: "",
        coverage_type: "",
        
        // Employment
        employment_status: "",
        employer_name: "",
        income_level: "",
        
        // Preferences
        preferred_language: "he",
        communication_preferences: {
            email: true,
            sms: false,
            phone: false
        }
    });
    
    const [fullAnalysis, setFullAnalysis] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileHash, setFileHash] = useState("");
    const [policyId, setPolicyId] = useState(0);
    const [uploadedPolicyName, setUploadedPolicyName] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('uploadedPolicyName') || "";
        }
        return "";
    });
    const [refunds, setRefunds] = useState({});

    // Store onboarding messages for chat context
    const [initialMessages, setInitialMessages] = useState(null);

        // When entering the upload step, if no policy name is set, fetch the latest policy for the user
    useEffect(() => {
        const fetchPolicyForUser = async () => {
            if (step === 1 && !uploadedPolicyName && userData.userId) {
                try {
                    const params = new URLSearchParams({ user_id: userData.userId });
                    const response = await fetch(`${API_POLICY}?${params.toString()}`);
                    const result = await response.json();
                    if (response.ok && result.success && result.file_name) {
                        setUploadedPolicyName(result.file_name);
                        setFullAnalysis(result.answer || 'Opps.. no analysis found2');
                    }
                } catch (e) {
                    // Ignore errors, just don't set policy name
                }
            }
        };
        fetchPolicyForUser();
    }, [step, uploadedPolicyName, userData.userId]);

    // Persist uploadedPolicyName to localStorage
    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         if (uploadedPolicyName) {
    //             localStorage.setItem('uploadedPolicyName', uploadedPolicyName);
    //         } else {
    //             localStorage.removeItem('uploadedPolicyName');
    //         }
    //     }
    // }, [uploadedPolicyName]);
    
    useEffect(() => {
        let isMounted = true;
        const loadUser = async () => {
            try {
                const userId = user?.id;
                if (!userId) {
                    if (isMounted) {
                        setUserData({
                            userId: null,
                            email: "",
                            date_of_birth: "",
                            gender: "female", // default to אישה
                            children_ages: [],
                            is_pregnant: false,
                            planning_pregnancy: false,
                            is_smoker: false
                        });
                        setIsLoading(false);
                    }
                    return;
                }
                const params = new URLSearchParams({ user_id: userId });
                const response = await fetch(`${API_PROFILE}?${params.toString()}`);
                const result = await response.json();
                if (!response.ok || !result.success || !result.profile) {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                    return;
                }

                const currentUser = result.profile;
                if (isMounted) {
                    setUserData({
                        userId: userId,
                        email: currentUser.email || '',
                        // Basic Information
                        full_name: currentUser.full_name || '',
                        phone_number: currentUser.phone_number || '',
                        date_of_birth: currentUser.date_of_birth || '',
                        gender: currentUser.gender || '',
                        national_id: currentUser.national_id || '',
                        
                        // Family Information
                        children_ages: Array.isArray(currentUser.children_ages) ? currentUser.children_ages : [],
                        is_pregnant: currentUser.is_pregnant || false,
                        planning_pregnancy: currentUser.planning_pregnancy || false,
                        marital_status: currentUser.marital_status || '',
                        spouse_name: currentUser.spouse_name || '',
                        spouse_date_of_birth: currentUser.spouse_date_of_birth || '',
                        
                        // Health Information
                        is_smoker: currentUser.is_smoker || false,
                        chronic_conditions: Array.isArray(currentUser.chronic_conditions) ? currentUser.chronic_conditions : [],
                        medications: Array.isArray(currentUser.medications) ? currentUser.medications : [],
                        disabilities: Array.isArray(currentUser.disabilities) ? currentUser.disabilities : [],
                        
                        // Insurance Information
                        insurance_provider: currentUser.insurance_provider || '',
                        policy_number: currentUser.policy_number || '',
                        coverage_type: currentUser.coverage_type || '',
                        
                        // Employment
                        employment_status: currentUser.employment_status || '',
                        employer_name: currentUser.employer_name || '',
                        income_level: currentUser.income_level || '',
                        
                        // Preferences
                        preferred_language: currentUser.preferred_language || 'he',
                        communication_preferences: currentUser.communication_preferences || {
                            email: true,
                            sms: false,
                            phone: false
                        },
                    });
                    setIsLoading(false);
                }
            } catch (e) { /* User not logged in */
                if (isMounted) setIsLoading(false);
            }
        };
        loadUser();
        return () => { isMounted = false; };
    }, [user]);

    const handleSavePersonalDetails = async () => {
        // Save or update user profile via backend API
        try {
            console.log('User object:', user);
            console.log('User ID:', user?.id);
            console.log('UserData:', userData);
            
            const email = userData.email || user?.email;
            if (!email) {
                toast.error(ERRORS.MISSING_EMAIL);
                return;
            }
            
            if (!user?.id) {
                toast.error('User not authenticated');
                return;
            }

            const response = await fetch(API_PROFILE, {
                method: 'POST',
                headers: { 'Content-Type': CONTENT_TYPE_JSON },
                body: JSON.stringify({
                    userId: user.id,
                    // Basic Information
                    email,
                    full_name: userData.full_name,
                    phone_number: userData.phone_number,
                    date_of_birth: userData.date_of_birth,
                    gender: userData.gender,
                    national_id: userData.national_id,
                    
                    // Family Information
                    children_ages: Array.isArray(userData.children_ages) ? userData.children_ages : [],
                    is_pregnant: userData.is_pregnant,
                    planning_pregnancy: userData.planning_pregnancy,
                    marital_status: userData.marital_status,
                    spouse_name: userData.spouse_name,
                    spouse_date_of_birth: userData.spouse_date_of_birth,
                    
                    // Health Information
                    is_smoker: userData.is_smoker,
                    chronic_conditions: Array.isArray(userData.chronic_conditions) ? userData.chronic_conditions : [],
                    medications: Array.isArray(userData.medications) ? userData.medications : [],
                    disabilities: Array.isArray(userData.disabilities) ? userData.disabilities : [],
                    
                    // Insurance Information
                    insurance_provider: userData.insurance_provider,
                    policy_number: userData.policy_number,
                    coverage_type: userData.coverage_type,
                    
                    // Employment
                    employment_status: userData.employment_status,
                    employer_name: userData.employer_name,
                    income_level: userData.income_level,
                    
                    // Preferences
                    preferred_language: userData.preferred_language,
                    communication_preferences: userData.communication_preferences || { email: true, sms: false, phone: false }
                })
            }).catch(error => {
                console.error('Fetch error:', error);
                toast.error('Network error: ' + error.message);
                throw error;
            });
            const result = await response.json();
            console.log('Profile save response:', result);
            console.log('Response status:', response.status);
            
            if (!response.ok || !result.success) {
                console.error('Profile save failed:', result);
                toast.error(ERRORS.PROFILE_SAVE + (result.message || ''));
                return;
            }

            setUserData({
                userId: user.id,
                email: result.profile?.email || '',
                // Basic Information
                full_name: result.profile?.full_name || '',
                phone_number: result.profile?.phone_number || '',
                date_of_birth: result.profile?.date_of_birth || '',
                gender: result.profile?.gender || '',
                national_id: result.profile?.national_id || '',
                
                // Family Information
                children_ages: Array.isArray(result.profile?.children_ages) ? result.profile.children_ages : [],
                is_pregnant: result.profile?.is_pregnant || false,
                planning_pregnancy: result.profile?.planning_pregnancy || false,
                marital_status: result.profile?.marital_status || '',
                spouse_name: result.profile?.spouse_name || '',
                spouse_date_of_birth: result.profile?.spouse_date_of_birth || '',
                
                // Health Information
                is_smoker: result.profile?.is_smoker || false,
                chronic_conditions: Array.isArray(result.profile?.chronic_conditions) ? result.profile.chronic_conditions : [],
                medications: Array.isArray(result.profile?.medications) ? result.profile.medications : [],
                disabilities: Array.isArray(result.profile?.disabilities) ? result.profile.disabilities : [],
                
                // Insurance Information
                insurance_provider: result.profile?.insurance_provider || '',
                policy_number: result.profile?.policy_number || '',
                coverage_type: result.profile?.coverage_type || '',
                
                // Employment
                employment_status: result.profile?.employment_status || '',
                employer_name: result.profile?.employer_name || '',
                income_level: result.profile?.income_level || '',
                
                // Preferences
                preferred_language: result.profile?.preferred_language || 'he',
                communication_preferences: result.profile?.communication_preferences || {
                    email: true,
                    sms: false,
                    phone: false
                },
            });
            toast.success(SUCCESS_PROFILE);
            setStep(1);
        } catch (e) {
            toast.error(ERRORS.GENERAL_PROFILE);
        }
    };

    const handlePolicyFileUpload = async (file) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const userId = userData.userId || user?.id;
            if (!userId) {
                toast.error(ERRORS.MISSING_USER_ID);
                setIsUploading(false);
                return;
            }
            // Send file and userId as FormData to backend
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user_id', userId);
            // Simulate progress for now (replace with SSE/WebSocket for real-time updates)
            setUploadProgress(10);
            // fetch file's data from policy
            const response = await fetch(API_POLICY, {
                method: 'POST',
                body: formData
            });
            setUploadProgress(80);
            const result = await response.json();
            setUploadProgress(100);

            if (!response.ok || !result.success) {
                toast.error(ERRORS.POLICY_SAVE + (result.message || ''));
                setIsUploading(false);
                return;
            }
            setFullAnalysis(result.answer);
            setFileHash(result?.file_hash || "");
            setUploadedPolicyName(result?.file_name || file.name || "");
            setPolicyId(result?.policy_id || 0);
            // Store onboarding messages for chat context if present
            if (result.messages && Array.isArray(result.messages)) {
                setInitialMessages(result.messages);
            } else {
                setInitialMessages(null);
            }
            setStep(2);
            setIsUploading(false);
        } catch (error) {
            toast.error(ERRORS.GENERAL_POLICY);
            setIsUploading(false);
        }
    };

    // Handler to continue with existing policy
    const handleContinueWithPolicy = async () => { // => setStep(2);
        // If we already have questions from the last upload, use them
        if (fullAnalysis && fullAnalysis.length > 0) {
            setStep(2);
            return;
        }
        // Otherwise, try to fetch questions for the current user/policy
        try {
            const userId = userData.userId || user?.id;
            if (!userId) {
                toast.error(ERRORS.MISSING_USER_ID);
                return;
            }
            // Try to fetch the latest questions for this user from the backend
            const params = new URLSearchParams({ user_id: userId, file_hash: fileHash });
            const response = await fetch(`${API_POLICY}?${params.toString()}`);
            const result = await response.json();
            if (!response.ok || !result.success) {
                toast.error(ERRORS.POLICY_SAVE + (result.message || ''));
                return;
            }
            setFullAnalysis(result.answer || "Opps.. no analysis found3");
            setStep(2);
        } catch (e) {
            toast.error(ERRORS.GENERAL_POLICY);
        }
    };

    const handleProfessionalHelp = () => {
        setStep(6);
    };

    return (
        <div className="flex flex-col items-center justify-center pt-16 pb-8 min-h-[80vh]">
            <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-2">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold" style={{ color: '#63cf80ff' }}>{WIZARD_TITLE}</CardTitle>
                        <CardDescription className="text-blue-500">{WIZARD_DESCRIPTION}</CardDescription>
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
                            <UploadStep
                                isUploading={isUploading}
                                onUpload={handlePolicyFileUpload}
                                email={userData.email || user?.email}
                                uploadProgress={uploadProgress}
                                onBack={() => setStep(0)}
                                policyName={uploadedPolicyName}
                                onContinueWithPolicy={handleContinueWithPolicy}
                            />
                        )}
                        {step === 2 && (
                            <PolicyLoadedOptions
                                results={results}
                                userName={user.name || ''}
                                onBack={() => setStep(1)}
                                onGuidedFlow={() => { setIsGuidedChat(true); setStep(4); }}
                                onFreeChat={() => { setIsGuidedChat(false); setStep(4); }}
                            />
                        )}
                        {/* שלב 3 (SmartQuestionnaireStep) מבוטל – הכל עובר לצ'אט */}
                        {step === 4 && (
                            <PolicyChatStep
                                userName={user.name || ''}
                                onBack={() => setStep(2)}
                                userId={userData.userId}
                                guided={isGuidedChat}
                                answer={fullAnalysis}
                                policyId={policyId}
                                onShowResults={(refunds) => {
                                    setRefunds(refunds); // assuming refunds is an array
                                    setStep(5);
                                }}
                                //messages={initialMessages}
                                //setResults={setResults}
                            />
                        )}
                        {step === 5 && (
                            <ResultsStep
                                results={refunds}
                                userData={userData}
                                onBack={() => setStep(2)}
                                onRestart={() => setStep(0)}
                                claim={handleProfessionalHelp}
                            />
                        )}
                        {step === 6 && (
                            <ClaimStep
                                results={refunds}
                                userData={userData}
                                onBack={() => setStep(2)}
                                onRestart={() => setStep(0)}
                                claim={handleProfessionalHelp}
                            
                            />
                        )}
                    </CardContent>
                    <CardFooter>
                        {/* Navigation buttons or summary can go here */}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
