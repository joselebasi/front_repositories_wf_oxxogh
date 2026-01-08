import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TableValidate() {
    const [members, setMembers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [typeFilter, setTypeFilter] = useState('All');
    const [teamFilter, setTeamFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchMembers = async () => {
            const { data, error } = await actions.bo_members_activity_fk_data.getAllMemberActivity();
            if (error) {
                console.error(error);
                return;
            }
            if (data) {
                console.log(data);
                setMembers(data);
            }
        };
        fetchMembers();
    }, []);

    // List of unique member types for filter
    const memberTypes = ['All', ...new Set(members.map(m => m.member_type).filter(Boolean))];
    // List of unique teams for filter
    const hasSinTeams = members.some(m => !m.bo_member_team || m.bo_member_team.length === 0);
    let allTeamsSorted = Array.from(new Set(members.flatMap(m => (m.bo_member_team || []).map(t => t.team)))).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    if (hasSinTeams) allTeamsSorted = ['SIN TEAMS', ...allTeamsSorted];
    const allTeams = ['All', ...allTeamsSorted];

    // Filter members by type, team AND search term
    const filteredMembers = members.filter(member => {
        const matchesType = typeFilter === 'All' || member.member_type === typeFilter;
        let matchesTeam = true;
        if (teamFilter !== 'All') {
            if (teamFilter === 'SIN TEAMS') {
                matchesTeam = !member.bo_member_team || member.bo_member_team.length === 0;
            } else {
                matchesTeam = member.bo_member_team && member.bo_member_team.some(t => t.team === teamFilter);
            }
        }
        const matchesSearch =
            member.member_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesTeam && matchesSearch;
    });

    // Sort members by inactive days
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.inactive_days - a.inactive_days;
        }
        return a.inactive_days - b.inactive_days;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = sortedMembers.slice(startIndex, endIndex);

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Color palette for team badges - all variations of #ffc627
    const teamColors = [
        { background: 'linear-gradient(to right, #ffc627, #ffb627)' },
        { background: 'linear-gradient(to right, #ffd627, #ffc627)' },
        { background: 'linear-gradient(to right, #ffb627, #ffa627)' },
        { background: 'linear-gradient(to right, #ffe627, #ffd627)' },
        { background: 'linear-gradient(to right, #ffc627, #ffaa27)' },
        { background: 'linear-gradient(to right, #ffd027, #ffc027)' },
        { background: 'linear-gradient(to right, #ffbe27, #ffae27)' },
        { background: 'linear-gradient(to right, #ffe027, #ffc627)' },
    ];

    const getTeamColor = (teamName) => {
        const hash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return teamColors[hash % teamColors.length];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const downloadCSV = () => {
        const headers = ['Member Username', 'Email', 'Member Type', 'Last Contribution', 'Inactive Days', 'Team'];
        const csvContent = [
            headers.join(','),
            ...sortedMembers.map(member => {
                const teams = member.bo_member_team && member.bo_member_team.length > 0
                    ? member.bo_member_team.map(t => t.team).join('; ')
                    : 'Sin Teams';
                return [
                    member.member_username,
                    member.email || 'N/A',
                    member.member_type || 'N/A',
                    member.last_contribution_date ? new Date(member.last_contribution_date).toISOString().split('T')[0] : 'N/A',
                    member.inactive_days,
                    `"${teams}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'members_activity.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // ---- DATA PARA PIE CHART ----
    const ownerCount = filteredMembers.filter(m => m.member_type === 'Owner').length;
    const memberCount = filteredMembers.filter(m => m.member_type === 'Member').length;

    const pieData = [
        { name: 'Owner', value: ownerCount },
        { name: 'Member', value: memberCount },
    ];

    const COLORS = ['#ffc627', '#b78c1e'];

    return (
        <div className="w-full space-y-4">
            {/* Header / Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#303030] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar miembro o email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-[#404040] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <label htmlFor="typeFilter" className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Tipo:
                        </label>
                        <select
                            id="typeFilter"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white dark:bg-[#404040] text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500 block p-2 transition-colors duration-200 outline-none w-full md:w-36"
                        >
                            {memberTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <label htmlFor="teamFilter" className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
                            Team:
                        </label>
                        <select
                            id="teamFilter"
                            value={teamFilter}
                            onChange={(e) => {
                                setTeamFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white dark:bg-[#404040] text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500 block p-2 transition-colors duration-200 outline-none w-full md:w-36"
                        >
                            {allTeams.map(team => (
                                <option key={team} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-black transition-all duration-200 rounded-lg shadow-md hover:shadow-lg bg-[#ffc627] hover:bg-[#e6b223] border border-gray-200 dark:border-gray-700 w-full md:w-auto justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full border-collapse bg-white dark:bg-[#303030]">
                    <thead>
                        <tr className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-gray-900" style={{ background: 'linear-gradient(to right, #ffc627, #ffb627, #ffc627)' }}>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Member Username
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Member Type
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Last Contribution
                            </th>
                            <th
                                className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-black/10 transition-colors duration-200 select-none"
                                onClick={toggleSortOrder}
                            >
                                <div className="flex items-center gap-2">
                                    Inactive Days
                                    <span className="text-lg">
                                        {sortOrder === 'desc' ? '↓' : '↑'}
                                    </span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Teams
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentMembers.map((member, index) => (
                            <tr
                                key={member.id}
                                className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                            >
                                <td className="px-6 py-4 text-sm font-medium">
                                    <a
                                        href={member.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200 font-semibold"
                                    >
                                        {member.member_username}
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {member.email || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {member.member_type || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {formatDate(member.last_contribution_date)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${member.inactive_days > 30
                                        ? 'bg-[#B91C1C] text-white'
                                        : member.inactive_days > 14
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                        {member.inactive_days} days
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {member.bo_member_team && member.bo_member_team.length > 0 ? (
                                            member.bo_member_team.map((t, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-4 py-2 rounded-lg text-gray-900 font-bold text-xs uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                                    style={getTeamColor(t.team)}
                                                >
                                                    {t.team}
                                                </span>
                                            ))
                                        ) : (
                                            <span
                                                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wide shadow-lg"
                                                style={{ background: '#B91C1C' }}
                                            >
                                                Sin Teams
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#303030] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando <span className="font-semibold text-amber-600 dark:text-amber-400">{startIndex + 1}</span> de{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, sortedMembers.length)}</span> de{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{sortedMembers.length}</span> miembros
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        First
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = idx + 1;
                            } else if (currentPage <= 3) {
                                pageNum = idx + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + idx;
                            } else {
                                pageNum = currentPage - 2 + idx;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${currentPage === pageNum
                                        ? 'text-gray-900 shadow-lg font-bold'
                                        : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    style={currentPage === pageNum ? { background: 'linear-gradient(to right, #ffc627, #ffb627)' } : {}}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Last
                    </button>
                </div>
            </div>
            {/* ------------------------- */}
{/*        PIE CHART          */}
{/* ------------------------- */}
<div className="p-6 bg-white dark:bg-[#303030] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mt-6">
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        Distribución Member vs Owner
    </h2>

    <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                >
                    {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
</div>

        </div>
        
    );
}