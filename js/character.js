
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export let characterMesh = null;
export let mixer = null;
export const animations = {};
let currentAction = null;
let pendingAnimation = null;
let pendingOnce = false;
export let defaultAnimation = 'walking';

const fbxLoader = new FBXLoader();

function getAssetBase() {
  return './';
}

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

function logHierarchy(object, prefix = '') {
  const meshInfo = object.isMesh || object.isSkinnedMesh ? ` mesh verts=${object.geometry?.attributes?.position?.count ?? 0}` : '';
  console.log(`${prefix}${object.type} name="${object.name || '(unnamed)'}" children=${object.children.length}${meshInfo}`);
  object.children.forEach((child) => logHierarchy(child, prefix + '  '));
}

export function loadFighter(scene, onComplete) {
  console.log('%c === LOADING FIGHTER ===', 'color: lime; font-size: 14px');

  const assetBase = getAssetBase();

  fbxLoader.load(`${assetBase}Fighter 2/mma fighter.fbx`, (object) => {
      console.log('%c MODEL LOADED SUCCESSFULLY', 'color: lime; font-size: 14px');
      console.log('loaded object type:', object.type, 'name:', object.name);
      logHierarchy(object);

      characterMesh = object;
      characterMesh.scale.set(0.05, 0.05, 0.05);
      characterMesh.position.set(0, 0, 0);

      characterMesh.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          if (child.material) {
            const originalMaterial = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : child.material.clone();
            const material = Array.isArray(originalMaterial)
              ? originalMaterial
              : originalMaterial;

            if (Array.isArray(material)) {
              material.forEach((mat) => {
                mat.skinning = !!child.isSkinnedMesh;
                mat.metalness = mat.metalness ?? 0.15;
                mat.roughness = mat.roughness ?? 0.65;
                mat.emissive = mat.emissive || new THREE.Color(0x000000);
                mat.emissiveIntensity = 0.1;
                mat.flatShading = false;
                mat.needsUpdate = true;
              });
            } else {
              material.skinning = !!child.isSkinnedMesh;
              material.metalness = material.metalness ?? 0.15;
              material.roughness = material.roughness ?? 0.65;
              material.emissive = material.emissive || new THREE.Color(0x000000);
              material.emissiveIntensity = 0.1;
              material.flatShading = false;
              material.needsUpdate = true;
            }

            child.material = material;
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xdddddd,
              emissive: 0x000000,
              emissiveIntensity: 0.1,
              metalness: 0.15,
              roughness: 0.65,
              skinning: !!child.isSkinnedMesh,
              flatShading: false
            });
          }

          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
        }
      });

      scene.add(characterMesh);
      console.log('%c CHARACTER ADDED TO SCENE', 'color: lime; font-size: 14px');
      console.log('characterMesh children:', characterMesh.children.length);

      mixer = new THREE.AnimationMixer(characterMesh);
      loadAnim(`${assetBase}Mma Idle.fbx`, 'idle');
      loadAnim(`${assetBase}Walking.fbx`, 'walking');
      loadAnim(`${assetBase}Counterstrike.fbx`, 'counter');
      loadAnim(`${assetBase}High Kick.fbx`, 'kick');
      loadAnim(`${assetBase}Left Short Hook from Guard.fbx`, 'hook');
      loadAnim(`${assetBase}Right Upper Hook from Guard.fbx`, 'uppercut');
      loadAnim(`${assetBase}Short Left Side Step.fbx`, 'leftSideStep');
      loadAnim(`${assetBase}Short Right Side Step.fbx`, 'rightSideStep');
      loadAnim(`${assetBase}Step Backward.fbx`, 'stepBackwards');
      loadAnim(`${assetBase}victory.fbx`, 'victory');

      characterMesh.rotation.y = Math.PI;
      if (onComplete) onComplete();
    }, undefined, (err) => {
      console.error('%c FAILED TO LOAD MODEL', 'color: red; font-size: 16px');
      console.error(err);
    }
  );
}



function loadAnim(file, name) {
  fbxLoader.load(file, (obj) => {
    if (obj.animations && obj.animations.length > 0) {
      const clip = obj.animations[0];
      clip.tracks = clip.tracks.filter(t => !t.name.toLowerCase().includes('hips.position'));
      const action = mixer.clipAction(clip);
      action.clampWhenFinished = true;
      animations[name] = action;
      console.log('Loaded animation:', name);
      if (pendingAnimation === name) {
        playAnimation(name, pendingOnce);
        pendingAnimation = null;
        pendingOnce = false;
      }
    }
  });
}

export function playAnimation(name, once = false) {
  if (!mixer) {
    pendingAnimation = name;
    pendingOnce = once;
    return;
  }
  if (!animations[name]) {
    pendingAnimation = name;
    pendingOnce = once;
    return;
  }

  const next = animations[name];
  if (currentAction === next) return;

  if (currentAction) currentAction.fadeOut(0.25);

  next.reset();
  next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat);
  next.clampWhenFinished = once;
  next.fadeIn(0.25);
  next.play();
  currentAction = next;

  // if this was a one-shot move, after it finishes, fall back to the default animation
  if (once && mixer) {
    const handler = (e) => {
      try {
        if (e.action === next) {
          mixer.removeEventListener('finished', handler);
          if (defaultAnimation && defaultAnimation !== name && animations[defaultAnimation]) {
            playAnimation(defaultAnimation);
          }
        }
      } catch (err) {
        console.warn('error in finished handler', err);
      }
    };
    mixer.addEventListener('finished', handler);
  }
}

export function setDefaultAnimation(name) {
  if (typeof name === 'string' && name.length) defaultAnimation = name;
}

export function updateCharacter(delta) {
  if (mixer) mixer.update(delta);

  if (characterMesh) {
    const targetY = mouseX * 0.5;
    const targetX = mouseY * 0.15;
    characterMesh.rotation.y += (targetY - characterMesh.rotation.y) * 0.08;
    characterMesh.rotation.x += (targetX - characterMesh.rotation.x) * 0.05;
  }
}
