# PRISM
Predictive Risk Identification System for Mentoring
Product Requirements Document (PRD)
Version 3.0 — Complete Product Specification

---

# 1. Product Overview

PRISM is a serverless AI-powered academic early-warning web application designed to:

- Monitor behavioral and academic indicators of students
- Predict stress levels using AI (Google Gemini 2.0 Flash)
- Estimate academic failure probability
- Predict attendance decline
- Generate intervention suggestions with AI explainability
- Alert teachers before academic deterioration occurs
- Enable teacher follow-up and intervention tracking

PRISM is an academic support tool and not a medical diagnostic system.

---

# 2. Product Modules

PRISM consists of three major layers:

1. Public Marketing Layer (Landing Page)
2. Authentication & Role Management Layer
3. Secure Application Layer (Dashboards + AI Engine)

---

# 3. Module A — Public Landing Page

Route: `/`

Accessible without authentication.

## Purpose

- Explain product value
- Explain problem being solved
- Build institutional credibility
- Direct users to correct login flow

## Required Sections

1. Hero Section
   - Headline
   - Subtext
   - CTA: Login as Student
   - CTA: Login as Teacher

2. Problem Section
   - Academic stress challenges
   - Lack of early detection

3. Solution Section
   - AI-based predictive analytics
   - Real-time monitoring
   - Faculty intervention system

4. How It Works
   - Data collection
   - AI analysis
   - Risk classification
   - Alerts

5. Security & Privacy Section
   - Consent-first system
   - Data encryption
   - No medical claims

6. FAQ Section
   - What data is collected?
   - Who can see my data?
   - Is this a medical tool?
   - How are predictions made?
   - Can I delete my data?

7. Call to Action Section
   - Role-based login buttons

8. Footer
   - Disclaimer
   - Version info
   - Privacy policy link

Non-functional:
- Responsive
- Accessible (WCAG AA)
- SEO-friendly
- Dark/Light theme support

---

# 4. Module B — Authentication & Role Management

Authentication Provider:
- Firebase Authentication
- Google OAuth only

No email/password system.
No anonymous login.

---

## 4.1 Role-Based Entry Flow

Users must select role before authentication:

- Continue as Student → `/auth/student`
- Continue as Teacher → `/auth/teacher`

---

## 4.2 Student Authentication Flow

1. User selects Student
2. Google OAuth
3. System checks Firestore:
   - If new → create user document with role = student
   - If existing with role = student → proceed
   - If existing with role = teacher → show error "This email is registered as a teacher account. Please use the teacher login."
4. Redirect to onboarding if first login
5. Redirect to Student Dashboard

---

## 4.3 Teacher Authentication Flow

1. User selects Teacher
2. Google OAuth
3. System checks `approvedTeachers` collection
4. If email approved:
   - Check if existing user with role = student → show error "This email is registered as a student account."
   - Create user with role = teacher
   - Redirect to onboarding/dashboard
5. If not approved:
   - Redirect to Access Denied page

---

# 5. Onboarding Flows

## Student Onboarding

Required fields:
- Full Name
- Roll Number
- Department
- Section / Batch
- Year / Semester
- Consent acknowledgment (mandatory)

On completion:
- onboardingCompleted = true

---

## Teacher Onboarding

Required fields:
- Full Name
- Department
- Institution
- Subjects handled (optional)

On completion:
- onboardingCompleted = true

---

# 6. Role-Based Routing

After authentication:

If role == student:
→ `/dashboard/student`

If role == teacher:
→ `/dashboard/teacher`

If unauthorized:
→ `/access-denied`

---

# 7. Module C — Student Dashboard

Capabilities:

- Submit daily logs:
  - Sleep hours
  - Screen time
  - Mood (1–5 scale)
  - Study hours
  - Social interaction level (1–5 scale)

- View:
  - Stress score (0–1)
  - Risk level (Low / Moderate / High)
  - 7-day stress trend chart
  - AI-generated suggestions
  - Explainability summary
  - Academic overview (read-only)
  - Historical daily log entries

- Settings:
  - Profile editing (name, department, section)
  - Theme toggle (dark/light)
  - Notification preferences

Restrictions:
- Cannot edit academic records
- Cannot access other students
- Maximum 1 daily log submission per day (rate limited)

---

# 8. Module D — Teacher Dashboard

Capabilities:

- View all students (with search & filters)
- View stress score
- View failure probability
- View attendance prediction
- View risk level
- Add faculty feedback score
- Filter by risk level, department, section
- View alerts (with priority levels)
- Access individual student detail view
- Add intervention notes on students
- View intervention history per student
- Department/batch-level analytics (aggregate risk distribution)
- Export student data as CSV

Restrictions:
- Cannot edit daily logs

---

# 9. AI Prediction Engine

Location:
Firebase Cloud Functions only

Frontend must never call AI directly.

---

## 9.1 Feature Normalization

All features are normalized to 0–1 range (higher = higher risk):

```
screenTime_norm = min(screenTime / 10, 1)
sleep_norm = max(0, 1 - (sleepHours / 8))
marks_norm = 1 - (ciaMarks / maxMarks)
attendance_norm = 1 - attendance    // attendance is already 0–1
feedback_norm = 1 - (facultyFeedback / 5)
mood_norm = 1 - (mood / 5)
studyHours_norm = max(0, 1 - (studyHours / 8))
social_norm = 1 - (socialInteraction / 5)
```

All values are clamped to [0, 1] range after computation.

---

## 9.2 AI Model

Provider:
Google Gemini API (Vertex AI via Firebase)

Model:
Gemini 2.0 Flash

Output Mode:
`responseMimeType: "application/json"` (guaranteed valid JSON)

Prompt must include all normalized features and request structured output.

Expected Output:

```json
{
  "stress_score": 0.72,
  "risk_level": "High",
  "attendance_prediction": 0.45,
  "failure_probability": 0.68,
  "suggestions": [
    "Consider reducing screen time before bed",
    "Try to maintain at least 7 hours of sleep"
  ],
  "explainability": "High stress is primarily driven by low sleep hours and elevated screen time combined with declining attendance."
}
```

---

## 9.3 Fallback Model

If Gemini API fails (timeout, error, invalid response):

Use deterministic weighted formula:

```
stress_score = (0.25 × sleep_norm) + (0.20 × mood_norm) + (0.15 × screenTime_norm) + (0.15 × marks_norm) + (0.10 × attendance_norm) + (0.10 × feedback_norm) + (0.05 × studyHours_norm)

failure_probability = (0.30 × marks_norm) + (0.25 × attendance_norm) + (0.20 × stress_score) + (0.15 × feedback_norm) + (0.10 × mood_norm)

attendance_prediction = current_attendance × (1 - (0.3 × stress_score))
```

Risk level thresholds:
- Low: stress_score < 0.4
- Moderate: 0.4 ≤ stress_score < 0.7
- High: stress_score ≥ 0.7

Fallback suggestions: predefined templates based on top contributing factors.

---

## 9.4 Prediction Triggers

Trigger Cloud Function when:

- New daily log added
- Academic data updated
- Faculty feedback submitted

Steps:
1. Fetch latest student data
2. Normalize features (with clamping)
3. Build prompt with context
4. Call Gemini API (JSON mode)
5. Validate response schema
6. If valid → store prediction
7. If invalid → use fallback model
8. Update metrics document
9. Trigger alert if thresholds exceeded

---

# 10. Alert Engine

## Trigger Conditions

stress_score > 0.75
OR
failure_probability > 0.65

## Alert Priority

- **Warning**: stress_score > 0.75 OR failure_probability > 0.65
- **Critical**: stress_score > 0.85 AND failure_probability > 0.75

## Actions

- metrics.alertStatus = true
- Create alert document
- Set priority level

## Alert Schema

```
alerts/
  alertId/
    studentId
    studentName
    department
    stressScore
    failureProbability
    priority ("warning" | "critical")
    resolved (boolean)
    resolvedBy (teacherId | null)
    resolvedAt (timestamp | null)
    teacherNotes (string | null)
    createdAt
```

---

# 11. Database Architecture

## users/

```
users/
  userId/
    name: string
    email: string
    role: "student" | "teacher"
    onboardingCompleted: boolean
    createdAt: timestamp
    updatedAt: timestamp
```

---

## students/

```
students/
  studentId/
    profile/
      name: string
      rollNumber: string
      department: string
      section: string
      year: number
      semester: number
      email: string

    academic/
      ciaMarks: number (0–100)
      maxMarks: number
      attendance: number (0–1)
      facultyFeedback: number (1–5)
      lastUpdatedBy: teacherId
      lastUpdatedAt: timestamp

    dailyLogs/
      logId/
        sleepHours: number
        screenTime: number
        mood: number (1–5)
        studyHours: number
        socialInteraction: number (1–5)
        submittedAt: timestamp

    predictions/
      predictionId/
        stressScore: number (0–1)
        riskLevel: "Low" | "Moderate" | "High"
        attendancePrediction: number (0–1)
        failureProbability: number (0–1)
        suggestions: string[]
        explainability: string
        modelUsed: "gemini" | "fallback"
        createdAt: timestamp

    metrics/
      currentStressScore: number
      currentRiskLevel: string
      currentFailureProbability: number
      alertStatus: boolean
      lastPredictionAt: timestamp
      totalLogs: number

    interventions/
      interventionId/
        teacherId: string
        teacherName: string
        note: string
        createdAt: timestamp
```

---

## teachers/

```
teachers/
  teacherId/
    name: string
    department: string
    institution: string
    subjects: string[]
```

---

## approvedTeachers/

```
approvedTeachers/
  docId/
    email: string
```

---

## alerts/

(See Alert Schema in Section 10)

---

# 12. Security Requirements

Firestore Rules:

Students:
- Read/write own dailyLogs (max 1 per day)
- Read own predictions
- Read own profile
- Read own interventions
- Cannot modify academic section

Teachers:
- Read all students in their department
- Write academic section
- Write interventions
- Read/resolve alerts

All AI calls must:
- Run inside Cloud Functions
- Use secure environment variables
- Never expose API keys

Rate Limiting:
- Students: max 1 daily log per 24 hours
- Teachers: max 100 feedback updates per hour
- AI: max 5 prediction requests per student per day

Data Retention:
- Daily logs: retained for current academic year
- Predictions: retained for current academic year
- Alerts: retained for 1 year after resolution
- Users may request data deletion via settings

---

# 13. Technical Architecture

Frontend:
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Recharts or Chart.js

Backend:
- Firebase Authentication
- Firestore
- Firebase Cloud Functions
- Firebase Hosting

AI Layer:
- Google Gemini 2.0 Flash (via Vertex AI)
- Server-side only (Cloud Functions)
- Deterministic fallback model

Architecture Type:
Fully serverless

---

# 14. Non-Functional Requirements

Scalability:
- Minimum 1000 students supported

Performance:
- AI prediction under 3 seconds
- Landing page under 2 seconds
- Dashboard load under 3 seconds

Security:
- OAuth only
- Role-based Firestore rules
- HTTPS enforced
- API keys in environment variables only

Reliability:
- Deterministic fallback if AI fails
- Error logging in Cloud Functions
- Graceful error handling on frontend

Accessibility:
- WCAG AA compliance
- Keyboard navigation
- Screen reader friendly

Theming:
- Dark and light mode support
- System preference detection

---

# 15. Development Phases

Phase 1:
Landing Page (with FAQ, responsive, dark/light theme)

Phase 2:
Role-based Authentication (with cross-role conflict handling)

Phase 3:
Onboarding (student + teacher, complete fields)

Phase 4:
Student Dashboard (daily logs, trends, settings)

Phase 5:
Teacher Dashboard (student list, filters, analytics, notes, export)

Phase 6:
AI Integration (Gemini 2.0 Flash + fallback model)

Phase 7:
Alert System (priority levels, acknowledgment, resolution)

Phase 8:
Security Hardening (Firestore rules, rate limiting, data retention)

Phase 9:
Testing & Deployment

---

# 16. Future Enhancements

- Parent dashboard
- Time-series ML model
- Email/SMS alerts
- Institutional analytics
- Fine-tuned custom model
- PWA / offline daily log support
- Bulk student import for teachers

---

END OF DOCUMENT