import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonList, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register-space',
  templateUrl: './register-space.page.html',
  styleUrls: ['./register-space.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonList, IonIcon, CommonModule, FormsModule]
})
export class RegisterSpacePage implements OnInit {

  isMobile = false;

  spaceForm = {
    name: '',
    type: '',
    capacity: null,
    pricePerHour: null,
    description: '',
    amenities: []
  };

  spaceTypes = [
    { value: 'meeting-room', label: 'Sala de Reuniones' },
    { value: 'office', label: 'Oficina Privada' },
    { value: 'auditorium', label: 'Auditorio' },
    { value: 'coworking', label: 'Espacio de Coworking' }
  ];

  amenitiesList = [
    'WiFi',
    'Proyector',
    'Pizarra',
    'Café',
    'Estacionamiento'
  ];

  constructor() { }

  ngOnInit() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  onSubmit() {
    console.log('Space registered:', this.spaceForm);
    // Aquí iría la lógica para guardar el espacio
  }

}
