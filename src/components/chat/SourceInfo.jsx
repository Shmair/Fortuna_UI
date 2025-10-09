export default function SourceInfo({ source, policySection }) {
  if (!source && !policySection) return null;
  return (
    <div className="text-xs text-gray-600">
      {source && <span>מקור: {source}</span>}
      {source && policySection && <span> · </span>}
      {policySection && <span>סעיף: {policySection}</span>}
    </div>
  );
}


