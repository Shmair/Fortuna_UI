import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import UploadStep from '../components/UploadStep';
import { getUserProfile, UserSubmission } from '../entities/all';
import { InvokeLLM, UploadFile } from '../integrations/Core';
import { supabase } from '../utils/supabaseClient';
import PersonalDetailsStep from './PersonalDetailsStep';
import SmartQuestionnaireStep from '../components/SmartQuestionnaireStep';
import ResultsStep from '../components/ResultsStep';




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
        const loadUser = async () => {
            try {
                const email = window.localStorage.getItem('user_email');
                if (!email) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
                const { data: currentUser, error } = await getUserProfile(email);
                if (error || !currentUser) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
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
        // Save or update user profile in Supabase
        try {
            const email = userData.email || user?.email;
            if (!email) {
                toast.error("חסר אימייל: אנא הזן כתובת אימייל תקינה.");
                return;
            }
            // Upsert profile
            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                    {
                        email,
                        date_of_birth: userData.date_of_birth,
                        gender: userData.gender,
                        children_ages: userData.children_ages,
                        is_pregnant: userData.is_pregnant,
                        planning_pregnancy: userData.planning_pregnancy,
                        is_smoker: userData.is_smoker
                    }
                ], { onConflict: ['email'] });
            if (error) {
                toast.error("שגיאה בשמירת הפרופיל: " + error.message);
                return;
            }
            window.localStorage.setItem('user_email', email);
            setUser(data?.[0] || null);
            toast.success("הפרטים נשמרו בהצלחה. הפרופיל שלך עודכן במערכת.");
            setStep(1);
        } catch (e) {
            toast.error("שגיאה כללית: אירעה שגיאה בשמירת הפרופיל.");
        }
    };

    const handlePolicyUpload = async (file) => {
        setIsUploading(true);
        try {
            // file is now an object with file_url and file_hash from backend
            const { file_url, file_hash } = file;

            // 1. Get user profile from Supabase
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, insurance_policy_id')
                .eq('email', user?.email || '')
                .maybeSingle();
            if (profileError) {
                toast.error("שגיאת פרופיל: " + profileError.message);
                setIsUploading(false);
                return;
            }

            // 2. If profile has insurance_policy_id, check the policy
            if (profileData && profileData.insurance_policy_id) {
                const { data: policyData, error: policyError } = await supabase
                    .from('insurance_policies')
                    .select('file_name, file_hash, analysis')
                    .eq('id', profileData.insurance_policy_id)
                    .single();
                if (policyError) {
                    toast.error("שגיאת פוליסה: " + policyError.message);
                    setIsUploading(false);
                    return;
                }
                if (policyData.file_hash === file_hash) {
                    setExistingPolicyFile(policyData.file_name);
                    // Load questions from analysis if available
                    let questions = [];
                    if (policyData.analysis) {
                        try {
                            const parsed = typeof policyData.analysis === 'string' ? JSON.parse(policyData.analysis) : policyData.analysis;
                            questions = parsed.coverage_analysis || [];
                        } catch (e) {
                            questions = [];
                        }
                    }
                    setFullAnalysis(questions);
                    setStep(1); // Show file name and next btn
                    setIsUploading(false);
                    return;
                } else {
                    toast.error("הפוליסה הקיימת שונה מהקובץ שהועלה. אנא פנה לתמיכה לעדכון.");
                    setIsUploading(false);
                    return;
                }
            }

            // 3. If no insurance_policy_id, run LLM analysis and create policy
            const analysisPrompt = `You are a world-class insurance policy analyst. Your task is to meticulously analyze the attached insurance policy document and transform its complex clauses into a simple, two-tiered questionnaire for the user.
Primary Goal: Extract EVERY SINGLE coverage item, refund, or eligibility clause. Do not miss any.
Additionally, extract the name of the insurance provider from the document and include it as 'insurance_provider' (string) in the output.
For each coverage item, you MUST assign a category from the following options ONLY: "כולנו" (general, applies to everyone), "נשים והריון" (women & pregnancy), "ילדים" (children), "מבוגרים" (adults). Choose the most appropriate category for each item.
Output Structure: The final JSON output should be a single object containing:
1.  'insurance_provider': (string) The name of the insurance provider as found in the document.
2.  'coverage_analysis': (array) For each clause you find, format it into a JSON object with the following fields:
    - 'service_name': (string) A clear, user-friendly name for the service. E.g., "Chiropractic Treatments", "Second Medical Opinion".
    - 'category': (string) One of: "כולנו", "נשים והריון", "ילדים", "מבוגרים".
    - 'initial_question': (string) A REQUIRED broad, general Yes/No question in HEBREW. Format: "האם השתמשת, ביצעת או נזקקת ל[service_name]?"
    - 'follow_up_questions': (array of strings) A list of specific, targeted questions in HEBREW to be asked ONLY if the user answers "yes" to the 'initial_question'. These questions must clarify the specific conditions from the policy. E.g., ["האם הטיפול בוצע בחו״ל?", "האם נדרשה הפניית רופא?"]. If no follow-ups are needed, provide an empty array [].
    - 'refund_details': (object) An object containing the raw details extracted directly from the policy, all in HEBREW.
`;
            const analysisResponse = await InvokeLLM({
                prompt: analysisPrompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        insurance_provider: { type: "string" },
                        coverage_analysis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    service_name: { type: "string" },
                                    category: { type: "string" },
                                    initial_question: { type: "string" },
                                    follow_up_questions: { type: "array", items: { type: "string" } },
                                    refund_details: {
                                        type: "object",
                                        properties: {
                                            refund_amount: { type: "string" },
                                            coverage_percentage: { type: "string" },
                                            eligibility_conditions: { type: "string" },
                                            required_documents: { type: "string" },
                                            description: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // Save tailor-made questions to profile (if any)
            if (analysisResponse.coverage_analysis && (userData.email || user?.email)) {
                try {
                    const { SaveCustomQuestions } = await import('../integrations/Core');
                    await SaveCustomQuestions({
                        email: userData.email || user?.email,
                        questions: analysisResponse.coverage_analysis
                    });
                } catch (e) {
                    // Optionally log error
                }
            }
            // Insert new policy
            const { data: insertData, error: insertError } = await supabase
                .from('insurance_policies')
                .insert([
                    {
                        file_hash: file_hash,
                        file_url,
                        uploaded_at: new Date().toISOString(),
                        file_name: 'policy.pdf', // You may want to pass the name from backend if available
                        insurance_provider: analysisResponse?.insurance_provider || null,
                        analysis: JSON.stringify(analysisResponse)
                    }
                ])
                .select();
            if (insertError || !insertData || !insertData[0]) {
                toast.error("שגיאה בשמירת הפוליסה: " + (insertError?.message || 'לא התקבל מזהה פוליסה'));
                setIsUploading(false);
                return;
            }
            // Update profile with insurance_policy_id
            await supabase
                .from('profiles')
                .update({ insurance_policy_id: insertData[0].id })
                .eq('id', profileData.id);
            setExistingPolicyFile('policy.pdf');
            // Set fullAnalysis for step 2 questions
            setFullAnalysis(analysisResponse.coverage_analysis || []);
            setStep(1); // Show file name and next btn
            setIsUploading(false);
        } catch (error) {
            toast.error("שגיאה כללית: אירעה שגיאה בעיבוד הפוליסה.");
            setIsUploading(false);
        }
    }
    // Wizard step rendering logic
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">טוען...</div>;
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
