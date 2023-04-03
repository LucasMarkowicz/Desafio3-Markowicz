const { ObjectId } = require('../db/db.js');
const Cart = require("./models/cart.Models.js")


class CartManager {
 
  
    async createCart() {
      const result = await Cart.create({ products: [] });
      console.log(result, 'soy result')
      return result.insertedId;
    }

  async getCart(cid) {
    const cart = await Cart.findOne({ _id: new ObjectId(cid) });
    return cart ? cart : 'No se encuentra dicho producto';
  }

  async getFirstCart() {
    const carts = await getCartCollection();
    return await carts.findOne();
  }
  

  async addProductToCart(cid, product, quantity = 1) {
    const cart = await this.getCart(cid);
    const existingProduct = cart.products.find(p => p._id.toString() === product._id.toString());
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({...product, quantity});
    }
    await Cart.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
    return true;
  }
  

async removeProductFromCart(cid, pid) {
  const cart = await this.getCart(cid);
  const productToDelete = cart.products.find(p => p._id.toString() === pid);
  if (productToDelete) {
    await Cart.updateOne({ _id: new ObjectId(cid) }, { $pull: { products: { _id: new ObjectId(pid) } } });
    return true;
  } else {
    return false;
  }
}



  async updateProductQuantity(cid, productId, quantity) {
    const cart = await this.getCart(cid);

    if (!cart) {
      return false;
    }

    const existingProduct = cart.products.find(p => p.id === productId);
    if (existingProduct) {
      existingProduct.quantity = quantity;
      await Cart.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
      return true;
    } else {
      return false;
    }
  }

  async clearCart(cid) {
    const cart = await this.getCart(cid);

    if (!cart) {
      return false;
    }

    cart.products = [];
    await Cart.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
    return true;
  }
}

module.exports = CartManager;

