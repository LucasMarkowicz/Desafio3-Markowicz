const http = require("http");
const express = require("express");
const { engine } = require("express-handlebars");
const router = require("../src/routes/index.js")
const session = require('express-session');
const app = express();
const port = 8080;
const dotenv = require('dotenv');
dotenv.config();
const MongoStore = require("connect-mongo");
const server = http.createServer(app);
/*const io = require("socket.io")(server);*/
const passport = require('passport');



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
    store:new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
  ttl:120000
  })
  })
);

//const GitHubStrategy = require('passport-github2').Strategy;

app.use(passport.initialize());
app.use(passport.session());

/*passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const user = { email: profile.username, role: 'user' };
      return done(null, user);
    }
  )
);

app.get('/auth/github', passport.authenticate('github'));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/api/products');
  }
);*/

router(app) 



server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
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
