import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ProductStore } from './models/product';
import productRouter from './routes/productRouter';
import userRouter from './routes/userRouter';
import orderRouter from './routes/orderRouter';

const app: express.Application = express();
const port = 3000;

const productStore = new ProductStore();

// const corsOptions: CorsOptions = {
//     origin: ['http://localhost:3000'],
// };

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/orders', orderRouter);

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
        console.log(product);
        res.json(product);
    });
});

app.listen(port, function () {
    console.log(`starting app on port: ${port}`);
});

export default app;