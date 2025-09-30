import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  standalone: false
})
export class SignIn {
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const user = await this.auth.signIn(form.value.email, form.value.password);
        if (user) {
          // Login exitoso, el AuthGuard permite el acceso
          this.router.navigate(['/home']);
        }
      } catch (error: any) {
        this.errorMessage = 'Error: ' + (error.message || 'No se pudo iniciar sesión');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
