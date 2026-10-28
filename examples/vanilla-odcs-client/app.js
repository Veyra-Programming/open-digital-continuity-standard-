import { OdcsEngine } from './odcs-engine.js';

const engine = new OdcsEngine();

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const badge = document.getElementById('continuity-badge');
const badgeLabel = document.getElementById('badge-label');
const netSelect = document.getElementById('network-select');
const outboxCount = document.getElementById('outbox-count');
const nodeIdEl = document.getElementById('node-id');

// Initialize Storage
engine.initStorage().then(() => {
  // Subscribe to status updates (Layer 4 UX indicator)
  engine.subscribeStatus((status) => {
    badge.className = `badge badge-${status.state.toLowerCase()}`;
    badgeLabel.textContent = status.message;
    outboxCount.textContent = status.pendingCount;
    nodeIdEl.textContent = status.nodeId;
  });

  // Subscribe to reactive entity changes
  engine.subscribeEntities((tasks) => {
    renderTasks(tasks);
  });
});

// Network Simulator Toggle (Layer 3)
netSelect.addEventListener('change', (e) => {
  engine.setNetworkMode(e.target.value);
});

// User Mutation (Layer 4 -> Layer 1)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: 'task-' + Date.now(),
    title: text,
    completed: false
  };

  input.value = '';
  await engine.recordMutation('tasks', 'CREATE', newTask);
});

function renderTasks(tasks) {
  taskList.innerHTML = '';
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">No continuity records found. Add one above!</li>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <span class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</span>
      <div class="task-actions">
        <button class="btn-toggle" data-id="${task.id}" data-completed="${task.completed}">
          ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="btn-delete" data-id="${task.id}">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  // Wire buttons
  taskList.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const completed = e.target.getAttribute('data-completed') === 'true';
      const existing = tasks.find(t => t.id === id);
      if (existing) {
        await engine.recordMutation('tasks', 'UPDATE', { ...existing, completed: !completed });
      }
    });
  });

  taskList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      await engine.recordMutation('tasks', 'DELETE', { id });
    });
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
