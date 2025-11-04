import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonTextarea, AlertController } from '@ionic/angular/standalone';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline, personOutline, mailOutline, calendarOutline, callOutline, locationOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonIcon]
})
export class ProfilePage implements OnInit {

  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ logOutOutline, personOutline, mailOutline, calendarOutline, callOutline, locationOutline, createOutline });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async editProfile() {
    if (!this.currentUser) return;

    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
          value: this.currentUser.name
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.currentUser.email
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Teléfono',
          value: this.currentUser.phone || ''
        },
        {
          name: 'address',
          type: 'text',
          placeholder: 'Dirección',
          value: this.currentUser.address || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (this.currentUser) {
              const success = this.authService.updateProfile(this.currentUser.id, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address
              });
              if (success) {
                // Refresh current user
                this.currentUser = this.authService.getCurrentUser();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
