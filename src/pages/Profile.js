
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from "../components/ui/use-toast";
import UserProfileForm from '../components/UserProfileForm';

import { createPageUrl } from '../utils';

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
                    return;
                }
                // Fetch user profile from backend API
                const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
                const { data: currentUser, error } = await res.json();
                if (error || !currentUser) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
                setUser(currentUser);
                setUserData({
                    full_name: currentUser.full_name || '',
                    email: currentUser.email || '',
                    date_of_birth: currentUser.date_of_birth || '',
                    gender: currentUser.gender || '',
                    children_ages: currentUser.children_ages || [],
                    is_pregnant: currentUser.is_pregnant || false,
                    planning_pregnancy: currentUser.planning_pregnancy || false,
                    is_smoker: currentUser.is_smoker || false,
                   // insurance_provider: currentUser.insurance_provider || ''
                });
            } catch (error) {
                console.error("Failed to fetch user", error);
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
        // Remove non-updatable fields before sending
        const { email, ...updatableData } = userData;
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatableData, email: userData.email })
            });
            const { error } = await res.json();
            if (!error) {
                toast.success("הפרופיל עודכן בהצלחה! הפרטים שלך נשמרו.");
            } else {
                toast.error("שגיאה בעדכון הפרופיל: " + error.message);
            }
        } catch (error) {
            console.error("Failed to update user", error);
            toast.error("שגיאה בעדכון הפרופיל: אנא נסה שוב מאוחר יותר.");
        }
    };
    
    const handleLogout = async () => {
        window.localStorage.removeItem('user_email');
        window.location.href = createPageUrl('Home');
    }

    if (isLoading) {
        return <div>טוען פרופיל...</div>;
    }

    if (!user) {
        return (
             <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>אינך מחובר/ת</CardTitle>
                    <CardDescription>עליך להתחבר כדי לראות את הפרופיל שלך.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={() => window.location.href = createPageUrl('Login')} className="w-full">התחברות</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>הפרופיל שלי</CardTitle>
                <CardDescription>עדכן את הפרטים האישיים שלך כאן. פרטים אלו יעזרו לנו לדייק את ההחזרים המוצעים לך באשף.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <Label htmlFor="full_name">שם מלא</Label>
                        <Input id="full_name" value={userData.full_name || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="email">אימייל</Label>
                        <Input id="email" name="email" type="email" value={userData.email || ''} onChange={handleInputChange} required autoComplete="email" />
                    </div>
                    
                    <UserProfileForm userData={userData} setUserData={setUserData} />

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button type="submit" className="w-full sm:w-auto">שמור שינויים</Button>
                        <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                            התנתקות
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
