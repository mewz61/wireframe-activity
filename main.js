import * as THREE from 'three';
import { characterMesh, loadFighter, updateCharacter, playAnimation, setDefaultAnimation } from './character.js';
import { initNavAnimations } from './nav-animations.js';

console.log('%c MAIN.JS IS RUNNING NOW', 'color: yellow; font-size: 18px; font-weight: bold');

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c DOM READY', 'color: cyan; font-size: 16px');

  window.setTimeout(() => {
    startExperience();
  }, 800);
});

function startExperience() {
  const container = document.getElementById('fighter');
  if (!container) {
    console.error('%c #fighter DIV NOT FOUND', 'color: red; font-size: 16px');
    return;
  }
  console.log('%c #fighter div found', 'color: lime');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '0';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.2, 7.5);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  try { renderer.setClearColor(0x000000, 0); } catch (e) {}

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(5, 10, 5);
  scene.add(light);

  let last = performance.now();
  let bounceEnabled = false;
  let bounceTimer = 0;
  let baseY = 0;
  let baseCamera = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  let lookAtTarget = new THREE.Vector3(0, 1.2, 0);
  let desiredCamOffsetX = 0;
  let desiredCamOffsetY = 0;
  let camOffsetX = 0;
  let camOffsetY = 0;
  let maxOffsetX = Math.min(window.innerWidth / 1600, 0.9);
  let maxOffsetY = 0.9;

  function onPointerMove(clientX, clientY) {
    const nx = (clientX / window.innerWidth) - 0.5;
    const ny = (clientY / window.innerHeight) - 0.5;
    desiredCamOffsetX = nx * maxOffsetX;
    desiredCamOffsetY = -ny * maxOffsetY;
  }

  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // load fighter via character module
  loadFighter(scene, () => {
    // expose control to global for pages to trigger animations
    window.playSuccess = () => playAnimation('victory', true);
    window.playVictory = () => playAnimation('victory', true);
    window.playIdle = () => playAnimation('idle');
    window.playWalk = () => playAnimation('walking');
    window.playHighKick = () => playAnimation('kick', true);
    window.playLeftHook = () => playAnimation('hook', true);
    window.playUppercut = () => playAnimation('uppercut', true);
    window.playLeftSide = () => playAnimation('leftSideStep', true);
    window.playRightSide = () => playAnimation('rightSideStep', true);
    window.playBackStep = () => playAnimation('stepBackwards', true);

    // reset scale and compute bbox from the object
    characterMesh.scale.set(1, 1, 1);
    let box = new THREE.Box3().setFromObject(characterMesh);
    let size = box.getSize(new THREE.Vector3());
    let center = box.getCenter(new THREE.Vector3());

    if (size.x > 0 && size.y > 0 && size.z > 0) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const fitScale = 1.2 / maxDim;
      if (Number.isFinite(fitScale) && fitScale > 0) {
        characterMesh.scale.setScalar(fitScale);
        box = new THREE.Box3().setFromObject(characterMesh);
        size = box.getSize(new THREE.Vector3());
        center = box.getCenter(new THREE.Vector3());
      }
    }

    characterMesh.position.sub(center);
    characterMesh.position.y += size.y * 0.5;
    baseY = characterMesh.position.y;

    const defaultCameraZ = Math.max(size.z * 2.2 + 3.6, 6);
    camera.position.set(0, size.y * 0.9 + 1.8, defaultCameraZ * 0.5);
    camera.lookAt(0, size.y * 0.35, 0);

    // store base camera values for dynamic panning
    baseCamera = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };
    lookAtTarget = new THREE.Vector3(0, size.y * 0.35, 0);
    maxOffsetX = Math.min(window.innerWidth / 1600, 0.9);
    maxOffsetY = 0.9;

    // expose a function to enable/disable camera motion if needed
    window.setCameraMotion = (enabled) => {
      if (!enabled) {
        desiredCamOffsetX = 0; desiredCamOffsetY = 0;
      }
    };

    console.log('%c FIGHTER BBOX', 'color: cyan;', { size, center, cameraPos: camera.position.toArray() });

    // keep the fighter moving on every page instead of falling back to an idle loop
    setDefaultAnimation('walking');
    playAnimation('walking');
    bounceEnabled = false;

    // initialize nav animation bindings (clicks + page load triggers)
    try { initNavAnimations(); } catch (e) { console.warn('nav animations init failed', e); }
  });

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const delta = (now - last) / 1000;
    last = now;

    if (bounceEnabled && characterMesh) {
      bounceTimer += delta;
      const bounce = Math.sin(bounceTimer * 2.5) * 0.08;
      characterMesh.position.y = baseY + bounce;
    }

    // smooth camera panning towards desired offsets
    try {
      // interpolate offsets
      camOffsetX += (desiredCamOffsetX - camOffsetX) * 0.08;
      camOffsetY += (desiredCamOffsetY - camOffsetY) * 0.08;

      // apply offsets relative to base camera position
      const offsetFactor = camera.position.z * 0.12; // scale with distance
      camera.position.x = baseCamera.x + camOffsetX * offsetFactor;
      camera.position.y = baseCamera.y + camOffsetY * offsetFactor;

      // always look at the fighter center
      if (characterMesh) camera.lookAt(characterMesh.position.x + lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
      else camera.lookAt(0, 1.2, 0);
    } catch (err) {}

    try { updateCharacter(delta); } catch (e) {}
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    maxOffsetX = Math.min(window.innerWidth / 1600, 0.9);
  });
}
