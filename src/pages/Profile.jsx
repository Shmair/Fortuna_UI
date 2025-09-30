
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from "../components/ui/use-toast";
import UserProfileForm from '../components/forms/UserProfileForm';

import { createPageUrl } from '../utils';

import { PROFILE_ERRORS, SUCCESS_PROFILE } from '../constants/profile';


export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const email = window.localStorage.getItem('user_email');
                if (!email) {
                    setUser(null);
                    setIsLoading(false);
                    toast.error(PROFILE_ERRORS.MISSING_EMAIL);
                    return;
                }
                // Fetch user profile from backend API
                const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
                const { data: currentUser, error } = await res.json();
                if (error || !currentUser) {
                    setUser(null);
                    setIsLoading(false);
                    toast.error(PROFILE_ERRORS.GENERAL_PROFILE);
                    return;
                }
                setUser(currentUser);
                setUserData({
                    full_name: currentUser.full_name || '',
                    email: currentUser.email || '',
                    date_of_birth: currentUser.date_of_birth || '',
                    gender: currentUser.gender || '',
                    children_ages: Array.isArray(currentUser.children_ages) ? currentUser.children_ages : [],
                    is_pregnant: currentUser.is_pregnant || false,
                    planning_pregnancy: currentUser.planning_pregnancy || false,
                    is_smoker: currentUser.is_smoker || false,
                });
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast.error(PROFILE_ERRORS.GENERAL_PROFILE);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, ...updatableData } = userData;
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatableData, email: userData.email })
            });
            const { error } = await res.json();
            if (!error) {
                toast.success(SUCCESS_PROFILE);
            } else {
                toast.error(PROFILE_ERRORS.PROFILE_SAVE + (error.message || ''));
            }
        } catch (error) {
            console.error("Failed to update user", error);
            toast.error(PROFILE_ERRORS.GENERAL_PROFILE);
        }
    };

    const handleLogout = async () => {
        window.localStorage.removeItem('user_email');
        window.location.href = createPageUrl('Home');
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-white to-blue-50">
                <div className="text-2xl font-bold text-blue-700 mb-4">טוען פרופיל...</div>
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-white to-blue-50">
                <Card className="max-w-md w-full shadow-lg rounded-2xl border-0">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-blue-700">אינך מחובר/ת</CardTitle>
                        <CardDescription className="text-blue-500">עליך להתחבר כדי לראות את הפרופיל שלך.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.href = createPageUrl('Login')} className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-full py-2 px-4 text-lg font-semibold shadow-md">התחברות</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-white to-blue-50">
            <img src="/images/refund-logo.png" alt="RefunD Logo" className="w-48 mb-6 drop-shadow-lg" style={{marginTop: '-32px'}} />
            <Card className="max-w-2xl w-full shadow-xl rounded-3xl border-0 p-8">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-blue-700 mb-2">הפרופיל שלי</CardTitle>
                    <CardDescription className="text-blue-500 text-lg">עדכן את הפרטים האישיים שלך כאן. פרטים אלו יעזרו לנו לדייק את ההחזרים המוצעים לך באשף.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="full_name" className="text-blue-700 font-semibold">שם מלא</Label>
                                <Input id="full_name" value={userData.full_name || ''} onChange={handleInputChange} className="rounded-full border-blue-200 focus:border-blue-400 px-4 py-2" />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-blue-700 font-semibold">אימייל</Label>
                                <Input id="email" name="email" type="email" value={userData.email || ''} onChange={handleInputChange} required autoComplete="email" className="rounded-full border-blue-200 focus:border-blue-400 px-4 py-2" />
                            </div>
                        </div>
                        <UserProfileForm userData={userData} setUserData={setUserData} />
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
                            <Button type="submit" className="w-full sm:w-auto bg-blue-400 hover:bg-blue-500 text-white rounded-full py-2 px-6 text-lg font-semibold shadow-md">שמור שינויים</Button>
                            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto rounded-full py-2 px-6 text-lg font-semibold shadow-md">התנתקות</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
