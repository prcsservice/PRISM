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

    const handleSubmit = async () => {
        if (!notes.trim() || !actionType || !onAddNote) return;
        setSubmitting(true);
        try {
            const label = actionType ? MENTOR_ACTION_LABELS[actionType] : "";
            await onAddNote(notes, label, actionType || undefined, actionStatus);
            setNotes("");
            setActionType("");
            setActionStatus("completed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickAction = (suggestion: string) => {
        setNotes(suggestion);
        // Auto-detect action type from suggestion text
        if (suggestion.toLowerCase().includes("wellness check") || suggestion.toLowerCase().includes("one-on-one")) {
            setActionType("scheduled_meeting");
        } else if (suggestion.toLowerCase().includes("counseling") || suggestion.toLowerCase().includes("counselor")) {
            setActionType("referred_counselor");
        } else if (suggestion.toLowerCase().includes("parent") || suggestion.toLowerCase().includes("guardian")) {
            setActionType("contacted_parent");
        } else if (suggestion.toLowerCase().includes("study") || suggestion.toLowerCase().includes("academic") || suggestion.toLowerCase().includes("tutoring")) {
            setActionType("academic_support");
        } else if (suggestion.toLowerCase().includes("encouragement") || suggestion.toLowerCase().includes("positive")) {
            setActionType("sent_encouragement");
        } else if (suggestion.toLowerCase().includes("peer")) {
            setActionType("peer_mentoring");
        } else {
            setActionType("custom");
        }
    };

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
