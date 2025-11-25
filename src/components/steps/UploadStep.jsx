import { Upload, X } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import BackButton from '../layout/BackButton';
import { Button } from '../ui/button';

const ISRAELI_PROVIDERS = [
  'הפניקס',
  'AIG',
  'הכשרה',
  'כלל ביטוח',
  'הראל',
  'מגדל',
  'מנורה מבטחים',
  'איילון',
  'ביטוח ישיר',
  'דקלה',
  'פסגות',
  'פסגת גרניט',
  'תמורה'
];

const ACCEPTED_FILE_TYPES = '.pdf,image/*';

export default function UploadStep({
  onUpload,
  isUploading,
  uploadProgress,
  onBack,
  policyName,
  onContinueWithPolicy,
  userName,
  showBackButton = true,
  showBypassNotice = false
}) {
  const [uploadError, setUploadError] = useState(null);
  const [provider, setProvider] = useState('');
  const [version, setVersion] = useState('');
  const [removed, setRemoved] = useState(false);
  const fileInputRef = useRef(null);

  const versionOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear - 2];
  }, []);

  const isReadyToUpload = provider.trim().length > 0 && version.trim().length > 0;
  const hasExistingPolicy = Boolean(policyName) && !removed;

  const resetError = useCallback(() => {
    setUploadError(null);
  }, []);

  const handleRemoveExisting = useCallback(() => {
    setRemoved(true);
    resetError();
  }, [resetError]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files?.[0];
    resetError();

    if (!selectedFile) return;

    if (!isReadyToUpload) {
      setUploadError('אנא הזינו את שם ספק הביטוח ואת גרסת הפוליסה לפני ההעלאה.');
      return;
    }

    try {
      await onUpload(selectedFile, provider.trim(), version.trim());
    } catch (err) {
      console.error('Upload error in UploadStep:', err);
      let errorMessage = 'שגיאה בהעלאת הקובץ';

      if (typeof err?.message === 'string') {
        if (err.message.includes('שגיאה בהעלאת הקובץ')) {
          errorMessage = err.message;
        } else if (err.message.includes('HTTP 400')) {
          errorMessage = 'שגיאה בהעלאת הקובץ: הקובץ אינו תקין או בפורמט לא נתמך';
        } else {
          errorMessage = `שגיאה בהעלאת הקובץ: ${err.message}`;
        }
      }

      setUploadError(errorMessage);
    }
  }, [isReadyToUpload, onUpload, provider, resetError, version]);

  const renderHeader = () => (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-gray-800">העלאת פוליסת ביטוח</h3>
      <p className="text-sm text-gray-600">
        ננתח את כל סעיפי הפוליסה כדי לבנות עבורכם שאלון חכם ולזהות החזרים רלוונטיים.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-green-700">
          📄 <strong>תומך בקבצי:</strong> PDF
        </p>
      </div>
    </div>
  );

  const renderBypassNotice = () => {
    if (!userName || !showBypassNotice) return null;
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-700">
          שלום {userName}! הפרופיל שלך מלא, דילגנו על שלב הפרטים האישיים.
        </p>
      </div>
    );
  };

  const renderExistingPolicy = () => (
    <>
      <div className="mt-6">
        <div className="mb-2 text-base font-semibold">מצאנו פוליסה קיימת במערכת</div>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border px-4 py-2 w-full max-w-md mx-auto">
          <span className="truncate text-right flex-1" title={policyName}>{policyName}</span>
          <button onClick={handleRemoveExisting} className="ml-2" title="הסר פוליסה">
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
      </div>
    </>
  );

  const renderProviderInputs = () => (
    <div className="mt-6 grid gap-4 text-right">
      <div className="space-y-1">
        <label htmlFor="provider-input" className="text-sm font-medium text-gray-700 block text-right">
          ספק הביטוח
        </label>
        <select
          id="provider-input"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          value={provider}
          onChange={event => setProvider(event.target.value)}
          disabled={isUploading}
        >
          <option value="">בחרו ספק ביטוח</option>
          {ISRAELI_PROVIDERS.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="version-input" className="text-sm font-medium text-gray-700 block text-right">
          גרסת הפוליסה
        </label>
        <select
          id="version-input"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          value={version}
          onChange={event => setVersion(event.target.value)}
          disabled={isUploading}
        >
          <option value="">בחרו את שנת הפוליסה</option>
          {versionOptions.map(year => (
            <option key={year} value={String(year)}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderUploadCta = () => (
    <div className="mt-4 flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />
      <Button
        className="flex items-center justify-center gap-2 font-bold text-base px-6 py-3 rounded-lg shadow-none"
        disabled={isUploading || !isReadyToUpload}
        onClick={openFilePicker}
      >
        <span className="w-full text-center">העלאת קובץ (PDF)</span>
        <Upload className="ml-2 h-4 w-4" />
      </Button>
      <button
        type="button"
        className="text-sm text-blue-700 hover:underline font-semibold"
        onClick={() => alert('המשכת ללא ביטוח פרטי')}
      >
        אין לי ביטוח פרטי / המשך ללא העלאה
      </button>
    </div>
  );

  const renderError = () => {
    if (!uploadError) return null;
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700 font-medium">שגיאה בהעלאת הקובץ:</p>
        <p className="text-sm text-red-600 mt-1">{uploadError}</p>
      </div>
    );
  };

  const renderOverlay = () => {
    if (!isUploading) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-white shadow-sm max-w-sm w-[92%]">
          <div className="relative h-12 w-12">
            <svg className="animate-spin h-12 w-12 text-green-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold text-gray-800">מעלה את הפוליסה…</div>
            <div className="text-sm text-gray-600 mt-1">זה עשוי לקחת עד 2 דקות לקבצים גדולים</div>
            <div className="text-xs text-gray-500 mt-2">נא לא לסגור את הדפדפן בזמן ההעלאה</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-center">
      {renderHeader()}
      {renderBypassNotice()}

      {hasExistingPolicy ? (
        renderExistingPolicy()
      ) : (
        <>
          {renderProviderInputs()}
          {renderUploadCta()}
          {renderError()}
        </>
      )}

      {showBackButton && (
        <div className="mt-4 flex w-full">
          <BackButton onClick={onBack} />
        </div>
      )}

      {renderOverlay()}
    </div>
  );
}