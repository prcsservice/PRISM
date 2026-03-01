export default function StudentSettingsPage() {
    return (
        <div className="flex flex-col gap-8 pb-10 max-w-2xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
                <p className="text-text-secondary">Manage your profile and privacy preferences.</p>
            </div>

            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-6">
                <p className="text-text-muted">Settings form will be implemented here.</p>
            </div>

            <div className="bg-[#1A0A0A] border border-red-900/50 rounded-xl p-6 md:p-8 space-y-4">
                <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Requesting data deletion will remove your profile and all daily logs from PRISM. Predictive models will no longer include your data.
                </p>
                <button className="px-4 py-2 border border-red-500/50 text-red-500 rounded flex items-center gap-2 hover:bg-red-500/10 transition-colors text-sm font-medium">
                    Request Data Deletion
                </button>
            </div>
        </div>
    );
}
