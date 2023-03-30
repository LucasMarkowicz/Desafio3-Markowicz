const { Router } = require("express")
const router = Router()
const ProductManager = require("../daos/productManager.js");
const manager = new ProductManager();


// endpoint products
router.get("/", async (req, res) => {
    let limit;
    if (req.query.limit) {
      limit = parseInt(req.query.limit);
    } else {
      limit = undefined;
    }
    const products = await manager.getProducts();
    if (limit) {
      res.json({ products: products.slice(0, limit) });
    } else {
      res.json({ products: products });
    }
  });
  
  router.get("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).send("Producto no encontrado");
    }
  });
  
  router.post("/", async (req, res) => {
    const { title, description, price, thumbnail, code, stock, type } = req.body;
    const newProduct = await manager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      type
    );
    res.send("Producto agregado exitosamente");
    io.emit("addProduct", newProduct);
  });
  
  router.put("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (!product) {
      res.status(404).send("Producto no encontrado");
    } else {
      const updatedProduct = { ...product, ...req.body };
      await manager.updateProduct(pid, updatedProduct);
      res.send("Producto actualizado exitosamente");
    }
  });
  
  router.delete("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (!product) {
      res.status(404).send("Producto no encontrado");
    } else {
      await manager.deleteProduct(pid);
      res.send("Producto eliminado exitosamente");
      io.emit("deleteProduct", pid);
    }
  });

  module.exports = router