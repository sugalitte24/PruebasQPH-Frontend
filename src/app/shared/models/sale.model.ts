export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  items: SaleItemRequest[];
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  createdAt: string;
  username: string;
  total: number;
  items: SaleItem[];
}
