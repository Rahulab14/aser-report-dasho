import React, { useState, useMemo } from 'react';
import reportData from './assets/aser_report.json';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Simple Icons
const icons = {
    Setting: (props) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    Monitor: (props) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
    ),
    Lightning: (props) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
    Check: (props) => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    Filter: (props) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
};

const COLORS = ['#FCD34D', '#F87171', '#60A5FA', '#34D399', '#A78BFA', '#FBCFE8'];

const glassStyle = "bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]";
const hoverGlassStyle = "transition-all duration-400 ease-out hover:bg-white/40 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-1";

export default function App() {
    // Unique options for filters
    const states = useMemo(() => ['All', ...new Set(reportData.map(d => d.State))], []);
    const years = useMemo(() => ['All', ...new Set(reportData.map(d => d.Year))], []);
    const grades = useMemo(() => ['All', ...new Set(reportData.map(d => d.Grade))], []);
    const types = useMemo(() => ['All', ...new Set(reportData.map(d => d.Type))], []);

    // Filter states
    const [selectedState, setSelectedState] = useState('All');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [selectedType, setSelectedType] = useState('Arithmetic');

    // Filtered data based on selections
    const filteredData = useMemo(() => {
        return reportData.filter(d => {
            return (selectedState === 'All' || d.State === selectedState) &&
                   (selectedYear === 'All' || d.Year === selectedYear) &&
                   (selectedGrade === 'All' || d.Grade === selectedGrade) &&
                   (selectedType === 'All' || d.Type === selectedType);
        });
    }, [selectedState, selectedYear, selectedGrade, selectedType]);

    // Data for Bar Chart: Average Value by Level
    const barChartData = useMemo(() => {
        const grouped = filteredData.reduce((acc, curr) => {
            if (!acc[curr.Level]) {
                acc[curr.Level] = { sum: 0, count: 0 };
            }
            acc[curr.Level].sum += parseFloat(curr.Value);
            acc[curr.Level].count += 1;
            return acc;
        }, {});

        return Object.keys(grouped).map(level => ({
            level: level.replace(/_/g, ' '),
            value: Number((grouped[level].sum / grouped[level].count).toFixed(2))
        })).sort((a, b) => b.value - a.value);
    }, [filteredData]);

    // Data for Line Chart: Trend over Years (Average Value by Year)
    const lineChartData = useMemo(() => {
        // Only makes sense if Year filter is 'All', otherwise show overall trend regardless of Year filter.
        // We will base this on State/Grade/Type filters ONLY, ignoring Year filter so we can see the trend.
        const trendData = reportData.filter(d => {
            return (selectedState === 'All' || d.State === selectedState) &&
                   (selectedGrade === 'All' || d.Grade === selectedGrade) &&
                   (selectedType === 'All' || d.Type === selectedType);
        });

        const grouped = trendData.reduce((acc, curr) => {
            if (!acc[curr.Year]) {
                acc[curr.Year] = { sum: 0, count: 0 };
            }
            acc[curr.Year].sum += parseFloat(curr.Value);
            acc[curr.Year].count += 1;
            return acc;
        }, {});

        return Object.keys(grouped).sort().map(year => ({
            year,
            average: Number((grouped[year].sum / grouped[year].count).toFixed(2))
        }));
    }, [selectedState, selectedGrade, selectedType]);

    // Data for Pie Chart: Average score by Type (if Type is 'All') or Grade
    const pieChartData = useMemo(() => {
        const groupKey = selectedType === 'All' ? 'Type' : 'Grade';
        const grouped = filteredData.reduce((acc, curr) => {
            if (!acc[curr[groupKey]]) {
                acc[curr[groupKey]] = { sum: 0, count: 0 };
            }
            acc[curr[groupKey]].sum += parseFloat(curr.Value);
            acc[curr[groupKey]].count += 1;
            return acc;
        }, {});

        return Object.keys(grouped).map(key => ({
            name: `${groupKey}: ${key}`,
            value: Number((grouped[key].sum / grouped[key].count).toFixed(2))
        }));
    }, [filteredData, selectedType]);


    // Metrics
    const avgScore = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const total = filteredData.reduce((sum, d) => sum + parseFloat(d.Value), 0);
        return (total / filteredData.length).toFixed(1);
    }, [filteredData]);

    const highestLevel = useMemo(() => {
        if (barChartData.length === 0) return 'N/A';
        return barChartData[0]?.level;
    }, [barChartData]);

    return (
        <div className="min-h-screen w-full font-sans text-[#1D1E20] overflow-hidden bg-[#FDFBF7] relative transition-opacity duration-700 opacity-100">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-[#FFF2CB]/80 to-[#FDFBF7]/10 blur-[120px]" />
                <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#F2F0E9]/60 to-transparent blur-[100px]" />
                <div className="absolute bottom-[0%] right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#FFF4D5]/60 to-transparent blur-[120px]" />
            </div>

            <style>{`
            @keyframes slideUpFade {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-stagger-1 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
            .animate-stagger-2 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
            .animate-stagger-3 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
            .animate-stagger-4 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
            ::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
            ::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 4px; }
            `}</style>

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-8 flex flex-col gap-8">
                
                {/* Top Navigation */}
                <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-stagger-1">
                    <div className={`px-6 py-2.5 rounded-full text-xl font-medium tracking-tight text-[#1D1E20] ${glassStyle} flex items-center gap-2`}>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FCD34D] to-[#F87171] shadow-inner" />
                        ASER Analytics
                    </div>

                    <div className={`hidden md:flex items-center p-1.5 rounded-full ${glassStyle} gap-1 justify-center`}>
                        {['Dashboard', 'Reports', 'States Data'].map((item, i) => (
                            <button
                                key={item}
                                className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${i === 0 ? 'bg-[#2A2B2F] text-white shadow-lg' : 'text-[#5A5B5F] hover:text-[#1D1E20] hover:bg-white/40'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button className={`flex items-center justify-center w-10 h-10 rounded-full ${glassStyle} hover:bg-white/50 transition-colors`}>
                            <icons.Setting className="w-5 h-5 text-[#5A5B5F]" />
                        </button>
                        <div className={`px-4 py-2 flex items-center gap-2 rounded-full ${glassStyle}`}>
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" alt="User" />
                            </div>
                            <span className="text-[13px] font-semibold">DEO </span>
                        </div>
                    </div>
                </nav>

                {/* Header & Metrics */}
                <section className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6 animate-stagger-2 mt-4">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-[#1D1E20] leading-[1.1]">
                            Education Progress <br/><span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">At A Glance</span>
                        </h1>
                        <p className="text-[14px] font-medium text-[#7A7B7F] mt-2 leading-relaxed">
                            Comprehensive visualization of Annual Status of Education Report (ASER) data. Analyze arithmetic and reading proficiency levels across various states, grades, and years to uncover hidden trends.
                        </p>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 xl:gap-6 w-full xl:w-auto">
                        <div className={`flex flex-col gap-1 p-5 rounded-[24px] ${glassStyle} ${hoverGlassStyle} min-w-[160px] flex-1 xl:flex-none`}>
                            <div className="flex items-center gap-2 text-[#7A7B7F] mb-1">
                                <icons.Monitor className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Score</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-[36px] font-light leading-none">{avgScore}</span>
                                <span className="text-[14px] font-medium text-green-500 mb-1">+2.4%</span>
                            </div>
                        </div>
                        <div className={`flex flex-col gap-1 p-5 rounded-[24px] ${glassStyle} ${hoverGlassStyle} min-w-[160px] flex-1 xl:flex-none`}>
                            <div className="flex items-center gap-2 text-[#7A7B7F] mb-1">
                                <icons.Lightning className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Top Proficiency</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-[28px] font-light leading-none capitalize">{highestLevel}</span>
                            </div>
                        </div>
                        <div className={`flex flex-col gap-1 p-5 rounded-[24px] ${glassStyle} ${hoverGlassStyle} min-w-[160px] flex-1 xl:flex-none`}>
                            <div className="flex items-center gap-2 text-[#7A7B7F] mb-1">
                                <icons.Check className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Data Points</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-[36px] font-light leading-none">{filteredData.length}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters Section */}
                <section className={`p-6 rounded-[28px] ${glassStyle} animate-stagger-3 mt-4`}>
                    <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/40 text-[#1D1E20] shadow-sm">
                            <icons.Filter className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">Interactive Filters</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-[#7A7B7F] tracking-wider ml-1">State</label>
                            <select 
                                value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-[14px] font-medium text-[#1D1E20] outline-none focus:border-[#FCD34D] transition-all cursor-pointer shadow-sm focus:ring-4 focus:ring-[#FCD34D]/20 appearance-none"
                            >
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-[#7A7B7F] tracking-wider ml-1">Year</label>
                            <select 
                                value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-[14px] font-medium text-[#1D1E20] outline-none focus:border-[#FCD34D] transition-all cursor-pointer shadow-sm focus:ring-4 focus:ring-[#FCD34D]/20 appearance-none"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-[#7A7B7F] tracking-wider ml-1">Grade</label>
                            <select 
                                value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-[14px] font-medium text-[#1D1E20] outline-none focus:border-[#FCD34D] transition-all cursor-pointer shadow-sm focus:ring-4 focus:ring-[#FCD34D]/20 appearance-none"
                            >
                                {grades.map(g => <option key={g} value={g}>{g === 'All' ? 'All Grades' : `Grade ${g}`}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-[#7A7B7F] tracking-wider ml-1">Subject Type</label>
                            <select 
                                value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-[14px] font-medium text-[#1D1E20] outline-none focus:border-[#FCD34D] transition-all cursor-pointer shadow-sm focus:ring-4 focus:ring-[#FCD34D]/20 appearance-none"
                            >
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_auto] gap-6 animate-stagger-4 pb-12">
                    
                    {/* Primary Bar Chart */}
                    <div className={`lg:col-span-2 rounded-[32px] p-7 flex flex-col relative ${glassStyle} shadow-xl border-white/50`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[20px] font-semibold text-[#1D1E20]">Average Score by Proficiency Level</h3>
                                <p className="text-[12px] font-medium text-[#7A7B7F] mt-1">Comparing different skill levels across selected filters</p>
                            </div>
                            <div className="px-3 py-1 bg-amber-100/50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200 backdrop-blur-sm">
                                Level Analysis
                            </div>
                        </div>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis 
                                        dataKey="level" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#7A7B7F', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#7A7B7F', fontSize: 12, fontWeight: 500 }}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(0,0,0,0.02)'}}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" name="Avg Score" radius={[6, 6, 0, 0]} barSize={40}>
                                        {barChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Trend Line / Area Chart */}
                    <div className={`rounded-[32px] p-7 flex flex-col relative ${glassStyle} shadow-xl border-white/50 h-[380px]`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[18px] font-semibold text-[#1D1E20]">Yearly Progression Trend</h3>
                                <p className="text-[12px] font-medium text-[#7A7B7F] mt-1">Average scores across years (Ignores 'Year' filter)</p>
                            </div>
                        </div>
                        <div className="w-full h-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#7A7B7F', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7B7F', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}
                                    />
                                    <Area type="monotone" dataKey="average" name="Yearly Avg" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Proportions Pie Chart */}
                    <div className={`rounded-[32px] p-7 flex flex-col relative ${glassStyle} shadow-xl border-white/50 h-[380px]`}>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-[18px] font-semibold text-[#1D1E20]">Composition Analysis</h3>
                                <p className="text-[12px] font-medium text-[#7A7B7F] mt-1">
                                    Distribution by {selectedType === 'All' ? 'Subject Type' : 'Grade'}
                                </p>
                            </div>
                        </div>
                        <div className="w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name.split(':')[1]} (${(percent * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}