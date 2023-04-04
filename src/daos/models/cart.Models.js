const mongoose = require('mongoose');
const cartCollection = 'cart';

// const mongoosePaginate = require('mongoose-paginate-v2')
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
  this.populate("products.productId");
  next()
})
// cartSchema.pre('find', function () {
//   this.po


const Cart = mongoose.model(cartCollection, cartSchema);
module.exports = Cart