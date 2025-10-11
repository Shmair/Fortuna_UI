export default function SourceChip({ source, policySection, className = '' }) {
  if (!source && !policySection) return null;
  
  const displayText = policySection ? `סעיף ${policySection}` : source;
  
  return (
    <div className={`inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border ${className}`}>
      <span className="text-gray-500 mr-1">מקור:</span>
      <span>{displayText}</span>
    </div>
  );
}
