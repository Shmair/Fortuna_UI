import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

const insuranceProviders = ["כללית", "מכבי", "מאוחדת", "לאומית", "הראל", "מגדל", "הפניקס", "אחר"];
const maritalStatuses = ["רווק/ה", "נשוי/ה", "גרוש/ה", "אלמן/ה"];
const employmentStatuses = ["עובד/ת", "מובטל/ת", "סטודנט/ית", "פנסיונר/ית"];
const incomeLevels = ["נמוך", "בינוני", "גבוה"];
const languages = ["עברית", "אנגלית", "ערבית"];

// Mapping from Hebrew to English values for database constraints
const employmentStatusMapping = {
    "עובד/ת": "employed",
    "מובטל/ת": "unemployed", 
    "סטודנט/ית": "student",
    "פנסיונר/ית": "retired"
};

const maritalStatusMapping = {
    "רווק/ה": "single",
    "נשוי/ה": "married",
    "גרוש/ה": "divorced",
    "אלמן/ה": "widowed"
};

const incomeLevelMapping = {
    "נמוך": "low",
    "בינוני": "medium",
    "גבוה": "high"
};

// Reverse mappings for displaying stored English values as Hebrew
const reverseEmploymentStatusMapping = {
    "employed": "עובד/ת",
    "unemployed": "מובטל/ת",
    "student": "סטודנט/ית",
    "retired": "פנסיונר/ית"
};

const reverseMaritalStatusMapping = {
    "single": "רווק/ה",
    "married": "נשוי/ה",
    "divorced": "גרוש/ה",
    "widowed": "אלמן/ה"
};

const reverseIncomeLevelMapping = {
    "low": "נמוך",
    "medium": "בינוני",
    "high": "גבוה"
};

export default function ComprehensiveUserProfileForm({ userData, setUserData, showErrors }) {
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        family: false,
        health: false,
        insurance: false,
        employment: false,
        preferences: false
    });

    const [newChildAge, setNewChildAge] = useState('');
    const [newCondition, setNewCondition] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const [newDisability, setNewDisability] = useState('');

    const REQUIRED_FIELDS = [
        "email", 
        "date_of_birth", 
        "gender",
        "full_name",
        "phone_number",
        "national_id"
    ];

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

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

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

    const addCondition = () => {
        if (newCondition.trim()) {
            const currentConditions = Array.isArray(userData.chronic_conditions) ? userData.chronic_conditions : [];
            setUserData({ ...userData, chronic_conditions: [...currentConditions, newCondition.trim()] });
            setNewCondition('');
        }
    };

    const removeCondition = (index) => {
        const currentConditions = Array.isArray(userData.chronic_conditions) ? userData.chronic_conditions : [];
        const updatedConditions = currentConditions.filter((_, i) => i !== index);
        setUserData({ ...userData, chronic_conditions: updatedConditions });
    };

    const addMedication = () => {
        if (newMedication.trim()) {
            const currentMedications = Array.isArray(userData.medications) ? userData.medications : [];
            setUserData({ ...userData, medications: [...currentMedications, newMedication.trim()] });
            setNewMedication('');
        }
    };

    const removeMedication = (index) => {
        const currentMedications = Array.isArray(userData.medications) ? userData.medications : [];
        const updatedMedications = currentMedications.filter((_, i) => i !== index);
        setUserData({ ...userData, medications: updatedMedications });
    };

    const addDisability = () => {
        if (newDisability.trim()) {
            const currentDisabilities = Array.isArray(userData.disabilities) ? userData.disabilities : [];
            setUserData({ ...userData, disabilities: [...currentDisabilities, newDisability.trim()] });
            setNewDisability('');
        }
    };

    const removeDisability = (index) => {
        const currentDisabilities = Array.isArray(userData.disabilities) ? userData.disabilities : [];
        const updatedDisabilities = currentDisabilities.filter((_, i) => i !== index);
        setUserData({ ...userData, disabilities: updatedDisabilities });
    };

    const SectionHeader = ({ title, section, icon: Icon }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5" />}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {expandedSections[section] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div>
                <SectionHeader title="מידע בסיסי" section="basic" />
                {expandedSections.basic && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="full_name">שם מלא *</Label>
                                <Input
                                    id="full_name"
                                    required
                                    value={userData.full_name || ''}
                                    onChange={e => setUserData({ ...userData, full_name: e.target.value })}
                                />
                                {renderError("full_name")}
                            </div>
                            <div>
                                <Label htmlFor="email">אימייל *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={userData.email || ''}
                                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                                />
                                {renderError("email")}
                            </div>
                            <div>
                                <Label htmlFor="phone_number">מספר טלפון *</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    required
                                    value={userData.phone_number || ''}
                                    onChange={e => setUserData({ ...userData, phone_number: e.target.value })}
                                />
                                {renderError("phone_number")}
                            </div>
                            <div>
                                <Label htmlFor="national_id">תעודת זהות *</Label>
                                <Input
                                    id="national_id"
                                    required
                                    value={userData.national_id || ''}
                                    onChange={e => setUserData({ ...userData, national_id: e.target.value })}
                                />
                                {renderError("national_id")}
                            </div>
                            <div>
                                <Label htmlFor="date_of_birth">תאריך לידה *</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    required
                                    value={userData.date_of_birth || ''}
                                    onChange={e => setUserData({ ...userData, date_of_birth: e.target.value })}
                                />
                                {renderError("date_of_birth")}
                            </div>
                            <div>
                                <Label htmlFor="gender">מגדר *</Label>
                                <Select
                                    value={userData.gender || ''}
                                    onValueChange={value => setUserData({ ...userData, gender: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו מגדר" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">זכר</SelectItem>
                                        <SelectItem value="female">נקבה</SelectItem>
                                        <SelectItem value="other">אחר</SelectItem>
                                    </SelectContent>
                                </Select>
                                {renderError("gender")}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Family Information */}
            <div>
                <SectionHeader title="מידע משפחתי" section="family" />
                {expandedSections.family && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="marital_status">סטטוס משפחתי</Label>
                                <Select
                                    value={reverseMaritalStatusMapping[userData.marital_status] || userData.marital_status || ''}
                                    onValueChange={value => setUserData({ ...userData, marital_status: maritalStatusMapping[value] || value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו סטטוס" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {maritalStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="spouse_name">שם בן/בת הזוג</Label>
                                <Input
                                    id="spouse_name"
                                    value={userData.spouse_name || ''}
                                    onChange={e => setUserData({ ...userData, spouse_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="spouse_date_of_birth">תאריך לידה של בן/בת הזוג</Label>
                                <Input
                                    id="spouse_date_of_birth"
                                    type="date"
                                    value={userData.spouse_date_of_birth || ''}
                                    onChange={e => setUserData({ ...userData, spouse_date_of_birth: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Children Ages */}
                        <div>
                            <Label>גילאי ילדים</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    placeholder="גיל ילד"
                                    value={newChildAge}
                                    onChange={e => setNewChildAge(e.target.value)}
                                    min="0"
                                    max="25"
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
                        </div>

                        {/* Pregnancy Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_pregnant"
                                    checked={userData.is_pregnant || false}
                                    onChange={e => setUserData({ ...userData, is_pregnant: e.target.checked })}
                                />
                                <Label htmlFor="is_pregnant">הריון נוכחי</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="planning_pregnancy"
                                    checked={userData.planning_pregnancy || false}
                                    onChange={e => setUserData({ ...userData, planning_pregnancy: e.target.checked })}
                                />
                                <Label htmlFor="planning_pregnancy">תכנון הריון</Label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Health Information */}
            <div>
                <SectionHeader title="מידע בריאותי" section="health" />
                {expandedSections.health && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_smoker"
                                checked={userData.is_smoker || false}
                                onChange={e => setUserData({ ...userData, is_smoker: e.target.checked })}
                            />
                            <Label htmlFor="is_smoker">מעשן/ת</Label>
                        </div>

                        {/* Chronic Conditions */}
                        <div>
                            <Label>מחלות כרוניות</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="שם המחלה"
                                    value={newCondition}
                                    onChange={e => setNewCondition(e.target.value)}
                                />
                                <Button type="button" onClick={addCondition} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(userData.chronic_conditions) && userData.chronic_conditions.map((condition, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {condition}
                                        <button onClick={() => removeCondition(index)} className="ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        <div>
                            <Label>תרופות נוכחיות</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="שם התרופה"
                                    value={newMedication}
                                    onChange={e => setNewMedication(e.target.value)}
                                />
                                <Button type="button" onClick={addMedication} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(userData.medications) && userData.medications.map((medication, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {medication}
                                        <button onClick={() => removeMedication(index)} className="ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Disabilities */}
                        <div>
                            <Label>מוגבלויות</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="סוג המוגבלות"
                                    value={newDisability}
                                    onChange={e => setNewDisability(e.target.value)}
                                />
                                <Button type="button" onClick={addDisability} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(userData.disabilities) && userData.disabilities.map((disability, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {disability}
                                        <button onClick={() => removeDisability(index)} className="ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Insurance Information */}
            <div>
                <SectionHeader title="מידע ביטוחי" section="insurance" />
                {expandedSections.insurance && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="insurance_provider">ספק ביטוח</Label>
                                <Select
                                    value={userData.insurance_provider || ''}
                                    onValueChange={value => setUserData({ ...userData, insurance_provider: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו ספק ביטוח" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {insuranceProviders.map(provider => (
                                            <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="policy_number">מספר פוליסה</Label>
                                <Input
                                    id="policy_number"
                                    value={userData.policy_number || ''}
                                    onChange={e => setUserData({ ...userData, policy_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="coverage_type">סוג כיסוי</Label>
                                <Select
                                    value={userData.coverage_type || ''}
                                    onValueChange={value => setUserData({ ...userData, coverage_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו סוג כיסוי" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">יחיד</SelectItem>
                                        <SelectItem value="family">משפחה</SelectItem>
                                        <SelectItem value="group">קבוצתי</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Employment Information */}
            <div>
                <SectionHeader title="מידע תעסוקתי" section="employment" />
                {expandedSections.employment && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="employment_status">סטטוס תעסוקתי</Label>
                                <Select
                                    value={reverseEmploymentStatusMapping[userData.employment_status] || userData.employment_status || ''}
                                    onValueChange={value => setUserData({ ...userData, employment_status: employmentStatusMapping[value] || value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו סטטוס" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employmentStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="employer_name">שם מעסיק</Label>
                                <Input
                                    id="employer_name"
                                    value={userData.employer_name || ''}
                                    onChange={e => setUserData({ ...userData, employer_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="income_level">רמת הכנסה</Label>
                                <Select
                                    value={reverseIncomeLevelMapping[userData.income_level] || userData.income_level || ''}
                                    onValueChange={value => setUserData({ ...userData, income_level: incomeLevelMapping[value] || value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו רמת הכנסה" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {incomeLevels.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div>
                <SectionHeader title="העדפות" section="preferences" />
                {expandedSections.preferences && (
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="preferred_language">שפה מועדפת</Label>
                                <Select
                                    value={userData.preferred_language || 'he'}
                                    onValueChange={value => setUserData({ ...userData, preferred_language: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחרו שפה" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map(lang => (
                                            <SelectItem key={lang} value={lang === 'עברית' ? 'he' : lang === 'אנגלית' ? 'en' : 'ar'}>{lang}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Communication Preferences */}
                        <div>
                            <Label>העדפות תקשורת</Label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="comm_email"
                                        checked={userData.communication_preferences?.email || false}
                                        onChange={e => setUserData({
                                            ...userData,
                                            communication_preferences: {
                                                ...userData.communication_preferences,
                                                email: e.target.checked
                                            }
                                        })}
                                    />
                                    <Label htmlFor="comm_email">אימייל</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="comm_sms"
                                        checked={userData.communication_preferences?.sms || false}
                                        onChange={e => setUserData({
                                            ...userData,
                                            communication_preferences: {
                                                ...userData.communication_preferences,
                                                sms: e.target.checked
                                            }
                                        })}
                                    />
                                    <Label htmlFor="comm_sms">SMS</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="comm_phone"
                                        checked={userData.communication_preferences?.phone || false}
                                        onChange={e => setUserData({
                                            ...userData,
                                            communication_preferences: {
                                                ...userData.communication_preferences,
                                                phone: e.target.checked
                                            }
                                        })}
                                    />
                                    <Label htmlFor="comm_phone">טלפון</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
