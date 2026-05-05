/**
 * JobList Component
 * Muestra lista de trabajos/tareas
 * Con polling, status updates y logs
 */

import React, { useState, useEffect } from 'react';
import Table from '@components/presentational/Table';
import Modal from '@components/shared/Modal';
import { useToast } from '../../context/ToastContext';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();

  const mockJobs = [
    { id: 1, name: 'Backup Database', status: 'Completado', progress: 100, duration: '2m 45s', createdAt: '2026-04-25 10:30' },
    { id: 2, name: 'Sincronizar archivos', status: 'En progreso', progress: 65, duration: '1m 20s', createdAt: '2026-04-25 10:45' },
    { id: 3, name: 'Generar reportes', status: 'En cola', progress: 0, duration: '-', createdAt: '2026-04-25 11:00' },
    { id: 4, name: 'Limpiar logs', status: 'Completado', progress: 100, duration: '45s', createdAt: '2026-04-25 09:15' },
    { id: 5, name: 'Verificar integridad', status: 'Fallido', progress: 45, duration: '1m 30s', createdAt: '2026-04-25 08:00' },
    { id: 6, name: 'Actualizar índices', status: 'Completado', progress: 100, duration: '3m 12s', createdAt: '2026-04-24 23:45' },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 500);

    // Simular polling cada 5 segundos
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'En progreso' && job.progress < 100) {
          return { ...job, progress: Math.min(job.progress + 5, 100) };
        }
        return job;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Completado': '#065f46',
      'En progreso': '#0c4a6e',
      'En cola': '#78350f',
      'Fallido': '#7f1d1d',
    };
    const textColors = {
      'Completado': '#d1fae5',
      'En progreso': '#cffafe',
      'En cola': '#fef3c7',
      'Fallido': '#fee2e2',
    };
    return { bg: colors[status], text: textColors[status] };
  };

  const columns = [
    { key: 'name', label: 'Tarea' },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => {
        const colors = getStatusColor(value);
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: '12px'
          }}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'progress',
      label: 'Progreso',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="progress-bar-track" style={{
            flex: 1,
            height: '8px',
            backgroundColor: '#1f2937',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div className="progress-bar-fill" style={{
              height: '100%',
              width: `${value}%`,
              backgroundColor: '#0ea5e9',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{value}%</span>
        </div>
      )
    },
    { key: 'duration', label: 'Duración', width: '80px' },
    { key: 'createdAt', label: 'Creado', width: '120px' },
  ];

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCancel = (job) => {
    if (job.status === 'En progreso') {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'Cancelado', progress: j.progress } : j));
      addToast(`Tarea ${job.name} cancelada`, 'info');
    }
  };

  const handleRetry = (job) => {
    if (job.status === 'Fallido') {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'En progreso', progress: 0 } : j));
      addToast(`Reintentando ${job.name}`, 'info');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Trabajos y Tareas</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Total: {jobs.length} tareas | En progreso: {jobs.filter(j => j.status === 'En progreso').length}
        </p>
      </div>

      <Table
        columns={columns}
        data={jobs}
        loading={loading}
        onActionClick={handleViewDetails}
      />

      <JobDetailsModal
        isOpen={showModal}
        job={selectedJob}
        onClose={() => {
          setShowModal(false);
          setSelectedJob(null);
        }}
        onCancel={handleCancel}
        onRetry={handleRetry}
      />
    </div>
  );
}

function JobDetailsModal({ isOpen, job, onClose, onCancel, onRetry }) {
  if (!job) return null;

  const mockLogs = [
    { time: '10:30:00', message: 'Iniciando tarea...' },
    { time: '10:30:02', message: 'Conectando a base de datos' },
    { time: '10:30:05', message: 'Iniciando backup' },
    { time: '10:30:15', message: 'Procesando datos...' },
    { time: '10:30:25', message: 'Comprimiendo archivos' },
    { time: '10:30:45', message: 'Tarea completada' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles: ${job.name}`}
      size="lg"
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
            Cerrar
          </button>
          {job.status === 'En progreso' && (
            <button
              onClick={() => {
                onCancel(job);
                onClose();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          )}
          {job.status === 'Fallido' && (
            <button
              onClick={() => {
                onRetry(job);
                onClose();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Estado</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{job.status}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Progreso</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{job.progress}%</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Duración</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{job.duration}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Creado</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{job.createdAt}</p>
        </div>
      </div>

      <h4 style={{ marginBottom: '12px' }}>Logs</h4>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '4px',
        padding: '12px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        {mockLogs.map((log, idx) => (
          <div key={idx}>
            <span style={{ color: '#0ea5e9' }}>[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default JobList;
