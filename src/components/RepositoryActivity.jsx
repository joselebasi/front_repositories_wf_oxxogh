import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RepositoryActivity() {
    const [repositories, setRepositories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRepositories = async () => {
            const { data, error } = await actions.bo_repositories_activity_data.getAllBoRepositoriesActivityData();
            if (error) {
                console.error(error);
                return;
            }
            if (data) {
                setRepositories(data);
            }
        };
        fetchRepositories();
    }, []);

    // List of unique repository types for filter
    const repoTypes = ['All', ...new Set(repositories.map(r => r.id_type_repository?.name).filter(Boolean))];

    // Filter repositories by type AND search term (name or branch)
    const filteredRepositories = repositories.filter(repo => {
        const matchesType = typeFilter === 'All' || repo.id_type_repository?.name === typeFilter;

        const matchesSearch =
            repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repo.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repo.member_name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    // Sort repositories by last commit date
    const sortedRepositories = [...filteredRepositories].sort((a, b) => {
        const dateA = new Date(a.last_commit_date || 0);
        const dateB = new Date(b.last_commit_date || 0);
        if (sortOrder === 'desc') {
            return dateB - dateA;
        }
        return dateA - dateB;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedRepositories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRepositories = sortedRepositories.slice(startIndex, endIndex);

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Color palette for type badges
    const getBadgeStyle = (typeName) => {
        const styles = {
            'DATABASE': { background: '#ffc627', color: 'black' },
            'SHELL': { background: '#8b5cf6', color: 'white' },
            'APPLICATION': { background: '#3b82f6', color: 'white' }
        };
        return styles[typeName] || { background: '#6b7280', color: 'white' };
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
        const headers = ['Repositorio', 'Rama', 'Miembro', 'Email', 'Último Commit', 'Tipo'];
        const csvContent = [
            headers.join(','),
            ...sortedRepositories.map(repo => {
                return [
                    repo.name,
                    repo.branch,
                    repo.member_name,
                    repo.email || 'N/A',
                    repo.last_commit_date ? new Date(repo.last_commit_date).toISOString().split('T')[0] : 'N/A',
                    `"${repo.id_type_repository?.name || 'N/A'}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'repository_activity.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // ---- DATA PARA PIE CHART (Distribution by Type) ----
    const typeDistribution = repositories.reduce((acc, repo) => {
        const typeName = repo.id_type_repository?.name || 'N/A';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(typeDistribution).map(name => ({
        name,
        value: typeDistribution[name]
    }));

    const COLORS = ['#ffc627', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

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
                            placeholder="Buscar repo, rama o miembro..."
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
                            {repoTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
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
                                Repositorio
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Rama
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Miembro
                            </th>
                            <th
                                className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-black/10 transition-colors duration-200 select-none"
                                onClick={toggleSortOrder}
                            >
                                <div className="flex items-center gap-2">
                                    Último Commit
                                    <span className="text-lg">
                                        {sortOrder === 'desc' ? '↓' : '↑'}
                                    </span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Tipo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentRepositories.map((repo) => (
                            <tr
                                key={repo.id}
                                className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                            >
                                <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200"
                                    >
                                        {repo.name}
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 font-mono text-xs">
                                        {repo.branch}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 dark:text-white">{repo.member_name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{repo.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {formatDate(repo.last_commit_date)}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
                                        style={getBadgeStyle(repo.id_type_repository?.name)}
                                    >
                                        {repo.id_type_repository?.name || 'N/A'}
                                    </span>
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
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, sortedRepositories.length)}</span> de{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{sortedRepositories.length}</span> repositorios
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Primero
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Anterior
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
                        Siguiente
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Último
                    </button>
                </div>
            </div>
        </div>
    );
}