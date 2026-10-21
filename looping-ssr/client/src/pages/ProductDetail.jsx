import React from 'react';
import { Head } from '@inertiajs/react';

export default function ProductDetail({ product, meta }) {
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="BRL" />
        <meta name="twitter:card" content="product" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={product.image} />
      </Head>
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Product Image */}
          <div>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  objectFit: 'cover',
                  maxHeight: '500px'
                }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '400px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}>
                No Image Available
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '1rem', fontWeight: 'bold' }}>
              {product.title}
            </h1>
            
            <div style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>
              R$ {product.price ? product.price.toFixed(2) : '0.00'}
            </div>

            {product.category && (
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                color: '#4b5563', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>
                {product.category}
              </div>
            )}

            {product.description && (
              <div style={{ 
                color: '#4b5563', 
                lineHeight: '1.6', 
                marginBottom: '2rem',
                fontSize: '1rem'
              }}>
                {product.description}
              </div>
            )}

            {/* Add to Cart Button */}
            <button 
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '1rem',
                width: '100%'
              }}
              onClick={() => {
                // In a real implementation, this would add to cart
                alert('Add to cart functionality would be implemented here');
              }}
            >
              Add to Cart
            </button>

            {/* Product Details */}
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '1rem',
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
                Product Details
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                <p><strong>Product ID:</strong> {product._id}</p>
                <p><strong>Category:</strong> {product.category || 'N/A'}</p>
                <p><strong>Availability:</strong> In Stock</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
