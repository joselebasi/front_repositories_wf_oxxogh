import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

const RepositoryTable = () => {
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
        const storageKey = `wf_repositories_data_${selectedId}`;
        const cacheTTL = 30 * 60 * 1000; // 30 minutos

        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isExpired = Date.now() - parsed.timestamp > cacheTTL;

          if (!isExpired && parsed.data) {
            console.log('✅ Cargando repositorios desde localStorage (vigente)');
            setData(parsed.data);
            setLastUpdated(new Date(parsed.timestamp));
            setLoading(false);
          } else {
            console.log('⚠️ Caché expirado, actualizando...');
            localStorage.removeItem(storageKey);
            await fetchRepositories();
          }
        } else {
          await fetchRepositories();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRepositories = async () => {
      console.log('🌐 Consultando repositorios desde el servidor...');
      const { data, error } = await actions.wf_repositories_data.getWfRepositoriesDataByIdType(selectedId);
      if (error) throw new Error(error.message || 'Error al obtener datos');
      setData(data);
      const payload = { timestamp: Date.now(), data };
      localStorage.setItem(`wf_repositories_data_${selectedId}`, JSON.stringify(payload));
      setLastUpdated(new Date(payload.timestamp));
    };

    const loadTechnicalLeaders = async () => {
      try {
        setTlLoading(true);
        const storageKey = 'wf_technical_leaders';
        const cacheTTL = 2 * 60 * 60 * 1000; // 2 horas

        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isExpired = Date.now() - parsed.timestamp > cacheTTL;

          if (!isExpired && parsed.data) {
            console.log('✅ Cargando líderes técnicos desde localStorage (vigente)');
            setTechnicalLeaders(parsed.data);
            setTlLoading(false);
            return;
          } else {
            console.log('⚠️ Caché de líderes técnicos expirado, actualizando...');
            localStorage.removeItem(storageKey);
          }
        }

        console.log('🌐 Consultando líderes técnicos desde el servidor...');
        const res = await fetch('/api/get_wf_technical_leader');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        setTechnicalLeaders(data);
        localStorage.setItem(storageKey, JSON.stringify({ timestamp: Date.now(), data }));
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
    { key: 'checkmarx_flag', label: 'Checkmarx' },
    { key: 'change_velocity_flag', label: 'Change Velocity' },
    { key: 'continuous_build_flag', label: 'Continuous Build' },
    { key: 'created_at_github', label: 'Created At (GitHub)' },
    { key: 'id_technical_leader', label: 'Lider Tecnico' },
  ];

  return (
    <>
      {/* --- NAV --- */}
      <nav className="mb-4 flex items-center gap-4">
        <button
          className={`px-3 py-2 rounded ${selectedId === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedId(1)}
        >
          DATABASE
        </button>
        <button
          className={`px-3 py-2 rounded ${selectedId === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedId(2)}
        >
          SHELL
        </button>
        <button
          className={`px-3 py-2 rounded ${selectedId === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedId(3)}
        >
          APPLICATION
        </button>

        {/* Hora última actualización */}
        {lastUpdated && (
          <span className="text-sm text-gray-600 ml-4">
            Última actualización: {lastUpdated.toLocaleString()}
          </span>
        )}

        {/* Botón para limpiar cache */}
        <button
          onClick={() => {
            localStorage.removeItem(`wf_repositories_data_${selectedId}`);
            localStorage.removeItem('wf_technical_leaders');
            alert('Caché local eliminado. Recarga la página para volver a consultar.');
          }}
          className="ml-auto px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Cache
        </button>
      </nav>

      {/* --- SEARCH --- */}
      <div className="mb-4 text-left">
        <input
          type="text"
          placeholder="Find repo by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="px-2 py-2 w-72 text-base rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* --- TABLE --- */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="border border-gray-300 p-2 bg-gray-100 text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => {
            const dataIdx = data.findIndex(r => r.id === row.id);
            return (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.key} className="border border-gray-300 p-2">
                    {col.key === 'name' ? (
                      <a href={`/dashboard/repository/${row.id}`} className="text-blue-600 hover:underline">{row.name}</a>
                    ) : col.key === 'id_technical_leader' ? (
                      <select
                        value={row.id_technical_leader || ''}
                        onChange={e => {
                          const newData = [...data];
                          newData[dataIdx] = { ...newData[dataIdx], id_technical_leader: e.target.value };
                          setData(newData);
                        }}
                        className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <td>
                  <button
                    onClick={() => handleUpdate(row)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Update
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* --- PAGINACIÓN --- */}
      <div className="flex justify-center gap-2 mt-8 mb-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="mr-2 px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          ◀
        </button>
        <span className="px-2 py-1">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="ml-2 px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </>
  );
};

export default RepositoryTable;
