export default function StudentAcademicPage() {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Academic Profile</h1>
                <p className="text-text-secondary">Your current academic standing as recorded by the institution. (Read-only)</p>
            </div>

            <div className="w-full bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center py-32">
                <p className="text-text-muted">Academic metrics overview will be implemented here.</p>
            </div>
        </div>
    );
}
