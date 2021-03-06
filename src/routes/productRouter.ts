import { Product, ProductDB } from './../models/product';
import express, { Request, Response } from 'express';
import { ProductStore } from '../models/product';
import verifyAuthToken from '../middleware/verifyAuthToken';

const productStore = new ProductStore();
const productRouter = express.Router();

// Handler
const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products: ProductDB[] = await productStore.index();
        res.json(products);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product: ProductDB = await productStore.show(parseInt(req.params['id'], 10));
        if (product) {
            res.status(200).json(product);
            return;
        }
        res.status(404).send('Product not found.');
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product_id = parseInt(req.params['id'], 10);
        const newProduct: ProductDB = req.body;

        if (!newProduct.category || !newProduct.name || !!newProduct.price) {
            throw new Error('Missing product properties');
        }

        const existingProduct: ProductDB = await productStore.show(product_id);

        if (existingProduct) {
            const updatedProduct = await productStore.update(product_id, newProduct);
            res.status(200).json(updatedProduct);
            return;
        }
        res.status(404).send('Could not update product, id not found.');
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const newProduct: Product = req.body;
        const createdProduct: ProductDB = await productStore.create(newProduct);

        res.status(201).json(createdProduct);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product_id = parseInt(req.params['id'], 10);
        const deletedProduct: ProductDB = await productStore.delete(product_id);
        res.status(200).json(deletedProduct);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

// Routes
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProduct);
productRouter.put('/:id', verifyAuthToken, updateProduct);
productRouter.post('/', verifyAuthToken, addProduct);
productRouter.delete('/:id', verifyAuthToken, deleteProduct);

export default productRouter;
