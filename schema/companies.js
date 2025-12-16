const { pgTable, varchar } = require('drizzle-orm/pg-core');

const companies = pgTable('companies', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  logo: varchar('logo'),
  location: varchar('location'),
});

module.exports = { companies };

