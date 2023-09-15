const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { hash, compare } = require("bcryptjs");
const validator = require("email-validator");

class AdminController {
  async update(request, response) {
    const { paidAt, name, email, password, isAdmin } = request.body;
    const user_id = request.user.id;
    const { id } = request.params;

    console.log({ paidAt, name, email, password, isAdmin })

    const checkIsAdmin = await knex("users")
      .select("is_admin")
      .where({ id: user_id})
      .first();

    if (!checkIsAdmin.is_admin) {
      throw new AppError("Você não é um administrador para realizar esta operação.", 403);
    }

    const user = await knex("users")
      .select("*")
      .where({ id })
      .first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    if (user.email === process.env.EMAIL_ADMIN_1 || user.email === process.env.EMAIL_ADMIN_2) {
      throw new AppError("Não é possível fazer alterações neste usuário.");
    }

    if (!validator.validate(email)) {
      throw new AppError("Endereço de email inválido.");
    }

    const userWithUpdatedEmail = await knex("users")
      .select("*")
      .where({ email })
      .first();

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const currentDate = await knex('users')
      .select(knex.raw('CURRENT_TIMESTAMP'))
      .first();
      
    const [formattedDate,] = currentDate.CURRENT_TIMESTAMP.split(" ");

    const [year, month, day] = paidAt.split("-");

    const updatedMonth = parseInt(month) + 1

    let updatedPaidAt;
    if (updatedMonth < 10) {
      updatedPaidAt = `${year}-0${updatedMonth}-${day}`;
    } else {
      updatedPaidAt = `${year}-${updatedMonth}-${day}`;
    }

    const checkPassword = await compare(password, user.password);

    if (!checkPassword) {
      user.password = await hash(password, 8);
    }

    let isActive = true;
    if (!isAdmin && updatedPaidAt < formattedDate) {
      isActive = false;
    }

    user.name = name ?? user.name;
    user.paid_at = `${paidAt} 12:00:00`;
    user.email = email;
    user.is_admin = isAdmin;
    user.is_active = isActive;
    user.updated_at = knex.fn.now();

    await knex("users").update(user)
      .where({ id: user.id });

    return response.json();
  }
}

module.exports = AdminController;