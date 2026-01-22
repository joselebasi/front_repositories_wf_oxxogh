import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

const RepositoryControlTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicalLeaders, setTechnicalLeaders] = useState([]);
  const [tlLoading, setTlLoading] = useState(true);
  const [tlError, setTlError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(1);

  const filteredData = data.filter(row =>
    row.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // --- EFECTO PRINCIPAL ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchRepositories();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRepositories = async () => {
      console.log('🌐 Consultando repositorios desde el servidor...');
      const { data, error } = await actions.wf_repositories_data.getAllWfRepositoriesData();
      console.log("✅ Repositorios obtenidos:", data);
      if (error) throw new Error(error.message || 'Error al obtener datos');
      setData(data);
      setLastUpdated(new Date());
    };

    const loadTechnicalLeaders = async () => {
      try {
        setTlLoading(true);

        console.log('🌐 Consultando líderes técnicos desde el servidor...');
        const res = await fetch('/api/get_wf_technical_leader');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        setTechnicalLeaders(data);
      } catch (err) {
        setTlError(err.message);
      } finally {
        setTlLoading(false);
      }
    };

    loadData();
    loadTechnicalLeaders();
  }, [selectedId]);

  // --- ACTUALIZAR FILAS ---
  const handleUpdate = async (row) => {
    try {
      await actions.wf_repositories_data.updateRowWfRepositoriesData({
        id: row.id,
        change_velocity_flag: row.change_velocity_flag,
        checkmarx_flag: row.checkmarx_flag,
        continuous_build_flag: row.continuous_build_flag,
        id_technical_leader: Number(row.id_technical_leader)
      });
      alert('Row updated successfully!');
    } catch (err) {
      alert('Error updating row: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!Array.isArray(data) || data.length === 0) return <div>No data found.</div>;
  if (tlLoading) return <div>Loading technical leaders...</div>;
  if (tlError) return <div>Error loading technical leaders: {tlError}</div>;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type_repository', label: 'Type Repository' },
    { key: 'checkmarx_flag', label: 'Checkmarx' },
    { key: 'change_velocity_flag', label: 'Change Velocity' },
    { key: 'continuous_build_flag', label: 'Continuous Build' },
    { key: 'created_at_github', label: 'Created At (GitHub)' },
    { key: 'id_technical_leader', label: 'Lider Tecnico' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* --- SEARCH --- */}
      <div className="mb-4 text-left">
        <input
          type="text"
          placeholder="Find repo by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 w-72 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {columns.map(col => (
                <th key={col.key} scope="col" className="px-6 py-3">{col.label}</th>
              ))}
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => {
              const dataIdx = data.findIndex(r => r.id === row.id);
              return (
                <tr key={row.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4">
                      {col.key === 'name' ? (
                        <a href={`/dashboard/repository/${row.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{row.name}</a>
                      ) : col.key === 'type_repository' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          {row.id_type_repository.name || 'N/A'}
                        </span>
                      ) : col.key === 'id_technical_leader' ? (
                        <select
                          value={row.id_technical_leader || ''}
                          onChange={e => {
                            const newData = [...data];
                            newData[dataIdx] = { ...newData[dataIdx], id_technical_leader: e.target.value };
                            setData(newData);
                          }}
                          className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Selecciona un LT</option>
                          {technicalLeaders.map(tl => (
                            <option key={tl.id} value={tl.id}>{tl.name || tl.id}</option>
                          ))}
                        </select>
                      ) : (
                        col.key === 'checkmarx_flag' || col.key === 'change_velocity_flag' || col.key === 'continuous_build_flag' ? (
                          <input
                            type="checkbox"
                            checked={row[col.key] === true}
                            onChange={e => {
                              const newData = [...data];
                              newData[dataIdx] = { ...newData[dataIdx], [col.key]: e.target.checked };
                              setData(newData);
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                        ) : row[col.key]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUpdate(row)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- PAGINACIÓN --- */}
      <div className="flex justify-center gap-2 mt-8 mb-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="mr-2 px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          ◀
        </button>
        <span className="px-2 py-1 text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="ml-2 px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default RepositoryControlTable;
