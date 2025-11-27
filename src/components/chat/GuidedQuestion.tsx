import { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

const GuidedQuestion = ({ 
  question, 
  questionIndex, 
  totalQuestions, 
  onAnswer, 
  onSkip,
  quickActions = []
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  
  const handleAnswer = (answer) => {
    if (answer === 'custom') {
      onAnswer(customAnswer);
    } else {
      onAnswer(answer);
    }
    setSelectedAnswer('');
    setCustomAnswer('');
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>שאלה {questionIndex + 1} מתוך {totalQuestions}</span>
          <span>{Math.round(progress)}% הושלם</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Question */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">{question}</h3>
        <p className="text-sm text-gray-600">
          אנא ענה בדיוק כדי לקבל הערכה מדויקת
        </p>
      </div>
      
      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">בחר תשובה:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleAnswer(action)}
                className="text-right justify-start"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Custom answer input */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">או כתוב תשובה מותאמת:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            placeholder="הקלד תשובה..."
            className="flex-1 px-3 py-2 border rounded-md text-right"
            onKeyPress={(e) => e.key === 'Enter' && handleAnswer('custom')}
          />
          <Button 
            onClick={() => handleAnswer('custom')}
            disabled={!customAnswer.trim()}
            size="sm"
          >
            שלח
          </Button>
        </div>
      </div>
      
      {/* Skip option */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          דלג על השאלה
        </Button>
      </div>
    </div>
  );
};

export default GuidedQuestion;
