const express = require('express');
const ProductManager = require('./productManager.js');

const manager = new ProductManager('../products.json');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send("Bienvenido a la página principal");
});

app.get('/products', (req, res) => {
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
        res.json({ products: products });
    }
});

app.get('/products/:pid', (req, res) => {
    const pid = parseInt(req.params.pid);
    const products = manager.getProducts();
    const product = products.find(p => p.id === pid);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  });
  

app.listen(port, () => {
console.log(`Server executed on http://localhost:${port}`);
});




