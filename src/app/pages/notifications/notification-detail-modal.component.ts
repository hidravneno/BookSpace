import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel, IonBadge, ModalController } from '@ionic/angular/standalone';
import { Notification } from '../../models/dashboard.models';

@Component({
  selector: 'app-notification-detail-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalles de Notificación</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="detail-card">
        <ion-card-header>
          <div class="modal-header-content">
            <ion-icon 
              [name]="getIconName(notification.type)" 
              [color]="getIconColor(notification)"
              class="modal-icon">
            </ion-icon>
            <div class="modal-title-section">
              <ion-card-title>{{ notification.title }}</ion-card-title>
              <div class="modal-badges">
                <ion-chip [color]="getPriorityColor(notification.priority)" class="priority-chip-large">
                  <ion-label>Prioridad: {{ getPriorityText(notification.priority) }}</ion-label>
                </ion-chip>
                <ion-chip color="medium" class="type-chip">
                  <ion-label>{{ getTypeText(notification.type) }}</ion-label>
                </ion-chip>
              </div>
            </div>
          </div>
        </ion-card-header>

        <ion-card-content>
          <!-- Mensaje -->
          <div class="detail-section">
            <h3>Mensaje</h3>
            <p class="message-text">{{ notification.message }}</p>
          </div>

          <!-- Fecha -->
          <div class="detail-section">
            <h3>
              <ion-icon name="time-outline"></ion-icon>
              Fecha y Hora
            </h3>
            <p>{{ formatDate(notification.createdAt) }}</p>
          </div>

          <!-- Estado -->
          <div class="detail-section">
            <h3>
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              Estado
            </h3>
            <p>
              <ion-badge [color]="notification.read ? 'success' : 'warning'">
                {{ notification.read ? 'Leída' : 'No leída' }}
              </ion-badge>
              <span *ngIf="notification.readAt" class="read-time">
                • Leída el {{ formatDate(notification.readAt) }}
              </span>
            </p>
          </div>

          <!-- ID de Referencia -->
          <div class="detail-section" *ngIf="notification.relatedId">
            <h3>
              <ion-icon name="link-outline"></ion-icon>
              ID de Referencia
            </h3>
            <p class="reference-id">{{ notification.relatedId }}</p>
          </div>

          <!-- Acciones -->
          <div class="modal-actions">
            <ion-button 
              expand="block" 
              color="primary"
              (click)="viewDetails()"
              *ngIf="notification.type === 'reservation' || notification.type === 'payment'">
              <ion-icon name="arrow-forward-outline" slot="start"></ion-icon>
              Ver Detalles
            </ion-button>

            <ion-button 
              expand="block" 
              fill="outline"
              color="danger"
              (click)="deleteNotif()">
              <ion-icon name="trash-outline" slot="start"></ion-icon>
              Eliminar Notificación
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .detail-card {
      margin: 0;
    }

    .modal-header-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .modal-icon {
      font-size: 48px;
      flex-shrink: 0;
    }

    .modal-title-section {
      flex: 1;
    }

    .modal-badges {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .priority-chip-large,
    .type-chip {
      height: 28px;
    }

    .detail-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--ion-color-light);

      &:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
      }

      h3 {
        font-size: 14px;
        font-weight: 600;
        color: var(--ion-color-medium);
        text-transform: uppercase;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;

        ion-icon {
          font-size: 18px;
        }
      }

      p {
        font-size: 16px;
        line-height: 1.6;
        margin: 0;
        color: var(--ion-text-color);
      }

      .message-text {
        font-size: 15px;
        white-space: pre-wrap;
      }

      .read-time {
        color: var(--ion-color-medium);
        font-size: 14px;
        margin-left: 8px;
      }

      .reference-id {
        font-family: monospace;
        background: var(--ion-color-light);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
      }
    }

    .modal-actions {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      ion-button {
        height: 48px;
        font-weight: 600;
      }
    }

    @media (prefers-color-scheme: dark) {
      .detail-section {
        border-bottom-color: rgba(255, 255, 255, 0.1);

        .reference-id {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonChip, IonLabel, IonBadge
  ]
})
export class NotificationDetailModalComponent {
  @Input() notification!: Notification;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  viewDetails() {
    this.modalController.dismiss({ action: 'navigate', notification: this.notification });
  }

  deleteNotif() {
    this.modalController.dismiss({ action: 'delete', notification: this.notification });
  }

  getIconName(type: string): string {
    switch (type) {
      case 'reservation': return 'calendar-outline';
      case 'payment': return 'cash-outline';
      case 'cancellation': return 'alert-circle-outline';
      case 'reminder': return 'information-circle-outline';
      case 'system': return 'notifications-outline';
      case 'update': return 'checkmark-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  getIconColor(notification: Notification): string {
    if (!notification.read) {
      switch (notification.priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        default: return 'primary';
      }
    }
    return 'medium';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'success';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      default: return 'Baja';
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'reservation': return 'Reserva';
      case 'payment': return 'Pago';
      case 'cancellation': return 'Cancelación';
      case 'reminder': return 'Recordatorio';
      case 'system': return 'Sistema';
      case 'update': return 'Actualización';
      default: return 'Notificación';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
