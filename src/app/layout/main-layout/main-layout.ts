import { Component, ViewChild, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
  standalone: false
})
export class MainLayoutComponent implements OnInit {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile$!: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private auth: AuthService  // ← ÚNICA LÍNEA AÑADIDA AL CONSTRUCTOR
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }

  ngOnInit() {
    console.log('MainLayout inicializado');
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  closeSidenav(): void {
    this.sidenav.close();
  }

  logout(): void {
    this.auth.logout();  // ← ÚNICA LÍNEA CAMBIADA EN EL MÉTODO
    this.closeSidenav();
  }
}
