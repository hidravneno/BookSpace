import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-reservations-calendar',
  templateUrl: './reservations-calendar.page.html',
  styleUrls: ['./reservations-calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, CommonModule, FormsModule, FullCalendarModule]
})
export class ReservationsCalendarPage implements OnInit {

  isMobile = false;

  reservations = [
    {
      id: 1,
      title: 'Reserva 1',
      date: '2025-10-30',
      time: '10:00 AM',
      user: 'Usuario 1',
      space: 'Sala A'
    },
    {
      id: 2,
      title: 'Reserva 2',
      date: '2025-10-31',
      time: '2:00 PM',
      user: 'Usuario 2',
      space: 'Sala B'
    },
    {
      id: 3,
      title: 'Reserva 3',
      date: '2025-11-01',
      time: '9:00 AM',
      user: 'Usuario 3',
      space: 'Sala C'
    }
  ];

  calendarOptions: any = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: this.reservations.map(res => ({
      title: res.title,
      date: res.date
    }))
  };

  constructor() { }

  ngOnInit() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

}
