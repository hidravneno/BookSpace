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
  IonText,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonText,
    CommonModule, 
    FormsModule
  ]
})
export class RegisterPage implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  // Password visibility toggles
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Password validation
  isPasswordValid: boolean = false;
  passwordsMatch: boolean = false;
  
  passwordRules = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private loadingController: LoadingController
  ) {
    addIcons({ eye, eyeOff, checkmarkCircle, closeCircle });
  }

  ngOnInit() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword() {
    this.passwordRules.minLength = this.password.length >= 8;
    this.passwordRules.hasUppercase = /[A-Z]/.test(this.password);
    this.passwordRules.hasLowercase = /[a-z]/.test(this.password);
    this.passwordRules.hasNumber = /\d/.test(this.password);
    this.passwordRules.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    
    this.isPasswordValid = Object.values(this.passwordRules).every(rule => rule);
    this.checkPasswordMatch();
  }

  checkPasswordMatch() {
    this.passwordsMatch = this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  isFormValid(): boolean {
    return !!(this.name && this.email && this.isPasswordValid && this.passwordsMatch);
  }

  async register() {
    this.validatePassword();
    this.checkPasswordMatch();
    
    if (!this.name.trim()) {
      this.toastService.showErrorToast('Por favor ingrese su nombre completo');
      return;
    }

    if (!this.email.trim()) {
      this.toastService.showErrorToast('Por favor ingrese su email');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.toastService.showErrorToast('Por favor ingrese un email válido');
      return;
    }
    
    if (!this.isPasswordValid) {
      this.toastService.showErrorToast('La contraseña no cumple con los requisitos');
      return;
    }
    
    if (!this.passwordsMatch) {
      this.toastService.showErrorToast('Las contraseñas no coinciden');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Registrando usuario...',
      translucent: true
    });
    await loading.present();
    
    try {
      const result = await this.authService.register(
        this.name.trim(), 
        this.email.trim(), 
        this.password
      );
      
      await loading.dismiss();
      
      if (result.success) {
        this.toastService.showSuccessToast(result.message);
        // Limpiar formulario
        this.clearForm();
        // Redirigir a login
        this.router.navigate(['/login']);
      } else {
        this.toastService.showErrorToast(result.message);
      }
    } catch (error) {
      await loading.dismiss();
      this.toastService.showErrorToast('Error al registrar usuario. Intente nuevamente.');
      console.error('Error en registro:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.isPasswordValid = false;
    this.passwordsMatch = false;
    this.passwordRules = {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false
    };
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
