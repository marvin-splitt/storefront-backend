CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name varchar(255),
    last_name varchar(255),
    email varchar(255),
    password varchar(255)
);