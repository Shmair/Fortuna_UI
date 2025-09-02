
import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Badge } from '../components/ui/badge';
import { Plus, X } from 'lucide-react';

const insuranceProviders = ["כללית", "מכבי", "מאוחדת", "לאומית", "הראל", "מגדל", "הפניקס", "אחר"];

export default function UserProfileForm({ userData, setUserData }) {
    const [newChildAge, setNewChildAge] = useState('');

    const addChild = () => {
        if (newChildAge && !isNaN(newChildAge)) {
            const age = parseInt(newChildAge);
            if (age >= 0 && age <= 25) {
                const updatedAges = [...(userData.children_ages || []), age];
                setUserData({ ...userData, children_ages: updatedAges });
                setNewChildAge('');
            }
        }
    };

    const removeChild = (index) => {
        const updatedAges = userData.children_ages.filter((_, i) => i !== index);
        setUserData({ ...userData, children_ages: updatedAges });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="dob">תאריך לידה</Label>
                <Input 
                    id="dob" 
                    type="date" 
                    value={userData.date_of_birth || ''}
                    onChange={(e) => setUserData({ ...userData, date_of_birth: e.target.value })}
                />
            </div>
            
            <div>
                <Label htmlFor="gender">מגדר</Label>
                <Select 
                    value={userData.gender || ''}
                    onValueChange={(value) => setUserData({ ...userData, gender: value })}
                >
                    <SelectTrigger><SelectValue placeholder="בחרו מגדר" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="female">אישה</SelectItem>
                        <SelectItem value="male">גבר</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="insurance">קופת חולים / חברת ביטוח עיקרית</Label>
                <Select 
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
            </div>

            <div>
                <Label htmlFor="is_smoker">האם את/ה מעשן/ת?</Label>
                <Select
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
                <Label>גילאי הילדים שלך</Label>
                <div className="flex gap-2 mt-2">
                    <Input 
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
                    {userData.children_ages && userData.children_ages.map((age, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            גיל {age}
                            <button onClick={() => removeChild(index)} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                {(!userData.children_ages || userData.children_ages.length === 0) && (
                    <p className="text-sm text-gray-500 mt-1">אין ילדים? זה בסדר גמור, רק תשאירו ריק</p>
                )}
            </div>
        </div>
    );
}
