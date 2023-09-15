const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const authConfig = require("../configs/auth");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    const user = await knex("users")
      .where({ email })
      .first();

    if(!user) {
      throw new AppError("E-mail e/ou senha incorreto(a)", 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorreto(a)", 401);
    }

    if (!user.is_admin) {
      if (user.is_active) {
        const [year, month, day] = user.paid_at.split(" ")[0].split("-");
        const lastPayMonth = parseInt(month) + 1;
        let payday;
  
        if (lastPayMonth < 10) {
          payday = `${year}-0${lastPayMonth}-${day}`;
        } else {
          payday = `${year}-${lastPayMonth}-${day}`;
        }
  
        const currentTime = await knex('users')
          .select(knex.raw('CURRENT_TIMESTAMP'))
          .first();
        
        const [currentTimeFormatted,] = currentTime.CURRENT_TIMESTAMP.split(" ");
  
        if (payday < currentTimeFormatted) {
          await knex("users").update({ is_active: false })
            .where({ id: user.id })

          throw new AppError(`O pagamento do serviço está atrasado. Por favor, entre em contato com a nossa equipe pelo email ${process.env.EMAIL_ADMIN_1}. Informe o seu nome e email. Obrigado!`, 403);
        }
      } else {
        throw new AppError(`O pagamento do serviço está atrasado. Por favor, entre em contato com a nossa equipe pelo email ${process.env.EMAIL_ADMIN_1}. Informe o seu nome e email. Obrigado!`, 403);
      }
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    });

    return response.json({ user, token });
  }
}

module.exports = SessionsController;