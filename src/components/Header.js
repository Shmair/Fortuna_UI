import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Header() {
  return (
    <header
      className="w-full bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-8 py-3 fixed top-0 left-0 z-50"
      style={{ height: 72, fontFamily: 'Varela Round, Arial, sans-serif' }}
    >
      <div className="flex items-center gap-2 min-w-[160px]">
        <img src="/RefunD logo1.png" alt="RefunD Logo" style={{ width: 250, height: 150 }} />
      </div>
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center gap-8 text-lg font-bold" style={{ fontFamily: 'Varela Round, Arial, sans-serif' }}>
          <Link to={createPageUrl("Home")} className="hover:text-blue-600">דף הבית</Link>
          <Link to={createPageUrl("Wizard")} className="hover:text-blue-600">אשף ההחזרים</Link>
          <Link to={createPageUrl("Profile")} className="hover:text-blue-600">הפרופיל שלי</Link>
          <Link to={createPageUrl("Contact")} className="hover:text-blue-600">יצירת קשר</Link>
          <Link to={createPageUrl("About")} className="hover:text-blue-600">אודותינו</Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        <Link to={createPageUrl("Login")} className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold" style={{ fontFamily: 'Varela Round, Arial, sans-serif' }}>כניסה</Link>
        <Link to={createPageUrl("Register")} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-bold" style={{ fontFamily: 'Varela Round, Arial, sans-serif' }}>הרשמה</Link>
      </div>
    </header>
  );
}
