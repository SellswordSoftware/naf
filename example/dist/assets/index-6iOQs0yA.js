(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function o(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(e){if(e.ep)return;e.ep=!0;const r=o(e);fetch(e.href,r)}})();let h,v;const L=t=>{h&&(t.add(h),v==null||v.push(t))},k=t=>[...t].forEach(i=>i());function b(t){let i=t;const o=new Set;return function(n){return arguments.length>0?(i!==n&&(i=n,k(o)),n):(L(o),i)}}function w(t){let i,o=!0;const n=new Set,e=()=>{o=!0,k(n)};return()=>{if(L(n),o){const r=h;h=e,i=t(),h=r,o=!1}return i}}function g(t){let i=!1;const o=[],n=()=>{if(i)return;i=!0,o.forEach(s=>s.delete(n)),o.length=0;const e=h,r=v;h=n,v=o,t(),h=e,v=r,i=!1};return n(),()=>{o.forEach(e=>e.delete(n)),o.length=0}}function C(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function H(t){return t!=null&&typeof t=="object"&&"html"in t&&"mount"in t}function E(t,i){const o=[],n=[t[0]];for(let e=0;e<i.length;e++){const r=i[e];H(r)?(o.push(r),n.push(r.html)):typeof r=="string"?n.push(r):r!=null&&r!==!1&&n.push(String(r)),n.push(t[e+1])}return{html:n.join(""),components:o}}function $(t,i,o){const n={html:t,el:void 0,mount(e){var r;e.innerHTML||(e.innerHTML=t);for(const s of i)s.mount(e);if(o!=null&&o.root){const s=e.querySelector(o.root);if(!s)throw new Error(`Element not found for selector: ${o.root}`);n.el=s}(r=o==null?void 0:o.onMount)==null||r.call(o,n.el,e)},unmount(){var e,r;for(const s of i)(e=s.unmount)==null||e.call(s);(r=o==null?void 0:o.onUnmount)==null||r.call(o)}};return n}let D=0;const T=document.createElement("div");function S(t,i,o){const n=t.parentNode;let e=t.nextSibling;for(;e&&e.textContent!==`/naf-${i}`;)e=e.nextSibling;const r=e;for(e=t.nextSibling;e&&e!==r;){const s=e.nextSibling;n.removeChild(e),e=s}if(o)for(T.innerHTML=o;T.firstChild;)n.insertBefore(T.firstChild,r)}function N(t,i){const o=D++;let n;const e=`<!--naf-${o}--><!--/naf-${o}-->`;return{html:e,mount(r){r.innerHTML||(r.innerHTML=e);const s=document.createTreeWalker(r,NodeFilter.SHOW_COMMENT,null);let a=null,d=null,l;for(;l=s.nextNode();)if(l.textContent===`naf-${o}`)a=l;else if(l.textContent===`/naf-${o}`){d=l;break}if(!a||!d)throw new Error(`Could not find placeholder comments: naf-${o}`);n=i(a)},unmount(){n==null||n()}}}function u(t,...i){if(!Array.isArray(t)&&typeof t=="object"&&!("raw"in t)){const s=t;return(a,...d)=>{const{html:l,components:c}=E(a,d);return $(l,c,s)}}const o=t,n=i,{html:e,components:r}=E(o,n);return $(e,r)}function q(t,i,o){let n;return N("when",e=>{var a;const r=((a=e.textContent)==null?void 0:a.replace("naf-",""))||"0",s=g(()=>{var c;(c=n==null?void 0:n.unmount)==null||c.call(n);const d=t();n=d?i(d):o==null?void 0:o(d);const l=(n==null?void 0:n.html)??"";S(e,r,l),n==null||n.mount(e.parentNode)});return()=>{var d;s(),(d=n==null?void 0:n.unmount)==null||d.call(n)}})}function I(t,i){let o=[];return N("each",n=>{var s;const e=((s=n.textContent)==null?void 0:s.replace("naf-",""))||"0",r=g(()=>{o.forEach(l=>{var c;return(c=l.unmount)==null?void 0:c.call(l)}),o=[];const d=t().map((l,c)=>{const m=i(l,()=>c);return o.push(m),m.html}).join("");S(n,e,d),o.forEach(l=>l.mount(n.parentNode))});return()=>{r(),o.forEach(a=>{var d;return(d=a.unmount)==null?void 0:d.call(a)})}})}function j(t,i,o){return t?g(()=>{const n=o();n===!1||n===null?t.removeAttribute(i):n===!0?t.setAttribute(i,""):t.setAttribute(i,String(n))}):()=>{}}function y(t,i){return t.querySelector(i)}function B(t,i){return Array.from(t.querySelectorAll(i))}function p(t,i,o,n){const e=t.querySelector(i);return e&&e.addEventListener(o,n),e}function O(t,i,o,n){const e=t.querySelector(i);if(!e)return null;const r=(n==null?void 0:n.type)||"text";r==="checkbox"&&e instanceof HTMLInputElement?e.checked=o():"value"in e&&(e.value=o());const s=r==="checkbox"?"change":"input";return e.addEventListener(s,()=>{r==="checkbox"&&e instanceof HTMLInputElement?o(e.checked):"value"in e&&o(e.value)}),g(()=>{const a=o();r==="checkbox"&&e instanceof HTMLInputElement?e.checked=a:"value"in e&&e.value!==a&&(e.value=a)}),e}function M(t,i,o){return t?g(()=>{o()?t.classList.add(i):t.classList.remove(i)}):()=>{}}function x(t,i){return t?g(()=>{t.textContent=String(i())}):()=>{}}function R(t){const{root:i,routes:o,notFound:n}=t;let e=null;const r=()=>window.location.hash||"#/",s=()=>{var c;(c=e==null?void 0:e.unmount)==null||c.call(e);const l=o[r()]??n;l?(e=l(),i.innerHTML=e.html,e.mount(i)):(e=null,i.innerHTML="<h1>Page Not Found</h1>")},a=l=>{window.location.hash=l};return window.addEventListener("hashchange",s),window.addEventListener("load",s),document.readyState==="complete"&&s(),{navigate:a,current:r,destroy:()=>{var l;window.removeEventListener("hashchange",s),window.removeEventListener("load",s),(l=e==null?void 0:e.unmount)==null||l.call(e),e=null}}}function f(t){return u`
    <div class="card ${t.className||""}">${t.children}</div>
  `}function W(){return u`
    <div class="home">
      <h1>NAF</h1>
      <p class="tagline">Not A Framework - Vanilla SPA Helper Functions</p>

      ${f({children:u`
          <div class="about-section">
            <h2>What is NAF?</h2>
            <p>
              NAF is a ~1.6KB gzipped collection of helper functions for building
              single-page applications with vanilla JavaScript/TypeScript.
              No virtual DOM, no build step required, just copy and use.
            </p>
          </div>
        `})}

      ${f({children:u`
          <div class="features-section">
            <h2>Features</h2>
            <ul>
              <li><strong>Reactive Signals</strong> - Fine-grained reactivity without a virtual DOM</li>
              <li><strong>Computed Values</strong> - Automatic dependency tracking and caching</li>
              <li><strong>Effects</strong> - Side effects that re-run when dependencies change</li>
              <li><strong>Template Literals</strong> - Build components with tagged templates</li>
              <li><strong>Conditional Rendering</strong> - <code>when()</code> for reactive conditionals</li>
              <li><strong>List Rendering</strong> - <code>each()</code> for reactive lists</li>
              <li><strong>Routing</strong> - Hash-based SPA routing built-in</li>
            </ul>
          </div>
        `})}

      ${f({children:u`
          <div class="philosophy-section">
            <h2>Philosophy</h2>
            <p>
              Copy-first, not install-first. NAF is designed to be copied directly
              into your project. No npm install, no dependency management, no
              version conflicts. Just one file you own and can modify.
            </p>
          </div>
        `})}

      ${f({children:u`
          <div class="try-section">
            <h2>Try It</h2>
            <p>
              Check out the <a href="#/todos">Todo App</a> to see NAF in action.
            </p>
          </div>
        `})}
    </div>
  `}function K(){return`
    <h1>Todo App</h1>
  `}function P(t){return f({children:u({root:".add-todo-form",onMount(i){const o=y(i,"button");O(i,"input",t.newTodoText,{}),p(i,"input","keydown",n=>{n.key==="Enter"&&t.newTodoText().trim()&&t.onAdd()}),p(i,"button","click",()=>{t.newTodoText().trim()&&t.onAdd()}),j(o,"disabled",()=>!t.newTodoText().trim())}})`
      <div class="add-todo-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          autofocus
        />
        <button>Add</button>
      </div>
    `})}function z(t){return f({children:u({root:".filters",onMount(i){B(i,"button").forEach(n=>{n.addEventListener("click",()=>{const r=n.getAttribute("data-filter");t.currentFilter(r)});const e=n.getAttribute("data-filter");M(n,"active",()=>t.currentFilter()===e)})}})`
      <div class="filters">
        <button class="secondary" data-filter="all">All</button>
        <button class="secondary" data-filter="active">Active</button>
        <button class="secondary" data-filter="completed">Completed</button>
      </div>
    `})}function J(t){return u({root:`[data-id="${t.todo.id}"]`,onMount(i){p(i,'input[type="checkbox"]',"change",()=>t.onToggle(t.todo.id)),p(i,".delete-btn","click",()=>t.onDelete(t.todo.id)),M(i,"done",()=>t.todo.done)}})`
    <div class="todo-item" data-id="${t.todo.id}">
      <input type="checkbox" ${t.todo.done?"checked":""} />
      <span class="todo-text">${C(t.todo.text)}</span>
      <button class="danger delete-btn">Delete</button>
    </div>
  `}function V(t){return f({children:u`
      <div class="todo-list">
        ${I(()=>t.todos,i=>J({todo:i,onToggle:t.onToggle,onDelete:t.onDelete}))}
      </div>
    `})}function G(t){return f({className:"empty-state",children:`
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>${{all:"No todos yet! Add one above to get started.",active:"No active todos! All done!",completed:"No completed todos yet. Keep working!"}[t.filter]}</p>
      </div>
    `})}function U(t){return f({className:"stats",children:u({root:".stats-content",onMount(i){const o=y(i,".stat:first-child strong"),n=y(i,".stat:first-child span"),e=y(i,".stat:last-child strong");x(o,t.activeCount),x(n,()=>t.activeCount()===1?"task remaining":"tasks remaining"),x(e,t.totalCount)}})`
      <div class="stats-content">
        <div class="stat">
          <strong>0</strong>
          <span>tasks remaining</span>
        </div>
        <div class="stat">
          <strong>0</strong>
          <span>total</span>
        </div>
      </div>
    `})}function _(){const t=b([{id:1,text:"Learn NAF",done:!1},{id:2,text:"Build a todo app",done:!1}]),i=b(""),o=b("all"),n=w(()=>{const l=t(),c=o();return c==="active"?l.filter(m=>!m.done):c==="completed"?l.filter(m=>m.done):l}),e=w(()=>t().filter(l=>!l.done).length),r=w(()=>t().length),s=()=>{const l=i().trim();l&&(t([...t(),{id:Date.now(),text:l,done:!1}]),i(""),setTimeout(()=>{var c;(c=y(document,".add-todo-form input"))==null||c.focus()},0))},a=l=>{t(t().map(c=>c.id===l?{...c,done:!c.done}:c))},d=l=>{t(t().filter(c=>c.id!==l))};return u`
    <div class="app">
      ${K()}
      ${P({newTodoText:i,onAdd:s})}
      ${z({currentFilter:o})}
      ${q(()=>n(),l=>V({todos:l,onToggle:a,onDelete:d}),()=>G({filter:o()}))}

      <div class="stats-wrapper">
          ${U({activeCount:e,totalCount:r})}
      </div>
  `}function Q(){return u`
    <nav class="main-nav">
      <a href="#/">Home</a>
      <a href="#/todos">Todos</a>
    </nav>
  `}const F=document.querySelector("#app");if(!F)throw new Error("Could not find #app element");function A(t){return()=>u`
    <div class="layout">
      ${Q()}
      <main>
        ${t()}
      </main>
    </div>
  `}R({root:F,routes:{"#/":A(W),"#/todos":A(_)},notFound:A(()=>u`
    <div class="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="#/">Go Home</a>
    </div>
  `)});
//# sourceMappingURL=index-6iOQs0yA.js.map
