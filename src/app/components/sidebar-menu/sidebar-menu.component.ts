import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, calendarOutline, walletOutline, personOutline, notificationsOutline, logOutOutline, businessOutline, addCircleOutline } from 'ionicons/icons'; // Add new icons
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Add RouterModule
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  ],
})
export class SidebarMenuComponent implements OnInit {
  public appPages = [
    { title: 'Dashboard / Inicio', url: '/dashboard', icon: 'home-outline' },
    { title: 'Mis Espacios', url: '/my-spaces', icon: 'business-outline' },
    { title: 'Registrar Nuevo Espacio', url: '/register-space', icon: 'add-circle-outline' },
    { title: 'Calendario de Reservas', url: '/reservations-calendar', icon: 'calendar-outline' },
    { title: 'Pagos / Ingresos', url: '/payments', icon: 'wallet-outline' },
    { title: 'Perfil', url: '/profile', icon: 'person-outline' },
    { title: 'Notificaciones', url: '/notifications', icon: 'notifications-outline' },
    { title: 'Cerrar Sesión', url: '/logout', icon: 'log-out-outline', handler: () => this.logout() }, // Add handler for logout
  ];
  public catalogManagement: any[] = []; // Remove old menu items
  public storeManagement: any[] = []; // Remove old menu items

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService, private menuController: MenuController) { // Inject AuthService
    addIcons({ 
      homeOutline, 
      businessOutline, 
      addCircleOutline, 
      calendarOutline, 
      walletOutline, 
      personOutline, 
      notificationsOutline, 
      logOutOutline
    });
  }

  ngOnInit() {
  }

  onItemClick() {
    this.menuController.close('main');
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  isPageActive(url: string): boolean {
    return this.router.url === url;
  }

  async logout() {
    console.log('Cerrando sesión...');
    this.authService.logout(); // Usar el método logout del AuthService
    this.router.navigateByUrl('/login', { replaceUrl: true }); // Redirige a la página de login
  }
}
