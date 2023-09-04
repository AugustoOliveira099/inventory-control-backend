const { Router } = require("express");

const usersRouter = require("./users.routes");
const productsRouter = require("./products.routes");
const sessionsRouter = require("./sessions.routes");
const pricesRoutes = require("./prices.routes");

const routes = Router();
routes.use("/users", usersRouter);
routes.use("/prices", pricesRoutes);
routes.use("/products", productsRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;