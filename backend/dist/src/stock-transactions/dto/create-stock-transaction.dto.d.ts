export declare class CreateStockTransactionDto {
    productId: string;
    fromLocationId?: string;
    toLocationId?: string;
    type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
    quantity: number;
    referenceNo?: string;
    remarks?: string;
}
