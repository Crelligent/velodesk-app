'use client'

const retentionStats = [
    { label: 'Day 1 Retention', value: '78%', trend: '↑ 3% vs last month' },
    { label: 'Day 7 Retention', value: '52%', trend: '↑ 5% vs last month' },
    { label: 'Day 30 Retention', value: '34%', trend: '↑ 2% vs last month' },
    { label: 'Day 90 Retention', value: '21%', trend: '↑ 1% vs last month' },
]

const cohortData = [
    { cohort: 'Nov 2024', users: 1240, weeks: [88, 76, 68, 58, 52, 45] },
    { cohort: 'Oct 2024', users: 1180, weeks: [85, 72, 65, 54, 48, 42] },
    { cohort: 'Sep 2024', users: 1320, weeks: [82, 70, 62, 52, 45, 38] },
    { cohort: 'Aug 2024', users: 1150, weeks: [80, 68, 58, 48, 42, 35] },
    { cohort: 'Jul 2024', users: 1280, weeks: [78, 65, 55, 45, 38, 32] },
]

const churnBySegment = [
    { segment: 'Enterprise', churn: 1.2 },
    { segment: 'Mid-Market', churn: 2.1 },
    { segment: 'SMB', churn: 3.4 },
    { segment: 'Startup', churn: 4.8 },
    { segment: 'Freelance', churn: 6.2 },
]

const engagementDrivers = [
    { driver: 'Daily Login', impact: 92 },
    { driver: 'Feature Use', impact: 78 },
    { driver: 'Team Invite', impact: 65 },
    { driver: 'Integration', impact: 54 },
    { driver: 'Export', impact: 42 },
]

export default function RetentionPage() {
    return (
        <div>
            <div className="mb-16">
                <h1 className="font-outfit text-[2.5rem] font-extralight tracking-tight mb-2">
                    Retention Analysis
                </h1>
                <p className="text-[#606060] text-[0.95rem] font-light">
                    Track how well you&apos;re keeping customers engaged over time
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-8 mb-16">
                {retentionStats.map((stat) => (
                    <div key={stat.label} className="p-8 border border-[rgba(255,255,255,0.04)]">
                        <div className="text-[0.55rem] uppercase tracking-[0.2em] text-[#404040] mb-4">
                            {stat.label}
                        </div>
                        <div className="font-outfit text-[2.5rem] font-extralight">{stat.value}</div>
                        <div className="text-[0.75rem] text-[#606060] mt-2">{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* Retention Curve */}
            <div className="mb-16">
                <h3 className="font-outfit text-[1.25rem] font-extralight mb-8">Retention Curve</h3>
                <div className="border border-[rgba(255,255,255,0.04)] p-8">
                    <div className="h-[300px] flex items-end gap-4">
                        {['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30', 'Day 60', 'Day 90'].map((day, i) => {
                            const values = [78, 65, 52, 42, 34, 26, 21]
                            return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-white/20 rounded-t transition-all hover:bg-white/30"
                                        style={{ height: `${values[i] * 3}px` }}
                                    />
                                    <div className="text-[0.7rem] text-[#606060]">{day}</div>
                                    <div className="text-[0.8rem] font-light">{values[i]}%</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Cohort Table */}
            <div className="mb-16">
                <h3 className="font-outfit text-[1.25rem] font-extralight mb-8">Cohort Analysis</h3>
                <div className="border border-[rgba(255,255,255,0.04)] overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left text-[0.6rem] uppercase tracking-[0.1em] text-[#404040] font-normal border-b border-[rgba(255,255,255,0.04)]">Cohort</th>
                                <th className="p-4 text-center text-[0.6rem] uppercase tracking-[0.1em] text-[#404040] font-normal border-b border-[rgba(255,255,255,0.04)]">Users</th>
                                {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'].map(week => (
                                    <th key={week} className="p-4 text-center text-[0.6rem] uppercase tracking-[0.1em] text-[#404040] font-normal border-b border-[rgba(255,255,255,0.04)]">{week}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cohortData.map((row) => (
                                <tr key={row.cohort} className="border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                                    <td className="p-4 text-[0.8rem]">{row.cohort}</td>
                                    <td className="p-4 text-center font-outfit font-light">{row.users}</td>
                                    {row.weeks.map((val, i) => (
                                        <td
                                            key={i}
                                            className="p-4 text-center font-outfit font-light transition-all hover:scale-105"
                                            style={{ background: `rgba(255,255,255,${val / 300})` }}
                                        >
                                            {val}%
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two Column Charts */}
            <div className="grid grid-cols-2 gap-8">
                {/* Churn by Segment */}
                <div>
                    <h3 className="font-outfit text-[1.25rem] font-extralight mb-8">Churn by Segment</h3>
                    <div className="border border-[rgba(255,255,255,0.04)] p-8">
                        <div className="space-y-4">
                            {churnBySegment.map((item) => (
                                <div key={item.segment} className="flex items-center gap-4">
                                    <div className="w-24 text-[0.8rem] text-[#606060]">{item.segment}</div>
                                    <div className="flex-1 h-6 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden">
                                        <div
                                            className="h-full bg-white/20 rounded"
                                            style={{ width: `${item.churn * 15}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-right text-[0.8rem]">{item.churn}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Engagement Drivers */}
                <div>
                    <h3 className="font-outfit text-[1.25rem] font-extralight mb-8">Engagement Drivers</h3>
                    <div className="border border-[rgba(255,255,255,0.04)] p-8">
                        <div className="space-y-4">
                            {engagementDrivers.map((item) => (
                                <div key={item.driver} className="flex items-center gap-4">
                                    <div className="w-24 text-[0.8rem] text-[#606060]">{item.driver}</div>
                                    <div className="flex-1 h-6 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden">
                                        <div
                                            className="h-full bg-white/15 rounded"
                                            style={{ width: `${item.impact}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-right text-[0.8rem]">{item.impact}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
