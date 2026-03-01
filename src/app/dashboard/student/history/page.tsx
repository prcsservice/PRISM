export default function StudentHistoryPage() {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">History Log</h1>
                <p className="text-text-secondary">List of all your previously submitted daily wellness logs.</p>
            </div>

            <div className="w-full bg-bg-secondary border border-border-primary rounded-xl overflow-hidden mt-4">
                <table className="w-full text-left text-sm text-text-secondary">
                    <thead className="text-xs uppercase bg-bg-hover text-text-muted">
                        <tr>
                            <th scope="col" className="px-6 py-4">Date</th>
                            <th scope="col" className="px-6 py-4">Sleep (hrs)</th>
                            <th scope="col" className="px-6 py-4">Screen Time (hrs)</th>
                            <th scope="col" className="px-6 py-4">Mood</th>
                            <th scope="col" className="px-6 py-4">Study (hrs)</th>
                            <th scope="col" className="px-6 py-4">Social</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-border-primary hover:bg-bg-hover transition-colors">
                            <td colSpan={6} className="px-6 py-12 text-center text-text-muted">Data table will be implemented here.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
