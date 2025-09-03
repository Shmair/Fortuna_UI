import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { PartyPopper, FileCheck, AlertTriangle } from 'lucide-react';
import React from 'react';

export default function ResultsStep({ results, onRestart }) {
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
}
