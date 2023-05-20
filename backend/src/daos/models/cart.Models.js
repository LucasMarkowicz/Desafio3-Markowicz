const mongoose = require('mongoose');
const cartCollection = 'cart';

const cartSchema = new mongoose.Schema({
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
          
        },
        objeto: {
          type: Object,
        },
        quantity: Number,
      }
    ],
    default: [],
    _id: false
  }
})
cartSchema.pre("find",function(next){
  this.populate({
    path: "products.product",
    options: { strictPopulate: false }
  });
  next()
})


const Cart = mongoose.model(cartCollection, cartSchema);
module.exports = Cart