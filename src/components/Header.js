import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Header({ isAuthenticated, userName, setShowAuth, showAuth, onAuth, onLogout }) {
  return (
    <header
      className="w-full bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-8 py-3 fixed top-0 left-0 z-50"
      style={{ height: 72, fontFamily: 'Varela Round, Arial, sans-serif' }}
    >
      <div className="flex items-center gap-2 min-w-[160px]">
        <Link to={createPageUrl("Home")}> 
          <img src="/RefunD logo1.png" alt="RefunD Logo" style={{ width: 250, height: 150, cursor: 'pointer' }} />
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center gap-8 text-lg font-bold" style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
          <Link to={createPageUrl("Home")} className="hover:text-blue-600">דף הבית</Link>
          <Link to={createPageUrl("Wizard")} className="hover:text-blue-600">אשף ההחזרים</Link>
          <Link to={createPageUrl("Profile")} className="hover:text-blue-600">הפרופיל שלי</Link>
          <Link to={createPageUrl("Contact")} className="hover:text-blue-600">יצירת קשר</Link>
          <Link to={createPageUrl("About")} className="hover:text-blue-600">אודותינו</Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        {!isAuthenticated ? (
          <button
            className="btn-dark"
            onClick={() => setShowAuth(true)}
          >
            כניסה
          </button>
        ) : (
          <>
            <span className="font-bold text-green-700">ברוך הבא {userName}!</span>
            <button
              className="btn-outline ml-4"
              onClick={onLogout}
            >
              התנתקות
            </button>
          </>
        )}
      </div>
    </header>
  );
}
