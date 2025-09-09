import { Upload } from 'lucide-react';
import React from 'react';
import BackButton from './BackButton';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

export default function UploadStep({ onUpload, isUploading, uploadProgress, onBack }) {
    const [file, setFile] = React.useState(null);

    const handleFileChange = async (e) => {debugger
        const selectedFile = e.target.files[0];
        setFile(selectedFile);debugger
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
                    // style={{ background: '#52ad6ae6', color: '#fff', boxShadow: 'none', minWidth: '220px', maxWidth: '340px' }}
                    disabled={isUploading}
                    onClick={() => document.getElementById('file-upload-input').click()}
                >
                    <span className="w-full text-center">העלאת קובץ (PDF או תמונה)</span>
                    <Upload className="ml-2 h-4 w-4" />
                </Button>
            </div>
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