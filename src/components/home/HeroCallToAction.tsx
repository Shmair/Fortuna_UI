import React, { useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HeroCallToAction({ isAuthenticated, setShowAuth }) {
  const handleClick = useCallback(() => {
    if (isAuthenticated) {
      window.location.href = '/wizard';
      return;
    }
    setShowAuth(true);
  }, [isAuthenticated, setShowAuth]);

  return (
    <button
      className="btn-dark flex items-center gap-3 px-14 py-4 rounded-full shadow-xl"
      style={{ fontSize: '30px' }}
      onMouseOver={e => e.currentTarget.classList.add('main-btn-hover')}
      onMouseOut={e => e.currentTarget.classList.remove('main-btn-hover')}
      onClick={handleClick}
    >
      מצאו את ההחזרים שלכם
      <ArrowLeft className="w-6 h-6" color="#fff" />
    </button>
  );
}
