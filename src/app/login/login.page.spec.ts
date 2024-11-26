import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';
import { AuthService } from '../auth.service'; // Importar AuthService
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs'; // Para simular las respuestas de AuthService

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']); // Crear un espía para AuthService

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AuthService, useValue: authServiceSpy } // Proveer el espía de AuthService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a toast if the email or password is empty', fakeAsync(async () => {
    component.user.email = '';
    component.user.password = '';

    spyOn(component, 'showToast');
    
    await component.login();
    
    expect(component.showToast).toHaveBeenCalledWith('Por favor, completa todos los campos.');
  }));

  it('should navigate to home if login is successful', fakeAsync(() => {
    component.user.email = 'test@gmail.com';
    component.user.password = '123456';

    authServiceSpy.login.and.returnValue(of(true)); // Simular éxito en login

    component.login();

    tick(); // Simular la resolución de promesas

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should show a toast if login fails', fakeAsync(async () => {
    component.user.email = 'test@other.com';
    component.user.password = '123456';

    authServiceSpy.login.and.returnValue(throwError({ message: 'Credenciales incorrectas' })); // Simular fallo en login

    spyOn(component, 'showToast');
    
    await component.login();
    
    expect(component.showToast).toHaveBeenCalledWith('Credenciales incorrectas');
  }));
});
