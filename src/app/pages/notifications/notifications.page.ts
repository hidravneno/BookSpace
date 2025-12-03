import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonButton, IonChip, IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonSpinner, AlertController, ActionSheetController, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, checkmarkCircleOutline, warningOutline, informationCircleOutline, cashOutline, calendarOutline, alertCircleOutline, checkmarkDoneOutline, trashOutline, ellipsisVertical, filterOutline, closeOutline, timeOutline, linkOutline, arrowForwardOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Notification } from '../../models/dashboard.models';
import { Router } from '@angular/router';
import { NotificationDetailModalComponent } from './notification-detail-modal.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, 
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonButton, IonChip,
    IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class NotificationsPage implements OnInit {

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  selectedFilter: 'all' | 'unread' | 'read' = 'all';
  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ 
      notificationsOutline, checkmarkCircleOutline, warningOutline, 
      informationCircleOutline, cashOutline, calendarOutline, 
      alertCircleOutline, checkmarkDoneOutline, trashOutline, 
      ellipsisVertical, filterOutline, closeOutline, timeOutline,
      linkOutline, arrowForwardOutline 
    });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.dashboardService.getUserNotifications(currentUser.id).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  applyFilter() {
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter(n => n.read);
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  handleRefresh(event: any) {
    this.loadNotifications();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getIconName(type: string): string {
    switch (type) {
      case 'reservation':
        return 'calendar-outline';
      case 'payment':
        return 'cash-outline';
      case 'cancellation':
        return 'alert-circle-outline';
      case 'reminder':
        return 'information-circle-outline';
      case 'system':
        return 'notifications-outline';
      case 'update':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }

  getIconColor(notification: Notification): string {
    if (!notification.read) {
      switch (notification.priority) {
        case 'high':
          return 'danger';
        case 'medium':
          return 'warning';
        default:
          return 'primary';
      }
    }
    return 'medium';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      default:
        return 'Baja';
    }
  }

  async markAsRead(notification: Notification) {
    // Abrir modal con detalles
    await this.openNotificationDetail(notification);

    // Marcar como leída si no lo está
    if (!notification.read) {
      const success = this.dashboardService.markNotificationAsRead(notification.id);
      if (success) {
        notification.read = true;
        notification.readAt = new Date();
        this.applyFilter();
      }
    }
  }

  async openNotificationDetail(notification: Notification) {
    const modal = await this.modalController.create({
      component: NotificationDetailModalComponent,
      componentProps: {
        notification: notification
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      if (data.action === 'navigate') {
        this.navigateFromNotification(data.notification);
      } else if (data.action === 'delete') {
        this.deleteNotification(data.notification);
      }
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'reservation':
        return 'Reserva';
      case 'payment':
        return 'Pago';
      case 'cancellation':
        return 'Cancelación';
      case 'reminder':
        return 'Recordatorio';
      case 'system':
        return 'Sistema';
      case 'update':
        return 'Actualización';
      default:
        return 'Notificación';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async navigateFromNotification(notification: Notification) {
    // Cerrar el modal si está abierto
    await this.modalController.dismiss();
    
    // Mostrar un toast de navegación
    let destination = '';
    let route = '';
    
    // Navegar según el tipo de notificación
    if (notification.actionUrl) {
      route = notification.actionUrl;
      destination = 'la página solicitada';
    } else if (notification.relatedId) {
      // Determinar la ruta según el tipo
      switch (notification.type) {
        case 'reservation':
          route = '/reservations-calendar';
          destination = 'el calendario de reservas';
          break;
        case 'payment':
          route = '/payments';
          destination = 'la página de pagos';
          break;
        case 'cancellation':
          route = '/reservations-calendar';
          destination = 'el calendario de reservas';
          break;
        case 'reminder':
          route = '/reservations-calendar';
          destination = 'el calendario de reservas';
          break;
        case 'system':
          route = '/dashboard';
          destination = 'el dashboard';
          break;
        default:
          break;
      }
    }
    
    if (route) {
      // Mostrar toast de feedback
      const toast = await this.toastController.create({
        message: `Navegando a ${destination}...`,
        duration: 2000,
        position: 'bottom',
        color: 'primary',
        icon: 'arrow-forward-outline'
      });
      await toast.present();
      
      // Navegar
      await this.router.navigate([route]);
    } else {
      // Si no hay ninguna referencia, mostrar mensaje
      const toast = await this.toastController.create({
        message: 'No hay detalles adicionales disponibles',
        duration: 2000,
        position: 'bottom',
        color: 'medium',
        icon: 'information-circle-outline'
      });
      await toast.present();
    }
  }

  async markAllAsRead() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const alert = await this.alertController.create({
      header: 'Marcar todas como leídas',
      message: '¿Deseas marcar todas las notificaciones como leídas?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            const success = this.dashboardService.markAllNotificationsAsRead(currentUser.id);
            if (success) {
              this.loadNotifications();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showNotificationOptions(notification: Notification) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: notification.read ? 'Marcar como no leída' : 'Marcar como leída',
          icon: 'checkmark-circle-outline',
          handler: () => {
            if (!notification.read) {
              this.markAsRead(notification);
            }
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.deleteNotification(notification);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();
  }

  async deleteNotification(notification: Notification) {
    const alert = await this.alertController.create({
      header: 'Eliminar Notificación',
      message: '¿Estás seguro de que deseas eliminar esta notificación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const success = this.dashboardService.deleteNotification(notification.id);
            if (success) {
              this.loadNotifications();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

}
