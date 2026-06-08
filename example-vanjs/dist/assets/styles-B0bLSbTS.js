(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();let l=Object.getPrototypeOf,u,p,d,s,A={isConnected:1},G=1e3,h,w={},U=l(A),N=l(l),c,T=(e,t,n,o)=>(e??(o?setTimeout(n,o):queueMicrotask(n),new Set)).add(t),j=(e,t,n)=>{let o=d;d=t;try{return e(n)}catch(r){return console.error(r),n}finally{d=o}},x=e=>e.filter(t=>{var n;return(n=t._dom)==null?void 0:n.isConnected}),E=e=>h=T(h,e,()=>{for(let t of h)t._bindings=x(t._bindings),t._listeners=x(t._listeners);h=c},G),_={get val(){var e;return(e=d==null?void 0:d._getters)==null||e.add(this),this.rawVal},get oldVal(){var e;return(e=d==null?void 0:d._getters)==null||e.add(this),this._oldVal},set val(e){var t;(t=d==null?void 0:d._setters)==null||t.add(this),e!==this.rawVal&&(this.rawVal=e,this._bindings.length+this._listeners.length?(p==null||p.add(this),u=T(u,this,Y)):this._oldVal=e)}},M=e=>({__proto__:_,rawVal:e,_oldVal:e,_bindings:[],_listeners:[]}),b=(e,t)=>{let n={_getters:new Set,_setters:new Set},o={f:e},r=s;s=[];let a=j(e,n,t);a=(a??document).nodeType?a:new Text(a);for(let i of n._getters)n._setters.has(i)||(E(i),i._bindings.push(o));for(let i of s)i._dom=a;return s=r,o._dom=a},k=(e,t=M(),n)=>{let o={_getters:new Set,_setters:new Set},r={f:e,s:t};r._dom=n??(s==null?void 0:s.push(r))??A,t.val=j(e,o,t.rawVal);for(let a of o._getters)o._setters.has(a)||(E(a),a._listeners.push(r));return t},I=(e,...t)=>{for(let n of t.flat(1/0)){let o=l(n??0),r=o===_?b(()=>n.val):o===N?b(n):n;r!=c&&e.append(r)}return e},F=(e,t,...n)=>{var O;let[{is:o,...r},...a]=l(n[0]??0)===U?n:[{},...n],i=e?document.createElementNS(e,t,{is:o}):document.createElement(t,{is:o});for(let[m,f]of Object.entries(r)){let S=g=>g?Object.getOwnPropertyDescriptor(g,m)??S(l(g)):c,y=t+","+m,V=w[y]??(w[y]=((O=S(l(i)))==null?void 0:O.set)??0),z=m.startsWith("on")?(g,q)=>{let P=m.slice(2);i.removeEventListener(P,q),i.addEventListener(P,g)}:V?V.bind(i):i.setAttribute.bind(i,m),v=l(f??0);m.startsWith("on")||v===N&&(f=k(f),v=_),v===_?b(()=>(z(f.val,f._oldVal),i)):z(f)}return I(i,a)},C=e=>({get:(t,n)=>F.bind(c,e,n)}),W=(e,t)=>t?t!==e&&e.replaceWith(t):e.remove(),Y=()=>{let e=0,t=[...u].filter(o=>o.rawVal!==o._oldVal);do{p=new Set;for(let o of new Set(t.flatMap(r=>r._listeners=x(r._listeners))))k(o.f,o.s,o._dom),o._dom=c}while(++e<100&&(t=[...p]).length);let n=[...u].filter(o=>o.rawVal!==o._oldVal);u=c;for(let o of new Set(n.flatMap(r=>r._bindings=x(r._bindings))))W(o._dom,b(o.f,o._dom)),o._dom=c;for(let o of n)o._oldVal=o.rawVal};const B={tags:new Proxy(e=>new Proxy(F,C(e)),C()),hydrate:(e,t)=>W(e,b(t,e)),add:I,state:M,derive:k},{nav:H,a:L}=B.tags;function R(e){return H({class:"main-nav"},L({href:"",class:e==="home"?"active":""},"Home"),L({href:"todo/",class:e==="todo"?"active":""},"Todos"))}const X=`
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem;
}

.container {
    max-width: 600px;
    margin: 0 auto;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #fff;
    margin-bottom: 1.5rem;
    font-size: 2.5rem;
    text-align: center;
}

.add-todo-form {
    display: flex;
    gap: 0.5rem;
}

input[type="text"] {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input[type="text"]:focus {
    outline: none;
    border-color: #667eea;
}

button {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

button:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

button:active:not(:disabled) {
    transform: translateY(0);
}

button:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    opacity: 0.6;
}

button.secondary {
    background: #e2e8f0;
    color: #4a5568;
}

button.secondary:hover {
    background: #cbd5e0;
}

button.secondary.active {
    background: #667eea;
    color: white;
}

button.danger {
    background: #f56565;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

button.danger:hover:not(:disabled) {
    background: #e53e3e;
}

.filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.filters button {
    flex: 1;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    transition: all 0.2s;
}

.todo-item:hover {
    background: #edf2f7;
    transform: translateX(4px);
}

.todo-item.done {
    opacity: 0.6;
}

.todo-item.done .todo-text {
    text-decoration: line-through;
    color: #a0aec0;
}

input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.todo-text {
    flex: 1;
    font-size: 1rem;
    color: #2d3748;
}

.stats {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
    text-align: center;
    color: #718096;
}

.stats strong {
    color: #667eea;
}

.main-nav {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 0.75rem 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.main-nav a {
    color: white;
    text-decoration: none;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s;
    background: transparent;
}

.main-nav a:hover {
    background: rgba(255, 255, 255, 0.2);
}

.main-nav a.active {
    background: white;
    color: #667eea;
}

.home h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.home .tagline {
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

.home h2 {
    color: #4a5568;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
}

.home p {
    color: #718096;
    line-height: 1.6;
}

.home ul {
    list-style: none;
    padding: 0;
}

.home li {
    color: #718096;
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    line-height: 1.5;
}

.home li::before {
    content: ">";
    position: absolute;
    left: 0;
    color: #667eea;
}

.home li strong {
    color: #4a5568;
}

.home code {
    background: #edf2f7;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: #667eea;
}

.home a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
}

.home a:hover {
    text-decoration: underline;
}
`;export{R as N,X as s,B as v};
