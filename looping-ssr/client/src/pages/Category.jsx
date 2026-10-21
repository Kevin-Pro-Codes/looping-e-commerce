import React from 'react';
import { Head } from '@inertiajs/react';

export default function Category({ category, products, pagination, meta }) {
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
      </Head>
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Category Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '1rem', fontWeight: 'bold' }}>
            {category.charAt(0).toUpperCase() + category.slice(1)} Products
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem' }}>
            Browse our collection of {category} products. {pagination.total} products found.
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {products.map((product) => (
              <div 
                key={product._id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image */}
                <div style={{ height: '200px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#9ca3af'
                    }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    marginBottom: '0.5rem',
                    height: '2.5rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.title}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '1.25rem', 
                    color: '#dc2626', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem'
                  }}>
                    R$ {product.price ? product.price.toFixed(2) : '0.00'}
                  </div>

                  {product.category && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '1rem'
                    }}>
                      {product.category}
                    </div>
                  )}

                  <button 
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('View product details functionality would be implemented here');
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '1rem' }}>
              No products found
            </h3>
            <p style={{ color: '#9ca3af' }}>
              There are no products in the {category} category at the moment.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            marginTop: '2rem'
          }}>
            {/* Previous Page */}
            {pagination.currentPage > 1 && (
              <a
                href={`/category/${category}?page=${pagination.currentPage - 1}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              >
                Previous
              </a>
            )}

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <a
                  key={pageNum}
                  href={`/category/${category}?page=${pageNum}`}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: pageNum === pagination.currentPage ? '#dc2626' : '#374151',
                    backgroundColor: pageNum === pagination.currentPage ? '#fef2f2' : 'white',
                    fontWeight: pageNum === pagination.currentPage ? 'bold' : 'normal'
                  }}
                >
                  {pageNum}
                </a>
              );
            })}

            {/* Next Page */}
            {pagination.currentPage < pagination.totalPages && (
              <a
                href={`/category/${category}?page=${pagination.currentPage + 1}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#374151',
                  backgroundColor: 'white'
                }}
              >
                Next
              </a>
            )}
          </div>
        )}
      </main>
    </>
  );
}
