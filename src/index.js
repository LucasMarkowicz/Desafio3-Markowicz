const express = require('express');
const { engine } = require('express-handlebars');
const ProductManager = require('./productManager.js');
const CartManager = require('./cartManager.js');
const app = express();
const port = 8080;

const manager = new ProductManager('./products.json');
const cartManager = new CartManager('./carts.json');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');


//endpoint home
app.get('/', (req, res) => {
  const products = manager.getProducts();
  res.render('home', { products });
});

app.use(express.json());

//endpoint products
app.get('/api/products', (req, res) => {
  let limit;
  if (req.query.limit) {
    limit = parseInt(req.query.limit);
  } else {
    limit = undefined;
  }
  const products = manager.getProducts();
  if (limit) {
    res.json({ products: products.slice(0, limit) });
  } else {
    res.json({ products: products });  }
});

app.get('/api/products/:pid', (req, res) => {
  const pid = parseInt(req.params.pid);
  const products = manager.getProducts();
  const product = products.find(p => p.id === pid);
  if (product) {
    res.json({ product });
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

app.post('/api/products', (req, res) => {
  const { title, description, price, thumbnail, code, stock } = req.body;
  manager.addProduct(manager.idCounter, title, description, price, thumbnail, code, stock);
  res.send("Producto agregado exitosamente");
});

app.put('/api/products/:pid', (req, res) => {
    const pid = parseInt(req.params.pid);
    const products = manager.getProducts();
    const productIndex = products.findIndex(p => p.id === pid);
    if (productIndex === -1) {
      res.status(404).send('Producto no encontrado');
    } else {
      const updatedProduct = {
        ...products[productIndex],
        ...req.body,
      };
      manager.updateProduct(pid, updatedProduct);
      res.send("Producto actualizado exitosamente");
    }
  });
  

app.delete('/api/products/:pid', (req, res) => {
  const pid = parseInt(req.params.pid);
  const products = manager.getProducts();
  const productIndex = products.findIndex(p => p.id === pid);
  if (productIndex === -1) {
    res.status(404).send('Producto no encontrado');
  } else {
    manager.deleteProduct(pid);
    res.send("Producto eliminado exitosamente");
  }
});

//endpoints carrito

app.post('/api/carts/', (req, res) => {
    const newCart = cartManager.addCart();
    res.status(201).json({
      message: "Cart created successfully",
      cart: newCart
    });
  });  

  app.get('/api/carts/:cid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const cart = cartManager.getCart(cid);
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }
    res.json({
      cart: cart
    });
  });

  app.post('/api/carts/:cid/products/:pid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const quantity = 1;
    if (cartManager.addProductToCart(cid, pid, quantity)) {
      res.send("Producto agregado exitosamente");
    } else {
      res.status(404).send("No se encontró el carrito o el producto");
    }
  });

  //websockets
  const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);


io.on('connection', socket => {
  console.log('Cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/realtimeproducts', (req, res) => {
  const products = manager.getProducts();
  res.render('realTimeProducts', { products });
});

server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

