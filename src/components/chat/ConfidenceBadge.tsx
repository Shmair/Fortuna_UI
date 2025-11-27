export default function ConfidenceBadge({ confidence }) {
  if (typeof confidence !== 'number') return null;
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? 'bg-green-100 text-green-800 border-green-200' : pct >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200';
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded border ${color}`} aria-label={`Confidence ${pct}%`}>
      ביטחון {pct}%
    </span>
  );
}



