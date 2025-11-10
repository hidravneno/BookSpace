import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Space, Reservation, Payment, Activity, DashboardStats, Notification } from '../models/dashboard.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly SPACES_KEY = 'bookspace_spaces';
  private readonly RESERVATIONS_KEY = 'bookspace_reservations';
  private readonly PAYMENTS_KEY = 'bookspace_payments';
  private readonly NOTIFICATIONS_KEY = 'bookspace_notifications';

  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeMockData();
  }

  /**
   * Obtiene las estadísticas del dashboard
   */
  getDashboardStats(): DashboardStats {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const spaces = this.getUserSpaces(currentUser.id);
    const reservations = this.getUserReservations(currentUser.id);
    const payments = this.getPayments().filter(p => p.userId === currentUser.id);
    const activities = this.getRecentActivities(currentUser.id);

    // Calcular estadísticas
    const activeReservations = reservations.filter(r => 
      r.status === 'confirmed' || r.status === 'pending'
    ).length;

    const monthlyRevenue = this.calculateMonthlyRevenue(payments);

    const stats: DashboardStats = {
      totalSpaces: spaces.length,
      activeReservations: activeReservations,
      monthlyRevenue: monthlyRevenue,
      pendingNotifications: this.getPendingNotificationsCount(currentUser.id),
      recentActivities: activities
    };

    this.dashboardStatsSubject.next(stats);
    return stats;
  }

  /**
   * Obtiene los espacios del usuario
   */
  getUserSpaces(userId: string): Space[] {
    const spaces = this.getSpaces();
    return spaces.filter(space => space.ownerId === userId);
  }

  /**
   * Obtiene las reservas del usuario
   */
  getUserReservations(userId: string): Reservation[] {
    const reservations = this.getReservations();
    const userSpaces = this.getUserSpaces(userId);
    const spaceIds = userSpaces.map(s => s.id);
    
    // Obtener reservas de los espacios del usuario
    return reservations.filter(r => spaceIds.includes(r.spaceId));
  }

  /**
   * Obtiene los pagos del usuario
   */
  getUserPayments(userId: string): Observable<Payment[]> {
    const payments = this.getPayments();
    const userPayments = payments.filter(p => p.userId === userId);
    return new BehaviorSubject(userPayments).asObservable();
  }

  /**
   * Obtiene las actividades recientes
   */
  getRecentActivities(userId: string): Activity[] {
    const activities: Activity[] = [];
    const reservations = this.getUserReservations(userId);
    const payments = this.getPayments().filter(p => p.userId === userId);

    // Crear actividades de reservas recientes
    reservations
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 2)
      .forEach(reservation => {
        let icon = 'checkmark-circle-outline';
        let iconColor = 'success';
        let title = 'Nueva reserva';
        
        if (reservation.status === 'confirmed') {
          icon = 'checkmark-circle-outline';
          iconColor = 'success';
          title = 'Reserva confirmada';
        } else if (reservation.status === 'pending') {
          icon = 'time-outline';
          iconColor = 'warning';
          title = 'Reserva pendiente';
        }

        activities.push({
          id: `activity_${reservation.id}`,
          type: 'reservation',
          icon: icon,
          iconColor: iconColor,
          title: title,
          description: `${reservation.spaceName} - ${this.formatDate(reservation.startDate)}`,
          timestamp: reservation.createdAt,
          relatedId: reservation.id
        });
      });

    // Crear actividades de pagos recientes
    payments
      .filter(p => p.status === 'completed')
      .sort((a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0))
      .slice(0, 2)
      .forEach(payment => {
        activities.push({
          id: `activity_${payment.id}`,
          type: 'payment',
          icon: 'cash-outline',
          iconColor: 'primary',
          title: 'Pago recibido',
          description: `$${payment.amount.toFixed(2)}`,
          timestamp: payment.paidAt || payment.createdAt,
          relatedId: payment.id
        });
      });

    // Ordenar por fecha y limitar a las últimas 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }

  /**
   * Calcula los ingresos del mes actual
   */
  private calculateMonthlyRevenue(payments: Payment[]): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments
      .filter(p => {
        if (p.status !== 'completed' || !p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /**
   * Obtiene el número de notificaciones pendientes
   */
  private getPendingNotificationsCount(userId: string): number {
    const reservations = this.getUserReservations(userId);
    // Contar reservas pendientes como notificaciones
    return reservations.filter(r => r.status === 'pending').length;
  }

  /**
   * Obtiene todos los espacios
   */
  private getSpaces(): Space[] {
    const spacesJson = localStorage.getItem(this.SPACES_KEY);
    if (!spacesJson) return [];
    
    const spaces = JSON.parse(spacesJson);
    // Convertir fechas de string a Date
    return spaces.map((space: any) => ({
      ...space,
      createdAt: new Date(space.createdAt),
      updatedAt: new Date(space.updatedAt)
    }));
  }

  /**
   * Obtiene todas las reservas
   */
  private getReservations(): Reservation[] {
    const reservationsJson = localStorage.getItem(this.RESERVATIONS_KEY);
    if (!reservationsJson) return [];
    
    const reservations = JSON.parse(reservationsJson);
    // Convertir fechas de string a Date
    return reservations.map((reservation: any) => ({
      ...reservation,
      startDate: new Date(reservation.startDate),
      endDate: new Date(reservation.endDate),
      createdAt: new Date(reservation.createdAt)
    }));
  }

  /**
   * Obtiene todos los pagos
   */
  private getPayments(): Payment[] {
    const paymentsJson = localStorage.getItem(this.PAYMENTS_KEY);
    if (!paymentsJson) return [];
    
    const payments = JSON.parse(paymentsJson);
    // Convertir fechas de string a Date
    return payments.map((payment: any) => ({
      ...payment,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : undefined,
      createdAt: new Date(payment.createdAt),
      date: payment.date ? new Date(payment.date) : new Date(payment.createdAt)
    }));
  }

  /**
   * Formatea una fecha para mostrar
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Inicializa datos de ejemplo (mock data) para demostración
   */
  private initializeMockData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Verificar si necesitamos reinicializar los pagos (para agregar nuevas propiedades)
    const existingPayments = localStorage.getItem(this.PAYMENTS_KEY);
    let needsPaymentUpdate = false;
    
    if (existingPayments) {
      try {
        const payments = JSON.parse(existingPayments);
        // Verificar si los pagos tienen las nuevas propiedades
        if (payments.length > 0 && (!payments[0].type || !payments[0].description)) {
          needsPaymentUpdate = true;
        }
      } catch (e) {
        needsPaymentUpdate = true;
      }
    }

    // Solo inicializar si no hay datos
    if (!localStorage.getItem(this.SPACES_KEY) || needsPaymentUpdate) {
      const mockSpaces: Space[] = [
        {
          id: 'space_1',
          name: 'Sala de Reuniones A',
          description: 'Sala moderna con capacidad para 10 personas',
          type: 'sala-reuniones',
          capacity: 10,
          pricePerHour: 50,
          pricePerDay: 300,
          amenities: ['WiFi', 'Proyector', 'Pizarra', 'Aire Acondicionado'],
          images: ['/assets/spaces/sala1.jpg'],
          address: 'Calle Principal 123',
          city: 'Ciudad de México',
          isActive: true,
          ownerId: currentUser.id,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'space_2',
          name: 'Oficina Premium',
          description: 'Oficina privada totalmente equipada',
          type: 'oficina',
          capacity: 4,
          pricePerHour: 75,
          pricePerDay: 450,
          amenities: ['WiFi', 'Escritorios', 'Sillas Ergonómicas', 'Café'],
          images: ['/assets/spaces/oficina1.jpg'],
          address: 'Avenida Reforma 456',
          city: 'Ciudad de México',
          isActive: true,
          ownerId: currentUser.id,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'space_3',
          name: 'Espacio Coworking',
          description: 'Espacio compartido ideal para freelancers',
          type: 'coworking',
          capacity: 20,
          pricePerHour: 25,
          pricePerDay: 150,
          amenities: ['WiFi', 'Café', 'Impresora', 'Áreas Comunes'],
          images: ['/assets/spaces/coworking1.jpg'],
          address: 'Calle Insurgentes 789',
          city: 'Ciudad de México',
          isActive: true,
          ownerId: currentUser.id,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];

      const mockReservations: Reservation[] = [
        {
          id: 'res_1',
          spaceId: 'space_1',
          spaceName: 'Sala de Reuniones A',
          userId: 'user_cliente_1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 horas
          status: 'confirmed',
          totalAmount: 200,
          notes: 'Reunión de equipo importante',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'res_2',
          spaceId: 'space_2',
          spaceName: 'Oficina Premium',
          userId: 'user_cliente_2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'confirmed',
          totalAmount: 450,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'res_3',
          spaceId: 'space_3',
          spaceName: 'Espacio Coworking',
          userId: 'user_cliente_3',
          userName: 'Carlos Rodríguez',
          userEmail: 'carlos@example.com',
          startDate: new Date(),
          endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
          status: 'pending',
          totalAmount: 200,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ];

      const mockPayments: Payment[] = [
        {
          id: 'pay_1',
          reservationId: 'res_1',
          userId: currentUser.id,
          amount: 200,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'Tarjeta de Crédito',
          transactionId: 'TXN001',
          paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'income',
          description: 'Pago por reserva - Sala de Reuniones A',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          method: 'card'
        },
        {
          id: 'pay_2',
          reservationId: 'res_2',
          userId: currentUser.id,
          amount: 450,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'Transferencia',
          transactionId: 'TXN002',
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          type: 'income',
          description: 'Pago por reserva - Oficina Premium',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          method: 'transfer'
        },
        {
          id: 'pay_3',
          reservationId: 'res_3',
          userId: currentUser.id,
          amount: 200,
          currency: 'MXN',
          status: 'pending',
          paymentMethod: 'Efectivo',
          transactionId: 'TXN003',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          type: 'income',
          description: 'Pago por reserva - Espacio Coworking',
          date: new Date(),
          method: 'cash'
        },
        {
          id: 'pay_4',
          reservationId: '',
          userId: currentUser.id,
          amount: 150,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'Tarjeta de Crédito',
          transactionId: 'TXN004',
          paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          type: 'expense',
          description: 'Mantenimiento del espacio',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          method: 'card'
        },
        {
          id: 'pay_5',
          reservationId: '',
          userId: currentUser.id,
          amount: 80,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'Efectivo',
          transactionId: 'TXN005',
          paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          type: 'expense',
          description: 'Suministros de oficina',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          method: 'cash'
        },
        {
          id: 'pay_6',
          reservationId: '',
          userId: currentUser.id,
          amount: 300,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'Transferencia',
          transactionId: 'TXN006',
          paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          type: 'expense',
          description: 'Renovación de mobiliario',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          method: 'transfer'
        }
      ];

      // Solo actualizar spaces y reservations si no existen
      if (!localStorage.getItem(this.SPACES_KEY)) {
        localStorage.setItem(this.SPACES_KEY, JSON.stringify(mockSpaces));
        localStorage.setItem(this.RESERVATIONS_KEY, JSON.stringify(mockReservations));
      }
      
      // Siempre actualizar payments si necesitan actualización o no existen
      if (needsPaymentUpdate || !localStorage.getItem(this.PAYMENTS_KEY)) {
        localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(mockPayments));
      }
    }
  }

  /**
   * Agrega un nuevo espacio
   */
  addSpace(space: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>): Space {
    const newSpace: Space = {
      ...space,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const spaces = this.getSpaces();
    spaces.push(newSpace);
    localStorage.setItem(this.SPACES_KEY, JSON.stringify(spaces));

    return newSpace;
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtiene las notificaciones del usuario
   */
  getUserNotifications(userId: string): Observable<Notification[]> {
    const notifications = this.getNotifications();
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return new BehaviorSubject(userNotifications).asObservable();
  }

  /**
   * Obtiene notificaciones no leídas
   */
  getUnreadNotifications(userId: string): Observable<Notification[]> {
    const notifications = this.getNotifications();
    const unreadNotifications = notifications
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return new BehaviorSubject(unreadNotifications).asObservable();
  }

  /**
   * Marca una notificación como leída
   */
  markNotificationAsRead(notificationId: string): boolean {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllNotificationsAsRead(userId: string): boolean {
    const notifications = this.getNotifications();
    let updated = false;
    
    notifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
    
    return updated;
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(notificationId: string): boolean {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications.splice(index, 1);
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene todas las notificaciones del localStorage
   */
  private getNotifications(): Notification[] {
    const notificationsJson = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (!notificationsJson) {
      this.initializeMockNotifications();
      return this.getNotifications();
    }
    
    const notifications = JSON.parse(notificationsJson);
    // Convertir fechas de string a Date
    return notifications.map((notification: any) => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
      readAt: notification.readAt ? new Date(notification.readAt) : undefined
    }));
  }

  /**
   * Inicializa notificaciones de ejemplo
   */
  private initializeMockNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        userId: currentUser.id,
        type: 'reservation',
        title: 'Nueva Reserva Confirmada',
        message: 'Se ha confirmado una reserva para tu Sala de Reuniones A.',
        priority: 'high',
        read: false,
        relatedId: 'res_1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Hace 2 horas
      },
      {
        id: 'notif_2',
        userId: currentUser.id,
        type: 'payment',
        title: 'Pago Recibido',
        message: 'Has recibido un pago de $200.00 por la reserva de Sala de Reuniones A.',
        priority: 'medium',
        read: false,
        relatedId: 'pay_1',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // Hace 5 horas
      },
      {
        id: 'notif_3',
        userId: currentUser.id,
        type: 'reservation',
        title: 'Reserva Pendiente',
        message: 'Tienes una nueva solicitud de reserva para Espacio Coworking.',
        priority: 'medium',
        read: false,
        relatedId: 'res_3',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // Hace 12 horas
      },
      {
        id: 'notif_4',
        userId: currentUser.id,
        type: 'reminder',
        title: 'Recordatorio de Reserva',
        message: 'Tu espacio Oficina Premium tiene una reserva programada para mañana.',
        priority: 'low',
        read: true,
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Hace 1 día
      },
      {
        id: 'notif_5',
        userId: currentUser.id,
        type: 'payment',
        title: 'Pago Completado',
        message: 'El pago de $450.00 ha sido procesado exitosamente.',
        priority: 'low',
        read: true,
        readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        relatedId: 'pay_2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Hace 3 días
      },
      {
        id: 'notif_6',
        userId: currentUser.id,
        type: 'system',
        title: 'Bienvenido a BookSpace',
        message: '¡Gracias por unirte! Comienza registrando tus primeros espacios.',
        priority: 'low',
        read: true,
        readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Hace 7 días
      }
    ];

    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(mockNotifications));
  }
}

