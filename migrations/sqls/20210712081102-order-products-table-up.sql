CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    quantity integer,
    order_id bigint references orders(id),
    product_id bigint references products(id)
);