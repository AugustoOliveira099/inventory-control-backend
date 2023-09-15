const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { hash, compare } = require("bcryptjs");
const validator = require("email-validator");

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;
        const user_id = request.user.id;
        let { isAdmin } = request.body;

        const user = await knex("users")
            .select("*")
            .where("id", user_id)
            .first();

        if (!user.is_admin) {
            throw new AppError("Você não é um administrador para realizar esta operação.", 403);
        }

        if (!validator.validate(email)) {
            throw new AppError("Endereço de email inválido.");
        }

        const checkUserExists = await knex("users")
            .select("*")
            .where("email", email)
            .first()
            .catch(error => {
                console.error(error);
                throw new AppError("Erro ao fazer requisição do banco de dados.", 503);
            })

        if(checkUserExists) {
            throw new AppError("Este e-mail já está em uso.");
        }

        const hashedPassword = await hash(password, 8);

        if (email === process.env.EMAIL_ADMIN_1 || email === process.env.EMAIL_ADMIN_2) {
            isAdmin = true
        } else if (!isAdmin) {
            isAdmin = false
        }

        await knex("users").insert({
            name,
            email,
            password: hashedPassword,
            is_admin: isAdmin,
            is_active: true,
            paid_at: knex.fn.now()
        })

        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, new_password, old_password } = request.body;
        const user_id = request.user.id;

        const user = await knex("users")
            .select("*")
            .where("id", user_id)
            .first();

        if (!user) {
            throw new AppError("Usuário não encontrado.");
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
        
        user.name = name ?? user.name;

        if (new_password && !old_password) {
            throw new AppError("Você precisa informar a senha atual para definir uma nova senha.");
        }

        if (old_password && ((email != user.email) || new_password)) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError("A senha atual que você informou está incorreta.");
            }

            user.email = email;
            if (new_password) {
                user.password = await hash(new_password, 8);
            }

        } else if (!old_password && ((email != user.email) || new_password)) {
            throw new AppError("Você precisa digitar a senha atual para atualizar o seu e-mail e/ou a sua senha.");
        }

        user.updated_at = knex.fn.now();

        await knex("users").update(user)
            .where({ id: user_id });

        return response.json();
    }

    async delete(request, response) {
        const user_id = request.user.id;    
        const { password } = request.body;

        if (!password) {
            throw new AppError("Você precisa digitar a sua senha para realizar esta operação.");
        }

        const user = await knex("users")
            .select("*")
            .where("id", user_id)
            .first();

        if (!user.is_admin) {
            throw new AppError("Você não é um administrador para realizar esta operação.", 403);
        }

        const checkPassword = await compare(password, user.password);

        if (!checkPassword) {
            throw new AppError("A senha que você informou está incorreta.");
        }

        await knex("users").where({ id: user_id }).delete();

        return response.json();
    }

    async index(request, response) {
        const user_id = request.user.id;
        let { name, email } = request.query;

        const user = await knex("users")
            .select("is_admin")
            .where("id", user_id)
            .first();

        if (!user.is_admin) {
            throw new AppError("Você não é um administrador para ter acesso a estas informações.", 403);
        }

        let users
        
        if (name && email) {
            users = await knex("users")
                .select("*")
                .where({ name })
                .where({ email })
                .orderBy("paid_at");
        } else if (name) {
            users = await knex("users")
                .select("*")
                .where({ name })
                .orderBy("paid_at");
        } else if (email) {
            users = await knex("users")
                .select("*")
                .where({ email })
                .orderBy("paid_at");
        } else {
            users = await knex("users")
                .select("*")
                .orderBy("paid_at");
        }

        return response.json(users);
    }
    
    async show(request, response) {
        const { id } = request.params;
        const user_id = request.user.id;

        let user = await knex("users")
            .select("is_admin")
            .where("id", user_id)
            .first();

        if (!user.is_admin) {
            throw new AppError("Você não é um administrador para ter acesso a estas informações.", 403);
        }

        user = await knex("users")
            .select("*")
            .where({ id })
            .first();

        return response.json(user);
    }
}

module.exports = UsersController;