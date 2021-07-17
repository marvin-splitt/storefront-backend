import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import verifyUserId from '../middleware/verifyUserId';
import { User, UserDB, UserStore } from './../models/user';

const userStore = new UserStore();
const userRouter = express.Router();

const { TOKEN_SECRET } = process.env;

// Handler
const addUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = req.body;
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }

        const newUser = await userStore.create(user);
        const token = jwt.sign({ user: newUser }, TOKEN_SECRET);
        res.json(token);
    } catch (e) {
        res.status(500).send(e);
    }
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const user: UserDB = req.body;
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET missing');
        }

        const updatedUser = await userStore.update(user);
        const token = jwt.sign({ user: updatedUser }, TOKEN_SECRET);
        res.json(token);
    } catch (e) {
        res.status(500).send(e);
    }
}

// Routes
userRouter.post('/', addUser);
userRouter.post('/:id', [verifyAuthToken, verifyUserId], updateUser);

export default userRouter;
