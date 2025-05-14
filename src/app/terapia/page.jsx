// /app/terapia/page.jsx
"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Importa el componente dinámico
const Terapia = dynamic(() => import('../../components/Terapia'), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando terapia...</div>}>
      <Terapia />
    </Suspense>
  );
}
