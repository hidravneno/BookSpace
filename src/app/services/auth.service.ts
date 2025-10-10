import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
        createdAt: new Date()
      };

      // Guardar usuario
      this.saveUser(newUser);

      // Crear usuario para autenticación (sin password)
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };

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
        email: user.email
      };

      // Guardar sesión actual
      this.setCurrentUser(authUser);

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
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Genera un ID único simple
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
