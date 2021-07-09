import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ProductStore } from './models/product';

const app: express.Application = express();
const port = 3000;

const productStore = new ProductStore();

app.use(bodyParser.json());

app.get('/', function (req: Request, res: Response) {
    res.send('Hello World!');
});

app.get('/test', function (req: Request, res: Response) {

    // productStore.create({
    //     name: 'test',
    //     quantity: 1,
    //     description: 'Just a test product',
    // }).then((product) => {
    //     console.log(product)
    //     res.json(product);
    // })

    productStore.index().then((product) => {
        console.log(product)
        res.json(product);
    })
});

app.listen(port, function () {
    console.log(`starting app on port: ${port}`);
});
