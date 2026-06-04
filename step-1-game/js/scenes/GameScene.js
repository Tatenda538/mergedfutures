import { RockLogic } from '../RockLogic.js';
import { LevelData } from '../LevelData.js';
import { GameData } from '../GameData.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.shipX = 400;
    this.shipY = 300;
    this.shipAngle = -Math.PI / 2;
    this.shipVx = 0;
    this.shipVy = 0;
    this.bullets = [];
    this.rocks = [];
    this.fireCooldown = 0;
    this.gameOver = false;
    this.levelComplete = false;
    this.elapsed = 0;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.drawStarfield();

    this.shipGraphics = this.add.graphics();

    const params = LevelData.getLevelParams(this.levelNumber);
    const rockData = RockLogic.generateRocks(params, w, h);
    this.rocks = rockData.map(r => ({
      ...r,
      graphics: this.add.graphics(),
    }));
    this.rocks.forEach(r => this.drawRock(r));

    this.timerText = this.add.text(w - 16, 16, '0.0', {
      fontFamily: 'Courier New', fontSize: '24px', color: '#00ffff',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(16, 16, `LEVEL ${this.levelNumber}`, {
      fontFamily: 'Courier New', fontSize: '18px', color: '#00ffff',
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.overlay = this.add.graphics();
    this.overlayText = this.add.text(w / 2, h / 2, '', {
      fontFamily: 'Courier New', fontSize: '36px', color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);

    this.overlaySubText = this.add.text(w / 2, h / 2 + 40, 'Click to continue', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#00ffff',
    }).setOrigin(0.5).setVisible(false);

    this.input.on('pointerdown', () => {
      if (this.gameOver || this.levelComplete) {
        this.scene.stop('GameScene');
        if (window.showMenu) window.showMenu();
      }
    });
  }

  drawStarfield() {
    const w = this.scale.width;
    const h = this.scale.height;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 100; i++) {
      g.fillCircle(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.5);
    }
  }

  drawShip() {
    const g = this.shipGraphics;
    g.clear();
    g.lineStyle(2, 0x00ffff, 1);
    const len = 18;
    const tip = { x: Math.cos(this.shipAngle) * len, y: Math.sin(this.shipAngle) * len };
    const left = { x: Math.cos(this.shipAngle + 2.3) * len * 0.8, y: Math.sin(this.shipAngle + 2.3) * len * 0.8 };
    const right = { x: Math.cos(this.shipAngle - 2.3) * len * 0.8, y: Math.sin(this.shipAngle - 2.3) * len * 0.8 };
    g.beginPath();
    g.moveTo(this.shipX + tip.x, this.shipY + tip.y);
    g.lineTo(this.shipX + left.x, this.shipY + left.y);
    g.lineTo(this.shipX + right.x, this.shipY + right.y);
    g.closePath();
    g.strokePath();
  }

  drawRock(rock) {
    const g = rock.graphics;
    g.clear();
    g.lineStyle(2, 0xff00ff, 1);
    const sides = 8 + Math.floor(Math.random() * 4);
    const points = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = rock.radius * (0.7 + Math.random() * 0.3);
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    g.beginPath();
    g.moveTo(rock.x + points[0].x, rock.y + points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(rock.x + points[i].x, rock.y + points[i].y);
    }
    g.closePath();
    g.strokePath();
  }

  update(time, delta) {
    if (this.gameOver || this.levelComplete) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const dt = delta / 1000;

    this.elapsed += dt;
    this.timerText.setText(this.elapsed.toFixed(1));

    if (this.cursors.left.isDown) this.shipAngle -= 3 * dt;
    if (this.cursors.right.isDown) this.shipAngle += 3 * dt;
    if (this.cursors.up.isDown) {
      this.shipVx += Math.cos(this.shipAngle) * 200 * dt;
      this.shipVy += Math.sin(this.shipAngle) * 200 * dt;
    }
    this.shipVx *= 0.99;
    this.shipVy *= 0.99;

    this.shipX = (this.shipX + this.shipVx * dt + w) % w;
    this.shipY = (this.shipY + this.shipVy * dt + h) % h;
    this.drawShip();

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (this.spaceKey.isDown && this.fireCooldown === 0) {
      this.fireBullet();
      this.fireCooldown = 0.25;
    }

    this.updateBullets(dt, w, h);
    this.updateRocks(dt, w, h);
    this.checkCollisions();
    this.checkWinCondition();
  }

  fireBullet() {
    const speed = 400;
    this.bullets.push({
      x: this.shipX,
      y: this.shipY,
      vx: Math.cos(this.shipAngle) * speed,
      vy: Math.sin(this.shipAngle) * speed,
      life: 1.5,
      graphics: this.add.graphics(),
    });
    const b = this.bullets[this.bullets.length - 1];
    b.graphics.lineStyle(2, 0x00ffff, 1);
    b.graphics.beginPath();
    b.graphics.arc(0, 0, 2, 0, Math.PI * 2);
    b.graphics.strokePath();
  }

  updateBullets(dt, w, h) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) {
        b.graphics.destroy();
        this.bullets.splice(i, 1);
      } else {
        b.graphics.setPosition(b.x, b.y);
      }
    }
  }

  updateRocks(dt, w, h) {
    for (const rock of this.rocks) {
      rock.x = (rock.x + rock.vx * dt + w) % w;
      rock.y = (rock.y + rock.vy * dt + h) % h;
      rock.graphics.setPosition(0, 0);
      this.drawRock(rock);
    }
  }

  checkCollisions() {
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      for (let ri = this.rocks.length - 1; ri >= 0; ri--) {
        const rock = this.rocks[ri];
        const dist = Math.hypot(b.x - rock.x, b.y - rock.y);
        if (dist < rock.radius) {
          b.graphics.destroy();
          this.bullets.splice(bi, 1);
          this.explodeRock(ri);
          break;
        }
      }
    }

    for (const rock of this.rocks) {
      const dist = Math.hypot(this.shipX - rock.x, this.shipY - rock.y);
      if (dist < rock.radius + 8) {
        this.endGame();
        return;
      }
    }
  }

  explodeRock(index) {
    const rock = this.rocks[index];
    rock.graphics.destroy();
    const children = RockLogic.splitRock(rock);
    this.rocks.splice(index, 1);
    for (const child of children) {
      child.graphics = this.add.graphics();
      this.drawRock(child);
      this.rocks.push(child);
    }
  }

  endGame() {
    this.gameOver = true;
    this.showOverlay('GAME OVER', '#ff00ff');
  }

  checkWinCondition() {
    if (this.rocks.length === 0 && !this.gameOver && !this.levelComplete) {
      this.levelComplete = true;
      GameData.completeLevel(this.levelNumber, this.elapsed);
      const best = GameData.getBestTime(this.levelNumber);
      this.showOverlay(`LEVEL COMPLETE\n${this.elapsed.toFixed(1)}s (best: ${best.toFixed(1)}s)`, '#00ffff');
    }
  }

  showOverlay(text, color) {
    const w = this.scale.width;
    const h = this.scale.height;
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.6);
    this.overlay.fillRect(0, 0, w, h);
    this.overlayText.setText(text);
    this.overlayText.setColor(color);
    this.overlayText.setVisible(true);
    this.overlaySubText.setVisible(true);
  }
}
