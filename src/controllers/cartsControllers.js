const { Router } = require("express")
const router = Router()
const CartManager = require("../daos/cartManager.js");
const ProductManager = require("../daos/productManager.js")
const cartManager = new CartManager();
const manager = new ProductManager();

//endpoints carrito

router.post("/", (req, res) => {
    const newCart = cartManager.createCart();
    res.status(201).json({
      message: "Cart created successfully",
      cart: newCart,
    });
  });
  
  router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCart(cid);
    if (cart) {
      const data = {
        cartId: cart._id,
        products: cart.products
      };
      res.render('carts', { data });
    } else {
      res.status(404).send('Cart not found');
    }
  });
  
  
  
  /*router.get("/:cid", async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCart(cid);
    if (cart) {
      res.json({ cart });
    } else {
      res.status(404).send("Carrito no encontrado");
    }
  });*/
  
  router.post("/:cid/products/:pid", async (req, res) => {
    try {
        
        const { cid, pid } = req.params;
        const respuesta = await cartManager.addProductToCart(cid, pid);
        if (!respuesta) {
            res.json({ mensage: "Carrito no encontrado" })
        }
        else {
            res.json(respuesta)
        }
    } catch (error) {
        console.log(error)
    
  }})
  
  
  
  router.delete("/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const result = await cartManager.removeProductFromCart(cid, pid);
    if (result) {
      res.send("Product removed successfully");
    } else {
      res.status(404).send("Product not found in cart");
    }
  });
  
  
  
  router.put('/:cid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const products = req.body;
    const success = cartManager.updateProductQuantity(cid, products);
    if (success) {
      res.send(`Cart ${cid} updated successfully`);
    } else {
      res.status(404).send(`Cart ${cid} not found`);
    }
  });
  
  router.put('/:cid/products/:pid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const quantity = parseInt(req.body.quantity);
    const success = cartManager.updateProductQuantity(cid, pid, quantity);
    if (success) {
      res.send(`Cantidad de producto ${pid} en carrito ${cid} actualizada exitosamente`);
    } else {
      res.status(404).send(`No se encontró el carrito ${cid} o el producto ${pid}`);
    }
  });
  
  router.delete('/:cid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const success = cartManager.clearCart(cid);
    if (success) {
      res.send(`Carrito ${cid} eliminado exitosamente`);
    } else {
      res.status(404).send(`No se encontró el carrito ${cid}`);
    }
  });

  module.exports = router