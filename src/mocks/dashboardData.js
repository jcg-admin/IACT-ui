// Mock IVR dashboard data — DashboardIVR spec (uc-rpt-01)

export const mockIVRDashboard = {
  segmentos_activos: ['nacional_A', 'nacional_B', 'Puebla'],
  trimestre_activo: 'Q3_25',
  total_llamadas: 18420,
  total_abandonadas: 1564,
  tasa_abandono: 8.49,
  centros_principales: [
    { centro: 'Servicio_General', total: 7200 },
    { centro: 'Soporte_Tecnico', total: 5100 },
    { centro: 'Cobranza', total: 3800 },
    { centro: 'Ventas', total: 1420 },
    { centro: 'Facturacion', total: 900 },
  ],
};

export const mockAbandonoBreakdown = {
  abandonadas_vacio: 420,
  abandonadas_cliente_colgo: 680,
  abandonadas_sin_opcion: 464,
};

export const mockMenusRedirigidos = [
  { menu: 'MENU_PRINCIPAL', total_llamadas: 9100, trimestre: 'Q3_25' },
  { menu: 'MENU_SOPORTE', total_llamadas: 3200, trimestre: 'Q3_25' },
  { menu: 'MENU_COBRANZA', total_llamadas: 2800, trimestre: 'Q3_25' },
  { menu: 'VACIO', total_llamadas: 420, trimestre: 'Q3_25' },
];

export const mockDashboardData = {
  dashboard: mockIVRDashboard,
  abandono: mockAbandonoBreakdown,
  menus: mockMenusRedirigidos,
  lastUpdated: new Date().toISOString(),
};
