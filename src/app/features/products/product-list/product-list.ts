import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { SaleService } from '../../../core/services/sale';
import { Product } from '../../../shared/models/product.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    FormsModule, 
    DialogModule,
    InputNumberModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {

  private productService = inject(ProductService);
  private saleService = inject(SaleService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  sellDialogVisible = false;
  selectedProduct: Product | null = null;
  sellQuantity = 1;
  selling = false;

  products: Product[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
        this.loading = false;
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/products/edit', id]);
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${product.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteProduct(product.id!)
    });
  }

  private deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto eliminado correctamente'
        });
        this.loadProducts();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error ?? 'No se pudo eliminar el producto'
        });
      }
    });
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  openSell(product: Product): void {
    this.selectedProduct = product;
    this.sellQuantity = 1;
    this.sellDialogVisible = true;
  }
  
  confirmSell(): void {
    if (!this.selectedProduct || this.sellQuantity < 1) return;
    this.selling = true;
  
    const request = { items: [{ productId: this.selectedProduct.id!, quantity: this.sellQuantity }] };

    this.saleService.create(request).subscribe({
      next: (sale) => {
        const item = sale.items[0];
        this.messageService.add({
          severity: 'success',
          summary: 'Venta registrada',
          detail: `${item.quantity} x ${item.productName} — Total $${sale.total}. Ver en Historial de ventas`
        });
        this.sellDialogVisible = false;
        this.selling = false;
        this.loadProducts();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo vender',
          detail: err.error?.error ?? 'Error al registrar la venta'
        });
        this.selling = false;
      }
    });
  }
}