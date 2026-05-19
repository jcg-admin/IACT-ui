/**
 * EJEMPLO: Página responsiva con useBreakpoint Hook
 * Demuestra cómo adaptar la UI según el tamaño de pantalla
 */

import React from 'react';
import { useBreakpoint, useMediaQuery } from '../../hooks/useBreakpoint';

/**
 * Ejemplo 1: Dashboard Responsivo
 */
export function DashboardResponsive() {
  const { breakpoint, isMobile, isTablet, isDesktop, width } = useBreakpoint();

  return (
    <div className="min-h-screen bg-dark-900 text-white p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Dashboard Responsivo
      </h1>

      {/* Estado actual */}
      <div className="bg-dark-800 rounded-lg p-4 mb-6 border border-dark-700">
        <p className="text-sm text-dark-400">
          Breakpoint actual: <span className="font-bold text-primary-400">{breakpoint}</span>
        </p>
        <p className="text-sm text-dark-400">
          Ancho: {width}px | Tipo: {
            isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Escritorio'
          }
        </p>
      </div>

      {/* Layout responsive usando Tailwind */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <Card title="Card 1" />
        <Card title="Card 2" />
        <Card title="Card 3" />
        <Card title="Card 4" />
      </div>

      {/* Contenido específico por breakpoint */}
      {isMobile && (
        <div className="bg-blue-500/10 border border-blue-500 rounded p-4 mb-6">
          <p className="text-sm">
            Estás en una pantalla móvil (menos de 768px)
          </p>
        </div>
      )}

      {isTablet && (
        <div className="bg-purple-500/10 border border-purple-500 rounded p-4 mb-6">
          <p className="text-sm">
            Estás en una pantalla tablet (768px a 1024px)
          </p>
        </div>
      )}

      {isDesktop && (
        <div className="bg-green-500/10 border border-green-500 rounded p-4 mb-6">
          <p className="text-sm">
            Estás en una pantalla de escritorio (más de 1024px)
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Ejemplo 2: Navbar Responsivo
 */
export function NavbarResponsivo() {
  const { isMobile } = useBreakpoint();

  return (
    <nav className="bg-dark-800 border-b border-dark-700">
      <div className="px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">IACT</div>

          {isMobile ? (
            <MobileMenu />
          ) : (
            <DesktopMenu />
          )}
        </div>
      </div>
    </nav>
  );
}

function MobileMenu() {
  return (
    <button className="p-2 hover:bg-dark-700 rounded">
      ☰ Menu
    </button>
  );
}

function DesktopMenu() {
  return (
    <div className="flex gap-6">
      <a href="#audit" className="hover:text-primary-400">Auditoria</a>
      <a href="#access" className="hover:text-primary-400">Acceso</a>
      <a href="#alerts" className="hover:text-primary-400">Alertas</a>
      <a href="#settings" className="hover:text-primary-400">Configuración</a>
    </div>
  );
}

/**
 * Ejemplo 3: Tabla Responsiva
 */
export function TablaResponsiva() {
  const { isDesktop } = useBreakpoint();

  const data = [
    { id: 1, usuario: 'admin@iact.com', accion: 'CREATE', fecha: '2026-04-27' },
    { id: 2, usuario: 'user@iact.com', accion: 'UPDATE', fecha: '2026-04-27' },
    { id: 3, usuario: 'dev@iact.com', accion: 'DELETE', fecha: '2026-04-27' },
  ];

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden">
      {isDesktop ? (
        // Vista de tabla completa (solo en desktop)
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="px-4 py-3 text-left text-sm font-bold">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Acción</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-dark-700 hover:bg-dark-700">
                <td className="px-4 py-3 text-sm">{row.usuario}</td>
                <td className="px-4 py-3 text-sm">{row.accion}</td>
                <td className="px-4 py-3 text-sm">{row.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Vista de tarjetas (móvil y tablet)
        <div className="flex flex-col gap-4 p-4">
          {data.map((row) => (
            <div key={row.id} className="bg-dark-700 rounded p-3">
              <p className="text-sm">
                <span className="text-dark-400">Usuario:</span> {row.usuario}
              </p>
              <p className="text-sm">
                <span className="text-dark-400">Acción:</span> {row.accion}
              </p>
              <p className="text-sm">
                <span className="text-dark-400">Fecha:</span> {row.fecha}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Ejemplo 4: Usando useMediaQuery para características específicas
 */
export function FeatureDarkMode() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isHighDPI = useMediaQuery('(min-resolution: 2dppx)');
  const isMobilePortrait = useMediaQuery('(max-width: 767px) and (orientation: portrait)');

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Preferencias del Sistema</h3>

      <div className="space-y-3">
        <div className={`p-3 rounded ${isDarkMode ? 'bg-blue-500/10' : 'bg-yellow-500/10'}`}>
          <p className="text-sm">
            Modo oscuro: <span className="font-bold">{isDarkMode ? 'Activado' : 'Desactivado'}</span>
          </p>
        </div>

        <div className={`p-3 rounded ${isHighDPI ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
          <p className="text-sm">
            Pantalla Retina/2x: <span className="font-bold">{isHighDPI ? 'Sí' : 'No'}</span>
          </p>
        </div>

        <div className={`p-3 rounded ${isMobilePortrait ? 'bg-purple-500/10' : 'bg-gray-500/10'}`}>
          <p className="text-sm">
            Móvil vertical: <span className="font-bold">{isMobilePortrait ? 'Sí' : 'No'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Ejemplo 5: Modal Responsivo
 */
export function ModalResponsivo({ isOpen, onClose }) {
  const { isMobile } = useBreakpoint();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {/* Modal que toma todo el ancho en móvil, ancho fijo en desktop */}
      <div className={`bg-dark-800 rounded-lg ${isMobile ? 'w-full' : 'max-w-md'}`}>
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Modal Responsivo</h2>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-dark-300 mb-6">
            Este modal se adapta al tamaño de la pantalla
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 rounded hover:bg-dark-600"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 rounded hover:bg-primary-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente Card reutilizable
 */
function Card({ title }) {
  return (
    <div className="bg-dark-800 rounded-lg p-4 border border-dark-700 hover:border-dark-600 transition">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-dark-400">
        Contenido de la tarjeta
      </p>
    </div>
  );
}

/**
 * Ejemplo 6: Usar dentro de AuditPage
 */
export function AuditPageResponsivo() {
  const { breakpoint, isMobile, isDesktop } = useBreakpoint();
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          Auditoria del Sistema
        </h1>
        <p className="text-sm text-dark-400 mt-2">
          Breakpoint: {breakpoint} | Modo: {isDarkMode ? 'Oscuro' : 'Claro'}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4 md:p-6 lg:p-8">
        {/* Grid que cambia de columnas según breakpoint */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card title="Filtro 1" />
          <Card title="Filtro 2" />
          <Card title="Filtro 3" />
        </div>

        {/* Tabla o Cards según breakpoint */}
        <TablaResponsiva />

        {/* Información adicional solo en desktop */}
        {isDesktop && (
          <div className="mt-8 bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-sm text-dark-400">
              Información avanzada solo visible en pantallas grandes
            </p>
          </div>
        )}

        {/* Información móvil solo en móvil */}
        {isMobile && (
          <div className="mt-8 bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-sm text-dark-400">
              Vista optimizada para móvil
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardResponsive;
