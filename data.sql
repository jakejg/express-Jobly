
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
);

DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL CHECK(equity < 1),
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted timestamp without time zone NOT NULL
  
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL, 
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT false 
  
);


DROP TABLE IF EXISTS applications;

CREATE TABLE applications (
  primary key (username, job_id),
  username TEXT REFERENCES users ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs ON DELETE CASCADE,
  state TEXT NOT NULL,
  created_at timestamp without time zone NOT NULL
  
);