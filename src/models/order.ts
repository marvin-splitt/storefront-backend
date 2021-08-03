import { UserDB } from './user';
import { PoolClient } from "pg";
import client from "../database";
import { ProductDB } from "./product";

export interface Order {
    status: string;
    userId: number;
}

export interface OrderDB extends Order {
    readonly id: number,
}

export interface OrderProduct {
    quantity: number;
    orderId?: number;
    productId: number;
}

export interface OrderProductDB extends OrderProduct {
    readonly id: number;
    orderId: number;
}

export interface DeletedOrder {
    deletedProducts: OrderProductDB[];
    deletedOrder: OrderDB;
}

export class OrderStore {

    async createOrder(userId: number, products: OrderProduct[]): Promise<OrderProductDB[]> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');

            const userSQL = 'SELECT * from users where id=($1);';
            const user: UserDB = (await connection.query(userSQL, [userId])).rows[0];

            if (!user) {
                throw new Error(`Could not find user with id: ${userId}`);
            }


            const createOrderSQL = 'INSERT INTO orders (status, user_id) VALUES ($1, $2) RETURNING *;';
            const order: OrderDB = (await connection.query(createOrderSQL, ['active', userId])).rows[0];

            if (!order) {
                throw new Error('Could not create new order');
            }

            const addProductSQL = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;';
            
            const productPromises = products.map(async (product: OrderProduct): Promise<OrderProductDB> => {
                const sqlProductValues = [product.quantity, product.orderId, product.productId];
                const createdOrderProduct: OrderProductDB = (await connection.query(addProductSQL, sqlProductValues)).rows[0];

                if (!createdOrderProduct) {
                    throw new Error('Could not add product to order')
                }
                return createdOrderProduct;
            });

            const addedProducts: OrderProductDB[] = await Promise.all(productPromises);

            await connection.query('COMMIT');
            return addedProducts
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not create order for user: ${userId}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async getProductsFromOrder(orderId: number): Promise<ProductDB[]> {
        const connection: PoolClient = await client.connect();
        try {
            const sql = 'SELECT p.id, name, price, category FROM products p INNER JOIN order_products ON product_id=order_id WHERE order_id=($1);';
            const products: ProductDB[] = (await connection.query(sql, [orderId])).rows;
            return products;
        } catch (err) {
            throw new Error(`Could not get products for order: ${orderId}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async addProductToOrder(orderProduct: OrderProduct): Promise<OrderProductDB> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const orderSQL = 'SELECT * FROM orders WHERE id=($1);'
            const order: OrderDB = (await connection.query(orderSQL, [orderProduct.orderId])).rows[0];

            if (!order) {
                throw new Error('Order does not exist, you may have to create it first');
            }

            if (order.status !== 'active') {
                throw new Error(`Order has status ${order.status}, can not add new products anymore`)
            }

            const sql = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;';
            const sqlValues = [orderProduct.quantity, orderProduct.orderId, orderProduct.productId];
            const createdOrderProduct: OrderProductDB = (await connection.query(sql, sqlValues)).rows[0];
            await connection.query('COMMIT');
            return createdOrderProduct;
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not add product ${orderProduct.productId} to order ${orderProduct.orderId}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }

    async deleteOrder(orderId: number): Promise<DeletedOrder> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const orderSQL = 'SELECT * FROM orders WHERE id=($1);'
            const order: OrderDB = (await connection.query(orderSQL, [orderId])).rows[0];

            if (!order) {
                throw new Error('Order does not exist, you may have to create it first');
            }

            if (order.status !== 'active') {
                throw new Error(`Order has status ${order.status}, can not delete order anymore`)
            }

            const deleteProductsFromOrdersSQL = 'DELETE FROM order_products WHERE order_id=($1) RETURNING *;';
            const deleteOrderSQL = 'DELETE FROM orders WHERE id=($1) RETURNING *;';
            const deletedProducts: OrderProductDB[] = (await connection.query(deleteProductsFromOrdersSQL, [orderId])).rows;
            const deletedOrder: OrderDB = (await connection.query(deleteOrderSQL, [orderId])).rows[0];
            await connection.query('COMMIT');
            return {
                deletedProducts,
                deletedOrder,
            };
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not delete order ${orderId}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }
}