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
  private MAX_CIRCLES = 30;
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

    this.MAX_CIRCLES = this.calculateMaxCircles(canvas.width);

    if (this.circles.length > this.MAX_CIRCLES) {
      this.circles.length = this.MAX_CIRCLES;
    }

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

    this.drawLines();

    this.generateRandomCircles(canvas);

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private drawLines(): void {
    const maxDistance = 150; // max distance where we draw a line

    for (let i = 0; i < this.circles.length; i++) {
      const c1 = this.circles[i];

      for (let j = i + 1; j < this.circles.length; j++) {
        // notice j = i + 1 to avoid duplicates
        const c2 = this.circles[j];
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance; // fade based on distance
          const line = new Line(c1.x, c1.y, c2.x, c2.y);
          line.draw(this.ctx, opacity);
        }
      }
    }
  }
  private calculateMaxCircles(width: number): number {
    if (width < 500) return 10;
    if (width < 900) return 15;
    if (width < 1300) return 20;
    if (width < 1700) return 30;
    return 40;
  }

  private generateRandomCircles(canvas: HTMLCanvasElement): void {
    if (this.circles.length < this.MAX_CIRCLES) {
      for (let i = this.circles.length; i < this.MAX_CIRCLES; i++) {
        const radius = 7.5;

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

class Line {
  constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}

  draw(ctx: CanvasRenderingContext2D, opacity: number = 1): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.strokeStyle = `rgba(199, 44, 65, ${opacity})`;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7.5;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
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
    ctx.fillStyle = 'rgba(199, 44, 65, 0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(237, 230, 232, 1)';
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
