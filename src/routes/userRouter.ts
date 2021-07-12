import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import verifyUserId from '../middleware/verifyUserId';
import { User, UserDB, UserStore } from './../models/user';

const userStore = new UserStore();
const userRouter = express.Router();

const { TOKEN_SECRET } = process.env;

if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET missing.');
}

userRouter.post('/:id', [verifyAuthToken, verifyUserId], async (req: Request, res: Response) => {
    const user: UserDB = req.body;
    try {
        const updatedUser = await userStore.update(user);
        const token = jwt.sign({ user: updatedUser }, TOKEN_SECRET);
        res.json(token);
    } catch (e) {
        res.status(500).send(e);
    }
});

userRouter.post('/', async (req: Request, res: Response) => {
    const user: User = req.body;
    try {
        const newUser = await userStore.create(user);
        const token = jwt.sign({ user: newUser }, TOKEN_SECRET);
        res.json(token);
    } catch (e) {
        res.status(500).send(e);
    }
});

export default userRouter;
