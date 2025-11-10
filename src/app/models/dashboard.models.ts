export interface Space {
  id: string;
  name: string;
  description: string;
  type: string; // 'oficina', 'sala-reuniones', 'espacio-trabajo', etc.
  capacity: number;
  pricePerHour: number;
  pricePerDay?: number;
  amenities: string[];
  images: string[];
  address: string;
  city: string;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  reservationId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  // Extended properties for payments page
  type: 'income' | 'expense';
  description: string;
  date: Date;
  method: 'card' | 'cash' | 'transfer';
}

export interface Activity {
  id: string;
  type: 'reservation' | 'payment' | 'notification' | 'update';
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string; // ID de reserva, pago, etc.
}

export interface DashboardStats {
  totalSpaces: number;
  activeReservations: number;
  monthlyRevenue: number;
  pendingNotifications: number;
  recentActivities: Activity[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reservation' | 'payment' | 'cancellation' | 'reminder' | 'system' | 'update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  relatedId?: string; // ID de la reserva, pago, etc.
  createdAt: Date;
  readAt?: Date;
}
