
-- DROP TABLE IF EXISTS companies;

-- CREATE TABLE companies (
--   handle TEXT PRIMARY KEY,
--   name TEXT NOT NULL UNIQUE,
--   num_employees INTEGER,
--   description TEXT, 
--   logo_url TEXT
-- );

DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL CHECK(equity < 1),
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted timestamp without time zone NOT NULL
  
);