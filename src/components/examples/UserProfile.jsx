import React, { useState } from 'react';
import useRequest from '@hooks/domain/useRequest';

function UserProfile({ userId }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const {
    data: user,
    loading: userLoading,
    error: userError,
    execute: fetchUser,
  } = useRequest(`/api/users/${userId}`, {
    method: 'GET',
    autoFetch: true,
    dependencies: [userId],
    onSuccess: (userData) => {
      setFormData(userData);
    },
  });

  const {
    data: updateResult,
    loading: updateLoading,
    error: updateError,
    execute: updateUser,
  } = useRequest(`/api/users/${userId}`, {
    method: 'PUT',
    autoFetch: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (userLoading) {
    return <div className="spinner"></div>;
  }

  if (userError) {
    return (
      <div className="alert alert-error">
        Erro ao carregar perfil: {userError.message}
      </div>
    );
  }

  if (!user) {
    return <div>Nenhum usuario encontrado</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
      
      <div className="profile-name">{user.name}</div>
      <div className="profile-role">{user.role}</div>
      
      {editMode ? (
        <form onSubmit={handleSave} className="form">
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          {updateError && (
            <div className="alert alert-error">
              {updateError.message}
            </div>
          )}

          <div className="profile-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateLoading}
            >
              {updateLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditMode(false)}
              disabled={updateLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{user.posts || 0}</div>
              <div className="profile-stat-label">Posts</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user.followers || 0}</div>
              <div className="profile-stat-label">Seguidores</div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Editar Perfil
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => fetchUser()}
            >
              Recarregar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;
