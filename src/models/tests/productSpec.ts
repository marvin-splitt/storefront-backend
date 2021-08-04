import client from '../../database';
import { ProductStore } from '../product';

const productStore = new ProductStore();

beforeAll(async () => {
    await productStore.create({
        name: 'Apple iPhone XR',
        price: 899,
        category: 'Mobile Phones',
    });
});

afterAll(async () => {
    await client.query('DELETE FROM products;');
});

describe('Product Model', () => {
    it('should have an index method', () => {
        expect(productStore.index).toBeDefined();
    });

    it('should have a show method', () => {
        expect(productStore.show).toBeDefined();
    });

    it('should have a create method', () => {
        expect(productStore.create).toBeDefined();
    });

    it('should have a update method', () => {
        expect(productStore.update).toBeDefined();
    });

    it('should have a delete method', () => {
        expect(productStore.delete).toBeDefined();
    });

    it('create method should add a product', async () => {
        const result = await productStore.create({
            name: 'Mac Book Pro 2020 Model',
            price: 2599,
            category: 'Notebooks',
        });
        expect(result).toEqual({
            id: result.id,
            name: 'Mac Book Pro 2020 Model',
            price: 2599,
            category: 'Notebooks',
        });
    });

    it('index method should return a list of products', async () => {
        const result = await productStore.index();
        expect(result).toContain({
            id: 1,
            name: 'Apple iPhone XR',
            price: 899,
            category: 'Mobile Phones',
        });
    });

    it('show method should return the correct product', async () => {
        const result = await productStore.show(1);
        expect(result).toEqual({
            id: 1,
            name: 'Apple iPhone XR',
            price: 899,
            category: 'Mobile Phones',
        });
    });

    it('delete method should remove the product', async () => {
        const result = await productStore.create({
            name: 'Apple iPad Air 2021',
            price: 699,
            category: 'Tablets',
        });
        await productStore.delete(result.id);
        const items = await productStore.index();
        expect(items).not.toContain(result);
    });
});
