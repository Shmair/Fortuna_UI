import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ROUTES, ROUTES_TITLES, STRINGS } from "../../constants/header";

export default function Header({ isAuthenticated, userName, setShowAuth, onLogout }) {
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

  return (
    <header
      className="w-full bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-8 py-3 fixed top-0 left-0 z-50"
      style={{ height: 72, fontFamily: 'Varela Round, Arial, sans-serif' }}
    >
      <div className="flex items-center gap-2 min-w-[160px]">
  <Link to={createPageUrl(ROUTES.HOME)}>
          <img src="/RefunD logo1.png" alt="RefunD Logo" style={{ width: 250, height: 150, cursor: 'pointer' }} />
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center gap-8 text-lg font-bold" style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
          {navLinks.map(({ to, text }, idx) => (
            <Link key={Object.keys(ROUTES)[idx]} to={to} className="hover:text-blue-600">{text}</Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        {!isAuthenticated ? (
          <button
            className="btn-dark"
            onClick={() => setShowAuth(true)}
          >
            {loginText}
          </button>
        ) : (
          <>
            <span className="font-bold text-green-700">{welcomeText} {userName}!</span>
            <button
              className="btn-outline ml-4"
              onClick={onLogout}
            >
              {logoutText}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
