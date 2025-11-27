type ProgressProps = {
  value?: number;
  max?: number;
  className?: string;
};

export function Progress({ value = 0, max = 100, className = "" }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = max === 0 ? 0 : (clamped / max) * 100;
  return (
    <div className={`w-full h-3 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-black transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
