const { Router } = require("express");

const ProductsController = require("../controllers/ProductsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const productsRoutes = Router();
const productsController = new ProductsController();

productsRoutes.use(ensureAuthenticated);

productsRoutes.get("/", productsController.index);
productsRoutes.get("/:id", productsController.show);
productsRoutes.post("/", productsController.create);
productsRoutes.delete("/:id", productsController.delete);
productsRoutes.put("/:id", productsController.update);

module.exports = productsRoutes;