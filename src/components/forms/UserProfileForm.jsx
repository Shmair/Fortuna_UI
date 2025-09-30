
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// import { Badge } from '../components/ui/badge';
import { Plus, X } from 'lucide-react';

const insuranceProviders = ["כללית", "מכבי", "מאוחדת", "לאומית", "הראל", "מגדל", "הפניקס", "אחר"];

export default function UserProfileForm({ userData, setUserData, showErrors }) {
        // Required fields and error helper
        const REQUIRED_FIELDS = ["email", "date_of_birth", "gender"];
        function getFieldError(field, value) {
            if (REQUIRED_FIELDS.includes(field) && !value) {
                return "שדה חובה";
            }
            return null;
        }
        const renderError = (field) => {
            if (!showErrors) return null;
            const error = getFieldError(field, userData[field]);
            return error ? (
                <div className="text-red-500 text-xs mt-1">{error}</div>
            ) : null;
        };
    const [newChildAge, setNewChildAge] = useState('');

    const addChild = () => {
        if (newChildAge && !isNaN(newChildAge)) {
            const age = parseInt(newChildAge);
            if (age >= 0 && age <= 25) {
                const currentAges = Array.isArray(userData.children_ages) ? userData.children_ages : [];
                const updatedAges = [...currentAges, age];
                setUserData({ ...userData, children_ages: updatedAges });
                setNewChildAge('');
            }
        }
    };

    const removeChild = (index) => {
        const currentAges = Array.isArray(userData.children_ages) ? userData.children_ages : [];
        const updatedAges = currentAges.filter((_, i) => i !== index);
        setUserData({ ...userData, children_ages: updatedAges });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={userData.email || ''}
                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                />
                {renderError("email")}
            </div>
            <div>
                <Label htmlFor="date_of_birth">תאריך לידה</Label>
                <Input 
                    id="date_of_birth" 
                    name="date_of_birth"
                    type="date" 
                    value={userData.date_of_birth || ''}
                    onChange={(e) => setUserData({ ...userData, date_of_birth: e.target.value })}
                />
                {renderError("date_of_birth")}
            </div>
            <div>
                <Label htmlFor="gender">מגדר</Label>
                <Select 
                    id="gender"
                    name="gender"
                    value={userData.gender === 'אישה' ? 'female' : userData.gender === 'גבר' ? 'male' : userData.gender || ''}
                    onValueChange={(value) => setUserData({ ...userData, gender: value })}
                >
                    <SelectTrigger><SelectValue placeholder="בחרו מגדר" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="female">אישה</SelectItem>
                        <SelectItem value="male">גבר</SelectItem>
                    </SelectContent>
                </Select>
                {renderError("gender")}
            </div>

            {/* <div>
                <Label htmlFor="insurance_provider">קופת חולים / חברת ביטוח עיקרית</Label>
                <Select 
                    id="insurance_provider"
                    name="insurance_provider"
                    value={userData.insurance_provider || ''}
                    onValueChange={(value) => setUserData({ ...userData, insurance_provider: value })}
                >
                    <SelectTrigger><SelectValue placeholder="בחרו ספק ביטוח" /></SelectTrigger>
                    <SelectContent>
                        {insuranceProviders.map(provider => (
                            <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

            <div>
                <Label htmlFor="is_smoker">האם את/ה מעשן/ת?</Label>
                <Select
                    id="is_smoker"
                    name="is_smoker"
                    value={userData.is_smoker === true ? 'yes' : (userData.is_smoker === false ? 'no' : '')}
                    onValueChange={(value) => setUserData({ ...userData, is_smoker: value === 'yes' })}
                >
                    <SelectTrigger><SelectValue placeholder="בחר/י" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">כן</SelectItem>
                        <SelectItem value="no">לא</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="child_age">גילאי הילדים שלך</Label>
                <div className="flex gap-2 mt-2">
                    <Input 
                        id="child_age"
                        name="child_age"
                        type="number" 
                        min="0" 
                        max="25"
                        placeholder="גיל הילד"
                        value={newChildAge}
                        onChange={(e) => setNewChildAge(e.target.value)}
                    />
                    <Button type="button" onClick={addChild} size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(userData.children_ages) && userData.children_ages.map((age, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            גיל {age}
                            <button onClick={() => removeChild(index)} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                {(!Array.isArray(userData.children_ages) || userData.children_ages.length === 0) && (
                    <p className="text-sm text-gray-500 mt-1">אין ילדים? זה בסדר גמור, רק תשאירו ריק</p>
                )}
            </div>
        </div>
    );
}
