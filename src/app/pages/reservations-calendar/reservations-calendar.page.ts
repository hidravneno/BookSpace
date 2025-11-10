import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonSelect, IonSelectOption, IonChip } from '@ionic/angular/standalone';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline, personOutline, businessOutline, checkmarkCircle, closeCircle, timeOutline as clockOutline } from 'ionicons/icons';
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
    private authService: AuthService
  ) {
    addIcons({ 
      calendarOutline, 
      timeOutline, 
      personOutline, 
      businessOutline, 
      checkmarkCircle, 
      closeCircle,
      clockOutline
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
  handleEventClick(arg: any) {
    const reservation = arg.event.extendedProps.reservation;
    console.log('Reserva seleccionada:', reservation);
    // Aquí podrías mostrar un modal con detalles de la reserva
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

}
