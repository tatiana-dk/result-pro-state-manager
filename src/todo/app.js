// 1. Создаём хранилище
import { createStore } from '../state/core.js';
const store = createStore();

// 2. Создаём атом с массивом задач
const tasksAtom = store.createAtom('tasks', [
  { id: 1, text: 'Изучить стейт-менеджер', done: true },
  { id: 2, text: 'Написать ToDo-приложение', done: false }
]);

const activeTasks = store.createComputedAtom(
    'active',
    [tasksAtom],
    (tasks) => tasks.filter(task => !task.done)
);

const completedTasks = store.createComputedAtom(
    'completed',
    [tasksAtom],
    (tasks) => tasks.filter(task => task.done)
);

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
function renderAllTasks() {
  const {active, completed} = getTasks();
  const {activeContainer, completedContainer} = getTaskContainers();
  
  activeContainer.innerHTML = active.map(task => renderTodoItem(task)).join('');
  completedContainer.innerHTML = completed.map(task => renderTodoItem(task)).join('');
}

function renderTodoItem(todoItem) {
    return `
    <div class="todo-item ${todoItem.done ? 'done' : ''}" data-id="${todoItem.id}">

        <div class="todo-item__checkbox${todoItem.done ? ' todo-item__checkbox--checked' : ''}"
            title="Сделано"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L6.6 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <div class="todo-item__text">${todoItem.text}</div>

        <div class="todo-item__delete" title="Удалить">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L8 8M8 8L14 14M8 8L2 14M8 8L14 2" stroke="red" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </div>

    </div>
  `;
}

function renderAllCounts() {
    const {active, completed} = getTasks();

    const activeCount = document.getElementById('activeCount');
    const completedCount = document.getElementById('completedCount');

    activeCount.innerHTML = active.length;
    completedCount.innerHTML = completed.length;
}

function toggleListsVisibility() {
    const { active, completed } = getTasks();
    
    document.getElementById('activeList').classList.toggle(
        'todo-list__todo--hide', 
        active.length === 0
    );
    
    document.getElementById('completedList').classList.toggle(
        'todo-list__done--hide', 
        completed.length === 0
    );
}

// Подписываемся
tasksAtom.subscribe(renderAllTasks);
tasksAtom.subscribe(renderAllCounts);
tasksAtom.subscribe(toggleListsVisibility);

// Функция возвращает объект с ссылками на оба контейнера
function getTaskContainers() {
    return {
        activeContainer: document.getElementById('activeContainer'),
        completedContainer: document.getElementById('completedContainer')
    };
}

// Функция возвращает объект с ссылками на оба списка
function getTasks() {
    return {
        active: activeTasks.get(),
        completed: completedTasks.get()
    };
}

function handleClickContainer(event) {
    event.stopPropagation();
    const target = event.target;
    const todoItem = target.closest('.todo-item')

    if (!todoItem) return;
    
    const id = Number(target.closest('.todo-item').getAttribute('data-id'));
    
    if (target.closest('.todo-item__delete')) {
        deleteTask(id);
    } else if (target.closest('.todo-item')) {
        toggleTask(id);
    }
}

// 5. Инициализация
document.addEventListener('DOMContentLoaded', () => {
  // Первый рендер
  renderAllTasks();
  renderAllCounts();
  toggleListsVisibility();
  
  // Обработчик добавления
  document.getElementById('addButton').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text) {
        addTask(text);
        input.value = '';
        input.focus();
    }
  });

  // Обработка Enter в поле ввода
    document.getElementById('taskInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('addButton').click();
        }
    });

  // Обработчики событий task
  const {activeContainer, completedContainer} = getTaskContainers();

  activeContainer.addEventListener('click', handleClickContainer);
  completedContainer.addEventListener('click', handleClickContainer);
});