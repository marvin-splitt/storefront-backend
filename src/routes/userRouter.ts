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
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user: UserDB = await userStore.show(parseInt(req.params['id'], 10));
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found.');
        }
    } catch (e) {
        res.status(500);
        res.send(e);
    }
};

const addDemoUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        password: 'test',
    };
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }
        const newUser: UserDB = await userStore.create(user);
        const token = jwt.sign(
            {
                user: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                },
            },
            TOKEN_SECRET,
        );
        res.status(201).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};

const addUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = req.body;
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }
        const newUser: UserDB = await userStore.create(user);
        const token = jwt.sign(
            {
                user: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                },
            },
            TOKEN_SECRET,
        );
        res.status(201).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const user: UserDB = req.body;
    const user_id: number = parseInt(req.params['id'], 10);
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET missing');
        }
        const updatedUser = await userStore.update(user_id, user);
        const token = jwt.sign(
            {
                user: {
                    id: updatedUser.id,
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    email: updatedUser.email,
                },
            },
            TOKEN_SECRET,
        );
        res.status(200).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const user_id: number = parseInt(req.params['id'], 10);
    try {
        const deletedUser = await userStore.delete(user_id);
        res.status(200).json(deletedUser);
    } catch (e) {
        res.status(500).send(e);
    }
};

const authenticateUser = async (req: Request, res: Response): Promise<void> => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    try {
        if (!email || !password) {
            throw new Error('Could not parse credentials');
        }
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET missing');
        }

        const authUser = await userStore.authenticate(email, password);
        if (!authUser) {
            throw new Error(`Could not authenticate user: ${email}. Wrong credentials`);
        }
        const token = jwt.sign(
            {
                user: {
                    id: authUser.id,
                    first_name: authUser.first_name,
                    last_name: authUser.last_name,
                    email: authUser.email,
                },
            },
            TOKEN_SECRET,
        );

        res.status(200).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};

// Routes
userRouter.get('/', verifyAuthToken, getAllUsers);
userRouter.get('/:id', verifyAuthToken, getUser);
userRouter.post('/login', authenticateUser);
userRouter.post('/demoUser', addDemoUser);
userRouter.post('/', verifyAuthToken, addUser);
userRouter.put('/:id', [verifyAuthToken, verifyUserId], updateUser);
userRouter.delete('/:id', [verifyAuthToken, verifyUserId], deleteUser);

export default userRouter;
