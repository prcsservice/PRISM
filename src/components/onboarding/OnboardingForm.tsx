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

export default function OnboardingForm() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isStudent = userData?.role === "student";
    const totalSteps = isStudent ? 3 : 2;

    // Form State
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        rollNo: "",
        department: "",
        section: "",
        year: "",
        // Teacher specific
        institution: "",
        subjectsFocus: "",
        // Consent
        consentGiven: false,
    });

    const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNext = () => {
        setError("");
        if (step === 1) {
            if (!formData.name) return setError("Name is required");
            if (isStudent && !formData.rollNo) return setError("Roll Number is required");
        }
        if (step === 2 && isStudent) {
            if (!formData.department || !formData.section || !formData.year) {
                return setError("Please fill all academic details");
            }
        }
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
        setError("");
    };

    const handleSubmit = async () => {
        if (isStudent && !formData.consentGiven) {
            return setError("You must provide consent to proceed.");
        }

        try {
            setLoading(true);
            setError("");

            if (!user) throw new Error("No user found");

            if (isStudent) {
                // Create student profile
                const profileRef = doc(db, "students", user.uid, "profile", "data");
                await setDoc(profileRef, {
                    studentId: user.uid,
                    name: formData.name,
                    email: user.email,
                    rollNo: formData.rollNo,
                    department: formData.department,
                    section: formData.section,
                    year: parseInt(formData.year),
                    consentGiven: formData.consentGiven,
                    consentDate: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Create teacher profile
                const teacherRef = doc(db, "teachers", user.uid);
                await setDoc(teacherRef, {
                    teacherId: user.uid,
                    name: formData.name,
                    email: user.email,
                    department: formData.department,
                    institution: formData.institution,
                    subjectsFocus: formData.subjectsFocus.split(",").map(s => s.trim()),
                    createdAt: serverTimestamp(),
                });
            }

            // Mark onboarding as complete on the base user doc
            await updateDoc(doc(db, "users", user.uid), {
                name: formData.name, // Update in case they changed it
                onboardingCompleted: true,
            });

            // Navigate to respective dashboard
            window.location.href = isStudent ? "/dashboard/student" : "/dashboard/teacher";

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save profile");
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
                    Complete your profile to access your personalized dashbaord.
                </p>
                <ProgressBar currentStep={step} totalSteps={totalSteps} />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait" custom={1}>
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
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={updateForm}
                                placeholder="John Doe"
                            />
                            {isStudent && (
                                <Input
                                    label="Roll Number / Student ID"
                                    name="rollNo"
                                    value={formData.rollNo}
                                    onChange={updateForm}
                                    placeholder="e.g. 21CS001"
                                />
                            )}
                            {!isStudent && (
                                <Input
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={updateForm}
                                    placeholder="e.g. Computer Science"
                                />
                            )}
                        </motion.div>
                    )}

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
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={updateForm}
                                placeholder="e.g. Computer Science"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Section/Class"
                                    name="section"
                                    value={formData.section}
                                    onChange={updateForm}
                                    placeholder="e.g. CSE-A"
                                />
                                <Select
                                    label="Year of Study"
                                    name="year"
                                    value={formData.year}
                                    onChange={(e) => updateForm(e as any)}
                                    options={[
                                        { value: "", label: "Select Year" },
                                        { value: "1", label: "1st Year" },
                                        { value: "2", label: "2nd Year" },
                                        { value: "3", label: "3rd Year" },
                                        { value: "4", label: "4th Year" },
                                    ]}
                                />
                            </div>
                        </motion.div>
                    )}

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
                            <Input
                                label="Institution Name"
                                name="institution"
                                value={formData.institution}
                                onChange={updateForm}
                                placeholder="e.g. Global Tech University"
                            />
                            <Input
                                label="Subjects Focus (Comma separated)"
                                name="subjectsFocus"
                                value={formData.subjectsFocus}
                                onChange={updateForm}
                                placeholder="e.g. Data Structures, Algorithms"
                            />
                        </motion.div>
                    )}

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
