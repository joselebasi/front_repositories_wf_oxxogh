import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WorkflowChart = ({ title, data, colors }) => (
    <div className="bg-white dark:bg-[#404040] p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center">
        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-tight">{title}</h3>
        <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
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
        <div className="flex gap-4 mt-2">
            {data.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 capitalize">{item.name}: {item.value}</span>
                </div>
            ))}
        </div>
    </div>
);

export default function RepositoryWorkflowsActivity() {
    const [repositories, setRepositories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRepositories = async () => {
            const { data, error } = await actions.bo_repository_workflows_activity_data.getAllBoRepositoriesWorkflowsActivityData();
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
            repo.name_repository?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repo.owner?.toLowerCase().includes(searchTerm.toLowerCase());

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
    const calculateStats = (field) => {
        const success = filteredRepositories.filter(r => r[field]).length;
        const total = filteredRepositories.length;
        const failure = total - success;
        return [
            { name: 'Sí', value: success },
            { name: 'No', value: failure }
        ];
    };

    const CHART_COLORS = ['#ffc627', '#4b5563']; // Amber and Gray

    const charts = [
        { title: 'Checkmarx', field: 'have_checkmarx' },
        { title: 'Continuous Build', field: 'have_continuous_build' },
        { title: 'Conjur', field: 'have_conjur' },
        { title: 'Change Velocity', field: 'have_change_velocity' },
        { title: 'Sharepoint Release', field: 'have_release_sharepoint' },
        { title: 'GitHub Release', field: 'have_release_github' },
        { title: 'Validate PR', field: 'have_validate_pr' },
        { title: 'Auto Close', field: 'have_auto_close' },
        { title: 'Cloud', field: 'is_cloud' },
        { title: 'Sonar', field: 'have_sonar' }
    ];

    const downloadCSV = () => {
        const headers = [
            'Repositorio', 'Tipo', 'Checkmarx', 'Continuous Build', 'Conjur', 'Change Velocity', 'SharePoint Rel', 'GitHub Rel', 'Validate PR', 'Auto Close', 'Cloud', 'Sonar'
        ];
        const csvContent = [
            headers.join(','),
            ...filteredRepositories.map(repo => {
                return [
                    repo.name_repository,
                    repo.id_type_repository?.name || 'N/A',
                    repo.have_checkmarx ? 'SI' : 'NO',
                    repo.have_continuous_build ? 'SI' : 'NO',
                    repo.have_conjur ? 'SI' : 'NO',
                    repo.have_change_velocity ? 'SI' : 'NO',
                    repo.have_release_sharepoint ? 'SI' : 'NO',
                    repo.have_release_github ? 'SI' : 'NO',
                    repo.have_validate_pr ? 'SI' : 'NO',
                    repo.have_auto_close ? 'SI' : 'NO',
                    repo.is_cloud ? 'SI' : 'NO',
                    repo.have_sonar ? 'SI' : 'NO'
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
                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Repositorio</th>
                            <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">Tipo</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Checkmarx</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Continuous<br />Build</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Conjur</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Change<br />Velocity</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Sharepoint<br />release</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Github<br />release</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Validate<br />PR</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Auto Close</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Cloud</th>
                            <th className="px-2 py-4 text-center text-xs font-bold uppercase tracking-wider">Sonar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentRepositories.map((repo) => (
                            <tr key={repo.id} className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
                                <td className="px-4 py-4 text-sm font-bold whitespace-nowrap">
                                    <a href={repo.url_workflows} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors duration-200">
                                        {repo.name_repository}
                                    </a>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm" style={getBadgeStyle(repo.id_type_repository?.name)}>
                                        {repo.id_type_repository?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_checkmarx} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_continuous_build} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_conjur} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_change_velocity} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_release_sharepoint} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_release_github} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_validate_pr} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_auto_close} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.is_cloud} /></td>
                                <td className="px-2 py-4"><StatusIcon status={repo.have_sonar} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#303030] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    Mostrando <span className="font-semibold text-amber-600 dark:text-amber-400">{startIndex + 1}</span> de <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.min(endIndex, filteredRepositories.length)}</span> de <span className="font-semibold text-amber-600 dark:text-amber-400">{filteredRepositories.length}</span> repositorios
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">Primero</button>
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">Anterior</button>
                    <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                            let pageNum = totalPages <= 5 ? idx + 1 : (currentPage <= 3 ? idx + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + idx : currentPage - 2 + idx));
                            return (
                                <button key={pageNum} onClick={() => goToPage(pageNum)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === pageNum ? 'text-gray-900 shadow-lg font-bold' : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`} style={currentPage === pageNum ? { background: 'linear-gradient(to right, #ffc627, #ffb627)' } : {}}>{pageNum}</button>
                            );
                        })}
                    </div>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">Siguiente</button>
                    <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">Último</button>
                </div>
            </div>

            {/* Charts Dashboard Section at Bottom */}
            <div className="p-6 bg-white dark:bg-[#303030] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mt-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">
                    Métricas de Workflow por Repositorio
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {charts.map((chart, idx) => (
                        <WorkflowChart
                            key={idx}
                            title={chart.title}
                            data={calculateStats(chart.field)}
                            colors={CHART_COLORS}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}