const productsControllers = require("../controllers/productsControllers.js")
const cartsControllers = require("../controllers/cartsControllers.js")

function router(app) {
    app.use("/api/products", productsControllers)
    app.use("/api/carts", cartsControllers)
}

module.exports = router