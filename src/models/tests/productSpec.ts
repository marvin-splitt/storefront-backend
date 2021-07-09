import client from "../../database";
import { ProductStore } from "../product";

const store = new ProductStore();

beforeAll(async () => {
  await store.create({
    name: 'Apple iPhone XR',
    quantity: 100,
    description: 'Buy now and get 5% off',
  });
})

afterAll(async () => {
  await client.query('DELETE FROM products;');
})

describe ("Product Model", () => {
    it('should have an index method', () => {
        expect(store.index).toBeDefined();
      });
    
      it('should have a show method', () => {
        expect(store.show).toBeDefined();
      });
    
      it('should have a create method', () => {
        expect(store.create).toBeDefined();
      });
    
      it('should have a update method', () => {
        expect(store.update).toBeDefined();
      });
    
      it('should have a delete method', () => {
        expect(store.delete).toBeDefined();
      });

      it('create method should add a product', async () => {
        const result = await store.create({
          name: 'Mac Book Pro 2020 Model',
          quantity: 250,
          description: 'The Apple Mac Book Pro 2020 Model.',
        });
        expect(result).toEqual({
          id: result.id,
          name: 'Mac Book Pro 2020 Model',
          quantity: 250,
          description: 'The Apple Mac Book Pro 2020 Model.',
        });
      });
    
      it('index method should return a list of products', async () => {
        const result = await store.index();
        expect(result).toContain(
          {
            id: 1,
            name: 'Apple iPhone XR',
            quantity: 100,
            description: 'Buy now and get 5% off',
          });
      });
    
      it('show method should return the correct product', async () => {
        const result = await store.show(1);
        expect(result).toEqual({
          id: 1,
          name: 'Apple iPhone XR',
          quantity: 100,
          description: 'Buy now and get 5% off',
        });
      });
    
      it('delete method should remove the product', async () => {
        const result = await store.create({
          name: 'Apple iPad Air 2021',
          quantity: 300,
          description: 'Special student offer',
        });
        await store.delete(result.id);
        const items = await store.index();
        expect(items).not.toContain(result);
      });
})