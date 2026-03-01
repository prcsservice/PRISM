"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStudentData } from "@/hooks/useStudentData";
import { useTheme } from "@/context/ThemeContext";
import { updateStudentProfile, requestDataDeletion } from "@/lib/firestore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { Save, Trash2, Moon, Sun, CheckCircle } from "lucide-react";

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

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateStudentProfile(user.uid, {
                name,
                rollNo,
                department,
                section,
                year: Number(year),
            });
            setSaved(true);
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
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
                <p className="text-text-secondary">Manage your profile and privacy preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-5">
                <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>

                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                <Input label="Roll Number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. 21CS101" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
                    <Input label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" />
                </div>

                <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 3" />

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
