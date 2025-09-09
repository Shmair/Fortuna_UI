import React from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { Progress } from './ui/progress';

export default function UploadStep({ onUpload, isUploading, uploadProgress }) {debugger;
    const [file, setFile] = React.useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (file && onUpload) {
            try {
                await onUpload(file); // Pass the uploaded file URL to parent
            } catch (err) {
                alert('שגיאה בהעלאת הקובץ: ' + err.message);
            }
        }
    };

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">העלאת פוליסה</h3>
            <p className="text-sm text-gray-500">בחרו קובץ פוליסה להעלאה וניתוח.</p>
                <>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full" />
                    <Button className="w-full mt-4" onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? 'מעלה...' : 'העלה פוליסה'} <Upload className="ml-2 h-4 w-4" />
                    </Button>
                    {isUploading && (
                        <div className="mt-4">
                            <Progress value={typeof uploadProgress !== 'undefined' ? uploadProgress : 10} />
                            <div className="text-xs text-gray-500 mt-1">{typeof uploadProgress !== 'undefined' ? uploadProgress : 10}%</div>
                        </div>
                    )}
                </>
        </div>
    );
}
