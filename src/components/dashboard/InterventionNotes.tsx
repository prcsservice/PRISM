"use client";

import { useState } from "react";
import { Send, Phone, Calendar, UserCheck, Users, Heart, BookOpen, MessageSquare, ChevronDown } from "lucide-react";
import type { Intervention, MentorActionType } from "@/lib/types";
import { MENTOR_ACTION_LABELS } from "@/lib/types";
import Select from "@/components/ui/Select";

const ACTION_ICONS: Record<MentorActionType, any> = {
    called_student: Phone,
    scheduled_meeting: Calendar,
    referred_counselor: UserCheck,
    contacted_parent: Users,
    academic_support: BookOpen,
    peer_mentoring: Users,
    sent_encouragement: Heart,
    custom: MessageSquare,
};

const ACTION_COLORS: Record<MentorActionType, string> = {
    called_student: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    scheduled_meeting: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    referred_counselor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    contacted_parent: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    academic_support: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    peer_mentoring: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    sent_encouragement: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    custom: "text-text-secondary bg-bg-hover border-border-primary",
};

const ACTION_OPTIONS = [
    { value: "", label: "Select Action Type" },
    ...Object.entries(MENTOR_ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

const STATUS_OPTIONS = [
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];

interface InterventionNotesProps {
    interventions: Intervention[];
    onAddNote?: (notes: string, actionTaken: string, actionType?: MentorActionType, status?: string) => Promise<void>;
    loading?: boolean;
    suggestedActions?: string[];
}

export default function InterventionNotes({ interventions, onAddNote, loading = false, suggestedActions }: InterventionNotesProps) {
    const [notes, setNotes] = useState("");
    const [actionType, setActionType] = useState<MentorActionType | "">("");
    const [actionStatus, setActionStatus] = useState("completed");
    const [submitting, setSubmitting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!notes.trim() || !actionType || !onAddNote) return;
        setSubmitting(true);
        try {
            const label = actionType ? MENTOR_ACTION_LABELS[actionType] : "";
            await onAddNote(notes, label, actionType || undefined, actionStatus);
            setNotes("");
            setActionType("");
            setActionStatus("completed");
            setSelectedSuggestion(null);
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickAction = (suggestion: string) => {
        // Generate a warm, supportive student-facing message from the teacher suggestion
        const studentMessage = generateStudentMessage(suggestion);
        setNotes(studentMessage);
        setSelectedSuggestion(suggestion);

        // Auto-detect action type from suggestion text
        const lower = suggestion.toLowerCase();
        if (lower.includes("check-in") || lower.includes("wellness") || lower.includes("one-on-one") || lower.includes("message")) {
            setActionType("sent_encouragement");
        } else if (lower.includes("meeting") || lower.includes("schedule") || lower.includes("review")) {
            setActionType("scheduled_meeting");
        } else if (lower.includes("counseling") || lower.includes("counselor")) {
            setActionType("referred_counselor");
        } else if (lower.includes("parent") || lower.includes("guardian")) {
            setActionType("contacted_parent");
        } else if (lower.includes("study") || lower.includes("academic") || lower.includes("tutoring") || lower.includes("cia") || lower.includes("marks")) {
            setActionType("academic_support");
        } else if (lower.includes("peer")) {
            setActionType("peer_mentoring");
        } else if (lower.includes("encouragement") || lower.includes("positive") || lower.includes("trajectory")) {
            setActionType("sent_encouragement");
        } else if (lower.includes("call") || lower.includes("phone")) {
            setActionType("called_student");
        } else {
            setActionType("custom");
        }
    };

    /**
     * Converts a teacher-facing AI suggestion into a warm, supportive student-facing message.
     * The teacher can still review and edit before sending.
     */
    function generateStudentMessage(suggestion: string): string {
        const lower = suggestion.toLowerCase();

        // Check-in / well-being
        if (lower.includes("check-in") || lower.includes("well-being") || lower.includes("wellness")) {
            return "Hey! Just wanted to check in and see how you're doing. If you ever want to talk about anything — academic or otherwise — I'm always here. Take care of yourself! 😊";
        }

        // CIA / marks review
        if (lower.includes("cia") || lower.includes("marks") || lower.includes("weak area") || lower.includes("performance")) {
            return "Hi! I'd like us to sit down together and go over your recent assessments. We can identify a few areas to work on and come up with a plan — nothing to worry about, it's all about finding ways to help you improve. Let me know a good time to meet! 📚";
        }

        // Academic recovery / study plan
        if (lower.includes("recovery plan") || lower.includes("study session") || lower.includes("study plan")) {
            return "Hi! I'd like to help you put together a study plan that works for you. We can break things down into small, manageable steps so it feels less overwhelming. Let's chat soon — I'm confident we can turn things around together! 💪";
        }

        // Peer tutoring / study group
        if (lower.includes("peer") || lower.includes("tutoring") || lower.includes("study group")) {
            return "Hey! I think you'd really benefit from joining a study group or getting paired with a peer tutor. It's a great way to learn together and make studying less stressful. Would you be open to trying it? I can help set it up! 🤝";
        }

        // Guardian / parent contact
        if (lower.includes("guardian") || lower.includes("parent") || lower.includes("family")) {
            return "Hi! I want you to know that I care about your progress and well-being. I'm planning to have a quick chat with your family just to make sure we're all working together to support you. This is nothing negative — it's about making sure you have the best support system. 💛";
        }

        // Faculty coordination
        if (lower.includes("faculty") || lower.includes("coordinate") || lower.includes("other faculty")) {
            return "Hey! I'm coordinating with your other teachers to make sure we're all aligned on how to best support you. If there's anything specific you'd like us to know or help with, don't hesitate to reach out! 🙌";
        }

        // Counselor referral
        if (lower.includes("counselor") || lower.includes("counseling")) {
            return "Hi! I want to let you know about the counseling support available on campus. Speaking with a counselor can be really helpful — it's a safe, confidential space to talk things through. Would you like me to help you schedule a session? There's absolutely no stigma in asking for support. 💙";
        }

        // Encouragement / positive trajectory
        if (lower.includes("encouragement") || lower.includes("positive") || lower.includes("maintain") || lower.includes("trajectory")) {
            return "Hey! Just wanted to say — you're doing great, and I've noticed your efforts. Keep up the amazing work! Remember, consistency is key, and you're on the right track. I'm really proud of your progress. 🌟";
        }

        // Schedule meeting (generic)
        if (lower.includes("meeting") || lower.includes("schedule") || lower.includes("one-on-one")) {
            return "Hi! I'd love to have a quick chat with you. Nothing to worry about — I just want to see how you're doing and if there's anything I can help with. Let me know when you're free! 😊";
        }

        // Attendance
        if (lower.includes("attendance")) {
            return "Hey! I noticed your attendance has been a bit low recently. If there's anything going on that's making it hard to come to class, please let me know — I'd like to help. Your presence in class really makes a difference, and I want to make sure you don't miss out. 📋";
        }

        // Default: generic supportive message
        return `Hi! I wanted to reach out because I care about how you're doing. ${suggestion.replace(/the student('s)?/gi, "your").replace(/student/gi, "you")} — let me know if you'd like to talk about it. I'm here to help! 😊`;
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "planned": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "in_progress": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "completed": return "text-green-400 bg-green-400/10 border-green-400/20";
            default: return "text-text-muted bg-bg-hover border-border-primary";
        }
    };

    return (
        <div className="space-y-4">
            {/* AI Suggested Actions */}
            {suggestedActions && suggestedActions.length > 0 && showSuggestions && (
                <div className="border border-[#A3E635]/20 bg-[#A3E635]/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🤖</span>
                            <span className="text-xs font-semibold text-[#A3E635] uppercase tracking-wider">AI Suggested Actions</span>
                        </div>
                        <button
                            onClick={() => setShowSuggestions(false)}
                            className="text-xs text-text-muted hover:text-text-secondary"
                        >
                            Dismiss
                        </button>
                    </div>
                    <div className="grid gap-2">
                        {suggestedActions.map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickAction(suggestion)}
                                className="w-full text-left px-3 py-2.5 text-sm text-text-secondary bg-bg-primary border border-border-primary rounded-lg hover:border-[#A3E635]/40 hover:bg-[#A3E635]/5 transition-all group"
                            >
                                <span className="group-hover:text-text-primary transition-colors">{suggestion}</span>
                                <span className="text-[10px] text-text-muted ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to use</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Add new intervention */}
            {onAddNote && (
                <div className="space-y-3 border border-border-primary rounded-xl p-4 bg-bg-secondary">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label="Action Type"
                            name="actionType"
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value as MentorActionType)}
                            options={ACTION_OPTIONS}
                        />
                        <Select
                            label="Status"
                            name="status"
                            value={actionStatus}
                            onChange={(e) => setActionStatus(e.target.value)}
                            options={STATUS_OPTIONS}
                        />
                    </div>
                    {selectedSuggestion && (
                        <div className="flex items-start gap-2 px-3 py-2 bg-[#A3E635]/5 border border-[#A3E635]/20 rounded-lg">
                            <span className="text-[10px] font-semibold text-[#A3E635] uppercase tracking-wider shrink-0 mt-0.5">Based on:</span>
                            <span className="text-xs text-text-secondary flex-1">{selectedSuggestion}</span>
                            <button
                                onClick={() => setSelectedSuggestion(null)}
                                className="text-[10px] text-text-muted hover:text-text-secondary shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe the intervention, observations, and next steps..."
                        rows={3}
                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!notes.trim() || !actionType || submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={14} />
                        {submitting ? "Adding..." : "Record Intervention"}
                    </button>
                </div>
            )}

            {/* Past interventions */}
            <div className="space-y-3">
                {interventions.length === 0 && (
                    <p className="text-sm text-text-muted py-4 text-center">No intervention records yet.</p>
                )}
                {interventions.map((note) => {
                    const type = note.actionType as MentorActionType;
                    const Icon = type ? ACTION_ICONS[type] : MessageSquare;
                    const colorClass = type ? ACTION_COLORS[type] : ACTION_COLORS.custom;

                    return (
                        <div
                            key={note.id}
                            className="border border-border-primary rounded-xl p-4 bg-bg-primary hover:border-border-hover transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 p-1.5 rounded-lg border ${colorClass}`}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-text-primary">{note.teacherName}</span>
                                            {note.actionType && (
                                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${colorClass} uppercase`}>
                                                    {MENTOR_ACTION_LABELS[note.actionType] || note.actionTaken}
                                                </span>
                                            )}
                                            {note.status && (
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getStatusColor(note.status)} capitalize`}>
                                                    {note.status?.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-text-muted">{formatDate(note.date)}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">{note.notes}</p>
                                    {note.outcome && note.outcome !== "pending" && (
                                        <div className={`mt-2 text-xs font-medium capitalize ${note.outcome === "improved" ? "text-green-400" :
                                            note.outcome === "worsened" ? "text-red-400" : "text-text-muted"
                                            }`}>
                                            Outcome: {note.outcome.replace("_", " ")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
