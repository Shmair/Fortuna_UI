import React from 'react';
import FeatureCard from './FeatureCard';

export default function FeatureSteps({ steps = [] }) {
  return (
    <div className="mt-10 sm:mt-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">איך זה עובד?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-xs sm:max-w-5xl mx-auto">
        {steps.map(step => (
          <FeatureCard
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>
    </div>
  );
}
