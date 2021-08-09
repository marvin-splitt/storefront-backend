import { OrderStore, OrderProduct, OrderProductDB, DeletedOrder, OrderDB } from './../models/order';
import express, { Request, Response } from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import { ProductDB } from '../models/product';

const orderStore = new OrderStore();
const orderRouter = express.Router();

// Handler
const addProductToOrder = async (req: Request, res: Response): Promise<void> => {
    const orderProduct: OrderProduct = req.body;
    const order_id: number = parseInt(req.params['id'], 10);

    try {
        const createdOrderProduct: OrderProductDB = await orderStore.addProductToOrder(order_id, orderProduct);
        if (!createdOrderProduct) {
            throw new Error('Could not add product to order');
        }
        res.status(201).json(createdOrderProduct);
    } catch (e) {
        res.status(500).send(e);
    }
};

const createOrder = async (req: Request, res: Response): Promise<void> => {
    const user_id: number = req.body.user_id;
    const products: OrderProduct[] = req.body.products;

    try {
        if (!user_id || !products || !products.length) {
            throw new Error('Invalid request. Please provide a user_id and a products array');
        }

        const orderProducts: OrderProductDB[] = await orderStore.createOrder(user_id, products);

        if (!orderProducts) {
            throw new Error('Could not create order');
        }

        res.status(201).json(orderProducts);
    } catch (e) {
        res.status(500).send(e);
    }
};

const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders: OrderDB[] = await orderStore.getAllOrders();
        res.json(orders);
    } catch (e) {
        res.status(500).send(e);
    }
};
const getOrder = async (req: Request, res: Response): Promise<void> => {
    const order_id: number = parseInt(req.params['id'], 10);
    try {
        const order: OrderDB = await orderStore.getOrder(order_id);
        if (!order) {
            res.status(404).send(`Could not find order ${order_id}`);
            return;
        }
        res.json(order);
    } catch (e) {
        res.status(500).send(e);
    }
};

const getProductsFromOrder = async (req: Request, res: Response): Promise<void> => {
    const order_id: number = parseInt(req.params['id'], 10);

    try {
        const products: ProductDB[] = await orderStore.getProductsFromOrder(order_id);

        if (!products || !products.length) {
            res.status(404).send(`Could not find products for order ${order_id}`);
            return;
        }

        res.json(products);
    } catch (e) {
        res.status(500).send(e);
    }
};

const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    const user_id: number = parseInt(req.params['id'], 10);

    try {
        const orders: OrderDB[] = await orderStore.getOrdersByUser(user_id);

        if (!orders || !orders.length) {
            res.status(404).send(`Could not find orders for user ${user_id}`);
            return;
        }

        res.json(orders);
    } catch (e) {
        res.status(500).send(e);
    }
};

const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const order_id: number = parseInt(req.params['id'], 10);

    try {
        const deletedOrder: DeletedOrder = await orderStore.deleteOrder(order_id);
        res.json(deletedOrder);
    } catch (e) {
        res.status(500).send(e);
    }
};

// Routes
orderRouter.post('/:id/product', verifyAuthToken, addProductToOrder);
orderRouter.post('/', verifyAuthToken, createOrder);
orderRouter.get('/:id', verifyAuthToken, getOrder);
orderRouter.get('/:id/products', verifyAuthToken, getProductsFromOrder);
orderRouter.get('/', verifyAuthToken, getAllOrders);
orderRouter.get('/ordersByUser/:id', verifyAuthToken, getOrdersByUser);
orderRouter.delete('/:id', verifyAuthToken, deleteOrder);

export default orderRouter;
