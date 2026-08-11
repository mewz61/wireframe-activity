import * as THREE from 'three';
import { loadFighter, updateCharacter, setDefaultAnimation, playAnimation } from './character.js';
import { initNavAnimations } from './nav-animations.js';
import { initScrollControls } from './scroll.js';

function initScene() {
  const container = document.getElementById('fighter');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 8, 28);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.65, 7.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
  keyLight.position.set(4, 8, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xff3a3a, 0.9);
  fillLight.position.set(-4, 2, 3);
  scene.add(fillLight);

  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.3, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0x191919, metalness: 0.15, roughness: 0.85 })
  );
  ring.receiveShadow = true;
  ring.position.y = -1.05;
  scene.add(ring);

  const platform = new THREE.Mesh(
    new THREE.CircleGeometry(3.1, 48),
    new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 1, metalness: 0 })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = -1.01;
  platform.receiveShadow = true;
  scene.add(platform);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', resize);

  loadFighter(scene, () => {
    setDefaultAnimation('walking');
    playAnimation('walking');
  });
  initNavAnimations();
  initScrollControls();

  let last = performance.now();
  function animate(now) {
    const delta = (now - last) / 1000;
    last = now;
    updateCharacter(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link, .nav-links a').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  window.playWalk = () => playAnimation('walking');
  window.playIdle = () => playAnimation('idle');
  window.playVictory = () => playAnimation('victory', true);

  initScene();
});
