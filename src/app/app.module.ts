import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LayoutModule } from '@angular/cdk/layout';

// Componentes
import { AppComponent } from './app';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Home } from './features/home/home';
import { Profile } from './features/profile/profile';
import { Messages } from './features/messages/messages';
import { Search } from './features/search/search';
import { UserProfileComponent } from './features/user-profile/user-profile';
import { SignIn } from './features/auth/sign-in/sign-in';
import { SignUp } from './features/auth/sign-up/sign-up';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';
import { CreatePostComponent } from './shared/create-post/create-post.component';

// Guard
import { authGuard } from './core/auth/auth-guard';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    Home,
    Profile,
    Messages,
    Search,
    UserProfileComponent,
    SignIn,
    SignUp,
    BottomNavComponent,
    CreatePostComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,

    // Rutas principales
    RouterModule.forRoot([
      { path: 'sign-in', component: SignIn },
      { path: 'sign-up', component: SignUp },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
      { path: 'messages', component: Messages, canActivate: [authGuard] },
      { path: 'search', component: Search, canActivate: [authGuard] },
      { path: 'user/:userId', component: UserProfileComponent, canActivate: [authGuard] },
      { path: '**', redirectTo: 'home' }
    ]),

    // Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    LayoutModule
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
