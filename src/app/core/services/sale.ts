import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, SaleRequest } from '../../shared/models/sale.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SaleService {

  private readonly apiUrl = `${environment.apiUrl}/sales`;
  private http = inject(HttpClient);

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }

  create(request: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, request);
  }
}
