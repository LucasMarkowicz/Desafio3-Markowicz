const http = require("http");
const express = require("express");
const { engine } = require("express-handlebars");
const ProductManager = require("./daos/productManager.js");
const CartManager = require("./daos/cartManager.js");
//const UserManager = require('./daos/userManager.js');
const router = require("../src/routes/index.js")
const session = require('express-session');
const app = express();
const port = 8080;
//const { connect } = require("../src/db/db.js");

const server = http.createServer(app);
/*const io = require("socket.io")(server);*/

const cartManager = new CartManager();
const manager = new ProductManager();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
};


router(app) 


// endpoint home
app.get("/products", requireLogin, async (req, res) => {
  const { username, role } = req.session.user;
  try {
    const { limit = 4, page = 1, sort="", query="" } = req.query;

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

    const products = sortedProducts
      .slice((page - 1) * limit, page * limit)
      .map(product => product.toObject());

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const prevLink = hasPrevPage ? `/products/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
    const nextLink = hasNextPage ? `/products/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;

    res.render("home", {
      status: "success",
      message: `Bienvenido, ${username}. Rol: ${role}`,
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






//websockets

/*
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
}); */



server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
