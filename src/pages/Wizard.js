import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, UserSubmission } from '../entities/all';
import { UploadFile, InvokeLLM } from '../integrations/Core';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, ArrowRight, PartyPopper, AlertTriangle, Upload, FileText, Loader2, Check, X, HelpCircle, DollarSign, FileCheck } from 'lucide-react';
import { useToast } from "../components/ui/use-toast";
import UserProfileForm from '../components/UserProfileForm.js';
import { supabase }  from '../utils/supabaseClient';
import UploadStep from '../components/UploadStep';

// Step 0: Personal Details
const PersonalDetailsStep = ({ userData, setUserData, onNext }) => {
    // Save user details handler
    const handleSave = async (e) => {
        e.preventDefault();
        if (userData.email) {
            // You may want to validate more fields here
            await updateUserProfile(userData.email, userData);
        }
    };
    const requiredFields = ["email", "date_of_birth", "gender", "insurance_provider"];
    const isValid = true;//requiredFields.every(field => !!userData[field]);
debugger;
    const handleNext = (e) => {
        e.preventDefault();
        if (isValid) {
            onNext();
        }
    };
    return (
    <form id="personal-details-form" className="space-y-4" onSubmit={handleNext}>
            <h3 className="text-lg font-semibold text-center">בואו נכיר</h3>
            <p className="text-sm text-gray-500 text-center">הפרטים יעזרו לנו לנתח את הפוליסה בצורה מדויקת יותר.</p>
            {/* UserProfileForm now includes gender and insurance_provider inputs */}
            <UserProfileForm userData={userData} setUserData={setUserData} />
            <Button type="submit" className="w-full" disabled={!isValid}>
                המשך להעלאת פוליסה <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
            <Button type="button" className="w-full mt-2" variant="outline" onClick={handleSave}>
                שמור פרטי משתמש
            </Button>
        </form>
    );
};

// Component for a single question
const QuestionCard = ({ questionText, onAnswer, answer }) => {
    return (
        <Card className={`p-4 transition-all ${answer === true ? 'border-green-300 bg-green-50' : answer === false ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
                <p className="flex-1 font-medium">{questionText}</p>
                <div className="flex gap-2">
                    <Button size="icon" variant={answer === true ? 'default' : 'outline'} className={`bg-green-100 hover:bg-green-200 text-green-700 ${answer === true ? '!bg-green-600 !text-white' : ''}`} onClick={() => onAnswer(true)}>
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant={answer === false ? 'destructive' : 'outline'} className={`bg-red-100 hover:bg-red-200 text-red-700 ${answer === false ? '!bg-red-600 !text-white' : ''}`} onClick={() => onAnswer(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

// Step 2 & 3: The new dynamic questionnaire
const SmartQuestionnaireStep = ({ analysis, onFinish, userData }) => {
    const [answers, setAnswers] = useState({});

    // userData is now received as a prop

    // Filtering logic based on user profile
    const filteredAnalysis = analysis.filter(item => {
        switch (item.category) {
            case "כולנו":
                return true;
            case "נשים והריון":
                return userData.gender === "female" && (userData.is_pregnant || userData.planning_pregnancy);
            case "ילדים":
                return Array.isArray(userData.children_ages) && userData.children_ages.length > 0;
            case "מבוגרים":
                if (!userData.date_of_birth) return false;
                const birthYear = new Date(userData.date_of_birth).getFullYear();
                const age = new Date().getFullYear() - birthYear;
                return age >= 18;
            default:
                return true;
        }
    });

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // Filter for items that need follow-up
    const itemsWithFollowUps = filteredAnalysis.filter(item => answers[item.service_name] === true && item.follow_up_questions.length > 0);

    // Check if all follow-up questions have been answered
    const allFollowUpsAnswered = itemsWithFollowUps.every(item =>
        item.follow_up_questions.every(fu_question => answers[`${item.service_name}_${fu_question}`] !== undefined)
    );

    const relevantRefunds = filteredAnalysis.filter(item => {
        // Must have answered 'yes' to initial question
        if(answers[item.service_name] !== true) return false;

        // If there are follow ups, all must be 'yes' to be included
        if(item.follow_up_questions.length > 0) {
            return item.follow_up_questions.every(fu_question => answers[`${item.service_name}_${fu_question}`] === true);
        }

        // If no follow ups, just a 'yes' on initial is enough
        return true;
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-center mb-2">שאלון חכם</h3>
                <p className="text-sm text-gray-500 text-center">ענו 'כן' רק אם השירות רלוונטי עבורכם.</p>
                <div className="space-y-4 mt-4">
                    {filteredAnalysis.map(item => (
                        <QuestionCard
                            key={item.service_name}
                            questionText={item.initial_question}
                            answer={answers[item.service_name]}
                            onAnswer={(answer) => handleAnswer(item.service_name, answer)}
                        />
                    ))}
                </div>
            </div>

            {itemsWithFollowUps.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-center mb-2">שאלות המשך</h3>
                    <p className="text-sm text-gray-500 text-center">כמה שאלות נוספות כדי לדייק את הזכאות.</p>
                    <div className="space-y-4 mt-4">
                        {itemsWithFollowUps.map(item => (
                            <div key={item.service_name} className="p-4 border rounded-lg bg-gray-50">
                                <p className="font-semibold mb-3">לגבי "{item.service_name}":</p>
                                <div className="space-y-3">
                                    {item.follow_up_questions.map(fu_question => (
                                         <QuestionCard
                                            key={fu_question}
                                            questionText={fu_question}
                                            answer={answers[`${item.service_name}_${fu_question}`]}
                                            onAnswer={(answer) => handleAnswer(`${item.service_name}_${fu_question}`, answer)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Button onClick={() => onFinish(relevantRefunds)} className="w-full" disabled={Object.keys(answers).length === 0 || (itemsWithFollowUps.length > 0 && !allFollowUpsAnswered)}>
                הצג את ההחזרים שלי
                <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
        </div>
    );
};


// Step 4: Results
const ResultsStep = ({ results, onRestart }) => {
    return (
        <div>
            {results.length > 0 ? (
                <div className="text-center">
                    <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">מצאנו {results.length} החזרים פוטנציאליים!</h2>
                    <div className="mt-6 space-y-4 text-right">
                        {results.map(r => (
                            <Card key={r.service_name}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{r.service_name}</span>
                                        <span className="text-green-600 text-lg">{r.refund_details.refund_amount}</span>
                                    </CardTitle>
                                    <CardDescription>{r.category}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                     <p><span className="font-semibold">תנאי זכאות:</span> {r.refund_details.eligibility_conditions}</p>
                                      <div className="flex items-start p-2 rounded-md bg-blue-50 border border-blue-200">
                                        <FileCheck size={16} className="ml-2 mt-0.5 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold">מסמכים נדרשים:</span>
                                            <p className="text-xs mt-1">{r.refund_details.required_documents}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">לא מצאנו החזרים רלוונטיים</h2>
                    <p className="text-gray-600 mt-2">על סמך תשובותיך, לא זוהו החזרים התואמים את התנאים בפוליסה.</p>
                </div>
            )}
            <Button onClick={onRestart} variant="outline" className="w-full mt-6">בדיקה חדשה</Button>
        </div>
    );
};


export default function Wizard() {
    const [step, setStep] = useState(0);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        email: "",
        date_of_birth: "",
        gender: "",
        insurance_provider: "",
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
    const { toast } = useToast();

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
                    insurance_provider: currentUser.insurance_provider || ''
                });
            } catch (e) { /* User not logged in */ }
            finally { setIsLoading(false); }
        };
        loadUser();
    }, []);

    const handlePersonalDetailsNext = async () => {
        if (user) await updateUserProfile(user.email, userData);
        setStep(1);
    };

    const handlePolicyUpload = async (file) => {debugger
        setIsUploading(true);
        try {
            // 1. Hash the file content (SHA-256)
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // 2. Get user profile from Supabase
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, insurance_policy_id')
                .eq('email', user?.email || '')
                .single();
            if (profileError) {
                toast({ title: "שגיאת פרופיל", description: profileError.message, variant: "destructive" });
                setIsUploading(false);
                return;
            }

            // 3. If profile has insurance_policy_id, check the policy
            if (profileData && profileData.insurance_policy_id) {
                const { data: policyData, error: policyError } = await supabase
                    .from('insurance_policies')
                    .select('file_name, file_hash')
                    .eq('id', profileData.insurance_policy_id)
                    .single();
                if (policyError) {
                    toast({ title: "שגיאת פוליסה", description: policyError.message, variant: "destructive" });
                    setIsUploading(false);
                    return;
                }
                if (policyData.file_hash === hashHex) {
                    setExistingPolicyFile(policyData.file_name);
                    setStep(1); // Show file name and next btn
                    setIsUploading(false);
                    return;
                } else {
                    toast({ title: "פוליסה קיימת שונה", description: "הפוליסה הקיימת שונה מהקובץ שהועלה. אנא פנה לתמיכה לעדכון.", variant: "destructive" });
                    setIsUploading(false);
                    return;
                }
            }

            // 4. If no insurance_policy_id, upload file and create policy
            const { file_url } = await UploadFile({ file });
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
            // Insert new policy
            const { data: insertData, error: insertError } = await supabase
                .from('insurance_policies')
                .insert([
                    {
                        file_hash: hashHex,
                        file_url,
                        uploaded_at: new Date().toISOString(),
                        file_name: file.name,
                        insurance_provider: analysisResponse?.insurance_provider || null
                    }
                ])
                .select();
            if (insertError || !insertData || !insertData[0]) {
                toast({ title: "שגיאה בשמירת הפוליסה", description: insertError?.message || 'לא התקבל מזהה פוליסה', variant: "destructive" });
                setIsUploading(false);
                return;
            }
            // Update profile with insurance_policy_id
            await supabase
                .from('profiles')
                .update({ insurance_policy_id: insertData[0].id })
                .eq('id', profileData.id);
            setExistingPolicyFile(file.name);
            setStep(1); // Show file name and next btn
            setIsUploading(false);
        } catch (error) {
            toast({ title: "שגיאה כללית", description: "אירעה שגיאה בעיבוד הפוליסה.", variant: "destructive" });
            setIsUploading(false);
        }
    };
    
    const handleFinish = async (finalResults) => {
        setResults(finalResults);
        if (user && finalResults.length > 0) {
            const submissions = finalResults.map(r => ({
                user_email: user.email,
                potential_refund_id: r.service_name, // Using service_name as a unique id for now
                potential_refund_name: r.service_name,
                status: 'identified'
            }));
            await UserSubmission.bulkCreate(submissions);
        }
        setStep(3); // Step 3 is now the results page
    };

    const handleRestart = () => {
        setStep(0);
        setFullAnalysis([]);
        setResults([]);
    };

    const handleExistingPolicyNext = () => {
        setStep(2);
    };

    const getProgress = () => {
        if (step === 0) return 10;
        if (step === 1) return 30;
        if (step === 2) return 60;
        if (step === 3) return 100;
        return 0;
    };

    if(isLoading) return <p className="text-center p-8">טוען...</p>;

    const renderStep = () => {
        switch(step) {
            case 0: return <PersonalDetailsStep userData={userData} setUserData={setUserData} onNext={handlePersonalDetailsNext} />;
            case 1: return <UploadStep onUpload={handlePolicyUpload} isUploading={isUploading} existingPolicyFile={existingPolicyFile} onNext={handleExistingPolicyNext} />;
            case 2: return <SmartQuestionnaireStep analysis={fullAnalysis} onFinish={handleFinish} userData={userData} />;
            case 3: return <ResultsStep results={results} onRestart={handleRestart} />;
            default: return null;
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Progress value={getProgress()} className="mb-4" />
                <CardTitle>אשף ההחזרים החכם</CardTitle>
                <CardDescription>
                    {step === 0 && "ספרו לנו קצת עליכם."}
                    {step === 1 && "העלו את פוליסת הביטוח המלאה לניתוח עומק."}
                    {step === 2 && "ענו על השאלון הדינמי שנבנה במיוחד עבורכם."}
                    {step === 3 && "אלו ההחזרים שמצאנו עבורכם בפוליסה!"}
                </CardDescription>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
            {step > 0 && step < 3 && (
                <CardFooter className="flex justify-start">
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                        <ArrowRight className="ml-2 h-4 w-4" /> חזור
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
