const { ObjectId } = require("../db/db.js");
const Cart = require("./models/cart.Models.js");
const ProductManager = require('./productManager.js')
const product = new ProductManager()

class CartManager {
  async createCart() {
    const result = await Cart.create({ products: [] });
    console.log(result, "soy result");
    return result.insertedId;
  }

  async getCart(cid) {
    const cart = await Cart.findOne({ _id: new ObjectId(cid) });
    if (cart) {
      return cart;
    } else {
      throw new Error("No se encuentra dicho producto");
    }
  }

  async getFirstCart() {
    const carts = await getCartCollection();
    return await carts.findOne();
  }

  async addProductToCart(cid, pid) {
    try {
      const productID = await product.getProductById(pid);
      console.log(productID);
      const cart = await Cart.findById(cid);
      console.log("primer log", cart);
      if (!cart) {
        return cart;
      } else {
        if (cart.products.length) {
          const productIndex = cart.products.findIndex((e) => e.product == pid);
          console.log(productIndex);

          if (productIndex !== -1) {
            let updateQ = await Cart.updateOne(
              { _id: cid, "products.productId": pid },
              { $inc: { "products.$.quantity": 1 } }
            );
            return updateQ;
          } else {
            const pushProduct = Cart.updateOne(
              { _id: cid },
              {
                $push: {
                  products: {
                    productId: pid,
                    quantity: 1,
                    objeto: productID,
                  },
                },
              }
            );
            return pushProduct;
          }
        } else {
          {
            const pushProduct = Cart.updateOne(
              { _id: cid },
              {
                $push: {
                  products: {
                    productId: pid,
                    quantity: 1,
                    objeto: productID,
                  },
                },
              }
            );

            return pushProduct;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async removeProductFromCart(cid, pid) {
    const cart = await this.getCart(cid);
    const productToDelete = cart.products.find((p) => p._id.toString() === pid);
    if (productToDelete) {
      await Cart.updateOne(
        { _id: new ObjectId(cid) },
        { $pull: { products: { _id: new ObjectId(pid) } } }
      );
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

    const existingProduct = cart.products.find((p) => p.id === productId);
    if (existingProduct) {
      existingProduct.quantity = quantity;
      await Cart.updateOne(
        { _id: new ObjectId(cid) },
        { $set: { products: cart.products } }
      );
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
    await Cart.updateOne(
      { _id: new ObjectId(cid) },
      { $set: { products: cart.products } }
    );
    return true;
  }
}

module.exports = CartManager;
