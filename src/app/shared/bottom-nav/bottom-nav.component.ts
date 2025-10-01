import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: false
})
export class BottomNavComponent {
  currentRoute: string = '';
  showCreatePostDialog: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route);
  }

  openCreatePost() {
    this.showCreatePostDialog = true;
  }

  closeCreatePost() {
    this.showCreatePostDialog = false;
  }
}
