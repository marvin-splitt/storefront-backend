import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/verifyAuthToken';
import verifyUserId from '../middleware/verifyUserId';
import { User, UserDB, UserStore } from './../models/user';

const userStore = new UserStore();
const userRouter = express.Router();

const { TOKEN_SECRET } = process.env;

// Handler
const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const users: UserDB[] = await userStore.index();
        res.json(users);
    } catch (e) {
        res.status(500);
        res.send(e);
    }
}

const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user: UserDB = await userStore.show(parseInt(req.params['id'], 10));
        if (user) {
            res.status(200).json(user);
        }
        res.status(404).send('User not found.');
    } catch (e) {
        res.status(500);
        res.send(e);
    }
}

const addUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = req.body;
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }
        const newUser: UserDB = await userStore.create(user);
        const token = jwt.sign({ user: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
        } }, TOKEN_SECRET);
        res.status(201).json(token);
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
        const token = jwt.sign({ user: {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email
        } }, TOKEN_SECRET);
        res.status(200).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId: number = parseInt(req.params['id'], 10);
    try {
        const deletedUser = await userStore.delete(userId);
        res.status(204).json(deletedUser);
    } catch (e) {
        res.status(500).send(e);
    }
}

// Routes
userRouter.get('/', verifyAuthToken, getAllUsers);
userRouter.get('/:id', verifyAuthToken, getUser);
userRouter.post('/', verifyAuthToken, addUser);
userRouter.put('/:id', [verifyAuthToken, verifyUserId], updateUser);
userRouter.delete('/:id', [verifyAuthToken, verifyUserId], deleteUser);


export default userRouter;
