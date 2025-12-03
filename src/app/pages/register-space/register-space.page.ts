import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonList, IonIcon, IonCheckbox, IonGrid, IonRow, IonCol, IonNote, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, businessOutline, homeOutline, peopleOutline, saveOutline, closeCircle, addCircleOutline, closeOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Space } from '../../models/dashboard.models';

@Component({
  selector: 'app-register-space',
  templateUrl: './register-space.page.html',
  styleUrls: ['./register-space.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonList, IonIcon, IonCheckbox, IonNote, CommonModule, FormsModule]
})
export class RegisterSpacePage implements OnInit {

  isMobile = false;
  isSubmitting = false;
  showCustomType = false;
  showCustomAmenityInput = false;
  customAmenity = '';

  spaceForm = {
    name: '',
    type: '',
    customType: '',
    capacity: null as number | null,
    pricePerHour: null as number | null,
    pricePerDay: null as number | null,
    description: '',
    address: '',
    city: '',
    amenities: [] as string[],
    images: [] as string[]
  };

  spaceTypes = [
    { value: 'oficina', label: 'Oficina Privada' },
    { value: 'sala-reuniones', label: 'Sala de Reuniones' },
    { value: 'coworking', label: 'Espacio de Coworking' },
    { value: 'auditorio', label: 'Auditorio' },
    { value: 'espacio-trabajo', label: 'Espacio de Trabajo' },
    { value: 'otro', label: 'Otro (Especificar)' }
  ];

  amenitiesList = [
    'WiFi',
    'Proyector',
    'Pizarra',
    'Aire Acondicionado',
    'Café',
    'Estacionamiento',
    'Impresora',
    'Escritorios',
    'Sillas Ergonómicas',
    'Cocina',
    'Baños Privados',
    'Áreas Comunes'
  ];

  formErrors = {
    name: '',
    type: '',
    capacity: '',
    pricePerHour: '',
    address: '',
    city: ''
  };

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
    addIcons({ checkmarkCircle, businessOutline, homeOutline, peopleOutline, saveOutline, closeCircle, addCircleOutline, closeOutline });
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**
   * Maneja el cambio de amenidades
   */
  onAmenityChange(amenity: string, event: any) {
    const isChecked = event.detail.checked;
    if (isChecked) {
      if (!this.spaceForm.amenities.includes(amenity)) {
        this.spaceForm.amenities.push(amenity);
      }
    } else {
      const index = this.spaceForm.amenities.indexOf(amenity);
      if (index > -1) {
        this.spaceForm.amenities.splice(index, 1);
      }
    }
  }

  /**
   * Maneja el cambio de tipo de espacio
   */
  onTypeChange(event: any) {
    const selectedType = event.detail.value;
    console.log('Tipo seleccionado:', selectedType); // Debug
    this.showCustomType = selectedType === 'otro';
    console.log('showCustomType:', this.showCustomType); // Debug
    
    // Limpiar el campo personalizado si no es "otro"
    if (!this.showCustomType) {
      this.spaceForm.customType = '';
    }
  }

  /**
   * Verifica si el tipo "otro" está seleccionado
   */
  get isCustomTypeSelected(): boolean {
    return this.spaceForm.type === 'otro';
  }

  /**
   * Verifica si una amenidad está seleccionada
   */
  isAmenitySelected(amenity: string): boolean {
    return this.spaceForm.amenities.includes(amenity);
  }

  /**
   * Muestra el campo para agregar una amenidad personalizada
   */
  showAddCustomAmenity() {
    this.showCustomAmenityInput = true;
  }

  /**
   * Agrega una amenidad personalizada
   */
  async addCustomAmenity() {
    const trimmedAmenity = this.customAmenity.trim();
    
    if (!trimmedAmenity) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor ingresa el nombre de la amenidad',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Verificar que no exista ya (case insensitive)
    const exists = this.amenitiesList.some(
      a => a.toLowerCase() === trimmedAmenity.toLowerCase()
    );

    if (exists) {
      const alert = await this.alertController.create({
        header: 'Amenidad existente',
        message: 'Esta amenidad ya existe en la lista',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Agregar la nueva amenidad a la lista
    this.amenitiesList.push(trimmedAmenity);
    
    // Agregar automáticamente a las amenidades seleccionadas
    if (!this.spaceForm.amenities.includes(trimmedAmenity)) {
      this.spaceForm.amenities.push(trimmedAmenity);
    }
    
    // Limpiar el campo y ocultar el input
    this.customAmenity = '';
    this.showCustomAmenityInput = false;

    // Mostrar confirmación
    await this.toastService.showSuccessToast('Amenidad agregada exitosamente');
  }

  /**
   * Cancela la adición de amenidad personalizada
   */
  cancelCustomAmenity() {
    this.customAmenity = '';
    this.showCustomAmenityInput = false;
  }

  /**
   * Valida el formulario
   */
  private validateForm(): boolean {
    let isValid = true;
    
    // Resetear errores
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = '';
    });

    // Validar nombre
    if (!this.spaceForm.name || this.spaceForm.name.trim() === '') {
      this.formErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    // Validar tipo
    if (!this.spaceForm.type) {
      this.formErrors.type = 'El tipo de espacio es requerido';
      isValid = false;
    } else if (this.spaceForm.type === 'otro' && (!this.spaceForm.customType || this.spaceForm.customType.trim() === '')) {
      this.formErrors.type = 'Por favor especifica el tipo de espacio';
      isValid = false;
    }

    // Validar capacidad
    if (!this.spaceForm.capacity || this.spaceForm.capacity <= 0) {
      this.formErrors.capacity = 'La capacidad debe ser mayor a 0';
      isValid = false;
    }

    // Validar precio por hora
    if (!this.spaceForm.pricePerHour || this.spaceForm.pricePerHour <= 0) {
      this.formErrors.pricePerHour = 'El precio debe ser mayor a 0';
      isValid = false;
    }

    // Validar dirección
    if (!this.spaceForm.address || this.spaceForm.address.trim() === '') {
      this.formErrors.address = 'La dirección es requerida';
      isValid = false;
    }

    // Validar ciudad
    if (!this.spaceForm.city || this.spaceForm.city.trim() === '') {
      this.formErrors.city = 'La ciudad es requerida';
      isValid = false;
    }

    return isValid;
  }

  /**
   * Envía el formulario
   */
  async onSubmit() {
    if (this.isSubmitting) return;

    // Validar formulario
    if (!this.validateForm()) {
      await this.toastService.showErrorToast('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      this.isSubmitting = true;

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        await this.toastService.showErrorToast('Debes iniciar sesión para registrar un espacio');
        this.router.navigate(['/login']);
        return;
      }

      // Crear objeto de espacio
      const finalType = this.spaceForm.type === 'otro' ? this.spaceForm.customType.trim() : this.spaceForm.type;
      
      const newSpace: Omit<Space, 'id' | 'createdAt' | 'updatedAt'> = {
        name: this.spaceForm.name.trim(),
        description: this.spaceForm.description.trim(),
        type: finalType,
        capacity: this.spaceForm.capacity!,
        pricePerHour: this.spaceForm.pricePerHour!,
        pricePerDay: this.spaceForm.pricePerDay || undefined,
        amenities: this.spaceForm.amenities,
        images: this.spaceForm.images.length > 0 ? this.spaceForm.images : ['/assets/spaces/default.jpg'],
        address: this.spaceForm.address.trim(),
        city: this.spaceForm.city.trim(),
        isActive: true,
        ownerId: currentUser.id
      };

      // Guardar el espacio
      const savedSpace = this.dashboardService.addSpace(newSpace);

      await this.toastService.showSuccessToast('¡Espacio registrado exitosamente!');
      
      // Resetear formulario
      this.resetForm();

      // Redirigir a mis espacios después de 1 segundo
      setTimeout(() => {
        this.router.navigate(['/my-spaces']);
      }, 1000);

    } catch (error) {
      console.error('Error registrando espacio:', error);
      await this.toastService.showErrorToast('Error al registrar el espacio. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Resetea el formulario
   */
  private resetForm() {
    this.spaceForm = {
      name: '',
      type: '',
      customType: '',
      capacity: null,
      pricePerHour: null,
      pricePerDay: null,
      description: '',
      address: '',
      city: '',
      amenities: [],
      images: []
    };

    this.showCustomType = false;

    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = '';
    });
  }

  /**
   * Cancela y regresa a la página anterior
   */
  onCancel() {
    this.router.navigate(['/my-spaces']);
  }

}
