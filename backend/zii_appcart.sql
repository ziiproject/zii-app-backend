
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname TEXT,
  email TEXT UNIQUE,
  password TEXT
);


CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  email TEXT,
  item TEXT,
  quantity INTEGER,
  price NUMERIC(10, 2),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE review_images (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'unit'    
);