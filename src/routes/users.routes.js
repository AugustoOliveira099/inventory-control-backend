const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const UsersController = require("../controllers/UsersController");
const UserAvatarController = require("../controllers/UserAvatarController");
const UserPasswordController = require("../controllers/UserPasswordController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const usersRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const usersController = new UsersController();
const userAvatarController = new UserAvatarController();
const userPasswordController = new UserPasswordController();

usersRoutes.get("/", ensureAuthenticated, usersController.index);
usersRoutes.get("/:id", ensureAuthenticated, usersController.show);
usersRoutes.post("/", ensureAuthenticated, usersController.create);
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.delete("/", ensureAuthenticated, usersController.delete);

usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update);

usersRoutes.post("/password", userPasswordController.create);
usersRoutes.get("/password/:hash", userPasswordController.show);
usersRoutes.put("/password/:hash", userPasswordController.update);

module.exports = usersRoutes;