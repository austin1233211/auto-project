import { BattleRenderer } from '../battle-renderer.js';

/**
 * Three.js implementation of the Battle Renderer
 * Renders 3D hero models and battle effects using Three.js
 */
export class BattleRendererThree extends BattleRenderer {
  constructor(container, options = {}) {
    super(container, options);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.heroes = {
      player: null,
      enemy: null
    };
    this.animationMixers = {
      player: null,
      enemy: null
    };
    this.clock = null;
    this.animationFrameId = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    const THREE = window.THREE;
    if (!THREE) {
      throw new Error('Three.js not loaded. Please include Three.js in your HTML.');
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'battle-renderer-canvas';
    this.container.appendChild(this.canvas);

    const width = this.container.clientWidth;
    const height = Math.min(400, this.container.clientHeight * 0.6);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1e);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.setupGround();

    this.clock = new THREE.Clock();
    this.isInitialized = true;

    this.startRenderLoop();

    window.addEventListener('resize', () => this.resize());
  }

  setupLighting() {
    const THREE = window.THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8040, 0.2);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);
  }

  setupGround() {
    const THREE = window.THREE;

    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1f2e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const gridHelper = new THREE.GridHelper(20, 20, 0x3b82f6, 0x2a3f5f);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  async spawnHero(hero, side) {
    if (!this.isInitialized || !this.scene) {
      console.warn('Renderer not initialized, cannot spawn hero');
      return null;
    }
    
    const THREE = window.THREE;
    
    const position = side === 'player' ? -3 : 3;
    const rotation = side === 'player' ? Math.PI / 4 : -Math.PI / 4;
    const color = side === 'player' ? 0x3b82f6 : 0xef4444;

    const group = new THREE.Group();
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 1.2;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.4,
      metalness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    head.position.y = 2.2;
    group.add(head);

    const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.castShadow = true;
    leftArm.position.set(-0.6, 1.5, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.castShadow = true;
    rightArm.position.set(0.6, 1.5, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    const legGeometry = new THREE.CapsuleGeometry(0.2, 0.9, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
      metalness: 0.2
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.castShadow = true;
    leftLeg.position.set(-0.25, 0.45, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.castShadow = true;
    rightLeg.position.set(0.25, 0.45, 0);
    group.add(rightLeg);

    group.position.set(position, 0, 0);
    group.rotation.y = rotation;
    
    group.userData = {
      side: side,
      body: body,
      head: head,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      idleAnimation: { time: 0 },
      currentAnimation: 'idle'
    };

    this.scene.add(group);
    this.heroes[side] = group;

    return group;
  }

  playAnimation(side, animationName, options = {}) {
    const hero = this.heroes[side];
    if (!hero) return;

    hero.userData.currentAnimation = animationName;
    hero.userData.animationStartTime = Date.now();
    hero.userData.animationOptions = options;

    switch (animationName) {
      case 'attack':
        this.playAttackAnimation(hero);
        break;
      case 'hit':
        this.playHitAnimation(hero);
        break;
      case 'death':
        this.playDeathAnimation(hero);
        break;
      case 'ultimate':
        this.playUltimateAnimation(hero);
        break;
      default:
        hero.userData.currentAnimation = 'idle';
    }
  }

  playAttackAnimation(hero) {
    const THREE = window.THREE;
    const rightArm = hero.userData.rightArm;
    const body = hero.userData.body;
    
    const startRotation = rightArm.rotation.z;
    const targetRotation = -Math.PI / 2;
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 0.5) {
        const t = progress * 2;
        rightArm.rotation.z = startRotation + (targetRotation - startRotation) * t;
        body.rotation.y = Math.sin(t * Math.PI) * 0.2;
      } else {
        const t = (progress - 0.5) * 2;
        rightArm.rotation.z = targetRotation + (startRotation - targetRotation) * t;
        body.rotation.y = Math.sin((1 - t) * Math.PI) * 0.2;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        rightArm.rotation.z = startRotation;
        body.rotation.y = 0;
        hero.userData.currentAnimation = 'idle';
      }
    };

    animate();
  }

  playHitAnimation(hero) {
    const body = hero.userData.body;
    const head = hero.userData.head;
    const startTime = Date.now();
    const duration = 200;

    const originalBodyColor = body.material.color.clone();
    const originalHeadColor = head.material.color.clone();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      body.material.color.lerp(new window.THREE.Color(0xff0000), 0.5 * (1 - progress));
      head.material.color.lerp(new window.THREE.Color(0xff0000), 0.5 * (1 - progress));
      
      const shake = Math.sin(progress * Math.PI * 4) * 0.1 * (1 - progress);
      hero.position.x += shake;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        body.material.color.copy(originalBodyColor);
        head.material.color.copy(originalHeadColor);
        hero.userData.currentAnimation = 'idle';
      }
    };

    animate();
  }

  playDeathAnimation(hero) {
    const startTime = Date.now();
    const duration = 1000;
    const startY = hero.position.y;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      hero.rotation.z = progress * Math.PI / 2;
      hero.position.y = startY - progress * 0.5;
      hero.traverse((child) => {
        if (child.material) {
          child.material.opacity = 1 - progress * 0.7;
          child.material.transparent = true;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  playUltimateAnimation(hero) {
    const THREE = window.THREE;
    const startTime = Date.now();
    const duration = 500;

    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
      color: hero.userData.side === 'player' ? 0x3b82f6 : 0xef4444,
      transparent: true
    });

    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      particle.position.copy(hero.position);
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      this.scene.add(particle);
      particles.push(particle);
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      hero.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.3);

      particles.forEach(particle => {
        particle.position.add(particle.userData.velocity);
        particle.material.opacity = 1 - progress;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hero.scale.setScalar(1);
        particles.forEach(particle => this.scene.remove(particle));
        hero.userData.currentAnimation = 'idle';
      }
    };

    animate();
  }

  updateIdleAnimation(hero, deltaTime) {
    if (hero.userData.currentAnimation !== 'idle') return;

    hero.userData.idleAnimation.time += deltaTime;
    const time = hero.userData.idleAnimation.time;

    const body = hero.userData.body;
    const head = hero.userData.head;
    const leftArm = hero.userData.leftArm;
    const rightArm = hero.userData.rightArm;

    body.position.y = 1.2 + Math.sin(time * 2) * 0.05;
    head.position.y = 2.2 + Math.sin(time * 2) * 0.05;
    
    leftArm.rotation.z = Math.PI / 6 + Math.sin(time * 1.5) * 0.1;
    rightArm.rotation.z = -Math.PI / 6 - Math.sin(time * 1.5) * 0.1;
  }

  updateHealth(side, currentHealth, maxHealth) {
  }

  updateMana(side, currentMana, maxMana) {
  }

  showDamage(side, damage, isCrit = false) {
    const THREE = window.THREE;
    const hero = this.heroes[side];
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = isCrit ? 'bold 72px Arial' : 'bold 48px Arial';
    ctx.fillStyle = isCrit ? '#ff0000' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(damage).toString(), 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 0.5, 1);
    sprite.position.copy(hero.position);
    sprite.position.y += 3;

    this.scene.add(sprite);

    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      sprite.position.y += 0.02;
      sprite.material.opacity = 1 - progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(sprite);
        texture.dispose();
        material.dispose();
      }
    };

    animate();
  }

  playEffect(effectName, side, options = {}) {
    console.log(`Playing effect: ${effectName} on ${side}`);
  }

  update(deltaTime) {
    if (!this.isInitialized) return;

    if (this.heroes.player) {
      this.updateIdleAnimation(this.heroes.player, deltaTime);
    }
    if (this.heroes.enemy) {
      this.updateIdleAnimation(this.heroes.enemy, deltaTime);
    }
  }

  startRenderLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  resize() {
    if (!this.isInitialized) return;

    const width = this.container.clientWidth;
    const height = Math.min(400, this.container.clientHeight * 0.6);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.heroes = { player: null, enemy: null };
    this.isInitialized = false;

    window.removeEventListener('resize', () => this.resize());
  }
}
