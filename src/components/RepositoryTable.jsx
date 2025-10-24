import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

const RepositoryTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicalLeaders, setTechnicalLeaders] = useState([]);
  const [tlLoading, setTlLoading] = useState(true);
  const [tlError, setTlError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // Search state
  const [search, setSearch] = useState("");
  const filteredData = data.filter(row => row.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Llamas directamente la acción del servidor
        const { data, error } = await actions.wf_repositories_data.getWfRepositoriesDataByIdType(3);

        if (error) throw new Error(error.message || 'Error al obtener datos');
        console.log('Fetched data json:', data);
        setData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Fetch technical leaders
    fetch('/api/get_wf_technical_leader')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setTechnicalLeaders(data);
        setTlLoading(false);
      })
      .catch(err => {
        setTlError(err.message);
        setTlLoading(false);
      });
  }, []);

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


  // Define the columns to display
  const columns = [
    // { key: 'id', label: 'ID' }, // Hidden column
    // { key: 'created_at', label: 'Created At' }, // Hidden column
    { key: 'name', label: 'Name' },
    // { key: 'url', label: 'URL' }, // Hidden column
    { key: 'checkmarx_flag', label: 'Checkmarx' },
    { key: 'change_velocity_flag', label: 'Change Velocity' },
    { key: 'continuous_build_flag', label: 'Continuous Build' },
    { key: 'created_at_github', label: 'Created At (GitHub)' },
    // { key: 'pushed_at_github', label: 'Pushed At (GitHub)' } // Hidden column
    { key: 'id_technical_leader', label: 'Lider Tecnico' },
  ];

  if (tlLoading) return <div>Loading technical leaders...</div>;
  if (tlError) return <div>Error loading technical leaders: {tlError}</div>;

  return (
    <>
      <div style={{ marginBottom: '16px', textAlign: 'left' }}>
        <input
          type="text"
          placeholder="Find repo by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px', width: '300px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={{ border: '1px solid #ccc', padding: '8px', background: '#f5f5f5' }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedData.map((row, idx) => {
          // Find the index in filteredData, then in data
          const filteredIdx = filteredData.findIndex(r => r.id === row.id);
          const dataIdx = data.findIndex(r => r.id === row.id);
          return (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col.key} style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {col.key === 'name' ? (
                    <a href={row.url} target="_blank" rel="noopener noreferrer">{row.name}</a>
                  ) : col.key === 'id_technical_leader' ? (
                    <select
                      value={row.id_technical_leader || ''}
                      onChange={e => {
                        const newData = [...data];
                        newData[dataIdx] = { ...newData[dataIdx], id_technical_leader: e.target.value };
                        setData(newData);
                      }}
                    >
                      <option value="">Selecciona un LT</option>
                      {technicalLeaders && Array.isArray(technicalLeaders) && technicalLeaders.map(tl => (
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
                      />
                    ) : row[col.key]
                  )}
                </td>
              ))}
              <td>
                <button onClick={() => handleUpdate(row)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Update
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    <div style={{ marginTop: '16px', textAlign: 'center' }}>
      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ marginRight: '8px' }}>Prev</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ marginLeft: '8px' }}>Next</button>
    </div>
    </>
  );
};

export default RepositoryTable;
