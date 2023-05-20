const User = require("../daos/models/user.Models.js");
const CartManager = require("../daos/cartManager.js");
const cartM = new CartManager();

async function cartVerification(req, res, next){
    const {email} = req.session.user
    if(!req.session.user.hasOwnProperty("associatedCart" || req.session.user.associatedCart._id === null)){
        const cartCreated = await cartM.createCart()
        req.session.user.associatedCart = cartCreated
        console.log("soy req.session.user.associatedCart._id", req.session.user.associatedCart._id);
        console.log("soy cartCreated", cartCreated);
        const users = await User.findOneAndUpdate({email}, {associatedCart: cartCreated.id}, {new: true})
    }
    console.log("soy email", email)
    next()
}

module.exports = {cartVerification}