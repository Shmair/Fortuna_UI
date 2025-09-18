import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { PartyPopper, FileCheck, AlertTriangle } from 'lucide-react';
import BackButton from './BackButton';

export default function ResultsStep({ results, onRestart, onBack, claim }) {
    // Calculate total refund
    const totalRefund = results.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0);

    // Handler for professional help button
    const handleProfessionalHelp = () => {
        if (typeof claim === 'function') {
            claim(); // parent should setStep(6) or similar
        }
    };

    return (
        <div>
            {results.length > 0 ? (
                <div className="text-center">
                    <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">מצאנו {results.length} החזרים פוטנציאליים!</h2>

                    {/* Total Refund Card */}
                    <div className="bg-green-50 rounded-lg p-4 max-w-lg mx-auto mt-6 mb-2 border border-green-200">
                        <div className="text-lg font-bold text-green-800">סכום החזר פוטנציאלי כולל:</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">{totalRefund.toLocaleString()} ₪</div>
                        <div className="text-xs text-gray-500 mt-1">*הסכום משוער בהתאם לתנוני הפוליסה</div>
                    </div>

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

                    {/* Professional Help Section */}
                    <div className="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto mt-8 mb-2 border border-blue-200 text-right">
                        <div className="font-bold text-lg mb-2">מעוניינים בעזרה מקצועית?</div>
                        <div className="text-sm mb-2">הצוות המומחה שלנו יכול לטפל בכל התביעות בשבילכם – מהכנת המסמכים ועד קבלת ההחזר.</div>
                        <ul className="text-sm mb-2 list-disc pr-4">
                            <li>הכנת כל המסמכים הנדרשים</li>
                            <li>הגשת תביעות לחברות הביטוח</li>
                            <li>שירות מקצועי ואמין</li>
                            <li>מעקב אחר התהליך עד קבלת הכסף</li>
                        </ul>
                        <Button onClick={handleProfessionalHelp} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 mt-2 text-lg transition-colors">כן! רוצה שתטפלו בשבילי <span role="img" aria-label="lightning">⚡</span></Button>
                        <div className="text-xs text-gray-500 mt-1">*התשלום רק במקרה של קבלת החזר בפועל</div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">לא מצאנו החזרים רלוונטיים</h2>
                    <p className="text-gray-600 mt-2">על סמך תשובותיך, לא זוהו החזרים התואמים את התנאים בפוליסה.</p>
                </div>
            )}
            {onBack && (
                <div className="mt-4 flex w-full">
                        <BackButton onClick={onBack} />
                </div>
            )}
        </div>
    );
}
