import { OrderStore, OrderProduct } from './../models/order';
import express, { Request, Response } from 'express';

const orderStore = new OrderStore;
const orderRouter = express.Router();

// Handler
const addOrderProduct = async(req: Request, res: Response): Promise<void> => {
    const orderProduct: OrderProduct = req.body;

    try {
        const createdOrderProduct = await orderStore.addProduct(orderProduct);
        res.json(createdOrderProduct);
    } catch (e) {
        res.status(500).send(e)
    }    
}

// Routes
orderRouter.post('/:id/products', addOrderProduct);

export default orderRouter;
