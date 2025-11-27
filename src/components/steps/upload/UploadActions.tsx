import React from 'react';
import { Upload } from 'lucide-react';
import ButtonPrimary from '../../common/ButtonPrimary';

export default function UploadActions({
  fileInputRef,
  onFileSelect,
  isUploading,
  canUpload,
  onContinueWithoutPolicy,
  uploadError
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={onFileSelect}
        className="hidden"
        data-testid="file-input"
      />
      <ButtonPrimary
        className="gap-2"
        icon={Upload}
        iconPosition="right"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || !canUpload}
      >
        העלאת קובץ (PDF)
      </ButtonPrimary>
      <button
        type="button"
        className="text-sm font-semibold text-[var(--color-secondary-dark)] hover:underline"
        onClick={onContinueWithoutPolicy}
      >
        אין לי ביטוח פרטי / המשך ללא העלאה
      </button>
      {uploadError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg w-full">
          <p className="text-sm text-red-700 font-medium">שגיאה בהעלאת הקובץ:</p>
          <p className="text-sm text-red-600 mt-1">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
