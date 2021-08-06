import { NextFunction, Request, Response } from 'express';

const { TOKEN_SECRET } = process.env;

if (!TOKEN_SECRET) {
    throw new Error('Missing env variable: TOKEN_SECRET');
}

const verifyUserId = (req: Request, res: Response, next: NextFunction): void => {
    const decodedToken = res.locals['decodedToken'];
    const userId = parseInt(req.params['id'], 10) || req.body['id'] || req.body['userId'];
    if (!decodedToken || !decodedToken.user || decodedToken.user.id !== userId) {
        res.status(401).send('You are not authorized to make changes to that user!');
        return;
    }
    next();
};

export default verifyUserId;
