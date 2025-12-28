// 1. Создаём хранилище
import { createStore } from '../state/core.js';
const store = createStore();

// 2. Создаём атом с массивом задач
const tasksAtom = store.createAtom('tasks', []);

// 3. Функции для изменения состояния
function addTask(text) {
  const tasks = tasksAtom.get();
  const newTask = { id: Date.now(), text, done: false };
  tasksAtom.set([newTask, ...tasks]);
}

function deleteTask(id) {
  const tasks = tasksAtom.get();
  tasksAtom.set(tasks.filter(task => task.id !== id));
}

function toggleTask(id) {
  const tasks = tasksAtom.get();
  tasksAtom.set(tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  ));
}

// 4. Подписка на изменения и обновление DOM
function renderTasks() {
  const tasks = tasksAtom.get();
  const container = document.getElementById('todoContainer');
  
  container.innerHTML = tasks.map(task => `
    <div class="todo-item ${task.done ? 'done' : ''}" data-id="${task.id}">

        <div class="todo-item__checkbox${task.done ? ' todo-item__checkbox--checked' : ''}"
            title="Сделано"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L6.6 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <div class="todo-item__text">${task.text}</div>

        <div class="todo-item__delete" title="Удалить">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L8 8M8 8L14 14M8 8L2 14M8 8L14 2" stroke="red" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </div>

    </div>
  `).join('');
}

// Подписываемся
tasksAtom.subscribe(renderTasks);

// 5. Инициализация
document.addEventListener('DOMContentLoaded', () => {
  // Первый рендер
  renderTasks();
  
  // Обработчик добавления
  document.getElementById('addButton').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    if (input.value.trim()) {
      addTask(input.value.trim());
      input.value = '';
    }
  });

  // Обработчики событий task
  const container = document.getElementById('todoContainer');
  container.addEventListener('click', (event) => {
    event.stopPropagation();
    const target = event.target;
    const todoItem = target.closest('.todo-item')

    if (!todoItem) return;

    const id = Number(todoItem.getAttribute('data-id'));
    
    if (target.closest('.todo-item__delete')) {
        deleteTask(id);
    } else if (target.closest('.todo-item')) {
        toggleTask(id);
    }
  });
});