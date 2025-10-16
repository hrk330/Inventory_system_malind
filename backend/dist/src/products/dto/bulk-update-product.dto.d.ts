import { UpdateProductDto } from './update-product.dto';
export declare class BulkUpdateItemDto {
    id: string;
    data: UpdateProductDto;
}
export declare class BulkUpdateProductDto {
    updates: BulkUpdateItemDto[];
}
