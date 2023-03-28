const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();


class CartManager {
  constructor() {
    this.connect();
  }

  async connect() {
    const uri = process.env.DB_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      console.log('Connected to the database!');
      this.collection = client.db('webstore').collection('carts');
    } catch (err) {
      console.error(err);
    }
  }

  async createCart() {
    const result = await this.collection.insertOne({ products: [] });
    return result.insertedId;
  }

  async getCart(cid) {
    const cart = await this.collection.findOne({ _id: new ObjectId(cid) });
    return cart ? cart : 'No se encuentra dicho producto';
  }

  async addProductToCart(cid, product, quantity = 1) {
    const cart = await this.getCart(cid);
    const existingProduct = cart.products.find(p => p._id.toString() === product._id.toString());
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({...product, quantity});
    }
    await this.collection.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
    return true;
  }
  

async removeProductFromCart(cid, pid) {
  const cart = await this.getCart(cid);
  const productToDelete = cart.products.find(p => p._id.toString() === pid);
  if (productToDelete) {
    await this.collection.updateOne({ _id: new ObjectId(cid) }, { $pull: { products: { _id: new ObjectId(pid) } } });
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
      await this.collection.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
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
    await this.collection.updateOne({ _id: new ObjectId(cid) }, { $set: { products: cart.products } });
    return true;
  }
}

module.exports = CartManager;

