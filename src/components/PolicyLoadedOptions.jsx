import { Button } from './ui/button';
import BackButton from './layout/BackButton';

export default function PolicyLoadedOptions({ onFreeChat, onGuidedFlow, onBack }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <h2 className="text-2xl font-bold mb-2 text-center">הפוליסה נטענה בהצלחה!</h2>
            <p className="text-gray-600 mb-8 text-center">איך תרצו להמשיך מכאן?</p>
            <div className="flex flex-row gap-8 items-center justify-center w-full max-w-3xl">
                {/* Free Chat Card */}
                <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center w-[320px]">
                    <div className="mb-4">
                        <span role="img" aria-label="chat" style={{ fontSize: 40, color: '#b3b3ff' }}>💬</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">צ'אט חופשי</h3>
                    <p className="text-gray-500 text-center mb-6">שאלו את העוזר הדיגיטלי כל שאלה שעולה על דעתכם לגבי הפוליסה, בשפה חופשית, ותקבלו תשובות מידיות.</p>
                    <Button style={{ background: '#22c55e', color: '#fff', fontWeight: 'bold' }} className="w-full py-2 text-lg rounded" onClick={onFreeChat}>אני אשאל שאלות</Button>
                </div>
                {/* Guided Flow Card */}
                <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center w-[320px]">
                    <div className="mb-4">
                        <span role="img" aria-label="guided" style={{ fontSize: 40, color: '#fbbf24' }}>✨</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">המסלול המודרך</h3>
                    <p className="text-gray-500 text-center mb-6">תנו למערכת ההנחיה שלנו לשאול אתכם שאלות ממוקדות כן/לא, שלב אחר שלב, כדי לזהות החזרים פוטנציאליים.</p>
                    <Button style={{ background: '#22c55e', color: '#fff', fontWeight: 'bold' }} className="w-full py-2 text-lg rounded" onClick={onGuidedFlow}>המערכת תשאל אותי</Button>
                </div>
            </div>
            {onBack && (
            <div className="mt-4 flex w-full">
                <BackButton onClick={onBack} />
            </div>            
            )}
        </div>
    );
}
