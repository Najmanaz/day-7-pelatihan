import { Router } from 'express';

import { UserHandler } from './user.handler.js';

import { registerUserSchema, userIdSchema } from './user.validation.js';

import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.js';

import { asyncHandler } from '../../shared/utils/async-handler.js';

import { updateUserSchema } from './user.validation.js';
import { paginationSchema } from '../../shared/pagination/pagination.validation.js';

export const createUserRoutes = (
    userHandler: UserHandler
) => {

    const router = Router();

    // Register
    router.post(
        '/register',
        validateBody(registerUserSchema),
        asyncHandler(userHandler.register)
    );

    router.get(
        '/:userId',
        validateParams(userIdSchema),
        asyncHandler(userHandler.getUserById)
    );

    // Get All
    router.get(
        '/',
        validateQuery(paginationSchema),
        asyncHandler(userHandler.getAll)
    );

    // Get single
    router.get(
        '/:id',
        validateParams(userIdSchema),
        asyncHandler(userHandler.getUserById)
    );

    // Update
    router.patch(
        '/:userId',
        // validateParams(userIdSchema),
        // validateBody(updateUserSchema),
        asyncHandler(userHandler.update)
    );

    // Delete
    router.delete(
        '/:id',
        // validateParams(userIdSchema),
        asyncHandler(userHandler.delete)
    )

    return router;
};