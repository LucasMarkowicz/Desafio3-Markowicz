const fs = require("fs");
const path = require('path');

class CartManager {
  constructor(path) {
    this.path = path;
    this.carts = [];
    this.idCounter = 1;
    this.readCarts();
  }

  readCarts() {
    try {
      this.carts = JSON.parse(fs.readFileSync(this.path).toString());
      if (this.carts.length > 0) {
        this.idCounter = Math.max(...this.carts.map(cart => cart.id)) + 1;
      }
    } catch (error) {
      console.error(error);
    }
  }

  writeCarts() {
    fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
  }

  addCart() {
    this.carts.push({
        id: this.carts.length + 1,
        products: []
      });
    this.writeCarts();
  }

  getCart(cid) {
    return this.carts.find(cart => cart.id === cid);
  }

  addProductToCart(cid, pid, quantity) {
    const cart = this.getCart(cid);
    if (!cart) {
      return false;
    }

    const existingProduct = cart.products.find(product => product.id === pid);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ id: pid, quantity: 1 });
    }

    this.writeCarts();
    return true;
  }
}

module.exports = CartManager;
