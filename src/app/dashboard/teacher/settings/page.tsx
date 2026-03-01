"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useTheme } from "@/context/ThemeContext";
import { updateTeacherProfile } from "@/lib/firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Skeleton from "@/components/ui/Skeleton";
import { Save, Moon, Sun, CheckCircle, Mail, Calendar } from "lucide-react";

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

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setDepartment(profile.department || "");
            setInstitution(profile.institution || "");
            setSubjects(profile.subjectsFocus?.join(", ") || "");
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateTeacherProfile(user.uid, {
                name,
                department,
                institution,
                subjectsFocus: subjects.split(",").map(s => s.trim()).filter(Boolean),
            });
            setSaved(true);
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
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Faculty Settings</h1>
                <p className="text-text-secondary">Manage your profile and notification preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-5">
                <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>

                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
                    <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. XYZ University" />
                </div>

                <Input
                    label="Subjects (comma separated)"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="e.g. Data Structures, Algorithms, OS"
                />

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
