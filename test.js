/**
 * Activity 3 & 4: Unified Test Suite for OOP and Functional Shopping Carts in JavaScript.
 *
 * Uses Node.js native test runner (node:test) and strict assertions (node:assert/strict).
 * Validates that both implementations are behaviorally identical across the 5 core test cases:
 * 1. Empty cart
 * 2. Single item
 * 3. Discount boundary at exactly 100 (threshold boundary: no discount)
 * 4. Discount boundary at 100.01 (threshold boundary: 10% discount applies)
 * 5. Remove a nonexistent item (graceful handling, state unchanged)
 *
 * Also tests:
 * - True immutability enforcement in Functional code (Object.isFrozen)
 * - Shared-reference aliasing contrast (OOP hazard vs FP safety)
 * - Activity 4 state extension (running discount history)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ShoppingCart } from './oopCart.js';
import * as fc from './functionalCart.js';
import * as te from './tradeoffExtension.js';

// Tolerance helper for floating point calculations
function assertApprox(actual, expected, tolerance = 1e-4, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `${msg || ''} Expected ${actual} to be approximately ${expected} (diff: ${diff} > ${tolerance})`
  );
}

// Adapters providing a uniform test interface across both paradigms
class OOPCartAdapter {
  constructor() {
    this.cart = new ShoppingCart();
  }
  add(name, price) {
    this.cart.addItem(name, price);
    return this;
  }
  remove(name) {
    this.cart.removeItem(name);
    return this;
  }
  getTotal() {
    return this.cart.total();
  }
  getCount() {
    return this.cart.count;
  }
}

class FunctionalCartAdapter {
  constructor() {
    this.cart = fc.createCart();
  }
  add(name, price) {
    this.cart = fc.addItem(this.cart, name, price);
    return this;
  }
  remove(name) {
    this.cart = fc.removeItem(this.cart, name);
    return this;
  }
  getTotal() {
    return fc.calculateTotal(this.cart);
  }
  getCount() {
    return this.cart.length;
  }
}

const implementations = [
  { name: 'OOP ShoppingCart', createAdapter: () => new OOPCartAdapter() },
  { name: 'Functional ShoppingCart', createAdapter: () => new FunctionalCartAdapter() }
];

describe('Activity 3: Unified Shared Suite (5 Core Test Cases)', () => {
  for (const { name, createAdapter } of implementations) {
    describe(`Backend: ${name}`, () => {
      it('Case 1: Empty cart has a total of 0.0 and 0 items', () => {
        const cart = createAdapter();
        assert.equal(cart.getCount(), 0);
        assert.equal(cart.getTotal(), 0.0);
      });

      it('Case 2: Single item under $100 receives no discount', () => {
        const cart = createAdapter();
        cart.add('Notebook', 45.50);
        assert.equal(cart.getCount(), 1);
        assertApprox(cart.getTotal(), 45.50);
      });

      it('Case 3: Discount boundary at exactly $100.00 receives no discount', () => {
        const cart = createAdapter();
        cart.add('Keyboard', 100.00);
        assert.equal(cart.getCount(), 1);
        assertApprox(cart.getTotal(), 100.00);
      });

      it('Case 4: Discount boundary at $100.01 triggers 10% discount', () => {
        const cart = createAdapter();
        cart.add('Mechanical Keyboard', 100.01);
        assert.equal(cart.getCount(), 1);
        const expected = 100.01 * 0.90; // 90.009
        assertApprox(cart.getTotal(), expected);
      });

      it('Case 5: Removing a nonexistent item does not crash and leaves cart unchanged', () => {
        const cart = createAdapter();
        cart.add('Pen', 15.00);
        assert.equal(cart.getCount(), 1);

        cart.remove('Nonexistent_Item');

        assert.equal(cart.getCount(), 1);
        assertApprox(cart.getTotal(), 15.00);
      });
    });
  }
});

describe('Paradigm-Specific Verification & Deep Dive', () => {
  it('Verifies true immutability in Functional Cart (Object.isFrozen)', () => {
    const c0 = fc.createCart();
    assert.ok(Object.isFrozen(c0), 'Initial cart must be frozen');

    const c1 = fc.addItem(c0, 'Mouse', 25.00);
    assert.ok(Object.isFrozen(c1), 'Cart with items must be frozen');
    assert.ok(Object.isFrozen(c1[0]), 'Individual items must be frozen');

    // In strict mode, modifying a frozen object throws TypeError
    assert.throws(() => {
      c1.push({ name: 'Hack', price: 10 });
    }, TypeError);

    const c2 = fc.addItem(c1, 'Mousepad', 15.00);
    const c3 = fc.removeItem(c2, 'Mouse');

    // Confirm historical snapshots are untouched
    assert.equal(c0.length, 0);
    assert.equal(c1.length, 1);
    assert.equal(c2.length, 2);
    assert.equal(c3.length, 1);
    assertApprox(fc.calculateTotal(c3), 15.00);
  });

  it('Contrasts OOP shared-reference aliasing with Functional safety', () => {
    // 1. OOP Aliasing bug demonstration
    const oopA = new ShoppingCart();
    const oopB = oopA; // Shared reference to identical instance
    oopB.addItem('Headphones', 80.00);

    // oopA is unintentionally mutated!
    assert.equal(oopA.count, 1);
    assertApprox(oopA.total(), 80.00);

    // 2. Functional immunity demonstration
    const fpA = fc.createCart();
    const fpB = fc.addItem(fpA, 'Headphones', 80.00);

    // fpA remains completely pristine and empty
    assert.equal(fpA.length, 0);
    assert.equal(fc.calculateTotal(fpA), 0.0);
    assert.equal(fpB.length, 1);
    assertApprox(fc.calculateTotal(fpB), 80.00);
  });

  it('Verifies combined discount calculation for multiple small items', () => {
    const oop = new ShoppingCart();
    oop.addItem('Item 1', 40.00);
    oop.addItem('Item 2', 40.00);
    oop.addItem('Item 3', 30.00); // Subtotal = 110.00 -> Total = 99.00
    assertApprox(oop.total(), 99.00);

    let fp = fc.createCart();
    fp = fc.addItem(fp, 'Item 1', 40.00);
    fp = fc.addItem(fp, 'Item 2', 40.00);
    fp = fc.addItem(fp, 'Item 3', 30.00);
    assertApprox(fc.calculateTotal(fp), 99.00);
  });
});

describe('Activity 4: State Extension Tests (Discount History)', () => {
  it('OOP state extension accumulates discount codes in-place across method calls', () => {
    const cart = new te.ExtendedOOPCart();
    cart.addItem('Monitor', 200.00);

    // Base discount for > 100 is 10% -> 200 * 0.90 = 180.00
    assertApprox(cart.total(), 180.00);

    cart.applyDiscountCode('SAVE5'); // +5% -> 15% discount
    assert.deepEqual(cart.discountHistory, ['SAVE5']);
    assertApprox(cart.total(), 170.00);

    cart.applyDiscountCode('VIP15'); // +15% -> 30% discount
    assert.deepEqual(cart.discountHistory, ['SAVE5', 'VIP15']);
    assertApprox(cart.total(), 140.00);
  });

  it('Functional state extension produces explicit immutable snapshots', () => {
    const s0 = te.createExtendedCart();
    const s1 = te.addItemExt(s0, 'Monitor', 200.00);
    const s2 = te.applyDiscountCodeExt(s1, 'SAVE5');
    const s3 = te.applyDiscountCodeExt(s2, 'VIP15');

    assertApprox(te.calculateTotalExt(s1), 180.00);
    assertApprox(te.calculateTotalExt(s2), 170.00);
    assertApprox(te.calculateTotalExt(s3), 140.00);

    // Historical immutable states remain intact
    assert.deepEqual(s1.discountHistory, []);
    assert.deepEqual(s2.discountHistory, ['SAVE5']);
    assert.deepEqual(s3.discountHistory, ['SAVE5', 'VIP15']);
  });
});
