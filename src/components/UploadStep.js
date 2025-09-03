import React from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

export default function UploadStep({ onUpload, isUploading, existingPolicyFile, onNext }) {
    const [file, setFile] = React.useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (file && onUpload) {
            await onUpload(file);
        }
    };

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">העלאת פוליסה</h3>
            <p className="text-sm text-gray-500">בחרו קובץ פוליסה להעלאה וניתוח.</p>
            {existingPolicyFile ? (
                <div className="mb-4">
                    <span className="font-semibold">קובץ קיים:</span> {existingPolicyFile}
                    <Button className="w-full mt-4" onClick={onNext}>
                        המשך <Upload className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full" />
                    <Button className="w-full mt-4" onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? 'מעלה...' : 'העלה פוליסה'} <Upload className="ml-2 h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
}
