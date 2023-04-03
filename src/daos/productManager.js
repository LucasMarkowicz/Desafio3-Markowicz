const { ObjectId} = require('../db/db.js');
const Product = require("./models/product.Models.js")

class ProductManager {
  
  async addProduct(title, description, price, thumbnail, code, stock, type) {
    const existingProduct = await Product.findOne({ code: code });
    if (existingProduct) {
      console.log("Ya existe un producto con ese código");
      return;
    }

    const product = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      type,
    };

    await Product.create(product);
    console.log("Producto agregado");
  }

  async getProducts() {
    try{
    const products = await Product.find({});
    return products;
    } catch(e){
      console.log(e);
    }
  }

  async getProductById(pid) {
    const result = await Product.findOne({ _id: new ObjectId(pid) });
    return result ? result : null;
  }

  async updateProduct(id, updates) {
    const product = await Product.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log("No se encuentra dicho producto");
      return;
    }

    await Product.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    console.log("Producto actualizado");
  }

  async deleteProduct(id) {
    const product = await Product.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log("No se encuentra dicho producto para ser eliminado");
      return;
    }

    await Product.deleteOne({ _id: new ObjectId(id) });
    console.log("Producto eliminado");
  }
}

module.exports = ProductManager;


