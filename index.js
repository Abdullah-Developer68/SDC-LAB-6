/**
 * Interactive demonstration runner for Lab 06: OOP & Functional Programming in JavaScript.
 *
 * Demonstrates:
 * - Activity 1: OOP Shopping Cart
 * - Activity 2: Functional Shopping Cart
 * - Activity 3: Execution of the 5 boundary test scenarios
 * - Activity 4: Concrete comparison of State Extension (Discount History)
 * - Evaluation Matrix: Simplicity, Reliability, and Efficiency
 */
import { ShoppingCart } from './oopCart.js';
import * as fc from './functionalCart.js';
import * as te from './tradeoffExtension.js';

function banner(title) {
  console.log('\n' + '='.repeat(75));
  console.log(` ${title.toUpperCase()}`);
  console.log('='.repeat(75));
}

function demoActivity1() {
  banner('Activity 1: Object-Oriented Programming (OOP) Cart');
  console.log('Concept: State lives inside the object instance; methods mutate internal state in-place.');
  const cart = new ShoppingCart();
  console.log(`Initial Cart: count=${cart.count}, total=$${cart.total().toFixed(2)}`);

  cart.addItem('Mechanical Keyboard', 100.01);
  console.log(`Added 'Mechanical Keyboard' ($100.01): Total = $${cart.total().toFixed(3)} (10% discount applied)`);

  cart.addItem('Mouse', 25.00);
  console.log(`Added 'Mouse' ($25.00): Total = $${cart.total().toFixed(3)}`);

  cart.removeItem('Mechanical Keyboard');
  console.log(`Removed 'Mechanical Keyboard': Total = $${cart.total().toFixed(3)} (Subtotal <= $100, no discount)`);

  cart.removeItem('Phantom Item');
  console.log(`Removed Nonexistent Item: Gracefully handled, Total remains $${cart.total().toFixed(3)}`);
}

function demoActivity2() {
  banner('Activity 2: Functional Programming (FP) Cart');
  console.log('Concept: Cart is an immutable array; functions are pure and return new frozen carts.');

  const cart0 = fc.createCart();
  console.log(`Cart 0 (initial empty): count=${cart0.length}, frozen=${Object.isFrozen(cart0)}`);

  const cart1 = fc.addItem(cart0, 'Mechanical Keyboard', 100.01);
  console.log(`Cart 1 (after adding item): count=${cart1.length}, total=$${fc.calculateTotal(cart1).toFixed(3)}`);
  console.log(`Notice: Cart 0 is still empty! cart0.length = ${cart0.length}`);

  const cart2 = fc.addItem(cart1, 'Mouse', 25.00);
  console.log(`Cart 2 (after adding Mouse): count=${cart2.length}, total=$${fc.calculateTotal(cart2).toFixed(3)}`);

  const cart3 = fc.removeItem(cart2, 'Mechanical Keyboard');
  console.log(`Cart 3 (after removing Keyboard): count=${cart3.length}, total=$${fc.calculateTotal(cart3).toFixed(3)}`);
  console.log(`Notice: Cart 2 is unmodified! cart2.length = ${cart2.length}`);
}

function demoActivity3() {
  banner('Activity 3: Unified Testing on 5 Core Cases');
  const scenarios = [
    { desc: '1. Empty cart', items: [] },
    { desc: '2. Single item ($45.50)', items: [['Book', 45.50]] },
    { desc: '3. Discount boundary (exactly $100.00)', items: [['Keyboard', 100.00]] },
    { desc: '4. Discount boundary ($100.01)', items: [['Mechanical Keyboard', 100.01]] },
    { desc: '5. Remove nonexistent item', items: [['Pen', 15.00], ['REMOVE_NONEXISTENT', 0]] }
  ];

  console.log(`${'Scenario'.padEnd(40)} | ${'OOP Total'.padEnd(12)} | ${'FP Total'.padEnd(12)} | Status`);
  console.log('-'.repeat(78));

  for (const { desc, items } of scenarios) {
    // OOP execution
    const oop = new ShoppingCart();
    for (const [name, price] of items) {
      if (name === 'REMOVE_NONEXISTENT') oop.removeItem('Ghost');
      else oop.addItem(name, price);
    }
    const oopTotal = oop.total();

    // FP execution
    let fp = fc.createCart();
    for (const [name, price] of items) {
      if (name === 'REMOVE_NONEXISTENT') fp = fc.removeItem(fp, 'Ghost');
      else fp = fc.addItem(fp, name, price);
    }
    const fpTotal = fc.calculateTotal(fp);

    const isMatch = Math.abs(oopTotal - fpTotal) < 1e-5;
    const status = isMatch ? 'MATCH (Identical)' : 'MISMATCH';
    console.log(
      `${desc.padEnd(40)} | $${oopTotal.toFixed(3).padEnd(11)} | $${fpTotal.toFixed(3).padEnd(11)} | ${status}`
    );
  }
}

function demoActivity4() {
  banner('Activity 4: State Extension Trade-Off (Discount Codes)');
  console.log('Feature Requirement: Remember running discount-code history across method calls.\n');

  console.log('--- OOP Approach: Stateful Extension ---');
  const oopCart = new te.ExtendedOOPCart();
  oopCart.addItem('Monitor', 200.00);
  console.log(`Base Total ($200 with >$100 discount): $${oopCart.total().toFixed(2)}`);
  oopCart.applyDiscountCode('SAVE5');
  console.log(`After 'SAVE5': Codes=${JSON.stringify(oopCart.discountHistory)}, Total=$${oopCart.total().toFixed(2)}`);
  oopCart.applyDiscountCode('VIP15');
  console.log(`After 'VIP15': Codes=${JSON.stringify(oopCart.discountHistory)}, Total=$${oopCart.total().toFixed(2)}`);

  console.log('\n--- Functional Approach: Explicit Immutable State ---');
  const s0 = te.createExtendedCart();
  const s1 = te.addItemExt(s0, 'Monitor', 200.00);
  const s2 = te.applyDiscountCodeExt(s1, 'SAVE5');
  const s3 = te.applyDiscountCodeExt(s2, 'VIP15');

  console.log(`State 1 (Item added, no codes): Codes=${JSON.stringify(s1.discountHistory)}, Total=$${te.calculateTotalExt(s1).toFixed(2)}`);
  console.log(`State 2 (SAVE5 applied):       Codes=${JSON.stringify(s2.discountHistory)}, Total=$${te.calculateTotalExt(s2).toFixed(2)}`);
  console.log(`State 3 (VIP15 applied):       Codes=${JSON.stringify(s3.discountHistory)}, Total=$${te.calculateTotalExt(s3).toFixed(2)}`);
}

function demoEvaluationMatrix() {
  banner('Evaluation Matrix: Simplicity, Reliability & Efficiency');
  const table = [
    {
      Attribute: 'Simplicity',
      OOP: 'Intuitive mental model for state accumulation; lower syntactic ceremony for developers used to imperative code.',
      Functional: 'Simpler cognitive footprint per function (no hidden side effects); but requires explicit state container plumbing.'
    },
    {
      Attribute: 'Reliability',
      OOP: 'Prone to subtle aliasing bugs (shared mutable references) and temporal coupling (order-dependent method calls).',
      Functional: 'Exceptionally high reliability; immutability completely prevents aliasing bugs; pristine test isolation.'
    },
    {
      Attribute: 'Efficiency',
      OOP: 'High memory efficiency; mutates arrays in place without reallocating collections on every modification.',
      Functional: 'Allocates new arrays and frozen wrappers per operation; negligible for small collections but higher GC pressure at scale.'
    }
  ];

  console.table(table);
}

function main() {
  console.log('\n===========================================================================');
  console.log(' Software Construction & Development (SDC) - Lab 06 (JavaScript Edition)');
  console.log(' Evaluation on Simplicity, Reliability, and Efficiency');
  console.log('===========================================================================');

  demoActivity1();
  demoActivity2();
  demoActivity3();
  demoActivity4();
  demoEvaluationMatrix();

  console.log('\n[SUCCESS] All demonstrations completed. Run "npm test" to run all automated tests.\n');
}

main();
