import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { PartyPopper, FileCheck, AlertTriangle } from 'lucide-react';
import BackButton from './BackButton';

export default function ResultsStep({ results, onRestart, onBack }) {
    return (
        <div>
            {results.length > 0 ? (
                <div className="text-center">
                    <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">מצאנו {results.length} החזרים פוטנציאליים!</h2>
                    <div className="mt-6 space-y-4 text-right">
                        {results.map((r, idx) => (
                            <Card key={r.type + idx}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{r.type}</span>
                                        <span className="text-green-600 text-lg">
                                            {r.amount?.toLocaleString?.() || r.amount} {r.currency === 'ILS' ? '₪' : r.currency}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>{r.policy_section}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p><span className="font-semibold">אחוז כיסוי:</span> {r.coverage || 'לא צוין'}</p>
                                    <p><span className="font-semibold">מקסימום החזר:</span> {r.max_limit ? r.max_limit + ' ₪' : 'לא צוין'}</p>
                                    <p><span className="font-semibold">השתתפות עצמית:</span> {r.co_payment ? r.co_payment + ' ₪' : 'לא צוין'}</p>
                                    <p><span className="font-semibold">בתוקף עד:</span> {r.valid_until || 'לא צוין'}</p>
                                    <p><span className="font-semibold">הערות:</span> {r.notes || '—'}</p>
                                    <div className="flex items-start p-2 rounded-md bg-blue-50 border border-blue-200">
                                        <FileCheck size={16} className="ml-2 mt-0.5 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold">מסמכים נדרשים:</span>
                                            <ul className="text-xs mt-1 list-disc pr-4">
                                                {(Array.isArray(r.required_documents) ? r.required_documents : [r.required_documents]).map((doc, i) => (
                                                    <li key={i}>{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <p><span className="font-semibold">סטטוס:</span> {r.status === 'eligible' ? 'מגיע' : r.status === 'pending_info' ? 'חסר מידע' : r.status === 'not_covered' ? 'לא מכוסה' : r.status}</p>
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
             {onBack && (
                <div className="mt-4 flex w-full">
                        <BackButton onClick={onBack} />
                </div>
            )}
        </div>
    );
}
