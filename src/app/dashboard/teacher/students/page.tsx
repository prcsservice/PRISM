"use client";

import { useTeacherData } from "@/hooks/useTeacherData";
import DataTable from "@/components/dashboard/DataTable";
import ExportButton from "@/components/dashboard/ExportButton";
import { RiskBadge } from "@/components/ui/RiskBadge";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { Search } from "lucide-react";

export default function TeacherStudentsPage() {
    const { profile, students, loading } = useTeacherData();
    const [search, setSearch] = useState("");

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { header: "Name", accessorKey: "name" as any },
        { header: "Roll Number", accessorKey: "rollNo" as any },
        { header: "Year", accessorKey: "year" as any, cell: (s: any) => `${s.year} Year` },
        { header: "Section", accessorKey: "section" as any },
        {
            header: "Risk Level",
            accessorKey: "metrics" as any,
            cell: (item: any) => {
                const riskLevel = item.metrics?.riskLevel;
                const variant = riskLevel
                    ? (riskLevel.toLowerCase() === "moderate" ? "medium" : riskLevel.toLowerCase())
                    : "default";
                return (
                    <RiskBadge variant={variant as any} className="capitalize w-20">
                        {riskLevel || "N/A"}
                    </RiskBadge>
                );
            }
        }
    ];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Student Roster</h1>
                    <p className="text-text-secondary">All actively monitored students in {profile?.department || "your department"}.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or roll no..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 bg-bg-secondary border border-border-primary rounded-md pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#A3E635] transition-colors"
                        />
                    </div>
                    <ExportButton
                        data={filteredStudents.map(s => ({
                            Name: s.name,
                            "Roll Number": s.rollNo,
                            Department: s.department,
                            Section: s.section,
                            Year: s.year,
                            "Risk Level": s.metrics?.riskLevel ?? "N/A",
                            "Risk Score": s.metrics?.riskScore ? Math.round(s.metrics.riskScore * 100) + "%" : "N/A",
                        }))}
                        filename="prism_students"
                    />
                </div>
            </div>

            <DataTable
                data={filteredStudents}
                columns={columns}
                rowHref={(s) => `/dashboard/teacher/student/${s.studentId}`}
                emptyMessage={search ? "No students matching search." : "No students found in your department."}
            />
        </div>
    );
}
