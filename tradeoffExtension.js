/**
 * Activity 4: Concrete Extension Example & Paradigm Evaluation.
 *
 * Feature Requirement:
 * Extend both models to remember cart-wide state across multiple calls:
 * a running discount-code history (e.g. 'SAVE5', 'VIP15').
 *
 * This module also exports comparative metrics and data structures evaluated across:
 * 1. Simplicity
 * 2. Reliability
 * 3. Efficiency
 */
import { createItem } from './item.js';

// ============================================================================
// OOP Extension: Stateful Cart with Running Discount History
// ============================================================================

export class ExtendedOOPCart {
  static DISCOUNT_THRESHOLD = 100.0;
  static BASE_DISCOUNT_RATE = 0.10;

  static CODE_DISCOUNTS = {
    SAVE5: 0.05,
    VIP15: 0.15
  };

  /** @type {Array<{ name: string, price: number }>} */
  #items;
  /** @type {Array<string>} */
  #discountHistory;

  constructor() {
    this.#items = [];
    // Rapid extension: new state variable added directly to instance
    this.#discountHistory = [];
  }

  addItem(name, price) {
    this.#items.push(createItem(name, price));
  }

  removeItem(name) {
    const index = this.#items.findIndex(item => item.name === name);
    if (index !== -1) {
      this.#items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Applies promo code in-place and records it in instance history.
   * @param {string} code
   * @returns {boolean}
   */
  applyDiscountCode(code) {
    if (ExtendedOOPCart.CODE_DISCOUNTS[code] && !this.#discountHistory.includes(code)) {
      this.#discountHistory.push(code);
      return true;
    }
    return false;
  }

  total() {
    const subtotal = this.#items.reduce((sum, item) => sum + item.price, 0);
    let discountRate = 0.0;

    if (subtotal > ExtendedOOPCart.DISCOUNT_THRESHOLD) {
      discountRate += ExtendedOOPCart.BASE_DISCOUNT_RATE;
    }

    for (const code of this.#discountHistory) {
      discountRate += ExtendedOOPCart.CODE_DISCOUNTS[code] || 0.0;
    }

    // Cap total discount at 50%
    const effectiveRate = Math.min(discountRate, 0.50);
    return subtotal * (1.0 - effectiveRate);
  }

  get discountHistory() {
    return Object.freeze([...this.#discountHistory]);
  }

  get count() {
    return this.#items.length;
  }
}

// ============================================================================
// Functional Extension: Explicit State Container with Pure Transformations
// ============================================================================

const CODE_DISCOUNTS = Object.freeze({
  SAVE5: 0.05,
  VIP15: 0.15
});

/**
 * Creates an immutable cart state container.
 * @returns {Readonly<{ items: ReadonlyArray<any>, discountHistory: ReadonlyArray<string> }>}
 */
export function createExtendedCart() {
  return Object.freeze({
    items: Object.freeze([]),
    discountHistory: Object.freeze([])
  });
}

/**
 * Pure function: returns a new CartState with the added item.
 */
export function addItemExt(state, name, price) {
  const newItem = createItem(name, price);
  return Object.freeze({
    items: Object.freeze([...state.items, newItem]),
    discountHistory: state.discountHistory
  });
}

/**
 * Pure function: returns a new CartState with the item removed.
 */
export function removeItemExt(state, name) {
  const index = state.items.findIndex(item => item.name === name);
  if (index === -1) {
    return state;
  }
  const nextItems = Object.freeze([
    ...state.items.slice(0, index),
    ...state.items.slice(index + 1)
  ]);
  return Object.freeze({
    items: nextItems,
    discountHistory: state.discountHistory
  });
}

/**
 * Pure function: returns a new CartState with updated discount history.
 */
export function applyDiscountCodeExt(state, code) {
  if (CODE_DISCOUNTS[code] && !state.discountHistory.includes(code)) {
    return Object.freeze({
      items: state.items,
      discountHistory: Object.freeze([...state.discountHistory, code])
    });
  }
  return state;
}

/**
 * Pure function: calculates total from explicit immutable state.
 */
export function calculateTotalExt(state) {
  const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
  let discountRate = 0.0;

  if (subtotal > 100.0) {
    discountRate += 0.10;
  }

  for (const code of state.discountHistory) {
    discountRate += CODE_DISCOUNTS[code] || 0.0;
  }

  const effectiveRate = Math.min(discountRate, 0.50);
  return subtotal * (1.0 - effectiveRate);
}
