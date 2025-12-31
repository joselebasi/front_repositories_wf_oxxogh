import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

export default function TableValidate() {
    const [members, setMembers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
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

    // Sort members by inactive days
    const sortedMembers = [...members].sort((a, b) => {
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
        const headers = ['Member Username', 'Email', 'Last Contribution', 'Inactive Days', 'Team'];
        const csvContent = [
            headers.join(','),
            ...members.map(member => {
                const teams = member.bo_member_team && member.bo_member_team.length > 0
                    ? member.bo_member_team.map(t => t.team).join('; ')
                    : 'Sin Team';
                return [
                    member.member_username,
                    member.email || 'N/A',
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

    return (
        <div className="w-full space-y-2">
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
                                    {formatDate(member.last_contribution_date)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${member.inactive_days > 30
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
                                                style={{ background: '#de2324' }}
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
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black transition-all duration-200 rounded-lg shadow-md hover:shadow-lg bg-[#ffc627] hover:bg-[#e6b223] border border-gray-200 dark:border-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        CSV
                    </button>
                    <div className="text-sm text-gray-600 dark:text-gray-300 border-l pl-4 border-gray-300 dark:border-gray-600">
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
        </div>
    );
}