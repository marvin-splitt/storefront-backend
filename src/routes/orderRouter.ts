import { OrderStore, OrderProduct, OrderProductDB, DeletedOrder, OrderDB } from './../models/order';
import express, { Request, Response } from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import { ProductDB } from '../models/product';

const orderStore = new OrderStore;
const orderRouter = express.Router();

// Handler
const addProductToOrder = async(req: Request, res: Response): Promise<void> => {
    const orderProduct: OrderProduct = req.body;
    const orderId: number = parseInt(req.params['id'], 10);

    try {
        const createdOrderProduct = await orderStore.addProductToOrder(orderId, orderProduct);
        if (!createdOrderProduct) {
            throw new Error('Could not add product to order');
        }
        res.status(201).json(createdOrderProduct);
    } catch (e) {
        res.status(500).send(e)
    }    
}

const createOrder = async(req: Request, res: Response): Promise<void> => {
    const userId: number = req.body.userId;
    const products: OrderProduct[] = req.body.products;

    try {
        if (!userId || !products || !products.length) {
            throw new Error('Invalid request. Please provide a userId and a products array');
        }

        const orderProducts: OrderProductDB[] = await orderStore.createOrder(userId, products);
        
        if (!orderProducts) {
            throw new Error('Could not create order');
        }

        res.status(201).json(orderProducts);

    } catch (e) {
        res.status(500).send(e);
    }
}

const getAllOrders = async(_req: Request, res: Response): Promise<void> => {
    try {
        const orders: OrderDB[] = await orderStore.getAllOrders();
        res.json(orders);
    } catch (e) {
        res.status(500).send(e);
    }
}

const getProductsFromOrder = async(req: Request, res: Response): Promise<void> => {
    const orderId: number = parseInt(req.params['id'], 10);

    try {
        
        const products: ProductDB[] = await orderStore.getProductsFromOrder(orderId);
        
        if (!products || !products.length) {
            res.status(404).send(`Could not find products for order ${orderId}`);
            return;
        }

        res.json(products);

    } catch (e) {
        res.status(500).send(e);
    }
}

const getOrdersByUser = async(req: Request, res: Response): Promise<void> => {
    const userId: number = parseInt(req.params['id'], 10);

    try {
        
        const orders: OrderDB[] = await orderStore.getOrdersByUser(userId);
        
        if (!orders || !orders.length) {
            res.status(404).send(`Could not find orders for user ${userId}`);
            return;
        }

        res.json(orders);

    } catch (e) {
        res.status(500).send(e);
    }
}

const deleteOrder = async(req: Request, res: Response): Promise<void> => {
    const orderId: number = parseInt(req.params['id'], 10);

    try {
        const deletedOrder: DeletedOrder = await orderStore.deleteOrder(orderId);
        res.json(deletedOrder);
    } catch (e) {
        res.status(500).send(e);
    }
}

// Routes
orderRouter.post('/:id/product', verifyAuthToken, addProductToOrder);
orderRouter.post('/', verifyAuthToken, createOrder);
orderRouter.get('/:id', verifyAuthToken, getProductsFromOrder);
orderRouter.get('/', verifyAuthToken, getAllOrders)
orderRouter.get('/ordersByUser/:id', verifyAuthToken, getOrdersByUser)
orderRouter.delete('/:id', verifyAuthToken, deleteOrder);

export default orderRouter;
