const knex = require("../database/knex")
const AppError = require("../utils/AppError")


class PricesController {
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

    const { title, supplier, serial_number, client, current_month } = request.query;
    let { startDate, endDate, details, isBought, isSold, max_value, min_value } = request.query;
    const user_id = request.user.id;

    isBought = isBought === 'true' ? true : false;
    isSold = isSold === 'true' ? true : false;
    min_value = parseFloat(min_value)
    max_value = parseFloat(max_value)

    if (!startDate && endDate || startDate && !endDate) {
        throw new AppError("Insira a data de início e fim da pesquisa.")
    }

    const isEmpty = title === "" && details === "" && supplier === "" && serial_number === "" && client === ""

    if (startDate && endDate) {
        startDate = `${startDate} 12:00:00`
        endDate = `${endDate} 12:00:00`
    } else if (current_month === 'true') {
        startDate = currentDate().newStartDate
        endDate = currentDate().newEndDate
    }

    let prices;

    if (isBought && isSold || !isBought && !isSold) {
      if (startDate && endDate) {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        }
      } else {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
                ])
                .where({ user_id })
                .where(function () {
                    this.whereLike("title", `%${title}%`)
                        .orWhereLike("details", `%${details}%`);
                })
                .whereLike("supplier", `%${supplier}%`)
                .whereLike("serial_number", `%${serial_number}%`)
                .whereLike("client", `%${client}%`)
        }
    }
    } else if (isBought && !isSold) {
      if (startDate && endDate) {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        }
      } else {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        }
    }
    } else if (!isBought && isSold) {
      if (startDate && endDate) {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        }
      } else {
        if (min_value > 0 && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (min_value > 0 && !max_value) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else if (!min_value && max_value > 0) {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        } else {
            prices = await knex("products")
                .select([
                    "value_sold",
                    "value_bought"
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
        }
    }
    }

    let valueBought = 0
    let valueSold = 0

    prices.forEach((price) => {
      price.value_bought = price.value_bought === '' ? 0 : price.value_bought
      price.value_sold = price.value_sold === '' ? 0 : price.value_sold

      valueBought += price.value_bought
      valueSold += price.value_sold
    })

    let finalValue = valueSold - valueBought

    const values = {
      value_bought: valueBought,
      value_sold: valueSold,
      final_value: finalValue
    }

    const count = prices.length

    return response.json({
      count,
      values
    });
  }
  
  // async index(request, response) {
  //   const { startDate, endDate, allProducts } = request.query;
  //   const user_id = request.user.id;
  //   let newStartDate = startDate;
  //   let newEndDate = endDate;

  //   if (!allProducts && !startDate || !endDate) {
  //     const currentDate = new Date();
  //     const year = currentDate.getFullYear();
  //     const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  //     const day = String(currentDate.getDate()).padStart(2, "0");

  //     const formattedDate = `${year}-${month}-${day}`;
      
  //     newStartDate = formattedDate.slice(0, -2) + "01 12:00:00";

  //     newEndDate = formattedDate + " 12:00:00";
  //   }

  //   let prices

  //   if (allProducts) {
  //     prices = await knex("products")
  //       .select([
  //           "value_sold",
  //           "value_bought"
  //       ])
  //       .where({ user_id })
  //   } else {
  //     prices = await knex("products")
  //       .select([
  //           "value_sold",
  //           "value_bought"
  //       ])
  //       .where({ user_id })
  //       .where(function () {
  //           this.where(function () {
  //               this.where("bought_at", ">=", newStartDate).andWhere("bought_at", "<=", newEndDate);
  //           }).orWhere(function () {
  //               this.where("sold_at", ">=", newStartDate).andWhere("sold_at", "<=", newEndDate);
  //           });
  //       })
  //   }

  //   return response.json(prices);
  // }
}

module.exports = PricesController;