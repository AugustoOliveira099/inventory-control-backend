exports.up = knex => knex.schema.createTable("products", table => {
  table.increments("id");
  table.text("title");
  table.text("details");
  table.text("supplier");
  table.text("client");
  table.text("color");
  table.text("model");
  table.text("serial_number");
  table.float("value_sold");
  table.float("value_bought");
  table.integer("user_id").references("id").inTable("users").onDelete("CASCADE");

  table.timestamp("bought_at");
  table.timestamp("sold_at");
  table.timestamp("created_at").default(knex.fn.now());
  table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("products");