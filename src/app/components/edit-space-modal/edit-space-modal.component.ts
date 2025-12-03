import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonCheckbox, IonGrid, IonRow, IonCol, IonNote, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, businessOutline, homeOutline, peopleOutline, saveOutline, closeCircle } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Space } from '../../models/dashboard.models';

@Component({
  selector: 'app-edit-space-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Editar Espacio</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="onSubmit()">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Información del Espacio</ion-card-title>
            <ion-card-subtitle>Modifica los detalles de tu espacio</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- Nombre del espacio -->
            <ion-item>
              <ion-label position="stacked">Nombre del Espacio *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.name"
                name="name"
                placeholder="Ej: Oficina Principal"
                required>
              </ion-input>
            </ion-item>
            <ion-note *ngIf="formErrors.name" color="danger" class="error-note">{{ formErrors.name }}</ion-note>

            <!-- Tipo de espacio -->
            <ion-item>
              <ion-label position="stacked">Tipo de Espacio *</ion-label>
              <ion-select
                [(ngModel)]="spaceForm.type"
                name="type"
                placeholder="Selecciona el tipo"
                (ionChange)="onTypeChange($event)"
                required>
                <ion-select-option *ngFor="let type of spaceTypes" [value]="type.value">
                  {{ type.label }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-note *ngIf="formErrors.type" color="danger" class="error-note">{{ formErrors.type }}</ion-note>

            <!-- Tipo personalizado -->
            <ion-item *ngIf="showCustomType">
              <ion-label position="stacked">Especificar Tipo *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.customType"
                name="customType"
                placeholder="Ej: Sala de Conferencias"
                required>
              </ion-input>
            </ion-item>

            <!-- Capacidad -->
            <ion-item>
              <ion-label position="stacked">Capacidad (personas) *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.capacity"
                name="capacity"
                type="number"
                placeholder="Ej: 10"
                min="1"
                required>
              </ion-input>
            </ion-item>
            <ion-note *ngIf="formErrors.capacity" color="danger" class="error-note">{{ formErrors.capacity }}</ion-note>

            <!-- Precio por hora -->
            <ion-item>
              <ion-label position="stacked">Precio por Hora (MXN) *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.pricePerHour"
                name="pricePerHour"
                type="number"
                placeholder="Ej: 150"
                min="0"
                step="0.01"
                required>
              </ion-input>
            </ion-item>
            <ion-note *ngIf="formErrors.pricePerHour" color="danger" class="error-note">{{ formErrors.pricePerHour }}</ion-note>

            <!-- Precio por día (opcional) -->
            <ion-item>
              <ion-label position="stacked">Precio por Día (MXN) - Opcional</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.pricePerDay"
                name="pricePerDay"
                type="number"
                placeholder="Ej: 800"
                min="0"
                step="0.01">
              </ion-input>
            </ion-item>

            <!-- Dirección -->
            <ion-item>
              <ion-label position="stacked">Dirección *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.address"
                name="address"
                placeholder="Ej: Calle Principal 123, Centro"
                required>
              </ion-input>
            </ion-item>
            <ion-note *ngIf="formErrors.address" color="danger" class="error-note">{{ formErrors.address }}</ion-note>

            <!-- Ciudad -->
            <ion-item>
              <ion-label position="stacked">Ciudad *</ion-label>
              <ion-input
                [(ngModel)]="spaceForm.city"
                name="city"
                placeholder="Ej: Ciudad de México"
                required>
              </ion-input>
            </ion-item>
            <ion-note *ngIf="formErrors.city" color="danger" class="error-note">{{ formErrors.city }}</ion-note>

            <!-- Descripción -->
            <ion-item>
              <ion-label position="stacked">Descripción</ion-label>
              <ion-textarea
                [(ngModel)]="spaceForm.description"
                name="description"
                placeholder="Describe las características de tu espacio..."
                rows="3">
              </ion-textarea>
            </ion-item>

            <!-- Amenidades -->
            <div class="amenities-section">
              <h3>Amenidades Disponibles</h3>
              <ion-grid>
                <ion-row>
                  <ion-col size="12" size-md="6" *ngFor="let amenity of amenitiesList">
                    <ion-item lines="none">
                      <ion-checkbox
                        [(ngModel)]="amenityStates[amenity]"
                        name="amenity-{{amenity}}"
                        (ionChange)="onAmenityChange(amenity, $event)">
                      </ion-checkbox>
                      <ion-label>{{ amenity }}</ion-label>
                    </ion-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Botones de acción -->
        <div class="modal-actions">
          <ion-button
            expand="block"
            type="submit"
            color="primary"
            [disabled]="isSubmitting">
            <ion-icon name="save-outline" slot="start" *ngIf="!isSubmitting"></ion-icon>
            <ion-icon name="refresh-outline" slot="start" *ngIf="isSubmitting" class="spinning"></ion-icon>
            {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            color="medium"
            (click)="dismiss()"
            [disabled]="isSubmitting">
            Cancelar
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .error-note {
      margin-left: 16px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .amenities-section {
      margin-top: 24px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: var(--ion-color-primary);
        margin-bottom: 16px;
      }

      ion-item {
        --padding-start: 0;
        --inner-padding-end: 0;
        margin-bottom: 8px;
      }
    }

    .modal-actions {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      ion-button {
        height: 48px;
        font-weight: 600;
      }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonCheckbox, IonGrid, IonRow, IonCol, IonNote
  ]
})
export class EditSpaceModalComponent implements OnInit {
  @Input() space!: Space;

  isSubmitting = false;
  showCustomType = false;

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
    amenities: [] as string[]
  };

  amenityStates: { [key: string]: boolean } = {};

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
    private modalController: ModalController,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    addIcons({ checkmarkCircle, businessOutline, homeOutline, peopleOutline, saveOutline, closeCircle });
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    // Pre-fill form with space data
    this.spaceForm = {
      name: this.space.name,
      type: this.spaceTypes.some(t => t.value === this.space.type) ? this.space.type : 'otro',
      customType: this.spaceTypes.some(t => t.value === this.space.type) ? '' : this.space.type,
      capacity: this.space.capacity,
      pricePerHour: this.space.pricePerHour,
      pricePerDay: this.space.pricePerDay || null,
      description: this.space.description || '',
      address: this.space.address,
      city: this.space.city,
      amenities: [...(this.space.amenities || [])]
    };

    this.showCustomType = this.spaceForm.type === 'otro';

    // Initialize amenity states
    this.amenitiesList.forEach(amenity => {
      this.amenityStates[amenity] = this.spaceForm.amenities.includes(amenity);
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  onTypeChange(event: any) {
    const selectedType = event.detail.value;
    this.showCustomType = selectedType === 'otro';
    if (!this.showCustomType) {
      this.spaceForm.customType = '';
    }
  }

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
        await this.toastService.showErrorToast('Debes iniciar sesión para editar un espacio');
        return;
      }

      // Crear objeto de espacio actualizado
      const finalType = this.spaceForm.type === 'otro' ? this.spaceForm.customType.trim() : this.spaceForm.type;

      const updatedSpace: Space = {
        ...this.space,
        name: this.spaceForm.name.trim(),
        description: this.spaceForm.description.trim(),
        type: finalType,
        capacity: this.spaceForm.capacity!,
        pricePerHour: this.spaceForm.pricePerHour!,
        pricePerDay: this.spaceForm.pricePerDay || undefined,
        amenities: this.spaceForm.amenities,
        address: this.spaceForm.address.trim(),
        city: this.spaceForm.city.trim(),
        updatedAt: new Date()
      };

      // Actualizar el espacio
      this.dashboardService.updateSpace(updatedSpace);

      await this.toastService.showSuccessToast('¡Espacio actualizado exitosamente!');

      // Cerrar modal y pasar el espacio actualizado
      this.modalController.dismiss({ action: 'updated', space: updatedSpace });

    } catch (error) {
      console.error('Error actualizando espacio:', error);
      await this.toastService.showErrorToast('Error al actualizar el espacio. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
