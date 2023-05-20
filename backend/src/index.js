const http = require("http");
const express = require("express");
const { engine } = require("express-handlebars");
const router = require("../src/routes/index.js");
const session = require("express-session");
const app = express();
const port = 8080;
const dotenv = require("dotenv");
dotenv.config();
const MongoStore = require("connect-mongo");
const passport = require("../src/config/passport.js");
const server = http.createServer(app);
const io = require("socket.io")(server);
const ProductManager = require("../src/daos/productManager.js");
const manager = new ProductManager();
const accessRole = require("./middlewares/accessRole");
const { requireLogin } = require("./middlewares/requireLogin.js")
const cors = require('cors');

app.use(cors());


app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 120000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/products");
  }
);

router(app);

//faker y mocking
const { faker } = require("@faker-js/faker");
const generateFakeProducts = () => {
  const fakeProducts = [];
  

  for (let i = 0; i < 100; i++) {
  const categorias = ["remeras", "pantalones", "buzos"];
  const randomIndex = Math.floor(Math.random() * categorias.length);
    const fakeProduct = {
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: faker.number.int(20000),
      thumbnail: faker.image.url(),
      code: faker.number.int(),
      stock: faker.number.int(100),
      category: categorias[randomIndex],
    };
    fakeProducts.push(fakeProduct);
  }

    return fakeProducts;
  };
  
  const fakeProducts = generateFakeProducts();

app.get("/mockingproducts", requireLogin, async (req, res) => {


  const { email, role } = req.session.user;
  console.log("soy req.session", req.session);
  console.log("soy req.session.user", req.session.user);
  try {
    const { limit = 4, page = 1, sort = "", query = "" } = req.query;

    const allProducts = await fakeProducts;

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
      .map((product) => product);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const prevLink = hasPrevPage
      ? `/mockingproducts/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}`
      : null;
    const nextLink = hasNextPage
      ? `/mockingproducts/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}`
      : null;

    res.render("mocking", {
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
    res.status(500).send("Error al obtener la lista de productos");
  }
});




//websockets

io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.on("message", (message) => {
    const { type, payload } = JSON.parse(message);
    if (type === "addProduct") {
      const { title, description, price, thumbnail, code, stock, category } =
        payload;
      manager.addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category
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

app.get("/realtimeproducts", accessRole("admin"), async (req, res) => {
  const products = await manager.getProducts();
  res.render("realtimeproducts", { products });
});



server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
