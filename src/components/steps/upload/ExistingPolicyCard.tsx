import React from 'react';
import { X } from 'lucide-react';
import ButtonPrimary from '../../common/ButtonPrimary';

export default function ExistingPolicyCard({ policyName, onRemove, onContinue }) {
  if (!policyName) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-base font-semibold">מצאנו פוליסה קיימת במערכת</div>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border px-4 py-2 w-full max-w-md mx-auto">
          <span className="truncate text-right flex-1" title={policyName}>{policyName}</span>
          <button onClick={onRemove} className="ml-2" title="הסר פוליסה">
            <X className="h-4 w-4 text-gray-500 hover:text-red-700" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center">
        <ButtonPrimary
          fullWidth
          className="max-w-md"
          onClick={onContinue}
        >
          המשך עם הפוליסה הקיימת
        </ButtonPrimary>
      </div>
    </div>
  );
}
