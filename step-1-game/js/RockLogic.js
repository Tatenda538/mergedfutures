const SPAWN_CLEARANCE = 150;

function childRadius(radius) {
  if (radius >= 40) return Math.round(radius * 0.6);
  return Math.round(radius * 0.4);
}

export const RockLogic = {
  splitRock(rock) {
    const cRadius = childRadius(rock.radius);
    if (cRadius < 10) return [];

    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = angle1 + Math.PI;
    const speed = 40 + Math.random() * 30;

    return [
      { x: rock.x, y: rock.y, radius: cRadius, vx: rock.vx + Math.cos(angle1) * speed, vy: rock.vy + Math.sin(angle1) * speed },
      { x: rock.x, y: rock.y, radius: cRadius, vx: rock.vx + Math.cos(angle2) * speed, vy: rock.vy + Math.sin(angle2) * speed },
    ];
  },

  generateRocks(params, gameWidth, gameHeight) {
    const cx = gameWidth / 2;
    const cy = gameHeight / 2;
    const rocks = [];

    for (let i = 0; i < params.rockCount; i++) {
      let x, y;
      do {
        x = Math.random() * gameWidth;
        y = Math.random() * gameHeight;
      } while (Math.hypot(x - cx, y - cy) < SPAWN_CLEARANCE);

      const angle = Math.random() * Math.PI * 2;
      const speed = params.minSpeed + Math.random() * (params.maxSpeed - params.minSpeed);
      const radius = params.minRadius + Math.random() * (params.maxRadius - params.minRadius);

      rocks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius });
    }

    return rocks;
  },
};
