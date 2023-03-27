const { MongoClient, ObjectId } = require('mongodb');


class ProductManager {
  constructor() {
    this.connect();
  }

  async connect() {
    const uri = 'mongodb+srv://luckpelle1:coder123@webstore.wlii359.mongodb.net/test';
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      console.log('Connected to the database!');
      this.collection = client.db('webstore').collection('products');
    } catch (err) {
      console.error(err);
    }
  }

  async addProduct(title, description, price, thumbnail, code, stock, type) {
    const existingProduct = await this.collection.findOne({ code: code });
    if (existingProduct) {
      console.log('Ya existe un producto con ese código');
      return;
    }

    const product = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      type
    };

    await this.collection.insertOne(product);
    console.log('Producto agregado');
  }

  async getProducts() {
    const products = await this.collection.find({}).toArray();
    return products;
  }

  async getProductById(id) {
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    return product ? product : 'No se encuentra dicho producto';
  }

  async updateProduct(id, updates) {
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log('No se encuentra dicho producto');
      return;
    }

    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
    console.log('Producto actualizado');
  }

  async deleteProduct(id) {
    const product = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      console.log('No se encuentra dicho producto para ser eliminado');
      return;
    }

    await this.collection.deleteOne({ _id: new ObjectId(id) });
    console.log('Producto eliminado');
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
