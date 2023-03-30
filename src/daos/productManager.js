const { connect, getConnection, ObjectId} = require('../db/db.js');


class ProductManager {
  constructor() {
    connect();
    this.collection = getConnection().collection('products');  
  }

  async addProduct(title, description, price, thumbnail, code, stock, type) {
    const existingProduct = await this.collection.findOne({ code: code });
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

    await this.collection.insertOne(product);
    console.log("Producto agregado");
  }

  async getProducts() {
    const products = await this.collection.find({}).toArray();
    return products;
  }

  async getProductById(pid) {
    const result = await this.collection.findOne({ _id: new ObjectId(pid) });
    return result ? result : null;
  }

  async updateProduct(id, updates) {
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log("No se encuentra dicho producto");
      return;
    }

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    console.log("Producto actualizado");
  }

  async deleteProduct(id) {
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log("No se encuentra dicho producto para ser eliminado");
      return;
    }

    await this.collection.deleteOne({ _id: new ObjectId(id) });
    console.log("Producto eliminado");
  }
}

module.exports = ProductManager;


