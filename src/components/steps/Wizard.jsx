import { useEffect, useState, useCallback } from 'react';
import { toast } from "sonner";
import PolicyChatStep from './PolicyChatStep';
import PolicyLoadedOptions from './PolicyLoadedOptions';
import ResultsStep from './ResultsStep';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import UploadStep from './UploadStep';
import PersonalDetailsStep from './PersonalDetailsStep';
import ClaimStep from './ClaimStep';
import { supabase } from '../../utils/supabaseClient';
import { apiService } from '../../services/apiService';

import {
    API_ENDPOINTS,
    HEADERS,
    ERRORS,
    SUCCESS_PROFILE,
    WIZARD_DESCRIPTION,
    WIZARD_TITLE
} from '../../constants/wizard';

// Constants
const REQUIRED_PROFILE_FIELDS = ['full_name', 'phone_number', 'national_id', 'date_of_birth', 'gender'];
const LOADING_DELAY = 1000; // 1 second minimum loading time

// Initial state objects
const initialUserData = {
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
};

const initialCommunicationPreferences = {
    email: true,
    sms: false,
    phone: false
};

export default function Wizard({ user, isLoadingUser }) {
    // State management
    const [step, setStep] = useState(0);
    const [chatMode, setChatMode] = useState('user'); // 'user' | 'assistant'
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [userData, setUserData] = useState(initialUserData);
    const [fullAnalysis, setFullAnalysis] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
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
    const [sessionId, setSessionId] = useState(null);
    const [initialMessages, setInitialMessages] = useState(null);

    // Utility functions
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const isProfileComplete = useCallback((profile) => {
        console.log('🔍 isProfileComplete called with profile:', profile);
        
        const result = REQUIRED_PROFILE_FIELDS.every(field => {
            const value = profile[field];
            // Convert to string and check if it's not empty
            const stringValue = String(value || '');
            const isValid = stringValue.trim() !== '';
            console.log(`  Field ${field}: "${value}" -> ${isValid}`);
            return isValid;
        });
        
        console.log('🔍 isProfileComplete result:', result);
        return result;
    }, []);

    const updateUserData = useCallback((profile) => {
        return {
            userId: profile.user_id || user?.id,
            email: profile.email || '',
            // Basic Information
            full_name: profile.full_name || '',
            phone_number: profile.phone_number || '',
            date_of_birth: profile.date_of_birth || '',
            gender: profile.gender || '',
            national_id: profile.national_id || '',
            
            // Family Information
            children_ages: Array.isArray(profile.children_ages) ? profile.children_ages : [],
            is_pregnant: profile.is_pregnant || false,
            planning_pregnancy: profile.planning_pregnancy || false,
            marital_status: profile.marital_status || '',
            spouse_name: profile.spouse_name || '',
            spouse_date_of_birth: profile.spouse_date_of_birth || '',
            
            // Health Information
            is_smoker: profile.is_smoker || false,
            chronic_conditions: Array.isArray(profile.chronic_conditions) ? profile.chronic_conditions : [],
            medications: Array.isArray(profile.medications) ? profile.medications : [],
            disabilities: Array.isArray(profile.disabilities) ? profile.disabilities : [],
            
            // Insurance Information
            insurance_provider: profile.insurance_provider || '',
            policy_number: profile.policy_number || '',
            coverage_type: profile.coverage_type || '',
            
            // Employment
            employment_status: profile.employment_status || '',
            employer_name: profile.employer_name || '',
            income_level: profile.income_level || '',
            
            // Preferences
            preferred_language: profile.preferred_language || 'he',
            communication_preferences: profile.communication_preferences || initialCommunicationPreferences,
        };
    }, [user?.id]);

    const finishLoading = useCallback((nextStep) => {
        return async () => {
            console.log('finishLoading called with step:', nextStep);
            await delay(LOADING_DELAY);
            console.log('Setting step to:', nextStep);
            setStep(nextStep);
            setIsLoading(false);
            setIsInitializing(false);
        };
    }, []);

    // API functions
    const fetchUserProfile = useCallback(async (userId) => {
        console.log('🔍 fetchUserProfile called for userId:', userId);
        const result = await apiService.getProfile(userId);
        
        // Return null if no profile exists (user needs to create one)
        return result.profile || null;
    }, []);

    const fetchUserPolicies = useCallback(async (userId) => {
        const result = await apiService.getPolicies(userId);
        return result;
    }, []);

    const fetchPolicyByHash = useCallback(async (fileHash) => {
        const result = await apiService.getPolicyByHash(fileHash);
        return result;
    }, []);

    const fetchPolicyById = useCallback(async (policyId) => {
        const result = await apiService.getPolicy(policyId);
        return result;
    }, []);

    const saveUserProfile = useCallback(async (profileData) => {
        const result = await apiService.saveProfile(profileData);
        return result;
    }, []);

    const uploadPolicyFile = useCallback(async (file, userId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);
        
        const result = await apiService.uploadPolicy(formData);
        return result;
    }, []);

    // Main initialization effect
    useEffect(() => {
        let isMounted = true;

        const initializeUser = async () => {
            try {
                const userId = user?.id;
                
                if (!userId) {
                    if (isMounted) {
                        console.log('No userId, staying on loading step');
                        setUserData(prev => ({ ...prev, userId: null }));
                        setIsLoading(false);
                        setIsInitializing(false);
                        setStep(0); // Stay on loading step for unauthenticated users
                    }
                    return;
                }

                // Fetch user profile
                const profile = await fetchUserProfile(userId);
                
                if (!isMounted) return;

                // If no profile exists, go to personal details step
                if (!profile) {
                    console.log('No profile found, going to personal details step');
                    setIsLoading(false);
                    setIsInitializing(false);
                    setStep(1); // Go to personal details step
                    return;
                }

                const updatedUserData = updateUserData(profile);
                setUserData(updatedUserData);

                // Check if profile is complete
                const profileComplete = isProfileComplete(profile);
                console.log('🔍 Profile completeness check:', {
                    profileComplete,
                    profile: {
                        full_name: profile.full_name,
                        phone_number: profile.phone_number,
                        national_id: profile.national_id,
                        date_of_birth: profile.date_of_birth,
                        gender: profile.gender
                    },
                    requiredFields: REQUIRED_PROFILE_FIELDS
                });
                
                if (profileComplete) {
                    console.log('Profile is complete, checking for existing policy');
                    
                    try {
                        // First check if profile has a linked policy ID
                        if (profile.insurance_policy_id) {
                            console.log('Found insurance_policy_id in profile, fetching policy by ID');
                            const policyResult = await fetchPolicyById(profile.insurance_policy_id);
                            
                            if (policyResult.policy) {
                                console.log('Found existing policy by ID, skipping to chat step');
                                setUploadedPolicyName(policyResult.policy.file_name);
                                setFullAnalysis(policyResult.policy.analysis || '');
                                setPolicyId(policyResult.policy.id);
                                setIsReturningUser(true);
                                setChatMode('user');
                            
                                await finishLoading(4)(); // Go to options step before chat
                                return;
                            }
                        }
                        
                        // Fallback: check for any policies by user ID
                        const policyResult = await fetchUserPolicies(userId);
                        
                        if (policyResult.policies && policyResult.policies.length > 0) {
                            console.log('Found existing policies, using the most recent one');
                            const mostRecentPolicy = policyResult.policies[0]; // Already sorted by uploaded_at desc
                            setUploadedPolicyName(mostRecentPolicy.file_name);
                            setFullAnalysis(mostRecentPolicy.analysis || '');
                            setPolicyId(mostRecentPolicy.id);
                            setIsReturningUser(true);
                            setChatMode('user');
                            
                            await finishLoading(4)(); // Go to options step before chat
                        } else {
                            console.log('No existing policies, going to upload step');
                            console.log('About to call finishLoading(2)');
                            await finishLoading(2)(); // Skip to upload step
                        }
                    } catch (error) {
                        console.log('Error checking for policies, going to upload step:', error);
                        await finishLoading(2)(); // Skip to upload step
                    }
                } else {
                    console.log('Profile incomplete, setting step to 1');
                    console.log('🔍 Profile incomplete - going to personal details step');
                    setIsLoading(false);
                    setIsInitializing(false);
                    setStep(1); // Go to personal details step for incomplete profiles
                }
            } catch (error) {
                console.error('Error initializing user:', error);
                if (isMounted) {
                    console.log('Error occurred, staying on loading step');
                    setIsLoading(false);
                    setIsInitializing(false);
                    setStep(0); // Stay on loading step on error
                }
            }
        };

        initializeUser();
        
        return () => { isMounted = false; };
    }, [user?.id]); // Only depend on user?.id, not the functions

    // Event handlers
    const handleSavePersonalDetails = useCallback(async () => {
        try {
            const email = userData.email || user?.email;
            
            if (!email) {
                toast.error(ERRORS.MISSING_EMAIL);
                return;
            }
            
            if (!user?.id) {
                toast.error('User not authenticated');
                return;
            }

            // Set loading state
            setIsLoading(true);

            const profileData = {
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
                communication_preferences: userData.communication_preferences || initialCommunicationPreferences
            };

            const result = await saveUserProfile(profileData);
            
            setUserData(updateUserData(result.profile));
            toast.success(SUCCESS_PROFILE);
            setStep(2);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(ERRORS.GENERAL_PROFILE);
        } finally {
            // Always clear loading state
            setIsLoading(false);
        }
    }, [user, userData, saveUserProfile, updateUserData]);

    const handlePolicyFileUpload = useCallback(async (file) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const userId = userData.userId || user?.id;
            
            if (!userId) {
                toast.error(ERRORS.MISSING_USER_ID);
                return;
            }

            setUploadProgress(10);
            const result = await uploadPolicyFile(file, userId);
            setUploadProgress(100);

            // Show processing step
            setIsUploading(false);
            setIsProcessing(true);
            setStep(3); // Go to processing step

            // Simulate processing time with progress updates
            await delay(500);
            setUploadProgress(20);
            await delay(500);
            setUploadProgress(40);
            await delay(500);
            setUploadProgress(60);
            await delay(500);
            setUploadProgress(80);
            await delay(500);
            setUploadProgress(100);

            setFullAnalysis(result.answer);
            setFileHash(result?.file_hash || "");
            setUploadedPolicyName(result?.file_name || file.name || "");
            setPolicyId(result?.policy_id || 0);
            
            if (result.messages && Array.isArray(result.messages)) {
                setInitialMessages(result.messages);
            } else {
                setInitialMessages(null);
            }
            
            // Move to options step after processing
            await delay(1000);
            setIsProcessing(false);
            setStep(4);
        } catch (error) {
            console.error('Error uploading policy:', error);
            // Don't show toast here - let UploadStep handle the error display
            // Re-throw the error so UploadStep can catch it
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [user, userData.userId, uploadPolicyFile]);

    const handleContinueWithPolicy = useCallback(async () => {
        if (fullAnalysis && fullAnalysis.length > 0) {
            setStep(2);
            return;
        }

        try {
            const userId = userData.userId || user?.id;
            
            if (!userId) {
                toast.error(ERRORS.MISSING_USER_ID);
                return;
            }

            // First try to get policy by ID if we have one
            if (policyId) {
                try {
                    const result = await fetchPolicyById(policyId);
                    if (result.policy) {
                        setFullAnalysis(result.policy.analysis || "No analysis found");
                        setStep(2);
                        return;
                    }
                } catch (error) {
                    console.log('Failed to fetch policy by ID, falling back to user policies');
                }
            }

            // Fallback: get all user policies
            const result = await fetchUserPolicies(userId);
            if (result.policies && result.policies.length > 0) {
                const mostRecentPolicy = result.policies[0];
                setFullAnalysis(mostRecentPolicy.analysis || "No analysis found");
                setPolicyId(mostRecentPolicy.id);
            } else {
                setFullAnalysis("No analysis found");
            }
            setStep(3);
        } catch (error) {
            console.error('Error continuing with policy:', error);
            toast.error(ERRORS.GENERAL_POLICY);
        }
    }, [user, userData.userId, fullAnalysis, policyId, fetchUserPolicies, fetchPolicyById]);

    const handleProfessionalHelp = useCallback(() => {
        setStep(7);
    }, []);

    // Render loading state
    if (isLoadingUser || !user || isInitializing) {
        return (
            <div className="flex flex-col items-center justify-center pt-16 pb-8 min-h-[80vh]">
                <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-2">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold" style={{ color: '#63cf80ff' }}>
                                {WIZARD_TITLE}
                            </CardTitle>
                            <CardDescription className="text-blue-500">
                                {WIZARD_DESCRIPTION}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 text-center">
                                    {isLoadingUser ? 'טוען...' : !user ? 'מאמת משתמש...' : 'בודקים את הפרופיל שלך...'}
                                </p>
                                <div className="text-xs text-gray-400 mt-2">
                                    Debug: isLoadingUser={String(isLoadingUser)}, user={user ? 'exists' : 'null'}, isInitializing={String(isInitializing)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Render main content
    return (
        <div className="flex flex-col items-center justify-center pt-16 pb-8 min-h-[80vh]">
            <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-2">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold" style={{ color: '#63cf80ff' }}>
                            {WIZARD_TITLE}
                        </CardTitle>
                        <CardDescription className="text-blue-500">
                            {WIZARD_DESCRIPTION}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={isProcessing ? uploadProgress : step * 12.5} max={100} />
                        <div className="text-xs text-gray-400 mb-2">
                            Debug: Current step = {step}
                        </div>
                        
                        {step === 0 && (
                            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 text-center">
                                    {!user ? 'מאמת משתמש...' : 'מאתחל את האשף...'}
                                </p>
                            </div>
                        )}
                        
                        {step === 1 && (
                            <PersonalDetailsStep
                                userData={userData}
                                setUserData={setUserData}
                                onNext={handleSavePersonalDetails}
                                isLoading={isLoading}
                                onBack={() => window.history.back()}
                            />
                        )}
                        
                        {step === 2 && (
                            <UploadStep
                                isUploading={isUploading}
                                onUpload={handlePolicyFileUpload}
                                email={userData.email || user?.email}
                                uploadProgress={uploadProgress}
                                onBack={() => {
                                    // If user has a complete profile, go back to loading step instead of personal details
                                    const profileComplete = isProfileComplete(userData);
                                    if (profileComplete) {
                                        setStep(0);
                                    } else {
                                        setStep(1);
                                    }
                                }}
                                policyName={uploadedPolicyName}
                                onContinueWithPolicy={handleContinueWithPolicy}
                                userName={userData.full_name}
                                showBackButton={!isProfileComplete(userData)}
                            />
                        )}
                        
                        {step === 3 && isProcessing && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <h2 className="text-2xl font-bold mb-2">מעבדים את הפוליסה שלכם</h2>
                                    <p className="text-gray-600 mb-6">האשף החכם שלנו מנתח את הפוליסה כדי לזהות החזרים פוטנציאליים...</p>
                                </div>
                                
                                {/* UX-ID: loading_expectations - Processing time expectations */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg w-full">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 text-sm">⏱️</span>
                                        </div>
                                        <h3 className="font-semibold text-blue-800">זמן עיבוד משוער: 2-3 דקות</h3>
                                    </div>
                                    <p className="text-sm text-blue-700 text-center">
                                        אנחנו מנתחים את כל הסעיפים בפוליסה שלכם כדי לזהות החזרים רלוונטיים
                                    </p>
                                </div>
                                
                                <div className="w-full max-w-md">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>התקדמות</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-3" />
                                </div>
                                
                                {/* UX-ID: loading_expectations - Detailed progress steps */}
                                <div className="bg-gray-50 rounded-lg p-4 max-w-lg w-full">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-center">מה קורה עכשיו?</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className={`flex items-center ${uploadProgress >= 20 ? 'text-green-600' : 'text-gray-500'}`}>
                                            <span className="w-4 h-4 rounded-full bg-current mr-3 flex items-center justify-center text-xs">
                                                {uploadProgress >= 20 ? '✓' : '1'}
                                            </span>
                                            חילוץ טקסט מהפוליסה
                                        </div>
                                        <div className={`flex items-center ${uploadProgress >= 40 ? 'text-green-600' : 'text-gray-500'}`}>
                                            <span className="w-4 h-4 rounded-full bg-current mr-3 flex items-center justify-center text-xs">
                                                {uploadProgress >= 40 ? '✓' : '2'}
                                            </span>
                                            זיהוי שפה וניתוח תוכן
                                        </div>
                                        <div className={`flex items-center ${uploadProgress >= 60 ? 'text-green-600' : 'text-gray-500'}`}>
                                            <span className="w-4 h-4 rounded-full bg-current mr-3 flex items-center justify-center text-xs">
                                                {uploadProgress >= 60 ? '✓' : '3'}
                                            </span>
                                            חלוקה לקטעים וזיהוי סעיפים
                                        </div>
                                        <div className={`flex items-center ${uploadProgress >= 80 ? 'text-green-600' : 'text-gray-500'}`}>
                                            <span className="w-4 h-4 rounded-full bg-current mr-3 flex items-center justify-center text-xs">
                                                {uploadProgress >= 80 ? '✓' : '4'}
                                            </span>
                                            יצירת שאלון חכם
                                        </div>
                                        <div className={`flex items-center ${uploadProgress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                                            <span className="w-4 h-4 rounded-full bg-current mr-3 flex items-center justify-center text-xs">
                                                {uploadProgress >= 100 ? '✓' : '5'}
                                            </span>
                                            סיום העיבוד
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center text-sm text-gray-500 max-w-md">
                                    <p>אנא המתנו בסבלנות - זה שווה את זה! 🎯</p>
                                </div>
                            </div>
                        )}
                        
                        {step === 4 && (
                            <PolicyLoadedOptions
                                results={results}
                                userName={userData.full_name || user.name || ''}
                                onBack={() => setStep(2)}
                                onGuidedFlow={async () => { setChatMode('assistant'); try { const r = await apiService.startChatSession({ userId: userData.userId, policyId, mode: 'assistant' }); setSessionId(r.sessionId); } catch {} setStep(5); }}
                                onFreeChat={async () => { setChatMode('user'); try { const r = await apiService.startChatSession({ userId: userData.userId, policyId, mode: 'user' }); setSessionId(r.sessionId); } catch {} setStep(5); }}
                                isReturningUser={isReturningUser}
                            />
                        )}

                        {step === 5 && (
                            <PolicyChatStep
                                userName={userData.full_name || user.name || ''}
                                onBack={() => setStep(2)}
                                userId={userData.userId}
                                mode={chatMode}
                                answer={fullAnalysis}
                                policyId={policyId}
                                sessionId={sessionId}
                                onShowResults={(refunds) => {
                                    setRefunds(refunds);
                                    setStep(6);
                                }}
                                isReturningUser={isReturningUser}
                            />
                        )}
                        
                        {step === 6 && (
                            <ResultsStep
                                results={refunds}
                                userData={userData}
                                onBack={() => setStep(5)}
                                onRestart={() => setStep(1)}
                                claim={handleProfessionalHelp}
                            />
                        )}
                        
                        {step === 7 && (
                            <ClaimStep
                                results={refunds}
                                userData={userData}
                                onBack={() => setStep(3)}
                                onRestart={() => setStep(1)}
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