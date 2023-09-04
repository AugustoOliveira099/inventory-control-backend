const { Router } = require("express");

const PricesController = require("../controllers/PricesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const pricesRoutes = Router();
const pricesController = new PricesController();

pricesRoutes.get("/", ensureAuthenticated, pricesController.index);

module.exports = pricesRoutes;