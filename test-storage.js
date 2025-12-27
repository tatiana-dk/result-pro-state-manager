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

// counterAtom.set('10'); // Ошибка несоответствие типов
// counterAtom.set(undefined); // Ошибка нельзя передать undefined

unsubscribeCounter();

counterAtom.set(15); // Нет подписчика
console.log(counterAtom.get()); // 15

console.log('Проверка вычисляемого значения');

const priceAtom = store.createAtom('price', 100);
const quantityAtom = store.createAtom('quantity', 2);

const totalAtom = store.createComputedAtom(
  'total',
  [priceAtom, quantityAtom],
  (price, quantity) => price * quantity
);

console.log(totalAtom.get()); // 200
quantityAtom.set(3);
console.log(totalAtom.get()); // 300