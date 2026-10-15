import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss']
})
export class ShellComponent {

  private authService = inject(AuthService);

  readonly username = this.authService.getUsername();
  readonly role = this.authService.getRole();
  readonly isAdmin = this.authService.isAdmin();

  logout(): void {
    this.authService.logout();
  }
}
