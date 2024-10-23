import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";

class CartManager {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.log("Error creating new cart");
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId).populate('products.product', '_id title price');
            console.log('Cart found by ID');
            if (!cart) {
                console.log("Cart with the specified ID does not exist");
                return null;
            }
            return cart;
        } catch (error) {
            console.log("Error retrieving the cart", error);
            throw error;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                console.log(`Cart with ID ${cartId} not found`);
                return null;
            }

            const product = await ProductModel.findById(productId);
            if (!product) {
                console.log(`Product with ID ${productId} not found`);
                return null;
            }

            // Verifica si el producto ya está en el carrito
            const existingProductIndex = cart.products.findIndex(p => p.product.toString() === productId);

            if (existingProductIndex >= 0) {
                // Si el producto ya está en el carrito, incrementa la cantidad
                cart.products[existingProductIndex].quantity += 1;
            } else {
                // Si el producto no está en el carrito, agrégalo con cantidad 1
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            console.log('Product added to cart successfully');
            return cart;
        } catch (error) {
            console.error('Error adding product to cart:', error.message || error);
            throw error;
        }
    }

    async getAllCarts() {
        try {
            // Obtiene todos los carritos con detalles de productos
            const carts = await CartModel.find().populate('products.product', '_id title price');
            return carts.map(cart => ({
                id: cart._id,
                products: cart.products.map(p => ({
                    id: p.product._id,
                    title: p.product.title,
                    price: p.product.price,
                    quantity: p.quantity
                })),
                totalQuantity: cart.products.reduce((sum, p) => sum + p.quantity, 0) // Calcula la cantidad total de productos
            }));
        } catch (error) {
            console.error('Error retrieving carts:', error);
            throw new Error('Could not retrieve carts');
        }
    }

    async deleteItem(itemId, cartId) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                throw new Error('Cart not found');
            }

            const index = cart.products.findIndex(item => item.product.toString() === itemId.toString());

            if (index !== -1) {
                cart.products.splice(index, 1);
                await cart.save();
                console.log('Item removed from cart');
            } else {
                console.log('Item not found in cart');
            }
        } catch (error) {
            console.error('Error removing the item:', error);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await CartModel.findOneAndUpdate(
                { _id: cartId, "products.product": productId },
                { $set: { "products.$.quantity": quantity } },
                { new: true }
            ).populate('products.product');

            if (!cart) {
                console.log('Product not found in cart');
                throw new Error('Product not found in cart');
            }

            console.log('Product quantity updated');
            return cart;
        } catch (error) {
            console.log("Error updating product quantity", error);
            throw error;
        }
    }

    async emptyCart(cartId) {
        try {
            await CartModel.findByIdAndUpdate(
                cartId,
                { $set: { products: [] } },
                { new: true }
            );
            console.log('Cart emptied successfully');
        } catch (error) {
            console.log("Error emptying the cart", error);
            throw error;
        }
    }
}

export default CartManager;
