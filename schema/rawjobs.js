const { pgTable, varchar, text } = require('drizzle-orm/pg-core');

const rawjobs = pgTable('rawjobs', {
    job_id: varchar('job_id').primaryKey(),
    title: varchar('title'),
    company: varchar('company'),
    deadline: varchar('deadline'),
    date_posted: varchar('date_posted'),
    url: text('url'),
    job_description: text('job_description'),
});

module.exports = { rawjobs };
