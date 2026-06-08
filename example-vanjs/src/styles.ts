export const styles = `
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
`;
