// src/state/core.js

/**
 * Единое хранилище с атомами
 */
function createStore() {
  // Здесь будут храниться все атомы по ключам
  const atoms = new Map();

  /**
   * Создаёт новый атом в хранилище
   * @param {string} key - уникальное имя атома
   * @param {any} initialValue - начальное значение
   * @returns {Atom} объект атома
   */
  function createAtom(key, initialValue) {
    // 1. Проверить, не существует ли уже атом с таким ключом
    if (atoms.has(key)) {
        throw new Error(`Атом с ключом "${key}" уже существует`);
    }

    // 2. Создать атом: значение, список подписчиков
    let value = initialValue;
    const listeners = [];

    // 3. Сохранить атом в хранилище (atoms)
    // Метод получения текущего значения
    const get = () => value;

    // Метод установки нового значения
    const set = (newValue) => {
      if (value !== newValue) {
        value = newValue;
        // Уведомляем всех подписчиков
        listeners.forEach(listener => listener(value));
      }
    };

    // Подписка на изменения
    const subscribe = (listener) => {
      listeners.push(listener);
      // Возвращаем функцию для отписки
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    };

    // 4. Вернуть объект с методами get, set, subscribe
    // Создаём объект атома
    const atom = { get, set, subscribe };

    // Сохраняем в хранилище
    atoms.set(key, atom);

    return atom;
  }

  /**
   * Возвращает атом по ключу
   * @param {string} key - имя атома
   * @returns {Atom | undefined} найденный атом или undefined
   */
  function getAtom(key) {
    // TODO: Вернуть атом из коллекции atoms
  }

  /**
   * Удаляет атом из хранилища
   * @param {string} key - имя атома
   */
  function removeAtom(key) {
    // TODO: 1. Отписать всех слушателей атома
    // TODO: 2. Удалить атом из коллекции atoms
  }

  /**
   * Объект атома (возвращается из createAtom)
   * @typedef {Object} Atom
   * @property {function(): any} get - возвращает текущее значение
   * @property {function(newValue: any): void} set - устанавливает новое значение
   * @property {function(listener: Function): Function} subscribe - подписка на изменения
   */

  // Публичные методы хранилища
  return {
    createAtom,
    getAtom,
    removeAtom,
  };
}

/**
 * Пример использования (для понимания структуры):
 * const store = createStore();
 * const countAtom = store.createAtom('count', 0);
 * 
 * countAtom.get() // 0
 * countAtom.set(5)
 * 
 * const unsubscribe = countAtom.subscribe(value => {
 *   console.log('Новое значение:', value);
 * });
 * 
 * unsubscribe();
 */

export { createStore };