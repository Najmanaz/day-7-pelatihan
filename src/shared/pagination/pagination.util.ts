import { from } from "node:stream/iter";
import type {
    PaginationParams,
    PaginationMeta,
    PaginationData,
    PaginatedResult
} from './pagination.model.js';
import { Result } from "pg";

export const createPaginationParams = (
    page: number,
    limit: number
): PaginationParams => {

    return {
        page,
        limit,
        offset: (page - 1) * limit
    };
};

export const createPaginationResult = <T>(
    result: PaginationData<T>,
    params: PaginationParams
): PaginatedResult<T> => {
    
    const totalPages = Math.ceil(
        result.totalIems / params.limit
    );

    const pagination: PaginationMeta = {
        page: params.page,
        limit: params.limit,
        totalItems: result.totalIems,
        totalPages,
        hasNextPage: params.page < totalPages, hasPreviousPage: params.page > 1
    };

    return {
        data: result.items,
        pagination
    };
};
