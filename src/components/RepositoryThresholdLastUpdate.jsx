import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

export default function RepositoryThresholdLastUpdate() {
    const [repositories, setRepositories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRepositories = async () => {
            const { data, error } = await actions.bo_repository_threshold_activity_data.getAllBoRepositoriesThresholdActivityData();
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

    // Filter repositories by search term (name_repository)
    const filteredRepositories = repositories.filter(repo => {
        const matchesSearch =
            repo.name_repository?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repo.owner?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredRepositories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRepositories = filteredRepositories.slice(startIndex, endIndex);

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha de actualización';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `Última actualización: ${day}/${month}/${year}`;
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const downloadCSV = () => {
        const headers = [
            'Repositorio', 'C-Low', 'C-Med', 'C-High', 'C-Crit',
            'S-Low', 'S-Med', 'S-High', 'S-Crit',
            'SC-Low', 'SC-Med', 'SC-High', 'SC-Crit'
        ];
        const csvContent = [
            headers.join(','),
            ...filteredRepositories.map(repo => {
                return [
                    repo.name_repository,
                    repo.limit_containers_low,
                    repo.limit_containers_medium,
                    repo.limit_containers_high,
                    repo.limit_containers_critical,
                    repo.limit_sast_low,
                    repo.limit_sast_medium,
                    repo.limit_sast_high,
                    repo.limit_sast_critical,
                    repo.limit_sca_low,
                    repo.limit_sca_medium,
                    repo.limit_sca_high,
                    repo.limit_sca_critical
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'repository_thresholds.csv');
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
                            placeholder="Buscar repositorio..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-[#404040] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200"
                        />
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
                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Repositorio</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">C-Low</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">C-Med</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">C-High</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">C-Crit</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">S-Low</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">S-Med</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">S-High</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">S-Crit</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">SC-Low</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">SC-Med</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">SC-High</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">SC-Crit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentRepositories.map((repo) => (
                            <tr
                                key={repo.id}
                                className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 text-center"
                            >
                                <td className="px-4 py-4 text-sm font-bold text-left whitespace-nowrap">
                                    <a
                                        href={repo.url_variables}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200"
                                    >
                                        {repo.name_repository}
                                    </a>
                                </td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_containers_low_last_update)}>{repo.limit_containers_low}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_containers_medium_last_update)}>{repo.limit_containers_medium}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_containers_high_last_update)}>{repo.limit_containers_high}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_containers_critical_last_update)}>{repo.limit_containers_critical}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sast_low_last_update)}>{repo.limit_sast_low}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sast_medium_last_update)}>{repo.limit_sast_medium}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sast_high_last_update)}>{repo.limit_sast_high}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sast_critical_last_update)}>{repo.limit_sast_critical}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sca_low_last_update)}>{repo.limit_sca_low}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sca_medium_last_update)}>{repo.limit_sca_medium}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sca_high_last_update)}>{repo.limit_sca_high}</td>
                                <td className="px-2 py-4 text-sm text-gray-600 dark:text-gray-300 cursor-help" title={formatDate(repo.limit_sca_critical_last_update)}>{repo.limit_sca_critical}</td>
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
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, filteredRepositories.length)}</span> de{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{filteredRepositories.length}</span> repositorios
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
