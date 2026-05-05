/**
 * UserList Component
 * Muestra lista de usuarios en tabla
 * Con búsqueda, filtrado, y acciones CRUD
 */

import React, { useState, useEffect } from 'react';
import Table from '@components/presentational/Table';
import Modal from '@components/shared/Modal';
import { useToast } from '../../context/ToastContext';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  // Mock data
  const mockUsers = [
    { id: 1, first_name: 'Juan', last_name: 'Pérez', email: 'juan@example.com', role: 'Admin', status: 'Activo' },
    { id: 2, first_name: 'María', last_name: 'García', email: 'maria@example.com', role: 'User', status: 'Activo' },
    { id: 3, first_name: 'Carlos', last_name: 'López', email: 'carlos@example.com', role: 'User', status: 'Inactivo' },
    { id: 4, first_name: 'Ana', last_name: 'Martínez', email: 'ana@example.com', role: 'Moderator', status: 'Activo' },
    { id: 5, first_name: 'Luis', last_name: 'Rodríguez', email: 'luis@example.com', role: 'User', status: 'Activo' },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'first_name', label: 'Nombre' },
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'role', label: 'Rol', width: '100px' },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value === 'Activo' ? '#065f46' : '#7f1d1d',
          color: value === 'Activo' ? '#d1fae5' : '#fee2e2',
          fontSize: '12px'
        }}>
          {value}
        </span>
      )
    },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`¿Eliminar a ${user.first_name} ${user.last_name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
      addToast(`${user.first_name} eliminado`, 'success');
    }
  };

  const handleSave = (formData) => {
    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
      addToast('Usuario actualizado', 'success');
    } else {
      setUsers([...users, { id: Date.now(), ...formData }]);
      addToast('Usuario creado', 'success');
    }
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Gestión de Usuarios</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Total: {users.length} usuarios
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
              flex: 1,
            }}
          />
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowModal(true);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredUsers}
        loading={loading}
        onActionClick={(user) => handleEdit(user)}
      />

      <UserModal
        isOpen={showModal}
        user={selectedUser}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

function UserModal({ isOpen, user, onClose, onSave }) {
  const [formData, setFormData] = useState(user || {
    first_name: '',
    last_name: '',
    email: '',
    role: 'User',
    status: 'Activo',
  });

  useEffect(() => {
    setFormData(user || {
      first_name: '',
      last_name: '',
      email: '',
      role: 'User',
      status: 'Activo',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
            Nombre
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
            Apellido
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
              Rol
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #1f2937',
                backgroundColor: '#0f172a',
                color: '#f3f4f6',
              }}
            >
              <option>Admin</option>
              <option>Moderator</option>
              <option>User</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #1f2937',
                backgroundColor: '#0f172a',
                color: '#f3f4f6',
              }}
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default UserList;
