import { Product, ProductDB } from './../models/product';
import express, { Request, Response } from 'express';
import { ProductStore } from '../models/product';

const productStore = new ProductStore();

const productRouter = express.Router();

productRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const products: ProductDB[] = await productStore.index();
        res.json(products);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
});

productRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const product: ProductDB = await productStore.show(parseInt(req.params['id'], 10));
        if (product) {
            res.status(200).json(product);
        }

        res.status(404).send('Product not found.');
    } catch (e) {
        res.status(500);
        res.send(e);
    }
});

productRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params['id'], 10);
        const newProduct: ProductDB = req.body;
        const existingProduct: ProductDB = await productStore.show(productId);

        if (existingProduct) {
            const updatedProduct = await productStore.update(newProduct);
            res.status(200).json(updatedProduct);
        }

        res.status(404).send('Could not update product, id not found.');
    } catch (e) {
        res.status(500);
        res.send(e);
    }
});

productRouter.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct: Product = req.body;
        const createdProduct: ProductDB = await productStore.create(newProduct);

        res.status(201).json(createdProduct);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
});

productRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params['id'], 10);
        const deletedProduct: ProductDB = await productStore.delete(productId);
        res.status(204).json(deletedProduct);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
});

export default productRouter;
