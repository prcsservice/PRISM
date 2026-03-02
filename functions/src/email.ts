import * as nodemailer from "nodemailer";
import { logger } from "firebase-functions";

// ===== Lazy-initialized Nodemailer Transport =====
// Transport is created on first use, not at module load, to avoid Firebase cold-start timeouts.

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (!_transporter) {
        _transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    return _transporter;
}

// ===== Send Email Helper =====

async function sendEmail(params: {
    to: string;
    subject: string;
    html: string;
}): Promise<void> {
    try {
        const fromName = process.env.SMTP_FROM_NAME || "PRISM";
        const fromEmail = process.env.SMTP_EMAIL || "noreply@prism.app";

        await getTransporter().sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: params.to,
            subject: params.subject,
            html: params.html,
        });
        logger.info(`✉️ Email sent: "${params.subject}" → ${params.to}`);
    } catch (error) {
        logger.error(`❌ Email failed: "${params.subject}" → ${params.to}`, error);
    }
}

// ===== Base HTML Template =====

function generateEmailHTML(params: {
    recipientName: string;
    subject: string;
    preheader: string;
    bodyTitle: string;
    bodyContent: string;
    ctaText?: string;
    ctaUrl?: string;
    footerNote?: string;
}): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${params.subject}</title>
    <!--[if mso]><style>table,td,div,p{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${params.preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;">
        <tr><td align="center" style="padding:40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
                <!-- Logo -->
                <tr><td align="center" style="padding:0 0 32px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr><td style="padding:8px 16px;border:1px solid rgba(163,230,53,0.2);border-radius:8px;background:rgba(163,230,53,0.05);">
                            <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">PR<span style="color:#A3E635;">IS</span>M</span>
                        </td></tr>
                    </table>
                </td></tr>
                <!-- Main Card -->
                <tr><td style="background-color:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
                    <div style="height:3px;background:linear-gradient(90deg,#A3E635,#65A30D);"></div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td style="padding:40px 36px;">
                            <p style="margin:0 0 8px;font-size:14px;color:#a3a3a3;">Hi ${params.recipientName},</p>
                            <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${params.bodyTitle}</h1>
                            <div style="margin:0 0 32px;font-size:15px;color:#d4d4d4;line-height:1.7;">${params.bodyContent}</div>
                            ${params.ctaText ? `
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                                <tr><td style="background-color:#A3E635;border-radius:8px;padding:14px 32px;">
                                    <a href="${params.ctaUrl || '#'}" target="_blank" style="color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.3px;">${params.ctaText}</a>
                                </td></tr>
                            </table>` : ''}
                        </td></tr>
                    </table>
                </td></tr>
                <!-- Footer -->
                <tr><td style="padding:24px 0 0;text-align:center;">
                    ${params.footerNote ? `<p style="margin:0 0 12px;font-size:12px;color:#525252;line-height:1.5;">${params.footerNote}</p>` : ''}
                    <p style="margin:0;font-size:11px;color:#404040;">&copy; ${new Date().getFullYear()} PRISM &mdash; Predictive Risk Intelligence for Student Monitoring</p>
                    <p style="margin:8px 0 0;font-size:11px;color:#404040;">This is an automated notification. Please do not reply.</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;
}

// ===== Public Email Functions =====

/**
 * Send alert email to a teacher when a high-risk student is detected.
 */
export async function sendAlertEmail(data: {
    teacherEmail: string;
    teacherName: string;
    studentName: string;
    riskLevel: string;
    reason: string;
    suggestedActions: string[];
    appUrl: string;
}): Promise<void> {
    const riskColor = data.riskLevel === "High" ? "#ef4444" : "#f97316";
    const actionsHtml = data.suggestedActions.length > 0
        ? `<div style="margin:16px 0;padding:16px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;">
            <p style="margin:0 0 8px;font-size:12px;color:#A3E635;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🤖 AI Suggested Actions</p>
            ${data.suggestedActions.map(a => `<p style="margin:4px 0;font-size:13px;color:#d4d4d4;padding-left:12px;border-left:2px solid #A3E635;">• ${a}</p>`).join('')}
           </div>`
        : '';

    const html = generateEmailHTML({
        recipientName: data.teacherName,
        subject: `⚠️ ${data.riskLevel} Risk Alert: ${data.studentName}`,
        preheader: `${data.studentName} has been flagged as ${data.riskLevel} risk.`,
        bodyTitle: `⚠️ ${data.riskLevel} Risk Alert`,
        bodyContent: `
            <div style="margin:0 0 16px;padding:12px 16px;background:rgba(239,68,68,0.08);border-left:3px solid ${riskColor};border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:16px;font-weight:600;color:${riskColor};">${data.studentName}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#a3a3a3;">Risk Level: <strong style="color:${riskColor};">${data.riskLevel}</strong></p>
            </div>
            <p style="margin:0 0 8px;font-size:14px;color:#d4d4d4;"><strong style="color:#ffffff;">Reason:</strong> ${data.reason}</p>
            ${actionsHtml}
        `,
        ctaText: "View Student Profile",
        ctaUrl: data.appUrl,
        footerNote: "You're receiving this as a mentor in the student's department.",
    });

    await sendEmail({
        to: data.teacherEmail,
        subject: `⚠️ ${data.riskLevel} Risk Alert: ${data.studentName}`,
        html,
    });
}

/**
 * Send email to student when their mentor takes an action.
 */
export async function sendMentorActionEmail(data: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    actionType: string;
    notes: string;
    appUrl: string;
}): Promise<void> {
    const html = generateEmailHTML({
        recipientName: data.studentName,
        subject: `Your mentor ${data.teacherName} took action`,
        preheader: `${data.teacherName} recorded "${data.actionType}" for you.`,
        bodyTitle: "🎯 Mentor Action Update",
        bodyContent: `
            <div style="margin:0 0 16px;padding:16px;background:rgba(163,230,53,0.05);border:1px solid rgba(163,230,53,0.2);border-radius:8px;">
                <p style="margin:0 0 4px;font-size:12px;color:#A3E635;font-weight:600;text-transform:uppercase;">Action Taken</p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${data.actionType}</p>
                <p style="margin:8px 0 0;font-size:13px;color:#d4d4d4;">By: ${data.teacherName}</p>
            </div>
            <p style="margin:0;font-size:14px;color:#d4d4d4;"><strong style="color:#ffffff;">Notes:</strong> ${data.notes}</p>
        `,
        ctaText: "View Dashboard",
        ctaUrl: data.appUrl,
        footerNote: "Your mentor is working to support your academic journey.",
    });

    await sendEmail({
        to: data.studentEmail,
        subject: `Your mentor ${data.teacherName} took action`,
        html,
    });
}

/**
 * Send stress trend alert email to a teacher.
 */
export async function sendStressTrendEmail(data: {
    teacherEmail: string;
    teacherName: string;
    studentName: string;
    stressLevel: number;
    appUrl: string;
}): Promise<void> {
    const html = generateEmailHTML({
        recipientName: data.teacherName,
        subject: `📈 Stress Trending Up: ${data.studentName}`,
        preheader: `${data.studentName}'s stress has been rising over 3+ assessments.`,
        bodyTitle: "📈 Stress Trend Alert",
        bodyContent: `
            <div style="margin:0 0 16px;padding:16px;background:rgba(249,115,22,0.08);border-left:3px solid #f97316;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:16px;font-weight:600;color:#f97316;">${data.studentName}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#a3a3a3;">Current Stress: <strong style="color:#f97316;">${data.stressLevel}%</strong></p>
            </div>
            <p style="margin:0;font-size:14px;color:#d4d4d4;">This student's stress level has been <strong style="color:#ffffff;">increasing over 3+ consecutive assessments</strong>. Consider reaching out for a wellness check.</p>
        `,
        ctaText: "View Student Profile",
        ctaUrl: data.appUrl,
        footerNote: "Early intervention can make a significant difference.",
    });

    await sendEmail({
        to: data.teacherEmail,
        subject: `📈 Stress Trending Up: ${data.studentName}`,
        html,
    });
}

/**
 * Send weekly report email to a student.
 */
export async function sendWeeklyReportEmail(data: {
    studentEmail: string;
    studentName: string;
    stressLevel: number;
    riskLevel: string;
    logsSubmitted: number;
    suggestions: string[];
    appUrl: string;
}): Promise<void> {
    const stressColor = data.stressLevel > 70 ? "#ef4444" : data.stressLevel > 40 ? "#f97316" : "#22c55e";
    const suggestionsHtml = data.suggestions.length > 0
        ? `<div style="margin:16px 0;padding:16px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;">
            <p style="margin:0 0 8px;font-size:12px;color:#A3E635;font-weight:600;text-transform:uppercase;">💡 This Week's Suggestions</p>
            ${data.suggestions.map(s => `<p style="margin:4px 0;font-size:13px;color:#d4d4d4;">• ${s}</p>`).join('')}
           </div>`
        : '';

    const html = generateEmailHTML({
        recipientName: data.studentName,
        subject: `Your PRISM Weekly Report — ${data.riskLevel} Risk`,
        preheader: `Your stress is at ${data.stressLevel}%. Here's your weekly summary.`,
        bodyTitle: "📊 Your Weekly Wellness Report",
        bodyContent: `
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                <tr>
                    <td style="padding:12px 16px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:${stressColor};">${data.stressLevel}%</p>
                        <p style="margin:4px 0 0;font-size:11px;color:#a3a3a3;text-transform:uppercase;">Stress Level</p>
                    </td>
                    <td style="width:8px;"></td>
                    <td style="padding:12px 16px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">${data.riskLevel}</p>
                        <p style="margin:4px 0 0;font-size:11px;color:#a3a3a3;text-transform:uppercase;">Risk Level</p>
                    </td>
                    <td style="width:8px;"></td>
                    <td style="padding:12px 16px;background:#1a1a1a;border:1px solid #262626;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:#A3E635;">${data.logsSubmitted}</p>
                        <p style="margin:4px 0 0;font-size:11px;color:#a3a3a3;text-transform:uppercase;">Logs This Week</p>
                    </td>
                </tr>
            </table>
            ${suggestionsHtml}
        `,
        ctaText: "View Full Dashboard",
        ctaUrl: data.appUrl,
        footerNote: "Stay consistent with your daily logs for accurate insights.",
    });

    await sendEmail({
        to: data.studentEmail,
        subject: `Your PRISM Weekly Report — ${data.riskLevel} Risk`,
        html,
    });
}
