import { ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../layout/BackButton';
import { Button } from '../ui/button';
import { Card } from '../ui/card';


// QuestionCard: Single question UI
const QuestionCard = ({ questionText, onAnswer, answer }) => {
    // Color logic for card and buttons
    let cardBg = 'bg-white border-gray-200';
    if (answer === true) cardBg = 'bg-green-50 border-green-300';
    else if (answer === false) cardBg = 'bg-red-50 border-red-200';

    return (
        <Card className={`p-4 transition-all ${cardBg}`}>
            <div className="flex justify-between items-center">
                <p className="flex-1 font-medium">{questionText}</p>
                <div className="flex gap-2">
                    {/* YES button */}
                    <Button
                        size="icon"
                        className={`border-2 transition-all ${answer === true
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-green-50 border-green-200 text-green-700'}`}
                        style={{ boxShadow: 'none' }}
                        aria-pressed={answer === true}
                        onClick={() => onAnswer(true)}
                    >
                        <Check className={`w-4 h-4 ${answer === true ? 'text-white' : 'text-green-700'}`} />
                    </Button>
                    {/* NO button */}
                    <Button
                        size="icon"
                        className={`border-2 transition-all ${answer === false
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-red-50 border-red-200 text-red-700'}`}
                        style={{ boxShadow: 'none' }}
                        aria-pressed={answer === false}
                        onClick={() => onAnswer(false)}
                    >
                        <X className={`w-4 h-4 ${answer === false ? 'text-white' : 'text-red-700'}`} />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

// SmartQuestionnaireStep: Dynamic questionnaire logic
export default function SmartQuestionnaireStep({ questions, onNext, userData, onBack }) {
    const [answers, setAnswers] = useState({});
    const [activeGroup, setActiveGroup] = useState(null);
    const [completedGroups, setCompletedGroups] = useState([]);

    // Filter questions by user profile
    const filteredQuestions = Array.isArray(questions) ? questions.filter(item => {
        switch (item.main_category) {
            case "כולנו": return true;
            case "נשים": return userData.gender === "female";
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

    // Group questions by sub_category
    const groups = {};
    filteredQuestions.forEach(q => {
        const group = q.sub_category || 'אחר';
        if (!groups[group]) groups[group] = [];
        groups[group].push(q);
    });
    const groupNames = Object.keys(groups);

    // Answer handler
    const handleAnswer = (questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Progress per group
    const getGroupProgress = (group) => {
        const groupQuestions = groups[group];
        const answered = groupQuestions.filter(q => answers[q.service_name] !== undefined).length;
        return { answered, total: groupQuestions.length };
    };

    // If no questions, show a message
    if (!filteredQuestions || filteredQuestions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-semibold mb-2">לא נמצאו שאלות מתאימות</h3>
                <p className="text-gray-500">לא נמצאו סעיפים רלוונטיים עבורך בפוליסה או שיש בעיה בנתוני הניתוח. נסה להעלות פוליסה אחרת או לעדכן את הפרטים האישיים.</p>
            </div>
        );
    }

    // If a group is selected, show its questions
    if (activeGroup) {
        const groupQuestions = groups[activeGroup];
        // Items needing follow-up in this group
        const itemsWithFollowUps = groupQuestions.filter(item => answers[item.service_name] === true && Array.isArray(item.follow_up_questions) && item.follow_up_questions.length > 0);

        // Use a unique key for each follow-up question: `${item.service_name}_${fu_question.id || fu_question.text}`
        const allFollowUpsAnswered = itemsWithFollowUps.every(item =>
            item.follow_up_questions.every(fu_question =>
            answers[`fu_${item.service_name}_${fu_question.id || fu_question.text}`] !== undefined
            )
        );

        const relevantRefunds = groupQuestions.filter(item => {
            if (answers[item.service_name] !== true) return false;
            if (Array.isArray(item.follow_up_questions) && item.follow_up_questions.length > 0) {
            return item.follow_up_questions.every(fu_question =>
                answers[`fu_${item.service_name}_${fu_question.id || fu_question.text}`] === true
            );
            }
            return true;
        });
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-center mb-2">{activeGroup}</h3>
                    <p className="text-sm text-gray-500 text-center">ענו 'כן' רק אם השירות רלוונטי עבורכם.</p>
                    <div className="space-y-4 mt-4">
                        {groupQuestions.map(item => (
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
                                                {item.follow_up_questions.map((fu_question, idx) => {
                                                    // Always generate a unique key, even if id is missing or undefined
                                                    const key = fu_question.id
                                                        ? `fu_${item.service_name}_${fu_question.id}`
                                                        : `fu_${item.service_name}_${idx}_${fu_question.text}`;
                                                    const answerKey = fu_question.id
                                                        ? `fu_${item.service_name}_${fu_question.id}`
                                                        : `fu_${item.service_name}_${idx}_${fu_question.text}`;
                                                    return (
                                                        <QuestionCard
                                                            key={key}
                                                            questionText={fu_question}
                                                            answer={answers[answerKey]}
                                                            onAnswer={(answer) => handleAnswer(answerKey, answer)}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    {/* <Button
                        onClick={() => setActiveGroup(null)}
                        className="flex items-center gap-2 font-bold text-base px-6 py-3 rounded-lg shadow-none"
                        style={{ background: '#e2e8f0', color: '#222', boxShadow: 'none' }}
                    >
                        <span>חזרה לרשימת התחומים</span>
                        <ArrowLeft className="h-5 w-5" />
                    </Button> */}
                    <Button
                        onClick={() => {
                            setCompletedGroups(prev => prev.includes(activeGroup) ? prev : [...prev, activeGroup]);
                            setActiveGroup(null);
                        }}
                        className="flex items-center gap-2 font-bold text-base px-6 py-3 rounded-lg shadow-none ml-4"
                        style={{ background: '#52ad6ae6', color: '#fff', boxShadow: 'none' }}
                        disabled={Object.keys(answers).length === 0 || (itemsWithFollowUps.length > 0 && !allFollowUpsAnswered)}
                    >
                        <span>סיימתי </span>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
                <div className="mt-4 flex w-full">
                   <BackButton onClick={() => setActiveGroup(null)} />
                </div>
            </div>
        );
    }

    // Show open chat with LLM instead of group selection
    // Import PolicyChatStep dynamically to avoid circular dependency if needed
    const PolicyChatStep = require('./PolicyChatStep').default;
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <PolicyChatStep
                userName={userData.full_name || ''}
                onBack={onBack}
                userId={userData.userId}
            />
        </div>
    );
}
