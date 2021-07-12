CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status varchar(60),
    user_id bigint references users(id)
);