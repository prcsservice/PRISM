/**
 * PRISM — Add Approved Teacher Emails
 * 
 * Usage:
 *   node scripts/add-teacher.js teacher@example.com
 *   node scripts/add-teacher.js teacher1@example.com teacher2@example.com
 *   node scripts/add-teacher.js --list               (shows all approved emails)
 * 
 * This adds emails to the `approvedTeachers` Firestore collection.
 * Only users with emails in this collection can sign in as teachers.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize with default credentials (uses GOOGLE_APPLICATION_CREDENTIALS or ADC)
initializeApp({ projectId: "prism-1" });
const db = getFirestore();

async function addTeacher(email) {
    const normalized = email.toLowerCase().trim();
    
    // Check if already exists
    const existing = await db.collection("approvedTeachers")
        .where("email", "==", normalized)
        .limit(1)
        .get();
    
    if (!existing.empty) {
        console.log(`  ⚠️  ${normalized} — already approved`);
        return;
    }
    
    await db.collection("approvedTeachers").add({
        email: normalized,
        addedAt: new Date(),
    });
    console.log(`  ✅  ${normalized} — added successfully`);
}

async function listTeachers() {
    const snap = await db.collection("approvedTeachers").get();
    if (snap.empty) {
        console.log("\n  No approved teachers found.\n");
        return;
    }
    console.log(`\n  Approved Teachers (${snap.size}):`);
    console.log("  " + "─".repeat(40));
    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  • ${data.email}`);
    });
    console.log();
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("\nUsage:");
        console.log("  node scripts/add-teacher.js teacher@example.com");
        console.log("  node scripts/add-teacher.js --list\n");
        process.exit(0);
    }
    
    if (args[0] === "--list") {
        await listTeachers();
        process.exit(0);
    }
    
    console.log("\nAdding approved teacher(s)...\n");
    for (const email of args) {
        await addTeacher(email);
    }
    console.log("\nDone! These teachers can now sign in with Google OAuth.\n");
    process.exit(0);
}

main().catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
});
