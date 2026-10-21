import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import render from './ssr.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const LARAVEL_URL = process.env.LARAVEL_URL || 'http://127.0.0.1:8888';

app.use(express.json());
app.use('/dist', express.static(path.resolve(__dirname, '../client/dist')));

// Helper to send Inertia responses
const inertiaRender = async (req, res, component, props = {}) => {
  const page = {
    component,
    props: {
      ...props,
      // Shared props can go here
      auth: { user: null } 
    },
    url: req.originalUrl,
    version: null, // You should handle versioning for asset cache busting
  };

  if (req.get('X-Inertia')) {
    res.set('X-Inertia', 'true');
    return res.json(page);
  }

  // SSR
  try {
    const { head, body } = await render(page);
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${head}
          <script type="module" src="/src/main.jsx"></script>
        </head>
        <body>
          ${body}
        </body>
      </html>
    `);
  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side only if SSR fails
    const pageAttr = JSON.stringify(page).replace(/"/g, '&quot;');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script type="module" src="/src/main.jsx"></script>
        </head>
        <body>
          <div id="app" data-page="${pageAttr}"></div>
        </body>
      </html>
    `);
  }
};

app.get('/', (req, res) => {
  inertiaRender(req, res, 'Home', {
    meta: {
      title: 'Welcome to Looping',
      description: 'A fast, SEO-optimized Inertia setup.'
    }
  });
});

// Product detail page SSR
app.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Fetch product data from Laravel backend
    const response = await fetch(`${LARAVEL_URL}/api/products/${productId}`);
    
    if (!response.ok) {
      return inertiaRender(req, res, 'NotFound', {
        meta: {
          title: 'Product Not Found',
          description: 'The requested product could not be found.'
        }
      });
    }
    
    const product = await response.json();
    
    inertiaRender(req, res, 'ProductDetail', {
      product,
      meta: {
        title: product.title || 'Product Detail',
        description: product.description?.substring(0, 160) || 'View product details at Looping'
      }
    });
  } catch (error) {
    console.error('Product SSR Error:', error);
    inertiaRender(req, res, 'Error', {
      meta: {
        title: 'Error',
        description: 'An error occurred while loading the product.'
      }
    });
  }
});

// Category page SSR
app.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    
    // Fetch products by category from Laravel backend
    const response = await fetch(`${LARAVEL_URL}/api/products?category=${encodeURIComponent(category)}&page=${page}&limit=20`);
    
    if (!response.ok) {
      return inertiaRender(req, res, 'NotFound', {
        meta: {
          title: 'Category Not Found',
          description: 'The requested category could not be found.'
        }
      });
    }
    
    const data = await response.json();
    
    inertiaRender(req, res, 'Category', {
      category,
      products: data.hits || [],
      pagination: {
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      },
      meta: {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Products | Looping`,
        description: `Browse our collection of ${category} products. Find the perfect ${category} merchandise at Looping.`
      }
    });
  } catch (error) {
    console.error('Category SSR Error:', error);
    inertiaRender(req, res, 'Error', {
      meta: {
        title: 'Error',
        description: 'An error occurred while loading the category.'
      }
    });
  }
});

// Search results page SSR
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category;
    const minPrice = req.query.min_price;
    const maxPrice = req.query.max_price;
    
    if (!query.trim()) {
      return inertiaRender(req, res, 'Search', {
        query: '',
        products: [],
        pagination: { currentPage: 1, totalPages: 0, total: 0 },
        meta: {
          title: 'Search Products | Looping',
          description: 'Search for products at Looping'
        }
      });
    }
    
    // Build search URL
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString()
    });
    
    if (category) searchParams.append('category', category);
    if (minPrice) searchParams.append('min_price', minPrice);
    if (maxPrice) searchParams.append('max_price', maxPrice);
    
    // Fetch search results from Laravel backend
    const response = await fetch(`${LARAVEL_URL}/api/search?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Search API failed');
    }
    
    const data = await response.json();
    
    inertiaRender(req, res, 'Search', {
      query,
      products: data.hits || [],
      filters: { category, minPrice, maxPrice },
      pagination: {
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      },
      meta: {
        title: `Search Results for "${query}" | Looping`,
        description: `Find ${data.total || 0} products matching "${query}" at Looping. Browse our collection and find exactly what you're looking for.`
      }
    });
  } catch (error) {
    console.error('Search SSR Error:', error);
    inertiaRender(req, res, 'Search', {
      query: req.query.q || '',
      products: [],
      pagination: { currentPage: 1, totalPages: 0, total: 0 },
      meta: {
        title: 'Search Error | Looping',
        description: 'An error occurred while searching for products.'
      }
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
