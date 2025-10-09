export default function QuickActions({ actions = [], onAction }) {
  if (!Array.isArray(actions) || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={() => onAction?.(typeof a === 'string' ? a : (a.label || a.action || ''))}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs border border-blue-300 transition-colors duration-200"
        >
          {typeof a === 'string' ? a : (a.label || a.action)}
        </button>
      ))}
    </div>
  );
}


