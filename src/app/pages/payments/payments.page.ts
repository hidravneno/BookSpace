import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonSegment, IonSegmentButton, IonChip, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { addIcons } from 'ionicons';
import { cardOutline, cashOutline, trendingUpOutline, trendingDownOutline, walletOutline, calendarOutline, filterOutline, downloadOutline, receiptOutline, checkmarkCircle, timeOutline, closeCircle } from 'ionicons/icons';
import 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Payment, Reservation } from '../../models/dashboard.models';

interface PaymentSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingPayments: number;
  completedPayments: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, 
    IonLabel, IonBadge, IonIcon, IonSegment, IonSegmentButton, IonChip,
    IonSpinner, IonRefresher, IonRefresherContent,
    BaseChartDirective, CommonModule, FormsModule
  ]
})
export class PaymentsPage implements OnInit {

  isMobile = false;
  isLoading = true;
  selectedFilter: 'all' | 'income' | 'expense' = 'all';
  
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  summary: PaymentSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    pendingPayments: 0,
    completedPayments: 0
  };

  // Chart data
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed?.y ?? 0;
            return `${context.dataset.label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ingresos',
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        data: [],
        label: 'Gastos',
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    addIcons({ cardOutline, cashOutline, trendingUpOutline, trendingDownOutline, walletOutline, calendarOutline, filterOutline, downloadOutline, receiptOutline, checkmarkCircle, timeOutline, closeCircle });
  }

  ngOnInit() {
    this.checkScreenSize();
    // Limpiar pagos antiguos del localStorage para forzar actualización
    this.clearOldPaymentsData();
    this.loadPayments();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  private clearOldPaymentsData() {
    // Limpiar datos de pagos antiguos que no tienen las nuevas propiedades
    const paymentsKey = 'bookspace_payments';
    const paymentsJson = localStorage.getItem(paymentsKey);
    
    if (paymentsJson) {
      try {
        const payments = JSON.parse(paymentsJson);
        if (payments.length > 0 && (!payments[0].type || !payments[0].description)) {
          console.log('Clearing old payments data...');
          localStorage.removeItem(paymentsKey);
        }
      } catch (e) {
        console.error('Error checking payments:', e);
        localStorage.removeItem(paymentsKey);
      }
    }
  }

  loadPayments() {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.dashboardService.getUserPayments(currentUser.id).subscribe({
        next: (payments) => {
          console.log('Payments loaded:', payments);
          this.payments = payments;
          this.calculateSummary();
          this.updateChartData();
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No current user found');
      this.isLoading = false;
    }
  }

  calculateSummary() {
    this.summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      pendingPayments: 0,
      completedPayments: 0
    };

    this.payments.forEach(payment => {
      if (payment.type === 'income') {
        this.summary.totalIncome += payment.amount;
      } else {
        this.summary.totalExpenses += payment.amount;
      }

      if (payment.status === 'completed') {
        this.summary.completedPayments++;
      } else if (payment.status === 'pending') {
        this.summary.pendingPayments++;
      }
    });

    this.summary.balance = this.summary.totalIncome - this.summary.totalExpenses;
  }

  updateChartData() {
    const monthlyData = this.getMonthlyData();
    
    this.barChartData.labels = monthlyData.map(d => d.month);
    this.barChartData.datasets[0].data = monthlyData.map(d => d.income);
    this.barChartData.datasets[1].data = monthlyData.map(d => d.expenses);
  }

  getMonthlyData(): MonthlyData[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyMap = new Map<number, MonthlyData>();

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      monthlyMap.set(monthIndex, {
        month: months[monthIndex],
        income: 0,
        expenses: 0
      });
    }

    // Aggregate payments by month
    this.payments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      const monthIndex = paymentDate.getMonth();
      
      if (monthlyMap.has(monthIndex)) {
        const data = monthlyMap.get(monthIndex)!;
        if (payment.type === 'income') {
          data.income += payment.amount;
        } else {
          data.expenses += payment.amount;
        }
      }
    });

    return Array.from(monthlyMap.values());
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredPayments = [...this.payments];
    } else {
      this.filteredPayments = this.payments.filter(p => p.type === this.selectedFilter);
    }
    
    // Sort by date (most recent first)
    this.filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  handleRefresh(event: any) {
    this.loadPayments();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getPaymentIcon(payment: Payment): string {
    if (payment.type === 'income') {
      return 'trending-up-outline';
    }
    return 'trending-down-outline';
  }

  getPaymentColor(payment: Payment): string {
    if (payment.type === 'income') {
      return 'success';
    }
    return 'danger';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'failed':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'card':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      case 'transfer':
        return 'wallet-outline';
      default:
        return 'wallet-outline';
    }
  }

  getMethodText(method: string): string {
    switch (method) {
      case 'card':
        return 'Tarjeta';
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

}
