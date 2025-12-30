import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

// Props: id_repository (number), userName (string)
export default function RepositorioLog({ id_repository, userName }) {
  const [logs, setLogs] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar logs cuando cambia el repositorio
  useEffect(() => {
    if (id_repository) fetchLogsByRepositoryId();
  }, [id_repository]);

  // 🔹 Obtener logs del servidor
  const fetchLogsByRepositoryId = async () => {
    try {
      console.log('🌐 Consultando logs del repositorio...');
      const { data, error } = await actions.wf_repositories_log.getAllLogByRepositoryId({ id_repository: Number(id_repository) });
      console.log('🌐 Logs recibidos:', data, error);
      if (error) throw new Error(error.message || 'Error al obtener logs');
      setLogs(data || []);
    } catch (err) {
      console.error('❌ Error al obtener logs:', err);
      alert('Error al obtener logs: ' + err.message);
    }
  };

  // 🔹 Guardar nuevo log
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      alert('Por favor, ingresa un comentario.');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Guardando log...', { id_repository, comment, userName });
      const { data, error } = await actions.wf_repositories_log.createLogRepository({
        id_repository : Number(id_repository),
        comment: comment.trim(),
        created_by: userName
      });

      if (error) throw new Error(error.message || 'Error al guardar el log');

      alert('✅ Log guardado correctamente');
      setComment(''); // limpiar input
      await fetchLogsByRepositoryId(); // recargar logs
    } catch (err) {
      console.error('❌ Error al guardar log:', err);
      alert('Error al guardar log: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Nuevo comentario de log"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-4 py-1 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      {/* Lista de logs */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay logs registrados aún.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="border rounded p-2 text-sm bg-gray-50">
              <p className="font-semibold">{log.created_by}</p>
              <p>{log.comment}</p>
              <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
