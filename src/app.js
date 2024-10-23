import express from 'express';
import exphbs from 'express-handlebars';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import http from 'http';
import { Server } from 'socket.io';
import './database.js';
import ProductManager from './dao/db/product-manager-db.js';
import bodyParser from 'body-parser'; // Importar body-parser usando ES Modules

const PORT = process.env.PORT || 8080;
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Configuración de Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
});

// Registrar el helper para calcular el precio total
hbs.handlebars.registerHelper('calculateTotalPrice', function (products) {
    let total = 0;
    products.forEach(product => {
        total += product.quantity * product.product.price;
    });
    return total;
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./src/public'));

// Middleware para manejar JSON y datos del cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Montar routers de API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Montar rutas de vistas
app.use('/', viewsRouter);

app.use('/favicon.ico', (req, res) => res.status(204).end());


// Utiliza el router de carritos
app.use(cartsRouter);

// Manejo de WebSocket para actualizaciones en tiempo real
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sortProducts', async (data) => {
        const { sort } = data;
        try {
            const products = await ProductManager.getProducts();
            const sortedProducts = products.sort((a, b) => {
                if (sort === 'asc') {
                    return a.price - b.price;
                } else if (sort === 'desc') {
                    return b.price - a.price;
                } else {
                    return 0;
                }
            });
            socket.emit('updateProducts', sortedProducts);
        } catch (error) {
            console.error('Error sorting products:', error);
            socket.emit('updateProducts', { error: 'Error al obtener productos' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Manejo de rutas no encontradas
app.get('*', (req, res) => {
    res.status(400).send('Route not found');
});
