export default function StudentTrendsPage() {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Wellness Trends</h1>
                <p className="text-text-secondary">Historical visualization of your stress levels, mood, and sleep patterns.</p>
            </div>

            <div className="h-96 w-full bg-bg-secondary border border-border-primary rounded-xl flex items-center justify-center">
                <p className="text-text-muted">Trend charts will be implemented here.</p>
            </div>
        </div>
    );
}
