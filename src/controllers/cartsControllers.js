const { Router } = require("express")
const router = Router()
const CartManager = require("../daos/cartManager.js");
const ProductManager = require("../daos/productManager.js")
const cartManager = new CartManager();
const productManager = new ProductManager();
const {cartVerification} = require("../middlewares/cartVerification.js");
const Ticket = require('../daos/models/ticket.Models.js');
const Cart = require('../daos/models/cart.Models')
const User = require('../daos/models/user.Models')
const Product = require('../daos/models/product.Models')
const accessRole = require('../middlewares/accessRole');




// endpoints carrito

router.post("/", cartVerification, async (req, res) => {
  //const newCart = await cartManager.createCart();
  console.log("soy req.session.user", req.session.user)
  const cartId = req.session.user.associatedCart._id
  console.log("soy cartId de cartsControllers", cartId)
  res.status(200).json({
    cartId
    //cart: newCart._id.toString()
  });
});


router.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCart(cid);
    if (cart) {
      const cartProducts = cart.products
      const productArray = cartProducts.map(({ product: { _id, ...rest } }) => rest);
      console.log("soy productArray", productArray);
      //const firstProduct = cartProducts[0].product;
      res.render("cart", {productArray});
      console.log("soy cartProducts", cartProducts);
      //console.log(firstProduct)
    } else {
      res.status(404).send('Cart not found');
    }
  }
  catch(e){
    console.log(e)
  }})

/*router.get('/:cid', async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCart(cid);
  if (cart) {
    const cartProducts = cart.products
    //const firstProduct = cartProducts[0].product;
    res.json(cartProducts);
    //res.render("cart", cartProducts);
    console.log(cartProducts);
    //console.log(firstProduct)
  } else {
    res.status(404).send('Cart not found');
  }
});*/

router.post("/:cid/products/:pid", accessRole('user'), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (updatedCart) {
      res.send(updatedCart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    res.json(updatedCart);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  const cid = req.params.cid;
  try {
    const updatedCart = await cartManager.clearCart(cid);
    res.json(updatedCart);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});



router.post('/:cid/purchase', async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: 'El carrito no existe' });
    }

    const user = await User.findOne({ associatedCart: String(cid) });
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    const purchaser = user.email;

    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.product._id);
      if (!product || product.stock < cartProduct.quantity) {
        return res.status(400).json({ error: `El producto ${cartProduct.product._id} no tiene suficiente stock` });
      }
    }

    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.product._id);
      product.stock -= cartProduct.quantity;
      await product.save();
    }

    const code = Math.random().toString(36).substr(2, 10);    ;
    const products = cart.toObject().products;
    const ticket = new Ticket({ code, purchaser, products });
    await ticket.save();

    await Cart.findByIdAndUpdate(cid, { products: [] });

    res.json({ message: 'Compra realizada con éxito', ticket });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});




module.exports = router;
