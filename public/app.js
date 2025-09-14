// public/app.js
const listEl = document.getElementById('todos');
const form = document.getElementById('todo-form');
const input = document.getElementById('title');

let currentPage = 1;
const limit = 5;

async function fetchTodos(page = 0.) {
  const res = await fetch(`/api/todos?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': 'Bearer mysecrettoken'
    }
  });  
  const result = await res.json();

  renderTodos(result.data, result.page, result.totalPages);
}

function renderTodos(todos, page, totalPages) {
  listEl.innerHTML = '';

  if (todos.length === 0) {
    listEl.innerHTML = '<li class="empty">No todos yet</li>';
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
      <label>
        <input type="checkbox" data-id="${todo.id}" ${todo.done ? 'checked' : ''}>
        <span class="${todo.done ? 'done' : ''}">${escapeHtml(todo.title)}</span>
      </label>
      <button class="delete" data-id="${todo.id}">Delete</button>
    `;
    listEl.appendChild(li);
  });

  // Pagination controls
  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  pagination.innerHTML = `
    <button ${page <= 1 ? 'disabled' : ''} id="prevPage">Prev</button>
    <span>Page ${page} of ${totalPages}</span>
    <button ${page >= totalPages ? 'disabled' : ''} id="nextPage">Next</button>
  `;

  listEl.appendChild(pagination);

  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (page > 1) {
      currentPage--;
      fetchTodos(currentPage);
    }
  });

  document.getElementById('nextPage')?.addEventListener('click', () => {
    if (page < totalPages) {
      currentPage++;
      fetchTodos(currentPage);
    }
  });
}


function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  input.value = '';
  fetchTodos();
});

listEl.addEventListener('click', async (e) => {
  if (e.target.matches('.delete')) {
    const id = e.target.dataset.id;
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  }
});

listEl.addEventListener('change', async (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const id = e.target.dataset.id;
    const done = e.target.checked;
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done })
    });
    fetchTodos();
  }
});

// Initial load
fetchTodos();
