import React, { useState } from 'react';
import axios from 'axios';

const ProductsButton = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/products');
            setProducts(response.data.items || response.data.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
        setLoading(false);
    };

    return (
        // Stack everything vertically
        <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-end">
            <button
                onClick={loadProducts}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mb-2"
            >
                {loading ? 'Loading...' : '+'}
            </button>

            {/* Message or loaded products will appear below the button */}
            <div className="products w-full">
                {products.length === 0 && !loading && (
                    <p className="text-gray-500 mt-2">No products loaded.</p>
                )}
                {products.map(product => (
                    <div key={product._id} className="product-card border p-2 rounded mt-2">
                        <h3>{product.name}</h3>
                        <p>Price: ${product.price}</p>
                        <p>{product.description}</p>
                        {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-full h-auto mt-2" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsButton;
