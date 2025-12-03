import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly USERS_KEY = 'bookspace_users';
  private readonly CURRENT_USER_KEY = 'bookspace_current_user';

  constructor() {
    // Cargar usuario actual si existe
    this.loadCurrentUser();
  }

  /**
   * Registra un nuevo usuario
   */
  async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      // Verificar si el email ya existe
      if (this.emailExists(email)) {
        return { success: false, message: 'Este email ya está registrado' };
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: this.generateId(),
        name,
        email: email.toLowerCase(),
        password, // En producción, esto debería estar hasheado
        phone: '',
        address: '',
        createdAt: new Date()
      };

      // Guardar usuario
      this.saveUser(newUser);

      // Crear usuario para autenticación (sin password)
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        createdAt: newUser.createdAt
      };

      // Enviar email de registro
      this.sendRegistrationEmail(authUser);

      return { 
        success: true, 
        message: 'Usuario registrado exitosamente',
        user: authUser
      };
    } catch (error) {
      return { success: false, message: 'Error al registrar usuario' };
    }
  }

  /**
   * Inicia sesión
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return { success: false, message: 'Email o contraseña incorrectos' };
      }

      // Crear usuario para autenticación
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt
      };

      // Guardar sesión actual
      this.setCurrentUser(authUser);

      // Enviar email de inicio de sesión
      this.sendLoginEmail(authUser);

      return { 
        success: true, 
        message: 'Inicio de sesión exitoso',
        user: authUser
      };
    } catch (error) {
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'address' | 'avatar'>>): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    // Actualizar usuario
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Actualizar usuario actual si es el mismo
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedAuthUser: AuthUser = {
        ...currentUser,
        ...updates,
      };
      this.setCurrentUser(updatedAuthUser);
    }

    return true;
  }

  /**
   * Actualiza el avatar del usuario
   */
  updateAvatar(userId: string, avatarBase64: string): boolean {
    return this.updateProfile(userId, { avatar: avatarBase64 });
  }

  /**
   * Verifica si un email ya existe
   */
  private emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Obtiene todos los usuarios
   */
  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Guarda un nuevo usuario
   */
  private saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Establece el usuario actual
   */
  private setCurrentUser(user: AuthUser): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Carga el usuario actual del localStorage
   */
  private loadCurrentUser(): void {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      // Convertir createdAt de string a Date si es necesario
      if (user.createdAt && typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
      }
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Genera un ID único simple
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Enviar email de registro
   */
  private sendRegistrationEmail(user: AuthUser): void {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      message: 'Te has registrado exitosamente en SPACEBOOK.'
    };

    emailjs.send(environment.emailjs.serviceId, environment.emailjs.templateRegisterId, templateParams, environment.emailjs.publicKey)
      .then((response) => {
        console.log('Email de registro enviado:', response);
      })
      .catch((error) => {
        console.error('Error enviando email de registro:', error);
      });
  }

  /**
   * Enviar email de inicio de sesión
   */
  private sendLoginEmail(user: AuthUser): void {
    const now = new Date();
    const loginTime = now.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      login_time: loginTime,
      message: `Has iniciado sesión en SPACEBOOK a las ${loginTime}.`
    };

    emailjs.send(environment.emailjs.serviceId, environment.emailjs.templateLoginId, templateParams, environment.emailjs.publicKey)
      .then((response) => {
        console.log('Email de login enviado:', response);
      })
      .catch((error) => {
        console.error('Error enviando email de login:', error);
      });
  }
}
