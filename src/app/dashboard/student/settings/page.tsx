"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStudentData } from "@/hooks/useStudentData";
import { useTheme } from "@/context/ThemeContext";
import { updateStudentProfile, requestDataDeletion } from "@/lib/firestore";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { Save, Trash2, Moon, Sun, CheckCircle } from "lucide-react";

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

const YEARS = [
    { value: "", label: "Select Year" },
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year (Integrated)" },
];

const SECTIONS = [
    { value: "", label: "Select Section" },
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" },
    { value: "E", label: "Section E" },
    { value: "F", label: "Section F" },
];

export default function StudentSettingsPage() {
    const { user } = useAuth();
    const { profile, loading } = useStudentData();
    const { theme, toggleTheme } = useTheme();

    const [name, setName] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [year, setYear] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deletionRequested, setDeletionRequested] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setRollNo(profile.rollNo || "");
            setDepartment(profile.department || "");
            setSection(profile.section || "");
            setYear(String(profile.year || ""));
        }
    }, [profile]);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";
        if (!rollNo.trim()) errs.rollNo = "Roll number is required";
        if (!department) errs.department = "Please select a department";
        if (!section) errs.section = "Please select a section";
        if (!year) errs.year = "Please select your year";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!user || !validate()) return;
        setSaving(true);
        try {
            await updateStudentProfile(user.uid, {
                name: name.trim(),
                rollNo: rollNo.trim(),
                department,
                section,
                year: Number(year),
            });
            setSaved(true);
            setErrors({});
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        }
        setSaving(false);
    };

    const handleDeleteRequest = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            await requestDataDeletion(user.uid);
            setDeletionRequested(true);
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Error requesting deletion:", err);
        }
        setDeleting(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 pb-10 max-w-2xl">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-2xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
                <p className="text-text-secondary">Manage your profile and privacy preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-5">
                <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>

                <div>
                    <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <Input label="Roll Number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. 21CS001" />
                    {errors.rollNo && <p className="text-xs text-red-500 mt-1">{errors.rollNo}</p>}
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Select
                            label="Section"
                            name="section"
                            value={section}
                            onChange={(e) => { setSection(e.target.value); setErrors(prev => ({ ...prev, section: "" })); }}
                            options={SECTIONS}
                        />
                        {errors.section && <p className="text-xs text-red-500 mt-1">{errors.section}</p>}
                    </div>
                    <div>
                        <Select
                            label="Year of Study"
                            name="year"
                            value={year}
                            onChange={(e) => { setYear(e.target.value); setErrors(prev => ({ ...prev, year: "" })); }}
                            options={YEARS}
                        />
                        {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
                    </div>
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

            {/* Danger Zone */}
            {deletionRequested ? (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 md:p-8 space-y-3">
                    <h3 className="text-xl font-bold text-orange-400">Deletion Requested</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Your data deletion request has been submitted. This process may take up to 24 hours.
                        All your daily logs, predictions, and profile data will be removed from PRISM.
                    </p>
                </div>
            ) : (
                <div className="bg-red-500/5 border border-red-900/50 rounded-xl p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Requesting data deletion will remove your profile and all daily logs from PRISM.
                        Predictive models will no longer include your data.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 border border-red-500/50 text-red-500 rounded flex items-center gap-2 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={14} />
                        Request Data Deletion
                    </button>
                </div>
            )}

            {/* Deletion confirmation modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Data Deletion">
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                        Are you sure you want to request deletion of all your data? This action is <strong className="text-red-400">irreversible</strong> and will remove:
                    </p>
                    <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                        <li>All daily wellness logs</li>
                        <li>All AI predictions and suggestions</li>
                        <li>Your student profile and academic data</li>
                        <li>Any alerts associated with your account</li>
                    </ul>
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <button
                            onClick={handleDeleteRequest}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {deleting ? "Processing..." : "Yes, Delete My Data"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
