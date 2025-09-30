import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';  // ← AÑADIR ESTA LÍNEA

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutModule } from '@angular/cdk/layout';

// Layout y páginas
import { AppComponent } from './app';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Home } from './features/home/home';
import { Profile } from './features/profile/profile';
import { Messages } from './features/messages/messages';
import { SignIn } from './features/auth/sign-in/sign-in';
import { SignUp } from './features/auth/sign-up/sign-up';

// Guard funcional
import { authGuard } from './core/auth/auth-guard';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    Home,
    Profile,
    Messages,
    SignIn,
    SignUp
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,  // ← AÑADIR AQUÍ TAMBIÉN

    // Rutas principales
    RouterModule.forRoot([
      { path: 'sign-in', component: SignIn },
      { path: 'sign-up', component: SignUp },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
      { path: 'messages', component: Messages, canActivate: [authGuard] },
      { path: '**', redirectTo: 'home' }
    ]),

    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    LayoutModule
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
