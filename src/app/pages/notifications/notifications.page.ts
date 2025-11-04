import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonBadge, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, checkmarkCircleOutline, warningOutline, informationCircleOutline } from 'ionicons/icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, CommonModule, FormsModule, IonList, IonItem, IonLabel, IonBadge, IonIcon]
})
export class NotificationsPage implements OnInit {

  notifications: Notification[] = [];

  constructor() {
    addIcons({ notificationsOutline, checkmarkCircleOutline, warningOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  private loadNotifications() {
    // Sample notifications - in a real app, this would come from a service
    this.notifications = [
      {
        id: '1',
        title: 'Nueva reserva confirmada',
        message: 'Se ha confirmado una reserva para la Sala de Reuniones A el 30 de octubre a las 10:00 AM',
        type: 'success',
        date: new Date('2025-10-29T10:00:00'),
        read: false
      },
      {
        id: '2',
        title: 'Pago recibido',
        message: 'Has recibido un pago de $150 por la reserva de Oficina B1',
        type: 'info',
        date: new Date('2025-10-28T15:30:00'),
        read: false
      },
      {
        id: '3',
        title: 'Mantenimiento programado',
        message: 'Recordatorio: Mantenimiento del sistema el 31 de octubre de 2:00 AM a 4:00 AM',
        type: 'warning',
        date: new Date('2025-10-27T09:00:00'),
        read: true
      },
      {
        id: '4',
        title: 'Reserva cancelada',
        message: 'La reserva para Conferencia Room fue cancelada por el cliente',
        type: 'warning',
        date: new Date('2025-10-26T14:20:00'),
        read: true
      }
    ];
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'checkmark-circle-outline';
      case 'warning': return 'warning-outline';
      case 'error': return 'warning-outline';
      default: return 'information-circle-outline';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'primary';
    }
  }

  markAsRead(notification: Notification) {
    notification.read = true;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

}
