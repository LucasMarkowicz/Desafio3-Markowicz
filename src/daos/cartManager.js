const { ObjectId } = require("../db/db.js");
const Cart = require("./models/cart.Models.js");
const ProductManager = require("./productManager.js");
const productDao = new ProductManager();
const cartErrors = require("../errors/cartErrors.js");


class CartManager {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart;
  }

  async getCart(cid) {
    try {
      const cart = await Cart.findById(cid).populate({
        path: "products.product",
        select: "title description price thumbnail code stock category",
        options: { lean: true },
      });
      return cart;
    } catch (error) {
      console.log(error);
      throw new Error(cartErrors.GENERAL_ERROR);


      /*const cart = await Cart.findOne({ _id: new ObjectId(cid) });
    if (cart) {
      return cart;
    } else {
      throw new Error("No se encuentra dicho producto");
    */
    }
  }

  async getFirstCart() {
    const carts = await getCartCollection();
    return await carts.findOne();
  }
  async addProductToCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        return cart;
      } else {
        const product = await productDao.getProductById(pid);
        if (!product) {
          return product;
        }
        const productIndex = cart.products.findIndex((e) => e.product == pid);
        const productStock = product.stock;

        if (productStock === 0) {
          throw new Error(cartErrors.OUT_OF_STOCK);
        }

        if (productIndex !== -1) {
          const cartProduct = cart.products[productIndex];
          const productQuantity = cartProduct.quantity;
          console.log("soy productQuantity", productQuantity);
          console.log("soy productStock", productStock);

          if (productQuantity >= productStock) {
            throw new Error(cartErrors.QUANTITY_EXCEEDS_STOCK);
          } else {
            await Cart.updateOne(
              { _id: cid, "products.product": pid },
              { $inc: { "products.$.quantity": 1 } }
            );
          }
        } else {
          await Cart.updateOne(
            { _id: cid },
            {
              $push: {
                products: {
                  product: product._id,
                  quantity: 1,
                },
              },
            }
          );
        }
        const updatedCart = await Cart.findById(cid).populate(
          "products.product"
        );
        return updatedCart;
      }
    } catch (error) {
      console.log(error);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async removeProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(cartErrors.CART_NOT_FOUND);
    }
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex === -1) {
      throw new Error(cartErrors.PRODUCT_NOT_FOUND);
    }
    cart.products.splice(productIndex, 1);
    await cart.save();
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await Cart.findById(cid);

      if (!cart) {
        return null;
      } else {
        await Cart.updateOne(
          { _id: cid, "products.product": pid },
          { $set: { "products.$.quantity": quantity } }
        );

        const updatedCart = await Cart.findById(cid);
        return updatedCart;
      }
    } catch (error) {
      console.log(error);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(cartErrors.CART_NOT_FOUND);
    }
    cart.products.splice(0, cart.products.length);
    await cart.save();
    return cart;
  }
}

module.exports = CartManager;
