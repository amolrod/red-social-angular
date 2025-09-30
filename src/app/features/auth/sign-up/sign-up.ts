import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
  standalone: false
})
export class SignUp {
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async onSubmit(form: NgForm) {
    if (form.valid) {
      // Validar que las contraseñas coincidan
      if (form.value.password !== form.value.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        const user = await this.auth.signUp(form.value.email, form.value.password);
        if (user) {
          this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo...';
          // Esperar un momento para mostrar el mensaje y luego redirigir
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        }
      } catch (error: any) {
        // Traducir algunos errores comunes de Firebase
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') {
          message = 'Este email ya está registrado. Intenta con otro o inicia sesión.';
        } else if (error.code === 'auth/weak-password') {
          message = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'El formato del email no es válido.';
        }
        this.errorMessage = 'Error: ' + message;
      } finally {
        this.isLoading = false;
      }
    }
  }
}
