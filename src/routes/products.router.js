import express from 'express';
import CartManager from '../dao/db/cart-manager-db.js'; // Ajusta la ruta según tu estructura
import ProductManager from '../dao/db/product-manager-db.js'; // Ajusta la ruta según tu estructura

const router = express.Router();
const cartManager = new CartManager(); // Instancia de CartManager
const productManager = new ProductManager(); // Instancia de ProductManager

// Endpoint para obtener productos con paginación, orden y filtrado
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = 'asc', query = '' } = req.query;

        const products = await productManager.getProducts({
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query,
        });

        res.json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink,
        });

    } catch (error) {
        console.error("Error getting products", error);
        res.status(500).json({
            status: 'error',
            error: "Internal server error"
        });
    }
});

// Endpoint para obtener un producto específico por ID
router.get('/:pid', async (req, res) => {
    const id = req.params.pid;

    try {
        const product = await productManager.getProductById(id);
        if (!product) {
            return res.json({
                error: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        console.error("Error getting product", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Endpoint para agregar un producto
router.post('/', async (req, res) => {
    const newProduct = req.body;

    try {
        await productManager.addProduct(newProduct);
        res.status(201).json({
            message: "Product added successfully"
        });
    } catch (error) {
        console.error("Error adding product", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Endpoint para actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    const id = req.params.pid;
    const updatedProduct = req.body;

    try {
        await productManager.updateProduct(id, updatedProduct);
        res.json({
            message: "Product updated successfully"
        });
    } catch (error) {
        console.error("Error updating product", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Endpoint para eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    const id = req.params.pid;

    try {
        await productManager.deleteProduct(id);
        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Endpoint para agregar un producto al carrito
router.post('/addProduct', async (req, res) => {
    const { productId, cartId } = req.body;
    
    if (!productId || !cartId) {
        return res.status(400).json({ error: 'Product ID and Cart ID are required' });
    }

    try {
        // Verificar si el carrito existe
        const cart = await cartManager.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Verificar si el producto existe
        const product = await productManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Agregar producto al carrito
        await cartManager.addProductToCart(cartId, productId);

        res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
