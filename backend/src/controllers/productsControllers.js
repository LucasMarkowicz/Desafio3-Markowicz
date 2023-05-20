const { Router } = require("express")
const router = Router()
const ProductManager = require("../daos/productManager.js");
const manager = new ProductManager();
const { requireLogin } = require("../middlewares/requireLogin.js");
const productErrors = require("../errors/productErrors.js");



// endpoint products
router.get("/", requireLogin, async (req, res) => {
  const { email, role } = req.session.user;
  console.log("soy req.session", req.session)
  console.log("soy req.session.user", req.session.user)
  try {
    const { limit = 4, page = 1, sort="", query="" } = req.query;

    const allProducts = await manager.getProducts();

    const filteredProducts = query
      ? allProducts.filter((product) => product.category === query)
      : allProducts;

    const sortedProducts =
      sort === "desc"
        ? filteredProducts.sort((a, b) => b.price - a.price)
        : sort === "asc"
        ? filteredProducts.sort((a, b) => a.price - b.price)
        : filteredProducts;

    const totalPages = Math.ceil(sortedProducts.length / limit);

    const products = sortedProducts
      .slice((page - 1) * limit, page * limit)
      .map(product => product.toObject());

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const prevLink = hasPrevPage ? `/api/products/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
    const nextLink = hasNextPage ? `/api/products/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;

    res.render("home", {
      status: "success",
      message: `Bienvenido, ${email}. Rol: ${role}`,
      products,
      totalPages,
      page: parseInt(page),
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(productErrors.PRODUCT_LIST_ERROR);
  }
});

router.get("/json", async (req, res) => {
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
      res.status(404).send(productErrors.PRODUCT_NOT_FOUND);
    }
  });
  
  router.post("/", async (req, res) => {
    const { title, description, price, thumbnail, code, stock, category } = req.body;
    const newProduct = await manager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category
    );
    res.send("Producto agregado exitosamente");
    //io.emit("addProduct", newProduct);
  });
  
  router.put("/:pid", async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (!product) {
      res.status(404).send(productErrors.PRODUCT_NOT_FOUND);
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
      res.status(404).send(productErrors.PRODUCT_NOT_FOUND);
    } else {
      await manager.deleteProduct(pid);
      res.send("Producto eliminado exitosamente");
      io.emit("deleteProduct", pid);
    }
  });


  module.exports = router