import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

export default function RepositoryOpenPullRequest() {
    const [repositories, setRepositories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [sortColumn, setSortColumn] = useState('created_at'); // 'created_at' or 'name_repository'
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdate, setLastUpdate] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRepositories = async () => {
            const { data, error } = await actions.bo_open_pull_requests_data.getAllBoOpenPullRequestsData();
            if (error) {
                console.error(error);
                return;
            }
            if (data) {
                setRepositories(data);
            }
        };

        const fetchLastUpdate = async () => {
            const { data, error } = await actions.bo_table_last_update_data.getTableLastUpdateByTableName({ table_name: 'bo_open_pull_requests' });
            if (error) {
                console.error(error);
                return;
            }
            if (data) {
                setLastUpdate(data[0]?.last_update || null);
            }
        };
        fetchRepositories();
        fetchLastUpdate();
    }, []);

    // List of reviewers for filter if needed, currently not used for filtering
    // const reviewersList = ['All', ...new Set(repositories.map(r => r.reviewers).filter(Boolean))];

    // Filter pull requests by title, source_branch or author
    const filteredPullRequests = repositories.filter(pr => {
        const matchesSearch =
            pr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.source_branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.name_repository?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Sort pull requests
    const sortedPullRequests = [...filteredPullRequests].sort((a, b) => {
        let valA, valB;

        if (sortColumn === 'created_at') {
            valA = new Date(a.created_at || 0);
            valB = new Date(b.created_at || 0);
        } else {
            valA = (a[sortColumn] || '').toLowerCase();
            valB = (b[sortColumn] || '').toLowerCase();
        }

        if (sortOrder === 'desc') {
            return valA < valB ? 1 : -1;
        }
        return valA > valB ? 1 : -1;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedPullRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPullRequests = sortedPullRequests.slice(startIndex, endIndex);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
        const headers = ['Repositorio', 'Pull Request', 'Rama Origen', 'Rama Destino', 'Autor', 'Fecha Creación', 'Revisores'];
        const csvContent = [
            headers.join(','),
            ...sortedPullRequests.map(pr => {
                return [
                    pr.name_repository || 'N/A',
                    `"${pr.title}"`,
                    pr.source_branch,
                    pr.target_branch,
                    pr.author,
                    pr.created_at ? new Date(pr.created_at).toISOString().split('T')[0] : 'N/A',
                    `"${pr.reviewers || 'N/A'}"`
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
                            placeholder="Buscar PR, rama o autor..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-[#404040] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200"
                        />
                    </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                    Última actualización: {lastUpdate ? formatDate(lastUpdate) : 'Cargando...'}
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
                            <th
                                className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-black/10 transition-colors duration-200 select-none"
                                onClick={() => handleSort('name_repository')}
                            >
                                <div className="flex items-center gap-2">
                                    Repositorio
                                    <span className="text-lg">
                                        {sortColumn === 'name_repository' ? (sortOrder === 'desc' ? '↓' : '↑') : '↕'}
                                    </span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-[30%]">
                                Titulo
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Rama (Origen → Destino)
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                                Autor
                            </th>
                            <th
                                className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-black/10 transition-colors duration-200 select-none"
                                onClick={() => handleSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Fecha Creación
                                    <span className="text-lg">
                                        {sortColumn === 'created_at' ? (sortOrder === 'desc' ? '↓' : '↑') : '↕'}
                                    </span>
                                </div>
                            </th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentPullRequests.map((pr) => (
                            <tr
                                key={pr.id}
                                className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                            >
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                    {pr.name_repository}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold whitespace-normal break-words w-[20%]">
                                    <a
                                        href={pr.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200"
                                    >
                                        {pr.title}
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 font-mono text-xs">
                                            {pr.source_branch}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                        <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-xs">
                                            {pr.target_branch}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="font-semibold text-gray-900 dark:text-white">{pr.author}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {formatDate(pr.created_at)}
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
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, sortedPullRequests.length)}</span> de{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{sortedPullRequests.length}</span> Pull Requests
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