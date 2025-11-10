import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, calendarOutline, businessOutline, checkmarkCircleOutline, cashOutline, notificationsOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats, Activity } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner, RouterModule]
})
export class DashboardPage implements OnInit {

  isMobile = false;
  isLoading = true;
  userName = '';
  stats: DashboardStats | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    addIcons({ addCircleOutline, calendarOutline, businessOutline, checkmarkCircleOutline, cashOutline, notificationsOutline });
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadUserData();
    this.loadDashboardData();
  }

  private loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
    }
  }

  private loadDashboardData() {
    try {
      this.isLoading = true;
      this.stats = this.dashboardService.getDashboardStats();
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Formatea la moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  /**
   * Formatea la fecha relativa (hace X tiempo)
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Refresca los datos del dashboard
   */
  refreshData() {
    this.loadDashboardData();
  }

}
