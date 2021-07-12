import { PoolClient, QueryResult } from "pg";
import client from "../database";

export interface Order {
    status: string;
    userId: number;
}

export interface OrderDB extends Order {
    readonly id: number,
}

export interface OrderProduct {
    quantity: number;
    orderId: number;
    productId: number;
}

export interface OrderProductDB extends OrderProduct {
    readonly id: number;
}

export class OrderStore {
    async addProduct(orderProduct: OrderProduct): Promise<OrderProductDB> {
        const connection: PoolClient = await client.connect();
        try {
            await connection.query('BEGIN');
            const orderSQL = 'SELECT * from orders where id=($1);'
            const order: OrderDB = (await connection.query(orderSQL, [orderProduct.orderId])).rows[0];

            if (!order) {
                throw new Error('Order does not exist');
            }

            if (order.status !== 'open') {
                throw new Error(`Order has status ${order.status}, can not add new products anymore`)
            }

            const sql = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;';
            const sqlValues = [orderProduct.quantity, orderProduct.orderId, orderProduct.productId];
            const result: QueryResult = await connection.query(sql, sqlValues);
            const createdOrderProduct: OrderProductDB = result.rows[0];
            await connection.query('COMMIT');
            return createdOrderProduct;
        } catch (err) {
            await connection.query('ROLLBACK');
            throw new Error(`Could not add product ${orderProduct.productId} to order ${orderProduct.orderId}. Error: ${err}`);
        } finally {
            connection.release();
        }
    }
}