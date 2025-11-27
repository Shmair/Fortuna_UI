import React from 'react';
import FormSelectField from '../../forms/FormSelectField';

export default function ProviderDetailsForm({
  provider,
  onProviderChange,
  version,
  onVersionChange,
  policyType,
  onPolicyTypeChange,
  versionOptions,
  isDisabled
}) {
  return (
    <div className="mt-8 space-y-4">
      <div className="bg-white/95 rounded-[24px] border border-white shadow-[0_25px_80px_rgba(15,46,71,0.08)] p-5 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 text-right">
          <FormSelectField
            id="provider-input"
            label="ספק הביטוח"
            value={provider}
            onChange={onProviderChange}
            disabled={isDisabled}
            placeholder="בחרו ספק ביטוח"
            options={versionOptions.providers}
            required
          />
          <FormSelectField
            id="version-input"
            label="גרסת הפוליסה"
            value={version}
            onChange={onVersionChange}
            disabled={isDisabled}
            placeholder="בחרו את שנת הפוליסה"
            options={versionOptions.years}
            required
          />
        </div>
        <p className="mt-4 text-sm text-[rgba(15,46,71,0.65)]">
          נשתמש בפרטים האלו כדי לוודא שהפוליסה עדכנית ולעזור לנו לבחור את מסלול ההחזרים המתאים ביותר.
        </p>
        <div className="mt-6">
          <FormSelectField
            id="policy-type-input"
            label="סוג הפוליסה"
            value={policyType}
            onChange={onPolicyTypeChange}
            disabled={isDisabled}
            placeholder="בחרו אם הפוליסה פרטית או קבוצתית"
            options={versionOptions.policyTypes}
            required
          />
        </div>
      </div>
    </div>
  );
}
