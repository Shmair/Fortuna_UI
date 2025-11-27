import React from 'react';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg shadow-[rgba(15,46,71,0.08)] hover:shadow-2xl transition-shadow text-center border border-white/60">
      <div className="flex items-center justify-center h-14 w-14 rounded-full mb-4 mx-auto" style={{ background: 'rgba(57, 164, 135, 0.12)' }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[var(--color-primary)]">{title}</h3>
      <p className="text-[rgba(15,46,71,0.75)] text-sm leading-6">{description}</p>
    </div>
  );
}
