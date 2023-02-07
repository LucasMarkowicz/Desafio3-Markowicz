const fs = require("fs");
const path = require('path');


class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.idCounter = 0;
    this.readProducts();
  }

  addProduct(id, title, description, price, thumbnail, code, stock) {
    if (!id || !title || !description || !price || !thumbnail || !code || !stock) {
      console.log("Todos los campos son obligatorios");
      return;
    }

    const existingProduct = this.products.find(p => p.code === code);
    if (existingProduct) {
      console.log("Ya existe un producto con ese código");
      return;
    }

    this.products.push({
      id: this.idCounter++,
      title,
      description,
      price,
      thumbnail,
      code,
      stock
    });

    this.writeProducts();
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find(p => p.id === id);
    return product ? product : "No se encuentra dicho producto";
  }

  updateProduct(id, field, value) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      console.log("No se encuentra dicho producto");
      return;
    }

    this.products[productIndex][field] = value;
    this.writeProducts();
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      console.log("No se encuentra dicho producto para ser eliminado");
      return;
    }

    this.products.splice(productIndex, 1);
    this.writeProducts();
  }

  readProducts() {
    try {
      const productsData = fs.readFileSync(this.path, "utf-8");
      this.products = JSON.parse(productsData);
      this.idCounter = this.products[this.products.length - 1].id + 1;
    } catch (err) {
      console.log("No se pudo leer el archivo de productos");
    }
  }

  writeProducts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products), "utf-8");
    } catch (err) {
      console.log("No se pudo escribir el archivo de productos");
    }
  }
}

module.exports = ProductManager;



/*
const manager = new ProductManager('products.json');
manager.addProduct('id', 'Remera', 'Roja', 1000, 'thumbnail', 'Remera01', 50);
manager.addProduct('id', 'Pantalon', 'Azul', 1200, 'thumbnail', 'Pantalon01', 20);
manager.addProduct('id', 'Zapatillas', 'Verdes', 1500, 'thumbnail', 'Zapatillas01', 30);
manager.addProduct('id', 'Buzo', 'Naranja', 1800, 'thumbnail', 'Buzo01', 50);
manager.addProduct('id', 'Remera', 'Negra', 1300, 'thumbnail', 'Remera02', 40);
manager.addProduct('id', 'Pantalon', 'Gris', 1400, 'thumbnail', 'Pantalon02', 25);
manager.addProduct('id', 'Zapatillas', 'Blancas', 1700, 'thumbnail', 'Zapatillas02', 35);
manager.addProduct('id', 'Buzo', 'Rojo', 2000, 'thumbnail', 'Buzo02', 60);
manager.addProduct('id', 'Remera', 'Amarilla', 1100, 'thumbnail', 'Remera03', 45);
manager.addProduct('id', 'Pantalon', 'Marrón', 1500, 'thumbnail', 'Pantalon03', 28);


// console.log(manager.getProducts());

// console.log(manager.getProductById(2));

// manager.updateProduct(2, 'description', 'Verdes Marca adidas');

// manager.deleteProduct(1);*/
