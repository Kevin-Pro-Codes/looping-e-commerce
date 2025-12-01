import React, { useState } from 'react';
import axios from 'axios';

const ProductsButton = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/products'); // baseURL set in axios
            setProducts(response.data.items || response.data.data); // if paginated, Laravel uses `data`
        } catch (error) {
            console.error('Error loading products:', error);
        }
        setLoading(false);
    };

    return (
        <div>
            <button onClick={loadProducts} disabled={loading}>
                {loading ? 'Loading Products...' : 'Load Products'}
            </button>

            <div className="products">
                {products.length === 0 && !loading && <p>No products found.</p>}
                {products.map(product => (
                    <div key={product._id} className="product-card">
                        <h3>{product.name}</h3>
                        <p>Price: ${product.price}</p>
                        <p>{product.description}</p>
                        {product.image_url && <img src={product.image_url} alt={product.name} />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsButton;
