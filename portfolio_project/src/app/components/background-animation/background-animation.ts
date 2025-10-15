import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-background-animation',
  templateUrl: './background-animation.html',
  styleUrls: ['./background-animation.css'],
})
export class BackgroundAnimation implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private platformId = inject(PLATFORM_ID);
  private ctx!: CanvasRenderingContext2D;

  private circles: Circle[] = [];
  private readonly MAX_CIRCLES = 25;
  private animationFrameId: number | null = null;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initiateDrawing();
      window.addEventListener('resize', () => this.initiateDrawing());
    }
  }

  private initiateDrawing(): void {
    if (!this.canvasRef) {
      console.error('Canvas reference not found.');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.generateRandomCircles(canvas);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animate();
    console.log('Animation started with', this.circles.length, 'circles.');
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const circle of this.circles) {
      circle.update(canvas.width, canvas.height);
      circle.draw(this.ctx);
    }

    this.circles = this.circles.filter(
      (c) =>
        !(
          c.x - c.radius > canvas.width ||
          c.x + c.radius < 0 ||
          c.y - c.radius > canvas.height ||
          c.y + c.radius < 0
        )
    );

    this.generateRandomCircles(canvas);

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private generateRandomCircles(canvas: HTMLCanvasElement): void {
    if (this.circles.length < this.MAX_CIRCLES) {
      for (let i = this.circles.length; i < this.MAX_CIRCLES; i++) {
        const radius = 10;

        const side = Math.floor(Math.random() * 4);
        let x, y: number;
        let vx = (Math.random() - 0.5) * 2;
        let vy = (Math.random() - 0.5) * 2;

        switch (side) {
          case 0: // left
            x = 0;
            y = Math.random() * (canvas.height - 2 * radius) + radius;
            vx = Math.abs(vx) + 1; // move right
            break;
          case 1: // top
            x = Math.random() * (canvas.width - 2 * radius) + radius;
            y = 0;
            vy = Math.abs(vy) + 1; // move down
            break;
          case 2: // right
            x = canvas.width;
            y = Math.random() * (canvas.height - 2 * radius) + radius;
            vx = -Math.abs(vx) - 1; // move left
            break;
          default: // bottom
            x = Math.random() * (canvas.width - 2 * radius) + radius;
            y = canvas.height;
            vy = -Math.abs(vy) - 1; // move up
            break;
        }

        this.circles.push(new Circle(x, y, radius, vx, vy));
      }
    }
  }
}

class Circle {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public vx: number,
    public vy: number
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(237, 230, 232, 1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(130, 6, 58, 0.05)';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  update(width: number, height: number): boolean {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x - this.radius > width || this.x + this.radius < 0) {
      return true;
    }

    if (this.y - this.radius > height || this.y + this.radius < 0) {
      return true;
    }

    return false;
  }
}
