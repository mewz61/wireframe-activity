import { playAnimation } from './character.js';

export function initScrollControls() {
  window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    if (scrollPercent < 0.2) {
      playAnimation('idle');
    } else if (scrollPercent >= 0.2 && scrollPercent < 0.4) {
      playAnimation('hook');
    } else if (scrollPercent >= 0.4 && scrollPercent < 0.6) {
      playAnimation('counter');
    } else if (scrollPercent >= 0.6 && scrollPercent < 0.8) {
      playAnimation('kick');
    } else {
      playAnimation('victory');
    }
  });
}
