import { OrderStore, OrderProduct, OrderProductDB } from './../models/order';
import express, { Request, Response } from 'express';
import verifyAuthToken from '../middleware/verifyAuthToken';
import { ProductDB } from '../models/product';

const orderStore = new OrderStore;
const orderRouter = express.Router();

// Handler
const addProductToOrder = async(req: Request, res: Response): Promise<void> => {
    const orderProduct: OrderProduct = req.body;

    try {
        const createdOrderProduct = await orderStore.addProductToOrder(orderProduct);
        res.json(createdOrderProduct);
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

        res.json(orderProducts);

    } catch (e) {
        res.status(500).send(e);
    }
}

const getProductsFromOrder = async(req: Request, res: Response): Promise<void> => {
    const orderId: number = parseInt(req.params['id'], 10);

    try {
        
        const products: ProductDB[] = await orderStore.getProductsFromOrder(orderId);
        
        if (!products) {
            throw new Error(`Could not find products for order ${orderId}`);
        }

        res.json(products);

    } catch (e) {
        res.status(500).send(e);
    }

}

// Routes
orderRouter.post('/:id/products', verifyAuthToken, addProductToOrder);
orderRouter.post('/', verifyAuthToken, createOrder);
orderRouter.get('/:id', verifyAuthToken, getProductsFromOrder);

export default orderRouter;
