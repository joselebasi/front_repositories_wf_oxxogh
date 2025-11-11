import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

// Props: id_repository (number)
export default function RepositorioLog({ id_repository, userName}) {
  const [logs, setLogs] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (id_repository) fetchLogs();
    // eslint-disable-next-line
  }, [id_repository]);

  const handleSubmit = (event) => {
    event.preventDefault(); // 👈 Evita que la página se recargue
    console.log('Formulario enviado con:', comment);
    
  };

  const handleUpdate = async (row) => {
      try {
        await actions.wf_repositories_log.createLogRepository({
          id_repository: id_repository,
          comment: comment,
          created_by: userName
        });
        alert('Log created successfully!');
      } catch (err) {
        alert('Error creating log: ' + err.message);
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          Guardar
        </button>
      </form>      
    </div>
  );
}
