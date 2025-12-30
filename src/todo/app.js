import { createStore } from '../state/core.js';

class TodoApp {
    #store;
    #tasksAtom;
    #activeTasks;
    #completedTasks;
    
    #selectors;
    #activeContainer;
    #completedContainer;
    #activeList;
    #completedList;
    #activeCount;
    #completedCount;
    #taskInput;
    #addButton;
    
    constructor(selectors) {
        this.#selectors = selectors;
        this.#store = createStore();
        
        this.#initAtoms();
        this.#setupSubscriptions();
        this.#cacheDOM();
    }
    
    #initAtoms() {
        this.#tasksAtom = this.#store.createAtom('tasks', this.#loadTasks());
        
        this.#activeTasks = this.#store.createComputedAtom(
            'active',
            [this.#tasksAtom],
            (tasks) => tasks.filter(task => !task.completed)
        );
        
        this.#completedTasks = this.#store.createComputedAtom(
            'completed',
            [this.#tasksAtom],
            (tasks) => tasks.filter(task => task.completed)
        );
    }
    
    #loadTasks() {
        try {
            const saved = localStorage.getItem('todo-tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки из LocalStorage:', error);
            return [];
        }
    }
    
    #saveTasks(tasks) {
        try {
            localStorage.setItem('todo-tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Ошибка сохранения в LocalStorage:', error);
        }
    }
    
    #cacheDOM() {
        this.#activeContainer = document.getElementById(this.#selectors.activeContainer);
        this.#completedContainer = document.getElementById(this.#selectors.completedContainer);
        this.#activeList = document.getElementById(this.#selectors.activeList);
        this.#completedList = document.getElementById(this.#selectors.completedList);
        this.#activeCount = document.getElementById(this.#selectors.activeCount);
        this.#completedCount = document.getElementById(this.#selectors.completedCount);
        this.#taskInput = document.getElementById(this.#selectors.taskInput);
        this.#addButton = document.getElementById(this.#selectors.addButton);
    }
    
    #setupSubscriptions() {
        const renderAll = () => {
            this.#renderAllTasks();
            this.#renderAllCounts();
            this.#toggleListsVisibility();
        };
        
        this.#tasksAtom.subscribe(renderAll);
        this.#tasksAtom.subscribe((tasks) => this.#saveTasks(tasks));
    }
    
    #getTasks() {
        return {
            active: this.#activeTasks.get(),
            completed: this.#completedTasks.get()
        };
    }
    
    #renderAllTasks() {
        const { active, completed } = this.#getTasks();
        
        this.#activeContainer.innerHTML = active.map(task => this.#renderTask(task)).join('');
        this.#completedContainer.innerHTML = completed.map(task => this.#renderTask(task)).join('');
    }
    
    #renderTask(task) {
        return `
            <div class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task__checkbox${task.completed ? ' task__checkbox--checked' : ''}" title="Сделано">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L6.6 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="task__text">${task.text}</div>
                <div class="task__delete" title="Удалить">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2L8 8M8 8L14 14M8 8L2 14M8 8L14 2" stroke="red" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
        `;
    }
    
    #renderAllCounts() {
        const { active, completed } = this.#getTasks();
        this.#activeCount.innerHTML = active.length;
        this.#completedCount.innerHTML = completed.length;
    }
    
    #toggleListsVisibility() {
        const { active, completed } = this.#getTasks();
        
        this.#activeList.classList.toggle(
            'todo-list__active--hide',
            active.length === 0
        );
        
        this.#completedList.classList.toggle(
            'todo-list__completed--hide',
            completed.length === 0
        );
    }
    
    #handleClickContainer(event) {
        event.stopPropagation();
        const target = event.target;
        const task = target.closest('.task');
        
        if (!task) return;
        
        const id = Number(task.getAttribute('data-id'));
        
        if (target.closest('.task__delete')) {
            this.#deleteTask(id);
        } else if (target.closest('.task')) {
            this.#toggleTask(id);
        }
    }
    
    #addTask(text) {
        const tasks = this.#tasksAtom.get();
        const newTask = { id: Date.now(), text, completed: false };
        this.#tasksAtom.set([...tasks, newTask]);
    }
    
    #deleteTask(id) {
        const tasks = this.#tasksAtom.get();
        this.#tasksAtom.set(tasks.filter(task => task.id !== id));
    }
    
    #toggleTask(id) {
        const tasks = this.#tasksAtom.get();
        this.#tasksAtom.set(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    }
    
    init() {
        this.#renderAllTasks();
        this.#renderAllCounts();
        this.#toggleListsVisibility();
        
        this.#addButton.addEventListener('click', () => {
            const text = this.#taskInput.value.trim();
            if (text) {
                this.#addTask(text);
                this.#taskInput.value = '';
                this.#taskInput.focus();
            }
        });
        
        this.#taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.#addButton.click();
            }
        });
        
        this.#activeContainer.addEventListener('click', (e) => this.#handleClickContainer(e));
        this.#completedContainer.addEventListener('click', (e) => this.#handleClickContainer(e));
    }
}

// Использование
const app = new TodoApp({
    activeContainer: 'activeContainer',
    completedContainer: 'completedContainer',
    activeList: 'activeList',
    completedList: 'completedList',
    activeCount: 'activeCount',
    completedCount: 'completedCount',
    taskInput: 'taskInput',
    addButton: 'addButton'
});

document.addEventListener('DOMContentLoaded', () => app.init());