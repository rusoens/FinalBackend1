import express from "express";
import CartManager from "../dao/db/cart-manager-db.js";

const router = express.Router();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts(); // Asume que `getAllCarts` es un método que devuelve todos los carritos
        res.json(carts);
    } catch (error) {
        console.error('Error fetching carts', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Endpoint para obtener todos los carritos
router.get('/carts', async (req, res) => {
    try {
        const carts = await CartManager.getAllCarts();
        res.json(carts); // Devuelve los carritos en formato JSON
    } catch (error) {
        console.error('Error fetching carts:', error);
        res.status(500).json({ error: 'Error fetching carts' });
    }
});

// Ruta para la vista específica de un carrito
router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        const cartDetails = {
            id: cart._id,
            totalQuantity: cart.products.reduce((total, item) => total + item.quantity, 0),
            products: cart.products.map(item => ({
                id: item.productId._id,
                title: item.productId.title,
                price: item.productId.price,
                quantity: item.quantity
            }))
        };

        res.render('cartDetails', { cart: cartDetails });
    } catch (error) {
        console.error('Error retrieving cart details:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
});

// Ruta para obtener todos los carritos en formato JSON
// router.get('/api/carts', async (req, res) => {
//     try {
//         const carts = await cartManager.getAllCarts();

//         // Estructura los datos para que incluyan la cantidad total de productos en cada carrito
//         const cartData = carts.map(cart => ({
//             id: cart._id,
//             products: cart.products.map(item => ({
//                 id: item.productId._id,
//                 title: item.productId.title,
//                 price: item.productId.price,
//                 quantity: item.quantity
//             })),
//             totalQuantity: cart.products.reduce((total, item) => total + item.quantity, 0)
//         }));

//         res.json(cartData);
//     } catch (error) {
//         console.error('Error retrieving carts:', error);
//         res.status(500).json({ message: 'Internal server error' });                           
//     }
// });

router.get('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching carts' });
    }
});

router.get('/api/carts/:id', async (req, res) => {
    const cartId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: 'Invalid cart ID' });
    }

    // Continúa con la búsqueda si el ID es válido
});

// Ruta para obtener un carrito específico en formato JSON
router.get('/api/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Estructura los datos del carrito específico
        const cartDetails = {
            id: cart._id,
            totalQuantity: cart.products.reduce((total, item) => total + item.quantity, 0),
            products: cart.products.map(item => ({
                id: item.productId._id,
                title: item.productId.title,
                price: item.productId.price,
                quantity: item.quantity
            }))
        };

        res.json(cartDetails);
    } catch (error) {
        console.error('Error retrieving cart details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Crear un nuevo carrito
router.post("/", async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error creating a new cart", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Listar productos en un carrito específico
router.get("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const cart = await cartManager.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        res.json(cart.products);
    } catch (error) {
        console.error("Error getting the cart", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Agregar productos a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error adding product to cart", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Vaciar un carrito
router.delete("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        await cartManager.emptyCart(cartId);
        res.json({ message: "Cart emptied successfully" });
    } catch (error) {
        console.error(`Error trying to empty cart with ID: ${cartId}`, error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Eliminar un producto específico de un carrito
router.delete("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        await cartManager.deleteItem(productId, cartId);
        res.json({ message: "Product removed from cart" });
    } catch (error) {
        console.error("Error deleting product from cart", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Actualizar la cantidad de un producto en un carrito
router.put("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
    }

    try {
        const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error updating product quantity in cart", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Actualizar el carrito con un array de productos
router.put("/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const newProducts = req.body.products;

    try {
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.products = newProducts;
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error("Error updating the cart", error);
        res.status(500).json({ error: "Error updating the cart" });
    }
});

// Endpoint para agregar un producto al carrito
router.post('/addProduct', async (req, res) => {
    try {
        const { productId, cartId } = req.body;

        // Verifica que se estén recibiendo los datos correctamente
        console.log(`Received productId: ${productId}, cartId: ${cartId}`);

        if (!productId || !cartId) {
            console.log('Product ID and Cart ID are required');
            return res.status(400).json({ error: 'Product ID and Cart ID are required' });
        }

        // Llama al método del CartManager y captura cualquier posible error
        const result = await cartManager.addProductToCart(cartId, productId);

        if (!result) {
            console.log('Failed to add product to cart');
            return res.status(400).json({ error: 'Error adding product to cart' });
        }

        return res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        // Captura el error específico y lo muestra en la consola
        console.error('Detailed error:', error.message || error);
        return res.status(500).json({ error: 'Error adding product to cart' });
    }
});


export default router;
