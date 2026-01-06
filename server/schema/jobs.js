const { pgTable, varchar, text, boolean } = require('drizzle-orm/pg-core');

const jobs = pgTable('jobs', {
    id: varchar('id').primaryKey(),
    title: varchar('title'),
    company: varchar('company'),
    logo: varchar('logo'),
    location: varchar('location'),
    date_posted: varchar('date_posted'),
    deadline: varchar('deadline'),
    company_email: varchar('company_email'),
    description: text('description'),
    level: varchar('level'),
    website: varchar('website'),
    slug: varchar('slug'),
    is_active: boolean('is_active').default(true),
    content_hash: varchar('content_hash')
});

module.exports = { jobs };
