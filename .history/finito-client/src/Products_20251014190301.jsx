import React, { useState } from 'react';
import axios from 'axios';

const ProductsButton = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/products');
            const data = Array.isArray(response.data) ? response.data : [];

            // Normalize _id from MongoDB ObjectId and ensure safe fields
            const normalized = data.map(p => ({
                _id: p._id?.$oid || p._id || Math.random().toString(), // fallback key
                title: p.title || 'No title',
                price: p.price || 0,
                description: p.description || '',
                image: p.image || null,
            }));

            setProducts(normalized);
        } catch (error) {
            console.error('Error loading products:', error);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-end p-5">
            <button
                onClick={loadProducts}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mb-2"
            >
                {loading ? 'Loading...' : '+'}
            </button>

            <div className="products w-full">
                {!loading && (!products || products.length === 0) && (
                    <p className="text-gray-500 mt-2 text-right">No products loaded.</p>
                )}

                {products.map(product => (
                    <div key={product._id} className="product-card border p-2 rounded mt-2">
                        <h3>{product.title}</h3>
                        <p>Price: ${product.price}</p>
                        {product.description && <p>{product.description}</p>}
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-auto mt-2"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsButton;
