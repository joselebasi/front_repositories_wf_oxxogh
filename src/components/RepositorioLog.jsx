import React, { useEffect, useState } from 'react';

// Props: id_repository (number)
export default function RepositorioLog({ id_repository }) {
  const [logs, setLogs] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db_client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAllLogByRepositoryId',
          id_repository,
        }),
      });
      if (!res.ok) throw new Error('Error fetching logs');
      const data = await res.json();
      // Order by created_at descending
      setLogs((data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_repository) fetchLogs();
    // eslint-disable-next-line
  }, [id_repository]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/db_client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createLogRepository',
          id_repository,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Error creating log');
      setComment('');
      await fetchLogs();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Nuevo comentario de log"
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading || !comment.trim()}>
          {loading ? 'Guardando...' : 'Agregar Log'}
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Comentario</th>
              <th className="px-4 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-4">Sin logs</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">{log.comment}</td>
                  <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
