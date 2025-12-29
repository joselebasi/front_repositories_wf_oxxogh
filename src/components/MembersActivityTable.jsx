import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

export default function MembersActivityTable() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination and Sorting states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [sortConfig, setSortConfig] = useState({ key: 'inactive_days', direction: 'desc' });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Parallel fetch for members and teams
                const [membersResponse, teamsResponse] = await Promise.all([
                    actions.bo_members_activity_fk_data.getAllMemberActivity(),
                    actions.bo_members_team_data.getAllMemberTeams()
                ]);

                const membersData = membersResponse.data;
                console.log('membersData', membersData);
                const membersError = membersResponse.error;
                const teamsData = teamsResponse.data;
                // We don't block on teams error, just log it
                if (teamsResponse.error) {
                    console.error('Error fetching teams:', teamsResponse.error);
                }

                if (membersError) {
                    throw new Error(membersError.message);
                }

                if (membersData) {
                    // Map teams by member_id for O(1) lookup
                    const teamsByMemberId = (teamsData || []).reduce((acc, team) => {
                        if (!acc[team.member_id]) {
                            acc[team.member_id] = [];
                        }
                        acc[team.member_id].push(team);
                        return acc;
                    }, {});

                    // Merge teams into members
                    const membersWithTeams = membersData.map(member => ({
                        ...member,
                        teams: teamsByMemberId[member.member_id] || []
                    }));

                    setMembers(membersWithTeams);
                }
            } catch (err) {
                console.error('Error fetching members:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedMembers = [...members].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(members.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:text-red-100">
                Error loading data: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('member_username')}>
                                Member {sortConfig.key === 'member_username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('email')}>
                                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('inactive_days')}>
                                Inactive Days {sortConfig.key === 'inactive_days' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('last_contribution_date')}>
                                Last Contribution {sortConfig.key === 'last_contribution_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col" className="px-6 py-3">Teams</th>
                            <th scope="col" className="px-6 py-3">URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((member) => (
                            <tr key={member.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {member.member_username}
                                </td>
                                <td className="px-6 py-4">
                                    {member.email}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${member.inactive_days > 30
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : member.inactive_days > 7
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                        {member.inactive_days} days
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(member.last_contribution_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {member.teams && member.teams.length > 0 ? (
                                            member.teams.map((team) => (
                                                <span
                                                    key={team.id}
                                                    className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {team.team}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No team</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <a href={member.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">
                                        View Profile
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, members.length)}</span> of <span className="font-medium">{members.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Logic to show limited page numbers: current, first, last, and immediate neighbors
                                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis
                                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                    return (
                                        <div key={page} className="flex">
                                            {showEllipsis && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">...</span>}
                                            <button
                                                onClick={() => paginate(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${currentPage === page
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-500 dark:text-white'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}

                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}