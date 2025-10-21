import { PaginatedResponse } from '../dto/pagination.dto';

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPaginationParams(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const take = limit;
  
  return { skip, take };
}
