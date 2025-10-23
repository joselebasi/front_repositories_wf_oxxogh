import React, { useEffect, useState } from 'react';

const RepositoryTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/get_wf_repositories_data')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!Array.isArray(data) || data.length === 0) return <div>No data found.</div>;


  // Define the columns to display
  const columns = [
    // { key: 'id', label: 'ID' }, // Hidden column
    { key: 'created_at', label: 'Created At' },
    { key: 'name', label: 'Name' },
    // { key: 'url', label: 'URL' }, // Hidden column
    { key: 'checkmarx_flag', label: 'Checkmarx' },
    { key: 'change_velocity_flag', label: 'Change Velocity' },
    { key: 'continuous_build_flag', label: 'Continuous Build' },
    { key: 'created_at_github', label: 'Created At (GitHub)' },
    { key: 'pushed_at_github', label: 'Pushed At (GitHub)' }
  ];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={{ border: '1px solid #ccc', padding: '8px', background: '#f5f5f5' }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map(col => (
              <td key={col.key} style={{ border: '1px solid #ccc', padding: '8px' }}>
                {col.key === 'name' ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer">{row.name}</a>
                ) : (
                  col.key === 'checkmarx_flag' || col.key === 'change_velocity_flag' || col.key === 'continuous_build_flag' ? (
                    <input
                      type="checkbox"
                      checked={!!row[col.key]}
                      onChange={e => {
                        const newData = [...data];
                        newData[idx] = { ...newData[idx], [col.key]: e.target.checked };
                        setData(newData);
                      }}
                    />
                  ) : row[col.key]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RepositoryTable;
