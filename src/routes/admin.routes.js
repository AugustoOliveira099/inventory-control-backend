const { Router } = require("express");

const AdminController = require("../controllers/AdminController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const adminRoutes = Router();
const adminController = new AdminController();

adminRoutes.use(ensureAuthenticated);

adminRoutes.put("/:id", adminController.update);

module.exports = adminRoutes;