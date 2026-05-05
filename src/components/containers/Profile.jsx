import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '@redux/slices/authSlice'
import { AnimatedButton } from '@components/animations'

function Profile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch(setUser(formData));
      setMessage('Perfil actualizado exitosamente');
      setEditMode(false);
    } catch (error) {
      setMessage('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-lg">
      <h1>Mi Perfil</h1>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.first_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="profile-name">{user?.first_name} {user?.last_name}</div>
          <div className="profile-role">{user?.role}</div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">127</div>
              <div className="profile-stat-label">Posts</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">1.2K</div>
              <div className="profile-stat-label">Followers</div>
            </div>
          </div>

          {!editMode && (
            <div className="profile-actions">
              <AnimatedButton
                variant="primary"
                onClick={() => setEditMode(true)}
              >
                Editar Perfil
              </AnimatedButton>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {editMode ? 'Editar Perfil' : 'Informacion'}
            </h3>
          </div>

          <div className="card-body">
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'} mb-lg`}>
                {message}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    disabled={loading}
                  ></textarea>
                </div>

                <div className="flex gap-md">
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </AnimatedButton>
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditMode(false)
                      setFormData(user)
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </AnimatedButton>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>NOMBRE</p>
                  <p style={{ fontSize: '16px' }}>{user?.first_name} {user?.last_name}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>EMAIL</p>
                  <p style={{ fontSize: '16px' }}>{user?.email}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>USUARIO</p>
                  <p style={{ fontSize: '16px' }}>{user?.username}</p>
                </div>

                <div>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>ROLE</p>
                  <span className="badge badge-primary">{user?.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
