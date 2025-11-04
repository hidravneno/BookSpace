import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, businessOutline, homeOutline, ellipsisVertical } from 'ionicons/icons';

@Component({
  selector: 'app-my-spaces',
  templateUrl: './my-spaces.page.html',
  styleUrls: ['./my-spaces.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, CommonModule, FormsModule]
})
export class MySpacesPage implements OnInit {

  isMobile = false;

  spaces = [
    {
      id: 1,
      name: 'Sala de Reuniones A',
      capacity: 10,
      pricePerHour: 50,
      icon: 'business-outline'
    },
    {
      id: 2,
      name: 'Oficina Privada B',
      capacity: 4,
      pricePerHour: 30,
      icon: 'business-outline'
    },
    {
      id: 3,
      name: 'Auditorio C',
      capacity: 50,
      pricePerHour: 150,
      icon: 'home-outline'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkScreenSize();
    addIcons({ add, businessOutline, homeOutline, ellipsisVertical });
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  goToRegisterSpace() {
    this.router.navigate(['/register-space']);
  }

}
