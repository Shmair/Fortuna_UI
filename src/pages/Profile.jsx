
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import ComprehensiveUserProfileForm from '../components/forms/ComprehensiveUserProfileForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../utils/supabaseClient';

import { PROFILE_ERRORS, SUCCESS_PROFILE } from '../constants/profile';
import { apiService } from '../services/apiService';
import { createPageUrl } from '../utils';


export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        // Basic Information
        full_name: '',
        email: '',
        phone_number: '',
        national_id: '',
        date_of_birth: '',
        gender: '',

        // Family Information
        children_ages: [],
        is_pregnant: false,
        planning_pregnancy: false,
        marital_status: '',
        spouse_name: '',
        spouse_date_of_birth: '',

        // Health Information
        is_smoker: false,
        chronic_conditions: [],
        medications: [],
        disabilities: [],

        // Insurance Information
        insurance_provider: '',
        policy_number: '',
        coverage_type: '',

        // Employment
        employment_status: '',
        employer_name: '',
        income_level: '',

        // Preferences
        preferred_language: 'he',
        communication_preferences: {
            email: true,
            sms: false,
            phone: false
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    // toast is now imported directly from sonner

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Get current user from Supabase
                const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

                if (authError || !currentUser) {
                    setUser(null);
                    setIsLoading(false);
                    toast.error(PROFILE_ERRORS.MISSING_EMAIL);
                    return;
                }

                // Fetch user profile from backend API using the user ID
                console.log('🔍 Profile.jsx getProfile called for userId:', currentUser.id);
                const result = await apiService.getProfile(currentUser.id);
                console.log('API Response:', result);
                const { profile: profileData, success, error } = result;

                if (!success || !profileData) {
                    // If no profile exists, create one with basic user info
                    setUser({
                        id: currentUser.id,
                        email: currentUser.email,
                        full_name: currentUser.user_metadata?.full_name || '',
                        date_of_birth: '',
                        gender: '',
                        children_ages: [],
                        is_pregnant: false,
                        planning_pregnancy: false,
                        is_smoker: false,
                    });
                    setUserData({
                        // Basic Information
                        full_name: currentUser.user_metadata?.full_name || '',
                        email: currentUser.email || '',
                        phone_number: '',
                        national_id: '',
                        date_of_birth: '',
                        gender: '',

                        // Family Information
                        children_ages: [],
                        is_pregnant: false,
                        planning_pregnancy: false,
                        marital_status: '',
                        spouse_name: '',
                        spouse_date_of_birth: '',

                        // Health Information
                        is_smoker: false,
                        chronic_conditions: [],
                        medications: [],
                        disabilities: [],

                        // Insurance Information
                        insurance_provider: '',
                        policy_number: '',
                        coverage_type: '',

                        // Employment
                        employment_status: '',
                        employer_name: '',
                        income_level: '',

                        // Preferences
                        preferred_language: 'he',
                        communication_preferences: {
                            email: true,
                            sms: false,
                            phone: false
                        }
                    });
                } else {
                    console.log('Profile data received:', profileData);
                    setUser(profileData);
                    setUserData({
                        // Basic Information
                        full_name: profileData.full_name || '',
                        email: profileData.email || '',
                        phone_number: profileData.phone_number || '',
                        national_id: profileData.national_id || '',
                        date_of_birth: profileData.date_of_birth || '',
                        gender: profileData.gender || '',

                        // Family Information
                        children_ages: Array.isArray(profileData.children_ages) ? profileData.children_ages : [],
                        is_pregnant: profileData.is_pregnant || false,
                        planning_pregnancy: profileData.planning_pregnancy || false,
                        marital_status: profileData.marital_status || '',
                        spouse_name: profileData.spouse_name || '',
                        spouse_date_of_birth: profileData.spouse_date_of_birth || '',

                        // Health Information
                        is_smoker: profileData.is_smoker || false,
                        chronic_conditions: Array.isArray(profileData.chronic_conditions) ? profileData.chronic_conditions : [],
                        medications: Array.isArray(profileData.medications) ? profileData.medications : [],
                        disabilities: Array.isArray(profileData.disabilities) ? profileData.disabilities : [],

                        // Insurance Information
                        insurance_provider: profileData.insurance_provider || '',
                        policy_number: profileData.policy_number || '',
                        coverage_type: profileData.coverage_type || '',

                        // Employment
                        employment_status: profileData.employment_status || '',
                        employer_name: profileData.employer_name || '',
                        income_level: profileData.income_level || '',

                        // Preferences
                        preferred_language: profileData.preferred_language || 'he',
                        communication_preferences: profileData.communication_preferences || {
                            email: true,
                            sms: false,
                            phone: false
                        }
                    });
                    console.log('UserData set to:', {
                        // Basic Information
                        full_name: profileData.full_name || '',
                        email: profileData.email || '',
                        phone_number: profileData.phone_number || '',
                        national_id: profileData.national_id || '',
                        date_of_birth: profileData.date_of_birth || '',
                        gender: profileData.gender || '',

                        // Family Information
                        children_ages: Array.isArray(profileData.children_ages) ? profileData.children_ages : [],
                        is_pregnant: profileData.is_pregnant || false,
                        planning_pregnancy: profileData.planning_pregnancy || false,
                        marital_status: profileData.marital_status || '',
                        spouse_name: profileData.spouse_name || '',
                        spouse_date_of_birth: profileData.spouse_date_of_birth || '',

                        // Health Information
                        is_smoker: profileData.is_smoker || false,
                        chronic_conditions: Array.isArray(profileData.chronic_conditions) ? profileData.chronic_conditions : [],
                        medications: Array.isArray(profileData.medications) ? profileData.medications : [],
                        disabilities: Array.isArray(profileData.disabilities) ? profileData.disabilities : [],

                        // Insurance Information
                        insurance_provider: profileData.insurance_provider || '',
                        policy_number: profileData.policy_number || '',
                        coverage_type: profileData.coverage_type || '',

                        // Employment
                        employment_status: profileData.employment_status || '',
                        employer_name: profileData.employer_name || '',
                        income_level: profileData.income_level || '',

                        // Preferences
                        preferred_language: profileData.preferred_language || 'he',
                        communication_preferences: profileData.communication_preferences || {
                            email: true,
                            sms: false,
                            phone: false
                        }
                    });
                }
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
        try {
            // Get current user ID from Supabase
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                toast.error('User not authenticated');
                return;
            }

            const result = await apiService.saveProfile({
                ...userData,
                userId: currentUser.id
            });
            if (result.success) {
                toast.success(SUCCESS_PROFILE);
                // Update local user state with the saved data
                setUser(result.profile);
            } else {
                toast.error(PROFILE_ERRORS.PROFILE_SAVE + (result.message || ''));
            }
        } catch (error) {
            console.error("Failed to update user", error);
            toast.error(PROFILE_ERRORS.GENERAL_PROFILE);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = createPageUrl('Home');
        } catch (error) {
            console.error('Error signing out:', error);
            // Still redirect even if signout fails
            window.location.href = createPageUrl('Home');
        }
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
            <Card className="max-w-2xl w-full shadow-xl rounded-3xl border-0 p-8">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-blue-700 mb-2">הפרופיל שלי</CardTitle>
                    <CardDescription className="text-blue-500 text-lg">עדכן את הפרטים האישיים שלך כאן. פרטים אלו יעזרו לנו לדייק את ההחזרים המוצעים לך באשף.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <ComprehensiveUserProfileForm userData={userData} setUserData={setUserData} showErrors={false} />
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
                        <Button
                            type="submit"
                            className="w-full sm:w-auto rounded-full py-2 px-6 text-lg font-semibold shadow-md text-white"
                            style={{ background: 'var(--color-button)' }}
                        >
                        שמור שינויים
                        </Button>
                        <Button
                            onClick={handleLogout}
                            className="w-full sm:w-auto rounded-full py-2 px-6 text-lg font-semibold shadow-md text-white"
                            style={{ background: 'var(--color-button)' }}
                        >
                        התנתקות
                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
