import { Upload, X } from 'lucide-react';
import React from 'react';
import BackButton from '../layout/BackButton';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export default function UploadStep({ onUpload, isUploading, uploadProgress, onBack, policyName, onContinueWithPolicy, userName, showBackButton = true, showBypassNotice = false }) {
    const [file, setFile] = React.useState(null);
    const [removed, setRemoved] = React.useState(false);
    const [uploadError, setUploadError] = React.useState(null);
    
    const handleRemove = () => {
        setRemoved(true);
        setUploadError(null); // Clear error when removing file
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setUploadError(null); // Clear any previous errors
        
        if (selectedFile && onUpload) {
            try {
                await onUpload(selectedFile);
            } catch (err) {
                console.error('Upload error in UploadStep:', err);
                
                // Try to extract Hebrew error message from API response
                let errorMessage = 'שגיאה בהעלאת הקובץ';
                
                if (err.message) {
                    // Check if the error message contains Hebrew error details
                    if (err.message.includes('שגיאה בהעלאת הקובץ')) {
                        errorMessage = err.message;
                    } else if (err.message.includes('HTTP 400')) {
                        // For HTTP 400 errors, try to get more specific message
                        errorMessage = 'שגיאה בהעלאת הקובץ: הקובץ אינו תקין או בפורמט לא נתמך';
                    } else {
                        errorMessage = `שגיאה בהעלאת הקובץ: ${err.message}`;
                    }
                }
                
                setUploadError(errorMessage);
            }
        }
    };

    return (
        <div className="space-y-6 text-center">
            {/* UX-ID: progress_context - Step descriptions */}
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">העלאת פוליסת ביטוח</h3>
                <p className="text-sm text-gray-600">
                    ננתח את כל סעיפי הפוליסה כדי לבנות עבורכם שאלון חכם ולזהות החזרים רלוונטיים.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-green-700">
                        📄 <strong>תומך בקבצים:</strong> PDF, תמונות (JPG, PNG, GIF, WebP, BMP, TIFF)
                    </p>
                </div>
            </div>
            
            {userName && showBypassNotice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                        שלום {userName}! הפרופיל שלך מלא, דילגנו על שלב הפרטים האישיים.
                    </p>
                </div>
            )}
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
                        {/* <Button
                            variant="outline"
                            className="w-full max-w-md font-bold text-base px-6 py-3 rounded-lg shadow-none flex items-center justify-center gap-2"
                            onClick={() => document.getElementById('file-upload-input').click()}
                        >
                            <Upload className="h-4 w-4 ml-2" />
                            החלף פוליסה
                        </Button> */}
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-6 flex justify-center" data-testid="upload-area">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-upload-input"
                            data-testid="file-input"
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
                    {/* Display upload error */}
                    {uploadError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">שגיאה בהעלאת הקובץ:</p>
                            <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                        </div>
                    )}
                </>
            )}
            {showBackButton && (
                <div className="mt-4 flex w-full">
                    <BackButton onClick={onBack} />
                </div>
            )}
            {isUploading && (
                <div className="mt-4">
                    <Progress value={typeof uploadProgress !== 'undefined' ? uploadProgress : 11} className="[&>div]:bg-green-600" />
                    <div className="text-xs text-gray-500 mt-1">{typeof uploadProgress !== 'undefined' ? uploadProgress : 10}%</div>
                    {uploadProgress === 100 && (
                        <div className="text-green-700 text-sm mt-1" data-testid="upload-success">העלאה הושלמה</div>
                    )}
                </div>
            )}
        </div>
    );
}