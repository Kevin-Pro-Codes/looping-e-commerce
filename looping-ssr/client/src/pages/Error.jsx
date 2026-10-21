import React from 'react';
import { Head } from '@inertiajs/react';

export default function Error({ meta }) {
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Head>
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', color: '#dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>
            Oops!
          </h1>
          <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem' }}>
            We encountered an error while processing your request. Please try again later.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Go Home
          </a>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </main>
    </>
  );
}
