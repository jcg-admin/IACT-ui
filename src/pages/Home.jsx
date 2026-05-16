/**
 * Home.jsx — PENDIENTE DE CONSOLIDACIÓN
 *
 * Este archivo es referenciado por src/app/App.jsx, que forma parte de un
 * sistema de entrada paralelo (src/index.jsx → src/app/App.jsx) no conectado
 * al webpack entry principal (src/index.js → src/App.jsx → AppRouter).
 *
 * No eliminar de forma aislada. La eliminación requiere coordinar con:
 *   src/index.jsx, src/app/App.jsx
 *
 * UC pendiente de resolución en iteración futura.
 */
import { lazy, Suspense } from 'react';

const HomeModule = lazy(() => import('@modules/home/HomeModule'));

function Home() {
  return (
    <div className="page-container">
      <Suspense fallback={<div>Cargando modulo...</div>}>
        <HomeModule />
      </Suspense>
    </div>
  );
}

export default Home;
