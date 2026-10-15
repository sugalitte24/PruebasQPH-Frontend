import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../core/services/user';
import { Role, User } from '../../../shared/models/user.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectButtonModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  readonly roles: { label: string; value: Role }[] = [
    { label: 'Usuario', value: 'USER' },
    { label: 'Administrador', value: 'ADMIN' }
  ];

  users = signal<User[]>([]);
  loading = signal(false);
  submitting = signal(false);

  form = this.fb.nonNullable.group({
    nombre:   ['', [Validators.required, Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50),
                    Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    role:     ['USER' as Role, Validators.required]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastError('No se pudieron cargar los usuarios');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.userService.create(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario creado',
          detail: `${created.nombre} (${created.username}) ya puede iniciar sesión`
        });
        this.users.update(list => [...list, created]);   
        this.form.reset();                                
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.applyServerErrors(err);
        this.submitting.set(false);
      }
    });
  }

  errorFor(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !control.touched || !control.errors) return null;

    const e = control.errors;
    if (e['server'])    return e['server'];
    if (e['required'])  return 'Campo requerido';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
    if (e['email'])     return 'Email no válido';
    if (e['pattern'])   return 'Solo letras, números, punto, guion y guion bajo';
    return 'Valor inválido';
  }

  private applyServerErrors(err: HttpErrorResponse): void {
    const details = err.error?.details as Record<string, string> | undefined;
    if (err.status === 400 && details) {
      Object.entries(details).forEach(([field, message]) => {
        const control = this.form.get(field);
        control?.setErrors({ server: message });
        control?.markAsTouched();
      });
      return;
    }
    this.toastError(err.error?.error ?? 'No se pudo crear el usuario');
  }

  private toastError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
