import React, { useState, useEffect } from 'react';
import { getUserProfile, UserSubmission, PotentialRefund } from '../entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, FileText, DollarSign } from 'lucide-react';

const statusMap = {
    identified: { text: 'זוהה', color: 'bg-blue-100 text-blue-800' },
    preparing: { text: 'בהכנת מסמכים', color: 'bg-yellow-100 text-yellow-800' },
    submitted: { text: 'הוגש', color: 'bg-green-100 text-green-800' },
    completed: { text: 'הושלם', color: 'bg-purple-100 text-purple-800' },
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [potentialRefunds, setPotentialRefunds] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Replace with your app's logic to get the logged-in user's email
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

                const userSubmissions = await UserSubmission.filter({ user_email: currentUser.email });
                setSubmissions(userSubmissions);

                if (userSubmissions.length > 0) {
                    const refundIds = userSubmissions.map(s => s.potential_refund_id);
                    const refunds = await PotentialRefund.list(); // Simplified for now
                    const refundsMap = refunds.reduce((acc, refund) => {
                        acc[refund.id] = refund;
                        return acc;
                    }, {});
                    setPotentialRefunds(refundsMap);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateStatus = async (submissionId, newStatus) => {
        await UserSubmission.update(submissionId, { status: newStatus });
        const updatedSubmissions = submissions.map(s => 
            s.id === submissionId ? { ...s, status: newStatus } : s
        );
        setSubmissions(updatedSubmissions);
    };

    if (isLoading) {
        return <div>טוען נתונים...</div>;
    }
    
    if (!user) {
        return <div>יש להתחבר כדי לראות את לוח הבקרה.</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">לוח הבקרה של {user.full_name}</h1>
            
            {submissions.length === 0 ? (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold">עדיין לא מצאנו לך החזרים</h3>
                        <p className="text-gray-500 mt-2">עבור לאשף כדי להתחיל את תהליך הבדיקה.</p>
                        <Button className="mt-4">התחילו עכשיו</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {submissions.map(submission => {
                        const refundDetails = potentialRefunds[submission.potential_refund_id];
                        return (
                            <Card key={submission.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{submission.potential_refund_name}</CardTitle>
                                    <Badge variant="secondary" className={statusMap[submission.status]?.color}>
                                        {statusMap[submission.status]?.text}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <DollarSign className="w-4 h-4 ml-2" />
                                        <span>החזר פוטנציאלי עד: {refundDetails?.max_refund_amount} ₪</span>
                                    </div>
                                    <div className="flex items-start text-sm text-gray-600">
                                        <FileText className="w-4 h-4 ml-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">מסמכים נדרשים:</span>
                                            <ul className="list-disc list-inside mt-1">
                                                {refundDetails?.required_documents.map((doc, i) => <li key={i}>{doc}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t flex gap-2">
                                    {submission.status === 'identified' && (
                                        <Button size="sm" onClick={() => updateStatus(submission.id, 'preparing')}>
                                            התחל הכנת מסמכים
                                        </Button>
                                    )}
                                     {submission.status === 'preparing' && (
                                        <Button size="sm" onClick={() => updateStatus(submission.id, 'submitted')}>
                                            סיימתי והגשתי
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}