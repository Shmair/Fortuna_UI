import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ROUTES, ROUTES_TITLES, STRINGS } from "../../constants/header";

export default function Header({ isAuthenticated, userName, setShowAuth, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: createPageUrl(ROUTES.HOME), text: ROUTES_TITLES.HOME },
    { to: createPageUrl(ROUTES.WIZARD), text: ROUTES_TITLES.WIZARD },
    { to: createPageUrl(ROUTES.PROFILE), text: ROUTES_TITLES.PROFILE },
    { to: createPageUrl(ROUTES.CONTACT), text: ROUTES_TITLES.CONTACT },
    { to: createPageUrl(ROUTES.ABOUT), text: ROUTES_TITLES.ABOUT }
  ];

  const loginText = STRINGS.LOGIN;
  const welcomeText = STRINGS.WELCOME;
  const logoutText = STRINGS.LOGOUT;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const handleNavClick = () => setIsMenuOpen(false);

  const renderAuthButtons = (variant = "desktop") => {
    if (!isAuthenticated) {
      const baseButtonClass = variant === 'mobile' ? 'w-full' : 'min-w-[110px]';
      const handleAuthClick = () => {
        setShowAuth(true);
        setIsMenuOpen(false);
      };

      const registerButton = (
        <button
          className={`btn-outline ${baseButtonClass}`}
          onClick={handleAuthClick}
        >
          הרשמה
        </button>
      );

      const loginButton = (
        <button
          className={`btn-dark ${baseButtonClass}`}
          onClick={handleAuthClick}
        >
          {loginText}
        </button>
      );

      if (variant === 'mobile') {
        return (
          <div className="flex flex-col gap-3 text-right">
            {registerButton}
            {loginButton}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-3 text-sm sm:text-base">
          {registerButton}
          {loginButton}
        </div>
      );
    }

    if (variant === "mobile") {
      return (
        <div className="flex flex-col gap-3 text-right">
          <Link to={createPageUrl(ROUTES.PROFILE)} className="text-green-700">
            {welcomeText} {userName}!
          </Link>
          <button className="btn-outline" onClick={() => { onLogout(); setIsMenuOpen(false); }}>
            {logoutText}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 text-sm sm:text-base">
        <span
          style={{ color: 'rgb(53 153 131)', fontSize: 'large', fontWeight: 500 }}
          className="whitespace-nowrap"
        >
          {welcomeText} {userName}!
        </span>
        <button
          className="btn-dark flex items-center gap-2 px-6 py-3 rounded-full shadow-xl"
          style={{ fontSize: '22px' }}
          onMouseOver={e => e.currentTarget.classList.add('main-btn-hover')}
          onMouseOut={e => e.currentTarget.classList.remove('main-btn-hover')}
          onClick={onLogout}
        >
          {logoutText}
        </button>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 md:h-28 gap-4 mb-4">
          <button
            className="md:hidden p-2 rounded-md border border-gray-200"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center min-w-[200px] justify-start">
            {renderAuthButtons()}
          </div>

          <nav
            className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-10 font-normal"
            style={{ fontFamily: 'Rubik, Arial, sans-serif', fontSize: '24px' }}
          >
            {navLinks.map(({ to, text }, idx) => (
              <Link key={Object.keys(ROUTES)[idx]} to={to} className="hover:text-blue-600 whitespace-nowrap">
                {text}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 mt-2">
            <Link
              to={createPageUrl(ROUTES.HOME)}
              onClick={handleNavClick}
              className="flex items-center justify-center overflow-hidden rounded-2xl"
              style={{ width: '11rem', height: '6.5rem' }}
            >
              <img
                src="/images/Fortuna_logo.png"
                alt="Fortuna Health Logo"
                className="w-full h-full object-cover object-center"
              />
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden border-t border-gray-100 transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col text-right px-4 py-4 gap-4 font-normal text-2xl" style={{ fontFamily: 'Rubik, Arial, sans-serif', fontSize: '24px' }}>
          {navLinks.map(({ to, text }, idx) => (
            <Link
              key={`mobile-${Object.keys(ROUTES)[idx]}`}
              to={to}
              className="py-2 border-b last:border-none border-gray-100"
              onClick={handleNavClick}
            >
              {text}
            </Link>
          ))}
        </nav>
        <div className="px-4 pb-6">
          {renderAuthButtons("mobile")}
        </div>
      </div>
    </header>
  );
}
