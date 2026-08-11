import * as THREE from 'three';

export let characterMesh = null;
export let mixer = null;
export const animations = {};
export let defaultAnimation = 'walking';

let currentAnimation = 'walking';
let animationEndAt = 0;
let time = 0;
let mouseX = 0;
let mouseY = 0;

const parts = {};

window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

function makeMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.08 });
}

function makeLimb(radiusTop, radiusBottom, height, color) {
  return new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12), makeMaterial(color));
}

function createFighterRig() {
  const rig = new THREE.Group();
  rig.name = 'fighter-rig';

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.8), makeMaterial(0x2e2e2e));
  torso.position.y = 0.9;
  torso.castShadow = true;
  rig.add(torso);
  parts.torso = torso;

  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.55, 0.85), makeMaterial(0x5b0f0f));
  chest.position.y = 1.52;
  chest.castShadow = true;
  rig.add(chest);
  parts.chest = chest;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), makeMaterial(0xe0c2a6));
  head.position.y = 2.25;
  head.castShadow = true;
  rig.add(head);
  parts.head = head;

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 10), makeMaterial(0xe0c2a6));
  neck.position.y = 1.92;
  rig.add(neck);
  parts.neck = neck;

  const leftUpperArm = makeLimb(0.12, 0.12, 0.72, 0x343434);
  leftUpperArm.position.set(-0.82, 1.55, 0);
  leftUpperArm.rotation.z = 0.15;
  rig.add(leftUpperArm);
  parts.leftUpperArm = leftUpperArm;

  const rightUpperArm = makeLimb(0.12, 0.12, 0.72, 0x343434);
  rightUpperArm.position.set(0.82, 1.55, 0);
  rightUpperArm.rotation.z = -0.15;
  rig.add(rightUpperArm);
  parts.rightUpperArm = rightUpperArm;

  const leftForearm = makeLimb(0.1, 0.1, 0.62, 0x464646);
  leftForearm.position.set(-0.96, 1.08, 0.05);
  leftForearm.rotation.z = 0.34;
  rig.add(leftForearm);
  parts.leftForearm = leftForearm;

  const rightForearm = makeLimb(0.1, 0.1, 0.62, 0x464646);
  rightForearm.position.set(0.96, 1.08, 0.05);
  rightForearm.rotation.z = -0.34;
  rig.add(rightForearm);
  parts.rightForearm = rightForearm;

  const leftGlove = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), makeMaterial(0xd71111));
  leftGlove.position.set(-1.06, 0.67, 0.05);
  rig.add(leftGlove);
  parts.leftGlove = leftGlove;

  const rightGlove = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), makeMaterial(0xd71111));
  rightGlove.position.set(1.06, 0.67, 0.05);
  rig.add(rightGlove);
  parts.rightGlove = rightGlove;

  const leftThigh = makeLimb(0.15, 0.15, 0.82, 0x2b2b2b);
  leftThigh.position.set(-0.34, 0.15, 0);
  rig.add(leftThigh);
  parts.leftThigh = leftThigh;

  const rightThigh = makeLimb(0.15, 0.15, 0.82, 0x2b2b2b);
  rightThigh.position.set(0.34, 0.15, 0);
  rig.add(rightThigh);
  parts.rightThigh = rightThigh;

  const leftShin = makeLimb(0.11, 0.11, 0.72, 0x3f3f3f);
  leftShin.position.set(-0.34, -0.62, 0.03);
  rig.add(leftShin);
  parts.leftShin = leftShin;

  const rightShin = makeLimb(0.11, 0.11, 0.72, 0x3f3f3f);
  rightShin.position.set(0.34, -0.62, 0.03);
  rig.add(rightShin);
  parts.rightShin = rightShin;

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.42), makeMaterial(0x151515));
  leftBoot.position.set(-0.34, -1.08, 0.08);
  rig.add(leftBoot);
  parts.leftBoot = leftBoot;

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.42), makeMaterial(0x151515));
  rightBoot.position.set(0.34, -1.08, 0.08);
  rig.add(rightBoot);
  parts.rightBoot = rightBoot;

  const shorts = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.86), makeMaterial(0x0f0f0f));
  shorts.position.y = 0.15;
  rig.add(shorts);
  parts.shorts = shorts;

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.06, 10, 18), makeMaterial(0xffb400));
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.28;
  rig.add(belt);
  parts.belt = belt;

  rig.scale.setScalar(0.95);
  rig.position.set(0, -1.1, 0);
  return rig;
}

function resetPose() {
  if (!characterMesh) return;
  characterMesh.rotation.set(0, Math.PI, 0);

  if (parts.leftUpperArm) parts.leftUpperArm.rotation.set(0, 0, 0.15);
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.set(0, 0, -0.15);
  if (parts.leftForearm) parts.leftForearm.rotation.set(0, 0, 0.34);
  if (parts.rightForearm) parts.rightForearm.rotation.set(0, 0, -0.34);
  if (parts.leftThigh) parts.leftThigh.rotation.set(0, 0, 0);
  if (parts.rightThigh) parts.rightThigh.rotation.set(0, 0, 0);
  if (parts.leftShin) parts.leftShin.rotation.set(0, 0, 0);
  if (parts.rightShin) parts.rightShin.rotation.set(0, 0, 0);
}

export function loadFighter(scene, onComplete) {
  characterMesh = createFighterRig();
  scene.add(characterMesh);
  resetPose();
  if (onComplete) onComplete();
}

function applyIdle(t) {
  resetPose();
  if (!characterMesh) return;
  characterMesh.position.y = -1.1 + Math.sin(t * 2) * 0.03;
  if (parts.head) parts.head.rotation.z = Math.sin(t * 1.7) * 0.04;
  if (parts.torso) parts.torso.rotation.z = Math.sin(t * 1.2) * 0.03;
  if (parts.leftForearm) parts.leftForearm.rotation.z = 0.28 + Math.sin(t * 2.4) * 0.02;
  if (parts.rightForearm) parts.rightForearm.rotation.z = -0.28 - Math.sin(t * 2.4) * 0.02;
}

function applyWalking(t) {
  resetPose();
  if (!characterMesh) return;
  const swing = Math.sin(t * 5.5) * 0.55;
  const stride = Math.sin(t * 5.5 + Math.PI) * 0.48;
  if (parts.leftUpperArm) parts.leftUpperArm.rotation.z = 0.15 + swing * 0.4;
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.z = -0.15 + stride * 0.4;
  if (parts.leftForearm) parts.leftForearm.rotation.z = 0.28 + swing * 0.15;
  if (parts.rightForearm) parts.rightForearm.rotation.z = -0.28 + stride * 0.15;
  if (parts.leftThigh) parts.leftThigh.rotation.x = stride * 0.6;
  if (parts.rightThigh) parts.rightThigh.rotation.x = swing * 0.6;
  if (parts.leftShin) parts.leftShin.rotation.x = Math.max(0, -stride) * 0.35;
  if (parts.rightShin) parts.rightShin.rotation.x = Math.max(0, -swing) * 0.35;
  characterMesh.position.y = -1.1 + Math.abs(Math.sin(t * 5.5)) * 0.05;
}

function applyVictory(t) {
  resetPose();
  if (!characterMesh) return;
  if (parts.leftUpperArm) parts.leftUpperArm.rotation.z = -0.45;
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.z = 0.45;
  if (parts.leftForearm) parts.leftForearm.rotation.z = -0.65;
  if (parts.rightForearm) parts.rightForearm.rotation.z = 0.65;
  if (parts.leftThigh) parts.leftThigh.rotation.x = -0.12;
  if (parts.rightThigh) parts.rightThigh.rotation.x = -0.12;
  characterMesh.position.y = -1.03 + Math.sin(t * 8) * 0.02;
}

function applyKick(t) {
  resetPose();
  if (!characterMesh) return;
  if (parts.leftUpperArm) parts.leftUpperArm.rotation.z = 0.55;
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.z = -0.25;
  if (parts.rightThigh) parts.rightThigh.rotation.x = -1.0;
  if (parts.rightShin) parts.rightShin.rotation.x = 0.65;
  characterMesh.position.y = -1.08;
}

function applyHook(t) {
  resetPose();
  if (!characterMesh) return;
  if (parts.leftUpperArm) parts.leftUpperArm.rotation.z = -0.85;
  if (parts.leftForearm) parts.leftForearm.rotation.z = -0.55;
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.z = 0.25;
}

function applyCounter(t) {
  resetPose();
  if (!characterMesh) return;
  if (parts.rightUpperArm) parts.rightUpperArm.rotation.z = 0.72;
  if (parts.leftUpperArm) parts.leftUpperArm.rotation.z = -0.1;
  if (parts.leftThigh) parts.leftThigh.rotation.x = 0.25;
}

function applySideStep(direction, t) {
  resetPose();
  if (!characterMesh) return;
  const sign = direction === 'left' ? -1 : 1;
  characterMesh.position.x = sign * 0.18;
  if (parts.leftThigh) parts.leftThigh.rotation.z = sign * 0.22;
  if (parts.rightThigh) parts.rightThigh.rotation.z = sign * -0.22;
}

function applyStepBack(t) {
  resetPose();
  if (!characterMesh) return;
  characterMesh.position.z = 0.08;
  if (parts.leftThigh) parts.leftThigh.rotation.x = -0.22;
  if (parts.rightThigh) parts.rightThigh.rotation.x = -0.22;
}

export function playAnimation(name, once = false) {
  currentAnimation = name;
  if (once) {
    clearTimeout(animationEndAt);
    animationEndAt = window.setTimeout(() => {
      currentAnimation = defaultAnimation;
    }, 1200);
  }
}

export function setDefaultAnimation(name) {
  if (typeof name === 'string' && name.length) {
    defaultAnimation = name;
  }
}

export function updateCharacter(delta) {
  time += delta;

  if (!characterMesh) return;

  const move = currentAnimation || defaultAnimation;
  characterMesh.rotation.y += (mouseX * 0.35 - characterMesh.rotation.y) * 0.04;
  characterMesh.rotation.x += (mouseY * 0.1 - characterMesh.rotation.x) * 0.04;

  switch (move) {
    case 'idle':
      applyIdle(time);
      break;
    case 'walking':
      applyWalking(time);
      break;
    case 'victory':
      applyVictory(time);
      break;
    case 'kick':
      applyKick(time);
      break;
    case 'hook':
      applyHook(time);
      break;
    case 'counter':
      applyCounter(time);
      break;
    case 'leftSideStep':
      applySideStep('left', time);
      break;
    case 'rightSideStep':
      applySideStep('right', time);
      break;
    case 'stepBackwards':
      applyStepBack(time);
      break;
    default:
      applyIdle(time);
      break;
  }
}
