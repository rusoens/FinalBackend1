import ProductModel from "../models/product.model.js";

class ProductManager {

    async addProduct({ title, description, price, img, code, stock, category, thumbnails }) {
        try {
            // Validación de campos obligatorios
            if (!title || !description || !price || !code || !stock || !category) {
                console.log("All fields are mandatory");
                return;
            }

            // Verificación de unicidad del código del producto
            const existingProduct = await ProductModel.findOne({ code: code });
            if (existingProduct) {
                console.log("Product code must be unique");
                return;
            }

            // Creación del nuevo producto
            const newProduct = new ProductModel({
                title,
                description,
                price,
                img,
                code,
                stock,
                category,
                status: true,
                thumbnails: thumbnails || []
            });

            await newProduct.save();
            console.log("Product added successfully");

        } catch (error) {
            console.log("Error adding product", error);
            throw error;
        }
    }

    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            const skip = (page - 1) * limit;

            // Opciones de consulta para filtro por categoría o estado
            let queryOptions = {};
            if (query) {
                queryOptions = {
                    $or: [
                        { category: { $regex: query, $options: "i" } },
                        { status: query.toLowerCase() === 'available' ? true : false }
                    ]
                };
            }

            // Opciones de ordenamiento
            const sortOptions = {};
            if (sort) {
                if (sort === 'asc' || sort === 'desc') {
                    sortOptions.price = sort === 'asc' ? 1 : -1;
                }
            }

            // Consulta a la base de datos
            const products = await ProductModel
                .find(queryOptions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

            // Contar productos totales
            const totalProducts = await ProductModel.countDocuments(queryOptions);

            const totalPages = Math.ceil(totalProducts / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;

            return {
                docs: products,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
                nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
            };
        } catch (error) {
            console.log("Error getting products", error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id);
            if (!product) {
                console.log("Product not found");
                return null;
            }
            console.log("Product found!");
            return product;
        } catch (error) {
            console.log("Error getting product by id", error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const updated = await ProductModel.findByIdAndUpdate(id, updatedProduct, { new: true });
            if (!updated) {
                console.log("Product not found");
                return null;
            }
            console.log("Product successfully updated");
            return updated;
        } catch (error) {
            console.log("Error updating product", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const deleted = await ProductModel.findByIdAndDelete(id);
            if (!deleted) {
                console.log("Product not found");
                return null;
            }
            console.log("Product successfully deleted!");
        } catch (error) {
            console.log("Error deleting product", error);
            throw error;
        }
    }
}

export default ProductManager;
