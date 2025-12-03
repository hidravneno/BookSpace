import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logIn, personAdd, searchOutline, businessOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, CommonModule, FormsModule]
})
export class WelcomePage implements OnInit {

  constructor(private router: Router) {
    addIcons({ logIn, personAdd, searchOutline, businessOutline });
  }

  ngOnInit() {
  }

  goToLogin(role: 'renter' | 'host') {
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  goToRegister(role: 'renter' | 'host') {
    this.router.navigate(['/register'], { queryParams: { role } });
  }

}
