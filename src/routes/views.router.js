import express from "express";
import ProductManager from "../dao/db/product-manager-db.js";
import CartManager from "../dao/db/cart-manager-db.js";

const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Ruta principal
router.get("/", (req, res) => {
    res.render("home");
});

// Ruta para obtener productos con paginación y ordenamiento
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 5, sort = 'asc', query = '' } = req.query;
        const validSort = ['asc', 'desc'].includes(sort) ? sort : 'asc';

        const productos = await productManager.getProducts({
            page: parseInt(page),
            limit: parseInt(limit),
            query,
            sort: validSort,
        });

        const nuevoArray = productos.docs.map((producto) => {
            const rest = producto.toObject();
            return rest;
        });

        //console.log(nuevoArray);
        res.render("products", {
            productos: nuevoArray,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            currentPage: productos.page,
            totalPages: productos.totalPages,
        });
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
});

router.get("/products/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);

        if (!product) {
            res.status(404).json({
                status: "error",
                error: "Product not found",
            });
            return;
        }

        res.render("productsDetails", { product });
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
})



// Ruta para obtener productos ordenados en tiempo real
router.get("/realtimeproducts", async (req, res) => {
    try {
        const { sort = 'asc', query = '' } = req.query;
        const validSort = ['asc', 'desc'].includes(sort) ? sort : 'asc';

        const products = await productManager.getProducts(query);

        const sortedProducts = products.sort((a, b) => {
            return validSort === 'asc' ? a.precio - b.precio : b.precio - a.precio;
        });

        res.render('realtimeproducts', { products: sortedProducts });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Render add product page
router.get("/products/add", (req, res) => {
    res.render("addProduct");
});

router.get('/', async (req, res) => {
    try {
        // Obtén la información de todos los carritos
        const cartInfo = await cartManager.getAllCarts();

        // Renderiza la vista "carts" con la información de los carritos
        res.render('carts', { cartInfo });
    } catch (error) {
        console.error('Error retrieving carts:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
});

router.get('/carts', async (req, res) => {
    try {
        // Obtén todos los carritos desde el cartManager
        const carts = await cartManager.getAllCarts();

        // Si la vista no carga, verifica que `carts.handlebars` esté en la carpeta correcta
        res.render('carts', { carts });
    } catch (error) {
        console.error('Error retrieving carts:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        //console.log("Received cartId:", cartId);

        const cart = await cartManager.getCartById(cartId);
        //console.log("Fetched cart:", cart);

        if (!cart) {
            console.log("Cart not found.");
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        res.render('cartDetails', { cart });
    } catch (error) {
        console.error('Error retrieving cart details:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
});



// // Ruta para obtener carrito por ID
// router.get("/carts/:cid", async (req, res) => {
//     const cartId = req.params.cid;

//     try {
//         const carrito = await cartManager.getCarritoById(cartId);

//         if (!carrito) {
//             console.log("Cart with ID", cartId, "does not exist");
//             return res.status(404).json({ error: "Cart not found" });
//         }

//         const productosEnCarrito = carrito.products.map((item) => ({
//             product: item.product.toObject(),
//             quantity: item.quantity,
//         }));

//         res.render("carts", { productos: productosEnCarrito });
//     } catch (error) {
//         console.error("Error getting cart:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

export default router;
