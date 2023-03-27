const http = require("http");
const express = require("express");
const { engine } = require("express-handlebars");
const ProductManager = require("./productManager.js");
const CartManager = require("./cartManager.js");
const app = express();
const port = 8080;

const server = http.createServer(app);
const io = require("socket.io")(server);

const manager = new ProductManager();
const cartManager = new CartManager("./carts.json");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// endpoint home
app.get("/", async (req, res) => {
  try {
    const { limit = 3, page = 1, sort, query } = req.query;

    const allProducts = await manager.getProducts();

    const filteredProducts = query
      ? allProducts.filter((product) => product.type === query)
      : allProducts;

    const sortedProducts =
      sort === "desc"
        ? filteredProducts.sort((a, b) => b.price - a.price)
        : sort === "asc"
        ? filteredProducts.sort((a, b) => a.price - b.price)
        : filteredProducts;

    const totalPages = Math.ceil(sortedProducts.length / limit);

    const products = sortedProducts.slice((page - 1) * limit, page * limit);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const prevLink = hasPrevPage ? `/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
    const nextLink = hasNextPage ? `/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;

    res.render("home", {
      status: "success",
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
    res.status(500).send("Error al obtener la lista de productos");
  }
});


// endpoint products
app.get("/api/products", async (req, res) => {
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

app.get("/api/products/:pid", async (req, res) => {
  const pid = req.params.pid;
  const product = await manager.getProductById(pid);
  if (product) {
    res.json({ product });
  } else {
    res.status(404).send("Producto no encontrado");
  }
});

app.post("/api/products", async (req, res) => {
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

app.put("/api/products/:pid", async (req, res) => {
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

app.delete("/api/products/:pid", async (req, res) => {
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

//endpoints carrito

app.post("/api/carts/", (req, res) => {
  const newCart = cartManager.addCart();
  res.status(201).json({
    message: "Cart created successfully",
    cart: newCart,
  });
});

app.get("/api/carts/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const cart = cartManager.getCart(cid);
  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
    });
  }
  res.json({
    cart: cart,
  });
});

app.post("/api/carts/:cid/products/:pid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const quantity = 1;
  if (cartManager.addProductToCart(cid, pid, quantity)) {
    res.send("Producto agregado exitosamente");
  } else {
    res.status(404).send("No se encontró el carrito o el producto");
  }
});

app.delete('/api/carts/:cid/products/:pid', (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const success = cartManager.removeProductFromCart(cid, pid);
  if (success) {
    res.send(`Producto ${pid} eliminado del carrito ${cid} exitosamente`);
  } else {
    res.status(404).send(`No se encontró el carrito ${cid} o el producto ${pid}`);
  }
});

app.put('/api/carts/:cid', (req, res) => {
  const cid = parseInt(req.params.cid);
  const products = req.body;
  const success = cartManager.updateCart(cid, products);
  if (success) {
    res.send(`Carrito ${cid} actualizado exitosamente`);
  } else {
    res.status(404).send(`No se encontró el carrito ${cid}`);
  }
});

app.put('/api/carts/:cid/products/:pid', (req, res) => {
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

app.delete('/api/carts/:cid', (req, res) => {
  const cid = parseInt(req.params.cid);
  const success = cartManager.clearCart(cid);
  if (success) {
    res.send(`Carrito ${cid} eliminado exitosamente`);
  } else {
    res.status(404).send(`No se encontró el carrito ${cid}`);
  }
});


//websockets

io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.on("message", (message) => {
    const { type, payload } = JSON.parse(message);
    if (type === "addProduct") {
      const { title, description, price, thumbnail, code, stock, type } = payload;
      manager.addProduct(
        manager.idCounter,
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        type
      );
      const products = manager.getProducts();
      io.sockets.emit("addProduct", products);
    }
  });

  socket.on("deleteProduct", (data) => {
    const pid = data.id;
    const result = manager.deleteProduct(pid);
    if (result) {
      io.sockets.emit("deleteProduct", pid);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.get("/realtimeproducts", (req, res) => {
  const products = manager.getProducts();
  res.render("realTimeProducts", { products });
});

server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
