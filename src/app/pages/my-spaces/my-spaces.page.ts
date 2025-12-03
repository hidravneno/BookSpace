import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonFab, IonFabButton, IonSpinner, AlertController, ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, businessOutline, homeOutline, ellipsisVertical, createOutline, trashOutline, peopleOutline, cashOutline, locationOutline, checkmarkCircle, closeCircle, calendarOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Space } from '../../models/dashboard.models';
import { EditSpaceModalComponent } from '../../components/edit-space-modal/edit-space-modal.component';

@Component({
  selector: 'app-my-spaces',
  templateUrl: './my-spaces.page.html',
  styleUrls: ['./my-spaces.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonFab, IonFabButton, IonSpinner, CommonModule, FormsModule]
})
export class MySpacesPage implements OnInit {

  isMobile = false;
  isLoading = true;
  spaces: Space[] = [];

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    addIcons({ 
      add, 
      businessOutline, 
      homeOutline, 
      ellipsisVertical, 
      createOutline, 
      trashOutline,
      peopleOutline,
      cashOutline,
      locationOutline,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadSpaces();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Carga los espacios del usuario
   */
  private loadSpaces() {
    try {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.spaces = this.dashboardService.getUserSpaces(currentUser.id);
      }
    } catch (error) {
      console.error('Error cargando espacios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navega a la página de registro de espacio
   */
  goToRegisterSpace() {
    this.router.navigate(['/register-space']);
  }

  /**
   * Obtiene el icono según el tipo de espacio
   */
  getSpaceIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'oficina': 'business-outline',
      'sala-reuniones': 'people-outline',
      'coworking': 'home-outline',
      'auditorio': 'home-outline',
      'espacio-trabajo': 'business-outline'
    };
    return icons[type] || 'business-outline';
  }

  /**
   * Formatea el precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  /**
   * Muestra el menú de opciones para un espacio
   */
  async showSpaceOptions(space: Space) {
    const alert = await this.alertController.create({
      header: space.name,
      message: '¿Qué acción deseas realizar?',
      buttons: [
        {
          text: 'Editar',
          handler: () => {
            this.editSpace(space);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmDeleteSpace(space);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Edita un espacio
   */
  async editSpace(space: Space) {
    const modal = await this.modalController.create({
      component: EditSpaceModalComponent,
      componentProps: {
        space: space
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.action === 'updated') {
        // Recargar los espacios después de la actualización
        this.loadSpaces();
      }
    });

    await modal.present();
  }

  /**
   * Confirma la eliminación de un espacio
   */
  async confirmDeleteSpace(space: Space) {
    const alert = await this.alertController.create({
      header: '¿Eliminar espacio?',
      message: `¿Estás seguro de que deseas eliminar "${space.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteSpace(space);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Elimina un espacio
   */
  deleteSpace(space: Space) {
    // TODO: Implementar eliminación en el servicio
    console.log('Eliminar espacio:', space);
    this.spaces = this.spaces.filter(s => s.id !== space.id);
    // Aquí deberías llamar al servicio para eliminar del localStorage
  }

  /**
   * Refresca la lista de espacios
   */
  refreshSpaces() {
    this.loadSpaces();
  }

}
