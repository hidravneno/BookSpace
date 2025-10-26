import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOut, person } from 'ionicons/icons';
import { AuthService, AuthUser } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    IonIcon,
    IonButtons,
    CommonModule
  ],
})
export class HomePage implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({ logOut, person });
  }

  ngOnInit() {
    // Suscribirse a cambios en el usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.toastService.showSuccessToast('Sesión cerrada exitosamente');
    this.router.navigate(['/login']);
  }
}
