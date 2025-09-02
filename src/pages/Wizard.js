
import React, { useState, useEffect } from 'react';
import { User, UserSubmission } from '../entities/all';
import { UploadFile, InvokeLLM } from '../integrations/Core';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, ArrowRight, PartyPopper, AlertTriangle, Upload, FileText, Loader2, Check, X, HelpCircle, DollarSign, FileCheck } from 'lucide-react';
import { useToast } from "../components/ui/use-toast";
import UserProfileForm from '../components/UserProfileForm.js';

// Step 0: Personal Details
const PersonalDetailsStep = ({ userData, setUserData, onNext }) => {
    const isValid = userData.date_of_birth && userData.gender && userData.insurance_provider;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">בואו נכיר</h3>
            <p className="text-sm text-gray-500 text-center">הפרטים יעזרו לנו לנתח את הפוליסה בצורה מדויקת יותר.</p>
            <UserProfileForm userData={userData} setUserData={setUserData} />
            <Button onClick={onNext} className="w-full" disabled={!isValid}>
                המשך להעלאת פוליסה <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
        </div>
    );
};

// Step 1: Upload Policy
const UploadStep = ({ onUpload, isUploading }) => {
    const fileInputRef = React.useRef(null);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) onUpload(file);
        event.target.value = null;
    };

    return (
        <div className="text-center space-y-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            <h3 className="text-lg font-semibold">העלאת פוליסת ביטוח</h3>
            <p className="text-sm text-gray-500">ננתח את כל סעיפי הפוליסה כדי לבנות עבורך שאלון חכם.</p>
            <Button onClick={() => fileInputRef.current.click()} variant="default" className="w-full max-w-sm" disabled={isUploading}>
                {isUploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> מנתח את הפוליסה...</>
                ) : (
                    <><Upload className="mr-2 h-4 w-4" /> העלאת קובץ (PDF או תמונה)</>
                )}
            </Button>
        </div>
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
const SmartQuestionnaireStep = ({ analysis, onFinish }) => {
    const [answers, setAnswers] = useState({});

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // Filter for items that need follow-up
    const itemsWithFollowUps = analysis.filter(item => answers[item.service_name] === true && item.follow_up_questions.length > 0);

    // Check if all follow-up questions have been answered
    const allFollowUpsAnswered = itemsWithFollowUps.every(item =>
        item.follow_up_questions.every(fu_question => answers[`${item.service_name}_${fu_question}`] !== undefined)
    );
    
    const relevantRefunds = analysis.filter(item => {
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
                    {analysis.map(item => (
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
    const [userData, setUserData] = useState({});
    
    const [fullAnalysis, setFullAnalysis] = useState([]);
    const [results, setResults] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
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
        if (user) await User.updateMyUserData(userData);
        setStep(1);
    };

    const handlePolicyUpload = async (file) => {
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            const analysisPrompt = `You are a world-class insurance policy analyst. Your task is to meticulously analyze the attached insurance policy document and transform its complex clauses into a simple, two-tiered questionnaire for the user.
Primary Goal: Extract EVERY SINGLE coverage item, refund, or eligibility clause. Do not miss any.
Output Structure: For each clause you find, you MUST format it into a JSON object with the following fields:
1.  \`service_name\`: (string) A clear, user-friendly name for the service. E.g., "Chiropractic Treatments", "Second Medical Opinion".
2.  \`category\`: (string) A general category. E.g., "Alternative Medicine", "Consultations".
3.  \`initial_question\`: (string) A REQUIRED broad, general Yes/No question in HEBREW. Format: "האם השתמשת, ביצעת או נזקקת ל[service_name]?"
4.  \`follow_up_questions\`: (array of strings) A list of specific, targeted questions in HEBREW to be asked ONLY if the user answers "yes" to the \`initial_question\`. These questions must clarify the specific conditions from the policy. E.g., ["האם הטיפול בוצע בחו״ל?", "האם נדרשה הפניית רופא?"]. If no follow-ups are needed, provide an empty array [].
5.  \`refund_details\`: (object) An object containing the raw details extracted directly from the policy, all in HEBREW.
The final JSON output should be a single object containing an array of these structured items.`;

            const analysisResponse = await InvokeLLM({
                prompt: analysisPrompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
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

            if (analysisResponse && analysisResponse.coverage_analysis.length > 0) {
                setFullAnalysis(analysisResponse.coverage_analysis);
                toast({ title: "ניתוח הפוליסה הושלם!", description: `זוהו ${analysisResponse.coverage_analysis.length} סעיפי כיסוי.` });
                setStep(2);
            } else {
                toast({ title: "שגיאה בניתוח", description: "לא הצלחנו לזהות סעיפי כיסוי בפוליסה. אנא ודאו שהקובץ ברור.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "שגיאה כללית", description: "אירעה שגיאה בעיבוד הפוליסה.", variant: "destructive" });
        } finally {
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
            case 1: return <UploadStep onUpload={handlePolicyUpload} isUploading={isUploading} />;
            case 2: return <SmartQuestionnaireStep analysis={fullAnalysis} onFinish={handleFinish} />;
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
