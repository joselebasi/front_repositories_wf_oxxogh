import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const StatusChart = ({ title, data, colors }) => (
    <div className="bg-white dark:bg-[#404040] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center w-full max-w-2xl mx-auto">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-tight">{title}</h3>
        <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.name}: {item.value}</span>
                </div>
            ))}
        </div>
    </div>
);


export default function RepositoryTopicsActivity() {
    const [repositories, setRepositories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRepositories = async () => {
            const { data, error } = await actions.bo_repository_status_data.getAllBoRepositoriesStatusData();
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

    // Filter repositories by type AND search term
    const filteredRepositories = repositories.filter(repo => {
        const matchesType = typeFilter === 'All' || repo.id_type_repository?.name === typeFilter;
        const matchesSearch =
            (repo.name_repository?.toLowerCase() || repo.url_repository?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredRepositories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRepositories = filteredRepositories.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getBadgeStyle = (typeName) => {
        const styles = {
            'DATABASE': { background: '#ffc627', color: 'black' },
            'SHELL': { background: '#8b5cf6', color: 'white' },
            'APPLICATION': { background: '#3b82f6', color: 'white' }
        };
        return styles[typeName] || { background: '#6b7280', color: 'white' };
    };

    const StatusIcon = ({ status }) => (
        status ? (
            <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    );

    // --- CHART DATA CALCULATION ---
    const calculateStatusDistribution = () => {
        const distribution = {};
        repositories.forEach(repo => {
            const status = repo.status || 'N/A';
            distribution[status] = (distribution[status] || 0) + 1;
        });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    };

    const STATUS_COLORS = ['#ffc627', '#4b5563', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

    const downloadCSV = () => {
        const headers = [
            'Repositorio', 'Tipo', 'Status', 'Tech', 'Toolbuild', 'Framework', 'Version', 'Release'
        ];
        const csvContent = [
            headers.join(','),
            ...filteredRepositories.map(repo => {
                const displayName = repo.name_repository || repo.url_repository?.split('/').pop() || 'N/A';
                return [
                    displayName,
                    repo.id_type_repository?.name || 'N/A',
                    repo.status || 'N/A',
                    repo.tech || 'N/A',
                    repo.toolbuild || 'N/A',
                    repo.framework || 'N/A',
                    repo.version || 'N/A',
                    repo.release || 'N/A'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'repository_workflows.csv');
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

                    {/* Filter Dropdown */}
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
                            className="bg-white dark:bg-[#404040] text-gray-900 dark:text-white text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-amber-500 focus:border-amber-500 block p-2 transition-colors duration-200 outline-none w-full md:w-48"
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
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Repositorio</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Tech</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Toolbuild</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Framework</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Version</th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Release</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentRepositories.map((repo) => (
                            <tr key={repo.id} className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                                <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                                    <a href={repo.url_repository} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200">
                                        {repo.name_repository || repo.url_repository?.split('/').pop() || 'N/A'}
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm" style={getBadgeStyle(repo.id_type_repository?.name)}>
                                        {repo.id_type_repository?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.status}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.tech}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.toolbuild}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.framework}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.version}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{repo.release}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#303030] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    Mostrando <span className="font-semibold text-amber-600 dark:text-amber-400">{startIndex + 1}</span> de{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, filteredRepositories.length)}</span> de{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{filteredRepositories.length}</span> repositorios
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md">Primero</button>
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md">Anterior</button>
                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                            let pageNum = totalPages <= 5 ? idx + 1 : (currentPage <= 3 ? idx + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + idx : currentPage - 2 + idx));
                            return (
                                <button key={pageNum} onClick={() => goToPage(pageNum)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${currentPage === pageNum ? 'text-gray-900 shadow-lg font-bold' : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`} style={currentPage === pageNum ? { background: 'linear-gradient(to right, #ffc627, #ffb627)' } : {}}>{pageNum}</button>
                            );
                        })}
                    </div>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md">Siguiente</button>
                    <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md">Último</button>
                </div>
            </div>

            {/* Dashboard Section */}
            <div className="p-6 bg-white dark:bg-[#303030] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mt-6">
                <StatusChart
                    title="Distribución de Estatus de Repositorios"
                    data={calculateStatusDistribution()}
                    colors={STATUS_COLORS}
                />
            </div>
        </div>
    );
}
