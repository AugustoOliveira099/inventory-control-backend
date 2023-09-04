const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class ProductsController {
    async create(request, response) {
        const { title, 
            details, 
            supplier, 
            client, 
            value_sold, 
            value_bought, 
            bought_at, 
            sold_at,
            color,
            model,
            serial_number
        } = request.body;
        const user_id = request.user.id;

        if (title === "" || 
            supplier === "" || 
            value_bought === 0.0 || 
            bought_at === "" ||
            color === "" ||
            model === "" ||
            serial_number === "")  {
            throw new AppError("Um ou mais campos não foram preenchidos.");
        }

        const boughtAt = `${bought_at} 12:00:00`;
        let soldAt = sold_at;

        if (sold_at) {
            soldAt = `${sold_at} 12:00:00`;
        }

        await knex("products").insert({
            user_id,
            title, 
            details, 
            supplier, 
            client,
            value_sold, 
            value_bought, 
            bought_at: boughtAt, 
            sold_at: soldAt,
            color,
            model,
            serial_number,
            updated_at: knex.fn.now()
        });

        return response.status(201).json();
    }

    async index(request, response) {
        const currentDate = () => {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
        
            const formattedDate = `${year}-${month}-${day}`;
            
            const newStartDate = formattedDate.slice(0, -2) + "01 12:00:00";
            const newEndDate = formattedDate + " 12:00:00";
        
            return ({
                newStartDate,
                newEndDate
            })
        }

        const { title, supplier, limit, page, serial_number, client } = request.query;
        let { startDate, endDate, details, isBought, isSold, max_value, min_value } = request.query;
        const user_id = request.user.id;
        const startIndex = (page - 1) * limit;

        isBought = isBought === 'true' ? true : false;
        isSold = isSold === 'true' ? true : false;
        min_value = parseFloat(min_value)
        max_value = parseFloat(max_value)

        if (!startDate && endDate || startDate && !endDate) {
            throw new AppError("Insira a data de início e fim da pesquisa.")
        }

        const isEmpty = (title === "" && details === "" && supplier === "" && serial_number === "" && client === "")

        if ( isEmpty && ((!startDate && !endDate) || (startDate && endDate)) ) {
            startDate = startDate ? `${startDate} 12:00:00`: currentDate().newStartDate
            endDate = endDate ? `${endDate} 12:00:00`: currentDate().newEndDate
        }

        let products;

        if (isBought && isSold || !isBought && !isSold) {
            if (startDate && endDate) {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            } else {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            }
        } else if (isBought && !isSold) {
            if (startDate && endDate) {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            } else {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where(function () {
                                this.where("sold_at", "").andWhere("value_sold", "")
                            })
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            }
        } else if (!isBought && isSold) {
            if (startDate && endDate) {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("bought_at", ">=", startDate).andWhere("bought_at", "<=", endDate);
                            }).orWhere(function () {
                                this.where("sold_at", ">=", startDate).andWhere("sold_at", "<=", endDate);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            } else {
                if (min_value > 0 && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value).andWhere("value_bought", "<=", max_value);
                            }).orWhere(function () {
                                this.where("value_sold", ">=", min_value).andWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (min_value > 0 && !max_value) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", ">=", min_value)
                                    .orWhere("value_sold", ">=", min_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else if (!min_value && max_value > 0) {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .where(function () {
                            this.where(function () {
                                this.where("value_bought", "<=", max_value)
                                    .orWhere("value_sold", "<=", max_value);
                            });
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                } else {
                    products = await knex("products")
                        .select([
                            "value_sold",
                            "value_bought",
                            "id",
                            "title",
                            "sold_at",
                            "bought_at"
                        ])
                        .where({ user_id })
                        .where(function () {
                            this.whereLike("title", `%${title}%`)
                                .orWhereLike("details", `%${details}%`);
                        })
                        .whereLike("supplier", `%${supplier}%`)
                        .whereLike("serial_number", `%${serial_number}%`)
                        .whereLike("client", `%${client}%`)
                        .where(function () {
                            this.where("sold_at", "!=", "")
                                .orWhere("value_sold", "!=", "");
                        })
                        .offset(startIndex)
                        .limit(limit)
                        .orderBy("updated_at", "desc")
                        .orderByRaw("title")
                }
            }
        }

        // const total = await knex("products")
        //     .where({ user_id })
        //     .count()
        //     .first()

        // const count = total["count(*)"]

        // const productsResponse = {
        //     count,
        //     products
        // }

        return response.json(products);
    }

    async show(request, response) {
        const { id } = request.params;
        const user_id = request.user.id;

        const product = await knex("products").where({ user_id }).where({ id }).first();

        return response.json({...product});
    }

    async update(request, response) {
        const { id } = request.params;
        const { title, 
            details, 
            supplier, 
            client, 
            value_sold, 
            value_bought, 
            color,
            model,
            serial_number
        } = request.body;

        
        let { bought_at, sold_at } = request.body;

        const product = await knex("products").where({ id }).first();

        if (!product) {
           throw new AppError("Produto não encontrado");
        }

        if (bought_at) {
            bought_at = `${ bought_at } 12:00:00`;
        }

        if (sold_at) {
            sold_at = `${ sold_at } 12:00:00`;
        }

        product.title = title ?? product.title;
        product.details = details ?? product.details;
        product.supplier = supplier ?? product.supplier;
        product.client = client ?? product.client;
        product.value_sold = value_sold ?? "";
        product.value_bought = value_bought ?? product.value_bought;
        product.bought_at = bought_at ?? product.bought_at;
        product.sold_at = sold_at ?? product.sold_at;
        product.color = color ?? product.color;
        product.model = model ?? product.model;
        product.serial_number = serial_number ?? product.serial_number;
        product.updated_at = knex.fn.now();

        await knex("products").where({ id }).update(product);

        return response.json();
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("products").where({ id }).delete();

        return response.json();
    }
}

module.exports = ProductsController;