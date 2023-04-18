const { ObjectId } = require("../db/db.js");
const Cart = require("./models/cart.Models.js");
const ProductManager = require("./productManager.js");
const productDao = new ProductManager();

class CartManager {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart;
  }

  async getCart(cid) {
    try {
      const cart = await Cart.findById(cid).populate({
        path: "products.product",
        select: "name price image  thumbnail string code stock type",

        options: { lean: true },
      });
      return cart;
    } catch (error) {
      console.log(error);

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
        if (cart.products.length) {
          const productIndex = cart.products.findIndex((e) => e.product == pid);
          if (productIndex !== -1) {
            let updateQ = await Cart.updateOne(
              { _id: cid, "products.product": pid },
              { $inc: { "products.$.quantity": 1 } }
            );
            const updatedCart = await Cart.findById(cid).populate('products.product');
            return updatedCart;
          } else {
            const pushProduct = Cart.updateOne(
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
            await pushProduct;
            const updatedCart = await Cart.findById(cid).populate('products.product');
            return updatedCart;
          }
        } else {
          const pushProduct = Cart.updateOne(
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
          await pushProduct;
          const updatedCart = await Cart.findById(cid).populate('products.product');
          return updatedCart;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
   /* try {
      const productID = await product.getProductById(pid);
      const cart = await Cart.findById(cid);

      if (!cart) {
        return null;
      } else {
        const existingProduct = cart.products.find(
          (p) => p.product.toString() === pid
        );

        if (existingProduct) {
          await Cart.updateOne(
            { _id: cid, "products.product": pid },
            { $inc: { "products.$.quantity": 1 } }
          );
        } else {
          await Cart.updateOne(
            { _id: cid },
            {
              $push: {
                products: {
                  product: pid,
                  quantity: 1,
                  objeto: productID,
                },
              },
            }
          );
        }

        const updatedCart = await Cart.findById(cid);
        return updatedCart;
      }
    } catch (error) {
      console.log(error);
    }*/
  

  async removeProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex === -1) {
      throw new Error("Producto no encontrado en el carrito");
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
    }
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error("Cart not found");
    }
    cart.products.splice(0, cart.products.length);
    await cart.save();
    return cart;
  }
}

module.exports = CartManager;
