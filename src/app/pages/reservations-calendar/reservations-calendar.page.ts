import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonMenuButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonSelect, IonSelectOption, IonChip, ModalController } from '@ionic/angular/standalone';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline, personOutline, businessOutline, checkmarkCircle, closeCircle, timeOutline as clockOutline, cashOutline, documentTextOutline, close } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Reservation } from '../../models/dashboard.models';

@Component({
  selector: 'app-reservations-calendar',
  templateUrl: './reservations-calendar.page.html',
  styleUrls: ['./reservations-calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonSelect, IonSelectOption, IonChip, CommonModule, FormsModule, FullCalendarModule]
})
export class ReservationsCalendarPage implements OnInit {

  isMobile = false;
  isLoading = true;
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  selectedFilter: string = 'all';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    }
  };

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private modalController: ModalController
  ) {
    addIcons({ 
      calendarOutline, 
      timeOutline, 
      personOutline, 
      businessOutline, 
      checkmarkCircle, 
      closeCircle,
      clockOutline,
      cashOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadReservations();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Carga las reservas del usuario
   */
  private loadReservations() {
    try {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.reservations = this.dashboardService.getUserReservations(currentUser.id);
        this.applyFilter();
        this.updateCalendarEvents();
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Actualiza los eventos del calendario
   */
  private updateCalendarEvents() {
    const events = this.filteredReservations.map(res => ({
      id: res.id,
      title: `${res.spaceName} - ${res.userName}`,
      start: res.startDate,
      end: res.endDate,
      backgroundColor: this.getEventColor(res.status),
      borderColor: this.getEventColor(res.status),
      extendedProps: {
        reservation: res
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  /**
   * Obtiene el color según el estado
   */
  private getEventColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': '#28a745',
      'pending': '#ffc107',
      'cancelled': '#dc3545',
      'completed': '#6c757d'
    };
    return colors[status] || '#007bff';
  }

  /**
   * Maneja el clic en una fecha
   */
  handleDateClick(arg: any) {
    console.log('Fecha seleccionada:', arg.dateStr);
    // Aquí podrías navegar a crear una nueva reserva
  }

  /**
   * Maneja el clic en un evento
   */
  async handleEventClick(arg: any) {
    const reservation = arg.event.extendedProps.reservation;
    console.log('Reserva seleccionada:', reservation);
    
    // Mostrar modal con detalles de la reserva
    await this.showReservationDetails(reservation);
  }

  /**
   * Aplica filtro a las reservas
   */
  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredReservations = [...this.reservations];
    } else {
      this.filteredReservations = this.reservations.filter(
        res => res.status === this.selectedFilter
      );
    }
    this.updateCalendarEvents();
  }

  /**
   * Maneja el cambio de filtro
   */
  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  /**
   * Obtiene el color del badge según el estado
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': 'success',
      'pending': 'warning',
      'cancelled': 'danger',
      'completed': 'medium'
    };
    return colors[status] || 'primary';
  }

  /**
   * Obtiene el texto del estado
   */
  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    return texts[status] || status;
  }

  /**
   * Formatea la fecha y hora
   */
  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatea el monto
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  /**
   * Refresca las reservas
   */
  refreshReservations() {
    this.loadReservations();
  }

  /**
   * Muestra un modal con los detalles de la reserva
   */
  async showReservationDetails(reservation: Reservation) {
    const modal = await this.modalController.create({
      component: ReservationDetailsModal,
      componentProps: {
        reservation: reservation
      },
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75
    });

    await modal.present();
  }

}

// Componente modal para mostrar detalles de la reserva
@Component({
  selector: 'app-reservation-details-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalles de la Reserva</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ reservation.spaceName }}</ion-card-title>
          <ion-card-subtitle>
            <ion-badge [color]="getStatusColor(reservation.status)">
              {{ getStatusText(reservation.status) }}
            </ion-badge>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="none">
            <ion-item>
              <ion-icon name="person-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <p>Usuario</p>
                <h3>{{ reservation.userName }}</h3>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <p>Fecha de Inicio</p>
                <h3>{{ formatDateTime(reservation.startDate) }}</h3>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <p>Fecha de Fin</p>
                <h3>{{ formatDateTime(reservation.endDate) }}</h3>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <p>Duración</p>
                <h3>{{ calculateDuration(reservation.startDate, reservation.endDate) }}</h3>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="cash-outline" slot="start" color="success"></ion-icon>
              <ion-label>
                <p>Monto Total</p>
                <h3>{{ formatAmount(reservation.totalAmount) }}</h3>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="reservation.notes">
              <ion-icon name="document-text-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <p>Notas</p>
                <h3>{{ reservation.notes }}</h3>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
    }
    
    ion-list {
      padding: 0;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 16px;
    }

    ion-label p {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-bottom: 4px;
    }

    ion-label h3 {
      font-size: 16px;
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    ion-badge {
      font-size: 12px;
      padding: 6px 12px;
    }
  `],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    CommonModule
  ]
})
class ReservationDetailsModal {
  reservation!: Reservation;

  constructor(private modalController: ModalController) {
    addIcons({ 
      personOutline,
      calendarOutline,
      timeOutline,
      cashOutline,
      documentTextOutline
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': 'success',
      'pending': 'warning',
      'cancelled': 'danger',
      'completed': 'medium'
    };
    return colors[status] || 'primary';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    return texts[status] || status;
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  calculateDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return diffDays === 1 
        ? `${diffDays} día${remainingHours > 0 ? ` y ${remainingHours} hora(s)` : ''}`
        : `${diffDays} días${remainingHours > 0 ? ` y ${remainingHours} hora(s)` : ''}`;
    }
    
    return `${diffHours} hora(s)`;
  }
}
