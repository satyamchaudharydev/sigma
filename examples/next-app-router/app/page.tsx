/** @jsxImportSource react */
'use client';

import { useEffect } from 'react';
import { startEditor } from '../../../src';

function ExampleCard() {
  return (
    <section
      style={{
        maxWidth: 640,
        padding: 32,
        borderRadius: 24,
        background: 'white',
        boxShadow: '0 18px 60px rgba(18, 30, 61, 0.14)'
      }}
    >
      <h1>Next.js example</h1>
      <p>When source metadata cannot be resolved, the editor still exports a usable DOM-based prompt.</p>
    </section>
  );
}

export default function Page() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startEditor();
    }
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <ExampleCard />
    </main>
  );
}
