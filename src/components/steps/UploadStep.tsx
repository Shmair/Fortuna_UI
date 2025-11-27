import React, { useCallback, useMemo, useRef, useState } from 'react';
import BackButton from '../layout/BackButton';
import ExistingPolicyCard from './upload/ExistingPolicyCard';
import ProviderDetailsForm from './upload/ProviderDetailsForm';
import UploadActions from './upload/UploadActions';
import UploadOverlay from './upload/UploadOverlay';

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
  const [policyType, setPolicyType] = useState('');
  const [removed, setRemoved] = useState(false);
  const fileInputRef = useRef(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear - 2];
  }, []);

  const providerOptions = useMemo(
    () => ISRAELI_PROVIDERS.map(name => ({ value: name, label: name })),
    []
  );

  const policyTypeOptions = useMemo(() => ([
    { value: 'private', label: 'פרטית' },
    { value: 'group', label: 'קבוצתית' }
  ]), []);

  const selectOptions = useMemo(() => ({
    providers: providerOptions,
    years: yearOptions.map(year => ({ value: String(year), label: String(year) })),
    policyTypes: policyTypeOptions
  }), [policyTypeOptions, providerOptions, yearOptions]);

  const isReadyToUpload = provider.trim().length > 0 && version.trim().length > 0 && policyType.trim().length > 0;
  const hasExistingPolicy = Boolean(policyName) && !removed;
  const progressValue = useMemo(() => {
    const base = hasExistingPolicy ? 70 : 45;
    const numericProgress = typeof uploadProgress === 'number' && uploadProgress > 0 ? uploadProgress : base;
    return Math.min(100, Math.max(15, numericProgress));
  }, [hasExistingPolicy, uploadProgress]);

  const resetError = useCallback(() => {
    setUploadError(null);
  }, []);

  const handleRemoveExisting = useCallback(() => {
    setRemoved(true);
    resetError();
  }, [resetError]);

  const handleContinueWithoutPolicy = useCallback(() => {
    alert('המשכת ללא ביטוח פרטי');
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

  return (
    <div className="text-right">
      <div className="bg-white/90 backdrop-blur-sm border border-white rounded-[32px] shadow-[0_35px_120px_rgba(15,46,71,0.12)] p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-primary)]">
          <span className="text-xs text-gray-400">שלב {hasExistingPolicy ? '3/3' : '2/3'}</span>
        </div>
        <div className="text-sm text-[rgba(15,46,71,0.65)]">
          <div className="h-2 bg-[rgba(57,164,135,0.15)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-button)] transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">העלאת פוליסת ביטוח</h3>
          <p className="text-base sm:text-lg text-[rgba(15,46,71,0.78)]">
            ננתח את כל סעיפי הפוליסה שלכם ונבנה צ'אט חכם שיוביל אתכם לצעד הבא בדרך להחזרים שמגיעים לכם.
          </p>
        </div>

        {hasExistingPolicy ? (
          <ExistingPolicyCard
            policyName={policyName}
            onRemove={handleRemoveExisting}
            onContinue={onContinueWithPolicy}
          />
        ) : (
          <>
            <ProviderDetailsForm
              provider={provider}
              version={version}
              policyType={policyType}
              onProviderChange={event => setProvider(event.target.value)}
              onVersionChange={event => setVersion(event.target.value)}
              onPolicyTypeChange={event => setPolicyType(event.target.value)}
              versionOptions={selectOptions}
              isDisabled={isUploading}
            />
            <UploadActions
              fileInputRef={fileInputRef}
              onFileSelect={handleFileChange}
              isUploading={isUploading}
              canUpload={isReadyToUpload}
              onContinueWithoutPolicy={handleContinueWithoutPolicy}
              uploadError={uploadError}
            />
          </>
        )}

        {showBackButton && (
          <div className="mt-6 flex w-full justify-start">
            <BackButton onClick={onBack} />
          </div>
        )}
      </div>

      <UploadOverlay isVisible={isUploading} />
    </div>
  );
}