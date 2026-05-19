import React, { useState } from 'react';
import useRequest from '@hooks/domain/useRequest';
import apiService from '@api/apiClient';

function UserList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: listData,
    loading,
    error,
    execute: fetchUsers,
  } = useRequest('/api/users', {
    method: 'GET',
    autoFetch: true,
    dependencies: [page, limit],
    onSuccess: (_data) => {
      // Callback de éxito — sin acción adicional
    },
  });

  const users = listData?.items || [];
  const total = listData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuario?')) {
      return;
    }

    try {
      await apiService.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      alert('Erro ao deletar usuario: ' + error.message);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="p-lg">
      <div className="flex justify-between items-center mb-lg">
        <h2>Usuarios</h2>
        <button className="btn btn-primary">Novo Usuario</button>
      </div>

      {error && (
        <div className="alert alert-error">
          Erro ao carregar usuarios: {error.message}
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Criado em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Nenhum usuario encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-md">
                          <div className="avatar avatar-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge badge-primary">
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button
                            className="btn btn-sm btn-secondary"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Deletar"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination" style={{ marginTop: '20px' }}>
            <button
              className="pagination-prev"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, page - 2),
                Math.min(totalPages, page + 3)
              )
              .map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-link ${
                    pageNum === page ? 'active' : ''
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

            <button
              className="pagination-next"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Proxima
            </button>

            <span className="pagination-info">
              Pagina {page} de {totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default UserList;
