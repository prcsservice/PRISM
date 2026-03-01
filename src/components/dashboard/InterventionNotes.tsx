"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Intervention } from "@/lib/types";

interface InterventionNotesProps {
    interventions: Intervention[];
    onAddNote?: (notes: string, actionTaken: string) => Promise<void>;
    loading?: boolean;
}

export default function InterventionNotes({ interventions, onAddNote, loading = false }: InterventionNotesProps) {
    const [notes, setNotes] = useState("");
    const [action, setAction] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!notes.trim() || !onAddNote) return;
        setSubmitting(true);
        try {
            await onAddNote(notes, action);
            setNotes("");
            setAction("");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="space-y-4">
            {/* Add new note */}
            {onAddNote && (
                <div className="space-y-3 border border-border-primary rounded-lg p-4 bg-bg-secondary">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add intervention notes..."
                        rows={3}
                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent"
                    />
                    <input
                        type="text"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="Action taken (e.g., Counseling referral, Parent meeting)"
                        className="w-full bg-bg-primary border border-border-primary rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!notes.trim() || submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={14} />
                        {submitting ? "Adding..." : "Add Note"}
                    </button>
                </div>
            )}

            {/* Past notes */}
            <div className="space-y-3">
                {interventions.length === 0 && (
                    <p className="text-sm text-text-muted py-4 text-center">No intervention notes yet.</p>
                )}
                {interventions.map((note) => (
                    <div
                        key={note.id}
                        className="border border-border-primary rounded-lg p-4 bg-bg-primary"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">{note.teacherName}</span>
                            <span className="text-xs text-text-muted">{formatDate(note.date)}</span>
                        </div>
                        <p className="text-sm text-text-secondary">{note.notes}</p>
                        {note.actionTaken && (
                            <div className="mt-2 text-xs text-accent font-medium">
                                Action: {note.actionTaken}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
