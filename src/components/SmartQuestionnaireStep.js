import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, X, ArrowLeft } from 'lucide-react';

// QuestionCard: Single question UI
const QuestionCard = ({ questionText, onAnswer, answer }) => (
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

// SmartQuestionnaireStep: Dynamic questionnaire logic
export default function SmartQuestionnaireStep({ analysis, onFinish, userData }) {
    const [answers, setAnswers] = useState({});
    // Filter analysis by user profile
    const filteredAnalysis = Array.isArray(analysis) ? analysis.filter(item => {
        switch (item.category) {
            case "כולנו": return true;
            case "נשים והריון": return userData.gender === "female" && (userData.is_pregnant || userData.planning_pregnancy);
            case "ילדים": return Array.isArray(userData.children_ages) && userData.children_ages.length > 0;
            case "מבוגרים":
                if (!userData.date_of_birth) return false;
                const birthYear = new Date(userData.date_of_birth).getFullYear();
                const age = new Date().getFullYear() - birthYear;
                return age >= 18;
            default: return true;
        }
    }) : [];
    // Answer handler
    const handleAnswer = (questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }));
    // Items needing follow-up
    const itemsWithFollowUps = filteredAnalysis.filter(item => answers[item.service_name] === true && item.follow_up_questions.length > 0);
    // All follow-ups answered?
    const allFollowUpsAnswered = itemsWithFollowUps.every(item => item.follow_up_questions.every(fu_question => answers[`${item.service_name}_${fu_question}`] !== undefined));
    // Final relevant refunds
    const relevantRefunds = filteredAnalysis.filter(item => {
        if(answers[item.service_name] !== true) return false;
        if(item.follow_up_questions.length > 0) {
            return item.follow_up_questions.every(fu_question => answers[`${item.service_name}_${fu_question}`] === true);
        }
        return true;
    });
    // If no questions, show a message
    if (!filteredAnalysis || filteredAnalysis.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-semibold mb-2">לא נמצאו שאלות מתאימות</h3>
                <p className="text-gray-500">לא נמצאו סעיפים רלוונטיים עבורך בפוליסה או שיש בעיה בנתוני הניתוח. נסה להעלות פוליסה אחרת או לעדכן את הפרטים האישיים.</p>
            </div>
        );
    }
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
}
