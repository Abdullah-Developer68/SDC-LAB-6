/**
 * Activity 2: Functional Programming (FP) Shopping Cart.
 *
 * Characteristics:
 * - Cart is represented using an immutable, frozen data structure: ReadonlyArray<Item>.
 * - Pure functions with zero side-effects: every operation returns a new cart snapshot.
 * - Referential transparency: identical inputs always yield identical outputs.
 * - Enforces immutability via Object.freeze() to eliminate mutable-state leakage.
 * - Prevents shared-reference aliasing bugs common in mutable OOP instances.
 */
import { createItem } from './item.js';

export const DISCOUNT_THRESHOLD = 100.0;
export const DISCOUNT_RATE = 0.10; // 10% discount above $100

/**
 * Pure function: creates an initial empty immutable cart.
 * @returns {ReadonlyArray<{ name: string, price: number }>}
 */
export function createCart() {
  return Object.freeze([]);
}

/**
 * Pure function: returns a new cart containing the newly added item.
 * Never mutates the original cart array.
 *
 * @param {ReadonlyArray<{ name: string, price: number }>} cart
 * @param {string} name
 * @param {number} price
 * @returns {ReadonlyArray<{ name: string, price: number }>}
 */
export function addItem(cart, name, price) {
  const newItem = createItem(name, price);
  return Object.freeze([...cart, newItem]);
}

/**
 * Pure function: returns a new cart with the first occurrence of the named item removed.
 * If the item does not exist, returns the original cart intact.
 * Never mutates the original cart array.
 *
 * @param {ReadonlyArray<{ name: string, price: number }>} cart
 * @param {string} name
 * @returns {ReadonlyArray<{ name: string, price: number }>}
 */
export function removeItem(cart, name) {
  const index = cart.findIndex(item => item.name === name);
  if (index === -1) {
    return cart;
  }
  return Object.freeze([...cart.slice(0, index), ...cart.slice(index + 1)]);
}

/**
 * Pure function: calculates the total, applying a 10% discount if subtotal > $100.
 *
 * @param {ReadonlyArray<{ name: string, price: number }>} cart
 * @returns {number}
 */
export function calculateTotal(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  if (subtotal > DISCOUNT_THRESHOLD) {
    return subtotal * (1.0 - DISCOUNT_RATE);
  }
  return subtotal;
}

/**
 * Alias for calculateTotal to support uniform function calling.
 * @param {ReadonlyArray<{ name: string, price: number }>} cart
 * @returns {number}
 */
export function total(cart) {
  return calculateTotal(cart);
}
