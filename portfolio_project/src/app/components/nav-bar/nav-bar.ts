import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {
  title = 'route'
}
