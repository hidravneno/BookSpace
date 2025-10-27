import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton,
  IonIcon,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonCard, 
    IonCardContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton,
    IonIcon,
    CommonModule, 
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private loadingController: LoadingController
  ) { 
    addIcons({ eye, eyeOff });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir a dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email.trim()) {
      this.toastService.showErrorToast('Por favor ingrese su email');
      return;
    }

    if (!this.password.trim()) {
      this.toastService.showErrorToast('Por favor ingrese su contraseña');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.toastService.showErrorToast('Por favor ingrese un email válido');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      translucent: true
    });
    await loading.present();

    try {
      const result = await this.authService.login(
        this.email.trim(), 
        this.password
      );
      
      await loading.dismiss();
      
      if (result.success) {
        this.toastService.showSuccessToast(`¡Bienvenido, ${result.user?.name}!`);
        // Limpiar formulario
        this.clearForm();
        // Redirigir a dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.toastService.showErrorToast(result.message);
      }
    } catch (error) {
      await loading.dismiss();
      this.toastService.showErrorToast('Error al iniciar sesión. Intente nuevamente.');
      console.error('Error en login:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearForm() {
    this.email = '';
    this.password = '';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
