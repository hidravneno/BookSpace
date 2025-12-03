import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonTextarea, IonAvatar, IonChip, IonGrid, IonRow, IonCol, AlertController, ToastController, ActionSheetController } from '@ionic/angular/standalone';
import { AuthService, AuthUser } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline, personOutline, mailOutline, calendarOutline, callOutline, locationOutline, createOutline, homeOutline, cardOutline, starOutline, timeOutline, briefcaseOutline, checkmarkCircle, trendingUpOutline, peopleOutline, notifications, keyOutline, cameraOutline, imagesOutline, trashOutline } from 'ionicons/icons';

interface UserStats {
  totalSpaces: number;
  totalReservations: number;
  totalIncome: number;
  completedBookings: number;
  activeSpaces: number;
  averageRating: number;
  memberSince: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, 
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
    IonList, IonItem, IonLabel, IonButton, IonIcon, IonAvatar, IonChip, 
    IonGrid, IonRow, IonCol,
    CommonModule, FormsModule
  ]
})
export class ProfilePage implements OnInit, OnDestroy {

  currentUser: AuthUser | null = null;
  userStats: UserStats = {
    totalSpaces: 0,
    totalReservations: 0,
    totalIncome: 0,
    completedBookings: 0,
    activeSpaces: 0,
    averageRating: 0,
    memberSince: ''
  };
  isLoading = true;
  private userSubscription: any;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ 
      logOutOutline, personOutline, mailOutline, calendarOutline, callOutline, 
      locationOutline, createOutline, homeOutline, cardOutline, starOutline, 
      timeOutline, briefcaseOutline, checkmarkCircle, trendingUpOutline, 
      peopleOutline, notifications, keyOutline, cameraOutline, imagesOutline, trashOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    // Limpiar suscripción cuando el componente se destruya
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Se suscribe a los cambios del usuario para actualización en tiempo real
   */
  private subscribeToUserChanges() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadUserStats();
        // Forzar detección de cambios para actualizar la vista inmediatamente
        this.cdr.detectChanges();
      }
    });
  }

  loadUserProfile() {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.loadUserStats();
    }
    
    this.isLoading = false;
  }

  loadUserStats() {
    if (!this.currentUser) return;

    // Obtener espacios del usuario
    const spaces = this.dashboardService.getUserSpaces(this.currentUser.id);
    
    // Obtener reservas del usuario
    const reservations = this.dashboardService.getUserReservations(this.currentUser.id);
    
    // Obtener pagos del usuario
    this.dashboardService.getUserPayments(this.currentUser.id).subscribe(payments => {
      const totalIncome = payments
        .filter(p => p.type === 'income' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      this.userStats = {
        totalSpaces: spaces.length,
        totalReservations: reservations.length,
        totalIncome: totalIncome,
        completedBookings: reservations.filter(r => r.status === 'completed').length,
        activeSpaces: spaces.filter(s => s.isActive).length,
        averageRating: 4.5, // Hardcoded por ahora
        memberSince: this.getMemberSince()
      };
    });
  }

  getMemberSince(): string {
    if (!this.currentUser?.createdAt) return '';
    
    const date = new Date(this.currentUser.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} año${years > 1 ? 's' : ''}`;
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  getInitials(): string {
    if (!this.currentUser?.name) return '?';
    
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  /**
   * Obtiene el avatar actual del usuario
   */
  getUserAvatar(): string | undefined {
    return this.currentUser?.avatar;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  async editProfile() {
    if (!this.currentUser) return;

    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre completo',
          value: this.currentUser.name,
          attributes: {
            required: true
          }
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.currentUser.email,
          attributes: {
            required: true
          }
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Teléfono (opcional)',
          value: this.currentUser.phone || ''
        },
        {
          name: 'address',
          type: 'text',
          placeholder: 'Dirección (opcional)',
          value: this.currentUser.address || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.name || !data.email) {
              this.showToast('Por favor completa los campos requeridos', 'warning');
              return false;
            }

            if (this.currentUser) {
              const success = this.authService.updateProfile(this.currentUser.id, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address
              });
              
              if (success) {
                // No necesitamos actualizar manualmente currentUser porque el observable lo hará
                this.showToast('Perfil actualizado correctamente', 'success');
              } else {
                this.showToast('Error al actualizar el perfil', 'danger');
              }
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual',
          attributes: {
            required: true
          }
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña',
          attributes: {
            required: true,
            minlength: 6
          }
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña',
          attributes: {
            required: true,
            minlength: 6
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
              this.showToast('Por favor completa todos los campos', 'warning');
              return false;
            }

            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Las contraseñas no coinciden', 'warning');
              return false;
            }

            if (data.newPassword.length < 6) {
              this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
              return false;
            }

            // Aquí iría la lógica real de cambio de contraseña
            this.showToast('Contraseña actualizada correctamente', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  /**
   * Muestra opciones para cambiar el avatar
   */
  async changeAvatar() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar Foto de Perfil',
      buttons: [
        {
          text: 'Seleccionar desde galería',
          icon: 'images-outline',
          handler: () => {
            this.selectAvatarFromGallery();
          }
        },
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => {
            this.takePhoto();
          }
        },
        ...(this.currentUser?.avatar ? [{
          text: 'Eliminar foto',
          icon: 'trash-outline',
          role: 'destructive' as const,
          handler: () => {
            this.removeAvatar();
          }
        }] : []),
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel' as const
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Selecciona una imagen desde la galería
   */
  selectAvatarFromGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.processImageFile(file);
      }
    };
    input.click();
  }

  /**
   * Toma una foto con la cámara (simulado en web, usa input de archivo)
   */
  takePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Intenta usar la cámara en móviles
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.processImageFile(file);
      }
    };
    input.click();
  }

  /**
   * Procesa el archivo de imagen seleccionado
   */
  private async processImageFile(file: File) {
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen es demasiado grande. Máximo 5MB', 'warning');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona una imagen válida', 'warning');
      return;
    }

    // Mostrar mensaje de procesamiento
    const loadingToast = await this.toastController.create({
      message: 'Procesando imagen...',
      duration: 0,
      position: 'bottom'
    });
    await loadingToast.present();

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64Image = e.target.result;
      await this.updateAvatarImage(base64Image);
      loadingToast.dismiss();
    };
    reader.onerror = async () => {
      await loadingToast.dismiss();
      this.showToast('Error al procesar la imagen', 'danger');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Actualiza la imagen del avatar
   */
  private async updateAvatarImage(base64Image: string) {
    if (!this.currentUser) return;

    const success = this.authService.updateAvatar(this.currentUser.id, base64Image);
    
    if (success) {
      // Esperar un tick para que se propague el cambio a través del observable
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
      this.showToast('Foto de perfil actualizada correctamente', 'success');
    } else {
      this.showToast('Error al actualizar la foto de perfil', 'danger');
    }
  }

  /**
   * Elimina el avatar del usuario
   */
  private async removeAvatar() {
    if (!this.currentUser) return;

    const alert = await this.alertController.create({
      header: 'Eliminar Foto',
      message: '¿Estás seguro de que deseas eliminar tu foto de perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const success = this.authService.updateAvatar(this.currentUser!.id, '');
            if (success) {
              // No necesitamos actualizar manualmente currentUser porque el observable lo hará
              this.showToast('Foto de perfil eliminada', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
