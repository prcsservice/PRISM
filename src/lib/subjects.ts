import type { SubjectMark } from "./types";

/**
 * Department → Semester → Subject list mapping.
 * Used to auto-populate subject fields when teachers enter academic data.
 * 
 * Each department has subjects grouped by semester (1-8).
 * Subjects are kept generic but representative of typical Indian engineering curricula.
 */

export interface SubjectTemplate {
    name: string;
    code: string;
}

// Common subjects shared across departments
const COMMON_SEM1: SubjectTemplate[] = [
    { name: "Engineering Mathematics I", code: "MA101" },
    { name: "Engineering Physics", code: "PH101" },
    { name: "Engineering Chemistry", code: "CH101" },
    { name: "Programming in C", code: "CS101" },
    { name: "Engineering Graphics", code: "ME101" },
];

const COMMON_SEM2: SubjectTemplate[] = [
    { name: "Engineering Mathematics II", code: "MA102" },
    { name: "Environmental Science", code: "ES101" },
    { name: "Basic Electronics", code: "EC101" },
    { name: "Workshop Practice", code: "ME102" },
    { name: "English Communication", code: "HU101" },
];

export const DEPARTMENT_SUBJECTS: Record<string, Record<number, SubjectTemplate[]>> = {
    "Computer Science & Engineering": {
        1: COMMON_SEM1,
        2: COMMON_SEM2,
        3: [
            { name: "Data Structures", code: "CS201" },
            { name: "Digital Logic Design", code: "CS202" },
            { name: "Discrete Mathematics", code: "CS203" },
            { name: "Object Oriented Programming", code: "CS204" },
            { name: "Computer Organization", code: "CS205" },
        ],
        4: [
            { name: "Design & Analysis of Algorithms", code: "CS301" },
            { name: "Operating Systems", code: "CS302" },
            { name: "Database Management Systems", code: "CS303" },
            { name: "Computer Networks", code: "CS304" },
            { name: "Software Engineering", code: "CS305" },
        ],
        5: [
            { name: "Theory of Computation", code: "CS401" },
            { name: "Compiler Design", code: "CS402" },
            { name: "Machine Learning", code: "CS403" },
            { name: "Web Technologies", code: "CS404" },
            { name: "Elective I", code: "CS4E1" },
        ],
        6: [
            { name: "Artificial Intelligence", code: "CS501" },
            { name: "Cloud Computing", code: "CS502" },
            { name: "Information Security", code: "CS503" },
            { name: "Elective II", code: "CS5E2" },
            { name: "Mini Project", code: "CS5P1" },
        ],
        7: [
            { name: "Deep Learning", code: "CS601" },
            { name: "Big Data Analytics", code: "CS602" },
            { name: "Elective III", code: "CS6E3" },
            { name: "Project Phase I", code: "CS6P1" },
        ],
        8: [
            { name: "Elective IV", code: "CS7E4" },
            { name: "Project Phase II", code: "CS7P2" },
            { name: "Internship", code: "CS7IN" },
        ],
    },
    "Electronics & Communication Engineering": {
        1: COMMON_SEM1,
        2: COMMON_SEM2,
        3: [
            { name: "Signals & Systems", code: "EC201" },
            { name: "Electronic Circuits", code: "EC202" },
            { name: "Digital Electronics", code: "EC203" },
            { name: "Network Theory", code: "EC204" },
            { name: "Electromagnetic Theory", code: "EC205" },
        ],
        4: [
            { name: "Analog Communication", code: "EC301" },
            { name: "Microprocessors", code: "EC302" },
            { name: "Control Systems", code: "EC303" },
            { name: "Linear Integrated Circuits", code: "EC304" },
            { name: "Digital Signal Processing", code: "EC305" },
        ],
        5: [
            { name: "Digital Communication", code: "EC401" },
            { name: "VLSI Design", code: "EC402" },
            { name: "Microcontrollers", code: "EC403" },
            { name: "Antenna & Wave Propagation", code: "EC404" },
            { name: "Elective I", code: "EC4E1" },
        ],
        6: [
            { name: "Wireless Communication", code: "EC501" },
            { name: "Embedded Systems", code: "EC502" },
            { name: "Optical Communication", code: "EC503" },
            { name: "Elective II", code: "EC5E2" },
            { name: "Mini Project", code: "EC5P1" },
        ],
    },
    "Mechanical Engineering": {
        1: COMMON_SEM1,
        2: COMMON_SEM2,
        3: [
            { name: "Engineering Mechanics", code: "ME201" },
            { name: "Thermodynamics", code: "ME202" },
            { name: "Strength of Materials", code: "ME203" },
            { name: "Material Science", code: "ME204" },
            { name: "Manufacturing Technology I", code: "ME205" },
        ],
        4: [
            { name: "Fluid Mechanics", code: "ME301" },
            { name: "Kinematics of Machinery", code: "ME302" },
            { name: "Manufacturing Technology II", code: "ME303" },
            { name: "Engineering Metallurgy", code: "ME304" },
            { name: "Design of Machine Elements", code: "ME305" },
        ],
    },
    "Electrical & Electronics Engineering": {
        1: COMMON_SEM1,
        2: COMMON_SEM2,
        3: [
            { name: "Electric Circuit Theory", code: "EE201" },
            { name: "Electrical Machines I", code: "EE202" },
            { name: "Electronic Devices", code: "EE203" },
            { name: "Measurements & Instrumentation", code: "EE204" },
            { name: "Electromagnetic Fields", code: "EE205" },
        ],
        4: [
            { name: "Power Systems I", code: "EE301" },
            { name: "Electrical Machines II", code: "EE302" },
            { name: "Linear Control Systems", code: "EE303" },
            { name: "Transmission & Distribution", code: "EE304" },
            { name: "Power Electronics", code: "EE305" },
        ],
    },
    "Civil Engineering": {
        1: COMMON_SEM1,
        2: COMMON_SEM2,
        3: [
            { name: "Surveying", code: "CE201" },
            { name: "Mechanics of Solids", code: "CE202" },
            { name: "Fluid Mechanics", code: "CE203" },
            { name: "Building Materials", code: "CE204" },
            { name: "Engineering Geology", code: "CE205" },
        ],
        4: [
            { name: "Structural Analysis", code: "CE301" },
            { name: "Geotechnical Engineering", code: "CE302" },
            { name: "Water Resources Engineering", code: "CE303" },
            { name: "Concrete Technology", code: "CE304" },
            { name: "Environmental Engineering", code: "CE305" },
        ],
    },
};

/**
 * Get subjects for a specific department and semester.
 * Returns empty array if department or semester not found.
 */
export function getSubjectsForSemester(department: string, semester: number): SubjectTemplate[] {
    return DEPARTMENT_SUBJECTS[department]?.[semester] ?? [];
}

/**
 * Get all available departments.
 */
export function getDepartments(): string[] {
    return Object.keys(DEPARTMENT_SUBJECTS);
}

/**
 * Get max defined semester for a department.
 */
export function getMaxSemester(department: string): number {
    const semesters = Object.keys(DEPARTMENT_SUBJECTS[department] ?? {}).map(Number);
    return semesters.length > 0 ? Math.max(...semesters) : 8;
}

/**
 * Compute the CIA average from the new semester/subject structure.
 * Uses only the current semester's subjects.
 * Falls back to legacy ciaMarks array if no semesters data.
 */
export function computeCiaAverage(academic: {
    semesters?: { semester: number; subjects: SubjectMark[] }[];
    currentSemester?: number;
    ciaMarks?: number[];
}): number {
    // Try new structure first
    if (academic.semesters && academic.currentSemester) {
        const currentSem = academic.semesters.find(s => s.semester === academic.currentSemester);
        if (currentSem && currentSem.subjects.length > 0) {
            const allMarks: number[] = [];
            for (const sub of currentSem.subjects) {
                if (sub.cia1 != null) allMarks.push(sub.cia1);
                if (sub.cia2 != null) allMarks.push(sub.cia2);
                if (sub.cia3 != null) allMarks.push(sub.cia3);
            }
            if (allMarks.length > 0) {
                return allMarks.reduce((a, b) => a + b, 0) / allMarks.length;
            }
        }
    }

    // Fall back to legacy flat array
    if (academic.ciaMarks && academic.ciaMarks.length > 0) {
        return academic.ciaMarks.reduce((a, b) => a + b, 0) / academic.ciaMarks.length;
    }

    return 0;
}
