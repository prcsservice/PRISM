"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useTheme } from "@/context/ThemeContext";
import { updateTeacherProfile } from "@/lib/firestore";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Skeleton from "@/components/ui/Skeleton";
import { Save, Moon, Sun, CheckCircle, Mail, Calendar } from "lucide-react";

// Same dropdown options as onboarding
const DEPARTMENTS = [
    { value: "", label: "Select Department" },
    { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Electronics & Communication", label: "Electronics & Communication" },
    { value: "Electrical & Electronics", label: "Electrical & Electronics" },
    { value: "Mechanical Engineering", label: "Mechanical Engineering" },
    { value: "Civil Engineering", label: "Civil Engineering" },
    { value: "Artificial Intelligence & ML", label: "Artificial Intelligence & ML" },
    { value: "Data Science", label: "Data Science" },
    { value: "Biomedical Engineering", label: "Biomedical Engineering" },
    { value: "Chemical Engineering", label: "Chemical Engineering" },
    { value: "Aerospace Engineering", label: "Aerospace Engineering" },
    { value: "Business Administration", label: "Business Administration" },
    { value: "Other", label: "Other" },
];

const INSTITUTIONS = [
    { value: "", label: "Select Institution" },
    { value: "SRM Institute of Science and Technology", label: "SRM Institute of Science and Technology" },
    { value: "VIT Vellore", label: "VIT Vellore" },
    { value: "Anna University", label: "Anna University" },
    { value: "IIT Madras", label: "IIT Madras" },
    { value: "NIT Trichy", label: "NIT Trichy" },
    { value: "Amrita Vishwa Vidyapeetham", label: "Amrita Vishwa Vidyapeetham" },
    { value: "PSG College of Technology", label: "PSG College of Technology" },
    { value: "SASTRA University", label: "SASTRA University" },
    { value: "Manipal Institute of Technology", label: "Manipal Institute of Technology" },
    { value: "BITS Pilani", label: "BITS Pilani" },
    { value: "Other", label: "Other" },
];

export default function TeacherSettingsPage() {
    const { user, userData } = useAuth();
    const { profile, loading } = useTeacherData();
    const { theme, toggleTheme } = useTheme();

    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [institution, setInstitution] = useState("");
    const [subjects, setSubjects] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setDepartment(profile.department || "");
            setInstitution(profile.institution || "");
            setSubjects(profile.subjectsFocus?.join(", ") || "");
        }
    }, [profile]);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";
        if (!department) errs.department = "Please select a department";
        if (!institution) errs.institution = "Please select an institution";
        if (!subjects.trim()) errs.subjects = "Enter at least one subject";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!user || !validate()) return;
        setSaving(true);
        try {
            await updateTeacherProfile(user.uid, {
                name: name.trim(),
                department,
                institution,
                subjectsFocus: subjects.split(",").map(s => s.trim()).filter(Boolean),
            });
            setSaved(true);
            setErrors({});
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10 max-w-2xl">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-80 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-2xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Faculty Settings</h1>
                <p className="text-text-secondary">Manage your profile and notification preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-5">
                <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>

                <div>
                    <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Select
                            label="Department"
                            name="department"
                            value={department}
                            onChange={(e) => { setDepartment(e.target.value); setErrors(prev => ({ ...prev, department: "" })); }}
                            options={DEPARTMENTS}
                        />
                        {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                    </div>
                    <div>
                        <Select
                            label="Institution"
                            name="institution"
                            value={institution}
                            onChange={(e) => { setInstitution(e.target.value); setErrors(prev => ({ ...prev, institution: "" })); }}
                            options={INSTITUTIONS}
                        />
                        {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
                    </div>
                </div>

                <div>
                    <Input
                        label="Subjects / Focus Areas (comma separated)"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="e.g. Data Structures, Algorithms, Machine Learning"
                    />
                    {errors.subjects && <p className="text-xs text-red-500 mt-1">{errors.subjects}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                        {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                    </Button>
                    {saved && <span className="text-sm text-green-400">Profile updated successfully.</span>}
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Appearance</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === "dark" ? <Moon size={18} className="text-text-muted" /> : <Sun size={18} className="text-text-muted" />}
                        <div>
                            <p className="text-sm font-medium text-text-primary">Dark Mode</p>
                            <p className="text-xs text-text-muted">Switch between light and dark themes</p>
                        </div>
                    </div>
                    <Toggle checked={theme === "dark"} onChange={toggleTheme} />
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Account Information</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail size={16} className="text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">Email Address</p>
                            <p className="text-sm text-text-primary">{userData?.email || user?.email || "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">Account Created</p>
                            <p className="text-sm text-text-primary">
                                {userData?.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }) || "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
