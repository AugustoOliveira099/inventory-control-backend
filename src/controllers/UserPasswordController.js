const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { hash } = require("bcryptjs");
const validator = require("email-validator");


class UserPasswordController {
  async create(request, response) {
    const { email } = request.body;

    if (!email) {
      throw new AppError("Endereço de email não enviado.");
    }

    if (!validator.validate(email)) {
      throw new AppError("Endereço de email inválido.");
    }

    const user = await knex("users")
      .select("*")
      .where({ email })
      .first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    if (!user.is_active) {
      throw new AppError(`Para atualizar a senha é preciso regularizar o pagamento do serviço. Por favor, entre em contato com a nossa equipe pelo email ${process.env.EMAIL_ADMIN_1}. Informe o seu nome e email cadastrado. Obrigado!`, 403);
    }

    const min = 10000000;
    const max = 1000000000000000;
    const randomInt = (Math.random() * (max - min + 1)) + min;
    const urlHash = await hash(`${randomInt}`, 8);
    let cleanUrlHash = urlHash.replace('.', '')
    cleanUrlHash = urlHash.replace('/', '')
    const url = `${process.env.BASEURL}/password/${cleanUrlHash}`;

    await knex("users")
      .update({ hash: cleanUrlHash })
      .where({ email });

    return response.json({
      url,
      email,
      name: user.name
    });
  }

  async show(request, response) {
    const { hash } = request.params;

    const checkUserExists = await knex("users")
      .where({ hash })
      .first();

    if (!checkUserExists) {
      throw new AppError("Link inválido. Para atualizar a senha, siga as intruções enviadas para o seu e-mail.");
    }

    if (!checkUserExists.is_active) {
      throw new AppError(`Para atualizar a senha é preciso regularizar o pagamento do serviço. Por favor, entre em contato com a nossa equipe pelo email ${process.env.EMAIL_ADMIN_1}. Informe o seu nome e email cadastrado. Obrigado!`, 403);
    }

    return response.json();
  }

  async update(request, response) {
    const { hash: auxHash } = request.params;
    const { password } = request.body;

    if (!password) {
      throw new AppError("Senha não informada.");
    }

    const checkUserExists = await knex("users")
      .where({ hash: auxHash })
      .first();

    if (!checkUserExists) {
      throw new AppError("Link inválido. Para atualizar a senha, siga as intruções enviadas para o seu e-mail.");
    }

    if (!checkUserExists.is_active) {
      throw new AppError(`Para atualizar a senha é preciso regularizar o pagamento do serviço. Por favor, entre em contato com a nossa equipe pelo email ${process.env.EMAIL_ADMIN_1}. Informe o seu nome e email cadastrado. Obrigado!`, 403);
    }

    const hashedPassword = await hash(password, 8);

    const updated_at = knex.fn.now();

    await knex("users").update({
        updated_at,
        password: hashedPassword,
        hash: ""
      })
      .where({ hash: auxHash });

    return response.json();
  }
}

module.exports = UserPasswordController;