import { TokenPayload } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload; // Now TypeScript knows req.user exists!
        }
    }
}
