import { Upload, X } from 'lucide-react';
import React from 'react';
import BackButton from './BackButton';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

export default function UploadStep({ onUpload, isUploading, uploadProgress, onBack, policyName, onContinueWithPolicy }) {
    const [file, setFile] = React.useState(null);
    const [removed, setRemoved] = React.useState(false);
    const handleRemove = () => {
        setRemoved(true);
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile && onUpload) {
            try {
                await onUpload(selectedFile);
            } catch (err) {
                alert('שגיאה בהעלאת הקובץ: ' + err.message);
            }
        }
    };

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">העלאת פוליסת ביטוח</h3>
            <p className="text-sm text-gray-500">ננתח את כל סעיפי הפוליסה כדי לבנות עבורך שאלון חכם.</p>
            {policyName && !removed ? (
                <>
                    <div className="mt-6">
                        <div className="mb-2 text-base font-semibold">מצאנו פוליסה קיימת במערכת</div>
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg border px-4 py-2 w-full max-w-md mx-auto">
                            <span className="truncate text-right flex-1" title={policyName}>{policyName}</span>
                            <button onClick={handleRemove} className="ml-2" title="הסר פוליסה">
                                <X className="h-4 w-4 text-gray-500 hover:text-red-700" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 items-center">
                        <Button
                            className="w-full max-w-md font-bold text-base px-6 py-3 rounded-lg shadow-none"
                            style={{ background: '#222', color: '#fff' }}
                            onClick={onContinueWithPolicy}
                        >
                            המשך עם הפוליסה הקיימת
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full max-w-md font-bold text-base px-6 py-3 rounded-lg shadow-none flex items-center justify-center gap-2"
                            onClick={() => document.getElementById('file-upload-input').click()}
                        >
                            <Upload className="h-4 w-4 ml-2" />
                            החלף פוליסה
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-6 flex justify-center">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-upload-input"
                        />
                        <Button
                            className="flex items-center justify-center gap-2 font-bold text-base px-6 py-3 rounded-lg shadow-none"
                            disabled={isUploading}
                            onClick={() => document.getElementById('file-upload-input').click()}
                        >
                            <span className="w-full text-center">העלאת קובץ (PDF או תמונה)</span>
                            <Upload className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-4">
                        <a
                            href="#"
                            className="text-sm text-blue-700 hover:underline font-semibold"
                            style={{ display: 'inline-block' }}
                            onClick={e => { e.preventDefault(); alert('המשכת ללא ביטוח פרטי'); }}
                        >
                            אין לי ביטוח פרטי / המשך ללא העלאה
                        </a>
                    </div>
                </>
            )}
            <div className="mt-4 flex w-full">
                <BackButton onClick={onBack} />
            </div>
            {isUploading && (
                <div className="mt-4">
                    <Progress value={typeof uploadProgress !== 'undefined' ? uploadProgress : 11} className="[&>div]:bg-green-600" />
                    <div className="text-xs text-gray-500 mt-1">{typeof uploadProgress !== 'undefined' ? uploadProgress : 10}%</div>
                </div>
            )}
        </div>
    );
}