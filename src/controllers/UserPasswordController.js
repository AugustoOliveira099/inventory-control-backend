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
      throw new AppError("O usuário está com o pagamento atrasado.");
    }

    const min = 10000000;
    const max = 1000000000000000;
    const randomInt = (Math.random() * (max - min + 1)) + min;
    const urlHash = await hash(`${randomInt}`, 8);
    const cleanUrlHash = urlHash.replace('.', '')
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
      .select("id")
      .where({ hash })
      .first();

    if (!checkUserExists) {
      throw new AppError("Link inválido. Para atualizar a senha, siga as intruções enviadas para o seu e-mail.");
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
      .select("id")
      .where({ hash: auxHash })
      .first();

    if (!checkUserExists) {
      throw new AppError("Link inválido. Para atualizar a senha, siga as intruções enviadas para o seu e-mail.");
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