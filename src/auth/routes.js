import { config } from '../config.js';

import { AuthController } from './authController.js';

import * as UserMiddleware from './users-middleware.js';
import * as AuthValidationMiddleware from './validation-middleware.js';


export default function configureAuthRoutes(app) {
    app.post('/auth', [
        UserMiddleware.hasAuthValidFields,
        UserMiddleware.passwordAndUserMatch,
        AuthController.login
    ]);

    app.post('/auth/refresh', [
        AuthValidationMiddleware.validJWTNeeded,
        AuthValidationMiddleware.verifyRefreshBodyField,
        AuthValidationMiddleware.validRefreshNeeded,
        AuthController.login
    ]);
};
