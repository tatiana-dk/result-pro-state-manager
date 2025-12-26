import { createStore } from './src/state/core.js';

// Создаём единое хранилище
const store = createStore();

// Создаём атомы
const counterAtom = store.createAtom('counter', 0);

// Работаем с атомами
console.log(counterAtom.get()); // 0

counterAtom.set(5);
console.log(counterAtom.get()); // 5

const unsubscribeCounter = counterAtom.subscribe(value => {
  console.log('Счётчик изменился:', value);
});

counterAtom.set(5); // Не вызовет подписчика
counterAtom.set(10); // Вызовет подписчика

unsubscribeCounter();

counterAtom.set(15); // Нет подписчика
console.log(counterAtom.get()); // 15