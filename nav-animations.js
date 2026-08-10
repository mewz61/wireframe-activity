
import { playAnimation } from './character.js';

function resolveNavMove(text, href) {
  const t = (text || '').toLowerCase();
  const h = (href || '').toLowerCase();

  if (t.includes('home') || h.includes('index')) return { name: 'walking', once: false };
  if (t.includes('shop') || h.includes('shop')) {
    return { name: 'kick', once: true };
  }
  if (t.includes('products') || h.includes('products')) {
    return { name: 'counter', once: true };
  }
  if (t.includes('community') || h.includes('community')) {
    return { name: 'hook', once: true };
  }
  if (t.includes('about') || h.includes('about')) return { name: 'leftSideStep', once: true };
  if (t.includes('gallery') || h.includes('gallery')) return { name: 'uppercut', once: true };
  if (t.includes('ranking') || h.includes('ranking')) return { name: 'victory', once: true };
  if (t.includes('cart') || h.includes('cart')) return { name: 'stepBackwards', once: true };
  if (t.includes('contact') || h.includes('contact')) return { name: 'rightSideStep', once: true };

  return { name: 'walking', once: false };
}

export function initNavAnimations() {
  setTimeout(() => {
    playForCurrentPage();

    document.querySelectorAll('nav a, header a, a').forEach(link => {
      link.addEventListener('click', () => {
        const text = (link.textContent || '').trim();
        const href = (link.getAttribute('href') || '');
        const move = resolveNavMove(text, href);
        playAnimation(move.name, move.once);
      });
    });
  }, 1000);
}

function playForCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  const move = resolveNavMove('', path);
  playAnimation(move.name, move.once);
}
