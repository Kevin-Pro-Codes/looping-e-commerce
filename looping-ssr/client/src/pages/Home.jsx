import React from 'react';
import { Head } from '@inertiajs/react';

export default function Home({ meta }) {
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Head>
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>Welcome to Looping</h1>
        <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          This page is rendered on the server using Inertia.js, so search engines receive fully‑rendered HTML.
        </p>
      </main>
    </>
  );
}
