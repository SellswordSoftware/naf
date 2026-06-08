/**
 * Home page - minimal JS since content is static HTML.
 * This file exists to demonstrate the pattern and could
 * be extended with interactive features if needed.
 */

console.log("NAF-HTML home page loaded");

// The home page is entirely static HTML - no reactivity needed.
// This demonstrates the HTML-first approach: content is visible
// immediately without waiting for JavaScript.
//
// If you needed interactivity, you could import from core.ts:
//
// import { signal, $, setText } from './core';
//
// const visitCount = signal(1);
// setText($('.visit-count'), () => visitCount());
