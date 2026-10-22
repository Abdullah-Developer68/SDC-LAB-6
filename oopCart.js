/**
 * Activity 1: Object-Oriented Programming (OOP) Shopping Cart.
 *
 * Characteristics:
 * - State lives inside the object instance between method calls (#items).
 * - Methods mutate internal state in-place.
 * - Encapsulation binds both data and operations into a single cohesive entity.
 */
import { createItem } from './item.js';

export class ShoppingCart {
  static DISCOUNT_THRESHOLD = 100.0;
  static DISCOUNT_RATE = 0.10; // 10% discount above $100

  /** @type {Array<{ name: string, price: number }>} */
  #items;

  constructor() {
    this.#items = [];
  }

  /**
   * Adds an item to the shopping cart, mutating the internal collection in place.
   * @param {string} name
   * @param {number} price
   */
  addItem(name, price) {
    this.#items.push(createItem(name, price));
  }

  /**
   * Removes the first occurrence of an item by name.
   * If the item is nonexistent, leaves cart intact and returns false.
   * @param {string} name
   * @returns {boolean} True if an item was removed, false otherwise
   */
  removeItem(name) {
    const index = this.#items.findIndex(item => item.name === name);
    if (index !== -1) {
      this.#items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculates the cart total, applying a 10% discount if the subtotal is strictly above $100.
   * @returns {number}
   */
  total() {
    const subtotal = this.#items.reduce((sum, item) => sum + item.price, 0);
    if (subtotal > ShoppingCart.DISCOUNT_THRESHOLD) {
      return subtotal * (1.0 - ShoppingCart.DISCOUNT_RATE);
    }
    return subtotal;
  }

  /**
   * Alias for total() to support uniform interfaces.
   * @returns {number}
   */
  calculateTotal() {
    return this.total();
  }

  /**
   * Returns a read-only snapshot of current items.
   * @returns {ReadonlyArray<{ name: string, price: number }>}
   */
  getItems() {
    return Object.freeze([...this.#items]);
  }

  /**
   * Returns item count.
   * @returns {number}
   */
  get count() {
    return this.#items.length;
  }
}
