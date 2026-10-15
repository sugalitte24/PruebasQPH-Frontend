import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SaleService } from '../../../core/services/sale';
import { AuthService } from '../../../core/services/auth';
import { Sale } from '../../../shared/models/sale.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sale-history',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TableModule, ToastModule],
  providers: [MessageService],
  templateUrl: './sale-history.html',
  styleUrls: ['./sale-history.scss']
})
export class SaleHistoryComponent implements OnInit {

  private saleService = inject(SaleService);
  private messageService = inject(MessageService);

  readonly isAdmin = inject(AuthService).isAdmin();

  sales = signal<Sale[]>([]);
  loading = signal(false);

  totalVendido = computed(() => this.sales().reduce((sum, s) => sum + s.total, 0));
  unidadesVendidas = computed(() =>
    this.sales().reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0), 0)
  );

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading.set(true);
    this.saleService.getAll().subscribe({
      next: (data) => {
        this.sales.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el historial de ventas'
        });
        this.loading.set(false);
      }
    });
  }

  shortInvoice(sale: Sale): string {
    return sale.invoiceNumber.substring(0, 8).toUpperCase();
  }
}
