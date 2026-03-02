"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ProgressBar from "./ProgressBar";
import ConsentCheckbox from "./ConsentCheckbox";

// ===== Dropdown Options =====

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

// ===== Validation =====

interface FormErrors {
    name?: string;
    rollNo?: string;
    department?: string;
    section?: string;
    year?: string;
    institution?: string;
    subjectsFocus?: string;
}

function validateStep1Student(data: { name: string; rollNo: string }): FormErrors {
    const errors: FormErrors = {};
    if (!data.name.trim()) errors.name = "Full name is required";
    else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!data.rollNo.trim()) errors.rollNo = "Roll number is required";
    else if (data.rollNo.trim().length < 3) errors.rollNo = "Enter a valid roll number";
    return errors;
}

function validateStep1Teacher(data: { name: string; department: string }): FormErrors {
    const errors: FormErrors = {};
    if (!data.name.trim()) errors.name = "Full name is required";
    else if (data.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!data.department) errors.department = "Please select a department";
    return errors;
}

function validateStep2Student(data: { department: string; section: string; year: string }): FormErrors {
    const errors: FormErrors = {};
    if (!data.department) errors.department = "Please select a department";
    if (!data.section) errors.section = "Please select a section";
    if (!data.year) errors.year = "Please select your year of study";
    return errors;
}

function validateStep2Teacher(data: { institution: string; subjectsFocus: string }): FormErrors {
    const errors: FormErrors = {};
    if (!data.institution) errors.institution = "Please select an institution";
    if (!data.subjectsFocus.trim()) errors.subjectsFocus = "Enter at least one subject";
    return errors;
}

// ===== Component =====

export default function OnboardingForm() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const isStudent = userData?.role === "student";
    const totalSteps = isStudent ? 3 : 2;

    const [formData, setFormData] = useState({
        name: userData?.name || "",
        rollNo: "",
        department: "",
        section: "",
        year: "",
        institution: "",
        subjectsFocus: "",
        consentGiven: false,
    });

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleNext = () => {
        let validationErrors: FormErrors = {};

        if (step === 1) {
            validationErrors = isStudent
                ? validateStep1Student(formData)
                : validateStep1Teacher(formData);
        }
        if (step === 2 && isStudent) {
            validationErrors = validateStep2Student(formData);
        }
        if (step === 2 && !isStudent) {
            validationErrors = validateStep2Teacher(formData);
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
        setErrors({});
    };

    const handleSubmit = async () => {
        if (isStudent && !formData.consentGiven) {
            setErrors({ name: "You must provide consent to proceed." });
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            if (!user) throw new Error("No user found");

            if (isStudent) {
                const profileRef = doc(db, "students", user.uid, "profile", "main");
                await setDoc(profileRef, {
                    studentId: user.uid,
                    name: formData.name.trim(),
                    email: user.email,
                    rollNo: formData.rollNo.trim(),
                    department: formData.department,
                    section: formData.section,
                    year: parseInt(formData.year),
                    consentGiven: formData.consentGiven,
                    consentDate: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            } else {
                const teacherRef = doc(db, "teachers", user.uid);
                await setDoc(teacherRef, {
                    teacherId: user.uid,
                    name: formData.name.trim(),
                    email: user.email,
                    department: formData.department,
                    institution: formData.institution,
                    subjectsFocus: formData.subjectsFocus.split(",").map(s => s.trim()).filter(Boolean),
                    createdAt: serverTimestamp(),
                });
            }

            await updateDoc(doc(db, "users", user.uid), {
                name: formData.name.trim(),
                onboardingCompleted: true,
            });

            window.location.href = isStudent ? "/dashboard/student" : "/dashboard/teacher";
        } catch (err: any) {
            console.error(err);
            setErrors({ name: err.message || "Failed to save profile" });
            setLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    // Inline error display helper
    const fieldError = (field: keyof FormErrors) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
        ) : null;

    return (
        <div className="w-full max-w-lg mx-auto bg-bg-secondary border border-border-primary rounded-[16px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative accent blob */}
            <div
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-10 blur-[80px]"
                style={{ backgroundColor: isStudent ? "var(--accent)" : "#A3E635" }}
            />

            <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {isStudent ? "Student Onboarding" : "Faculty Setup"}
                </h2>
                <p className="text-text-secondary text-sm mb-6">
                    Complete your profile to access your personalized dashboard.
                </p>
                <ProgressBar currentStep={step} totalSteps={totalSteps} />
            </div>

            {/* Global error (e.g. from submit failures) */}
            {errors.name && step === (isStudent ? 3 : 2) && !isStudent && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-500">{errors.name}</p>
                </div>
            )}

            <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait" custom={1}>
                    {/* ===== STEP 1: Basic Details ===== */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                            <div>
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={updateForm}
                                    placeholder="Enter your full name"
                                />
                                {fieldError("name")}
                            </div>

                            {isStudent ? (
                                <div>
                                    <Input
                                        label="Roll Number / Student ID"
                                        name="rollNo"
                                        value={formData.rollNo}
                                        onChange={updateForm}
                                        placeholder="e.g. 21CS001"
                                    />
                                    {fieldError("rollNo")}
                                </div>
                            ) : (
                                <div>
                                    <Select
                                        label="Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={(e) => updateForm(e as any)}
                                        options={DEPARTMENTS}
                                    />
                                    {fieldError("department")}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ===== STEP 2 (Student): Academic Details ===== */}
                    {step === 2 && isStudent && (
                        <motion.div
                            key="step2-student"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                            <div>
                                <Select
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={(e) => updateForm(e as any)}
                                    options={DEPARTMENTS}
                                />
                                {fieldError("department")}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Select
                                        label="Section"
                                        name="section"
                                        value={formData.section}
                                        onChange={(e) => updateForm(e as any)}
                                        options={SECTIONS}
                                    />
                                    {fieldError("section")}
                                </div>
                                <div>
                                    <Select
                                        label="Year of Study"
                                        name="year"
                                        value={formData.year}
                                        onChange={(e) => updateForm(e as any)}
                                        options={YEARS}
                                    />
                                    {fieldError("year")}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== STEP 2 (Teacher): Institution Details ===== */}
                    {step === 2 && !isStudent && (
                        <motion.div
                            key="step2-teacher"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                            <div>
                                <Select
                                    label="Institution"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={(e) => updateForm(e as any)}
                                    options={INSTITUTIONS}
                                />
                                {fieldError("institution")}
                            </div>
                            <div>
                                <Input
                                    label="Subjects / Focus Areas (comma separated)"
                                    name="subjectsFocus"
                                    value={formData.subjectsFocus}
                                    onChange={updateForm}
                                    placeholder="e.g. Data Structures, Algorithms, Machine Learning"
                                />
                                {fieldError("subjectsFocus")}
                            </div>
                        </motion.div>
                    )}

                    {/* ===== STEP 3 (Student): Consent ===== */}
                    {step === 3 && isStudent && (
                        <motion.div
                            key="step3-student"
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="bg-[#1F1F1F]/30 p-5 rounded-lg border border-border-primary">
                                <h3 className="font-semibold text-text-primary mb-2">Data Privacy & Consent</h3>
                                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                    PRISM collects daily self-reported data (sleep, screen time, mood) to predict academic risk.
                                    This data is encrypted, stored securely, and only visible to authorized faculty to provide early interventions.
                                </p>
                                <ConsentCheckbox
                                    id="consent"
                                    checked={formData.consentGiven}
                                    onChange={(c) => setFormData(prev => ({ ...prev, consentGiven: c }))}
                                    title="I agree to share my data"
                                    description="I explicitly consent to PRISM analyzing my academic and behavioral data to generate risk predictions."
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-4 pt-6 border-t border-border-primary relative z-10">
                {step > 1 && (
                    <Button variant="secondary" onClick={handleBack} disabled={loading} className="w-full">
                        Back
                    </Button>
                )}

                {step < totalSteps ? (
                    <Button variant="primary" onClick={handleNext} className="w-full">
                        Continue
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || (isStudent && !formData.consentGiven)}
                        className="w-full relative overflow-hidden"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                            "Complete Setup"
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
