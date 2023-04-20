const { Router } = require("express")
const router = Router()
const CartManager = require("../daos/cartManager.js");
const ProductManager = require("../daos/productManager.js")
const cartManager = new CartManager();
const productManager = new ProductManager();

// endpoints carrito

router.post("/", async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json({
    cart: newCart._id.toString()
  });
});

router.get('/:cid', async (req, res) => {
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
});

router.post("/:cid/products/:pid", async (req, res) => {
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





module.exports = router;
