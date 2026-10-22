# Lab 06: OOP & Functional Programming in Modern Development with AI (JavaScript Edition)

**Course:** Software Construction and Development (SDC) — BSE-7-B  
**Student Name:** Abdullah  
**Registration Number:** FA23-BSE-137  
**Date:** October 22, 2026  
**Environment:** Node.js v24.18.0 (Native `node:test` Runner)  
**GitHub Repository:** [https://github.com/Abdullah-Developer68/SDC-LAB-6](https://github.com/Abdullah-Developer68/SDC-LAB-6)

---

## Executive Summary & Objective

The objective of this lab is to solve a shopping cart problem using two distinct paradigms in modern JavaScript — **Object-Oriented Programming (OOP)** and **Functional Programming (FP)** — examine AI-assisted translation between both styles, verify behavioral equivalence using a unified test suite, and evaluate the trade-offs on the basis of **Simplicity**, **Reliability**, and **Efficiency**.

### Scenario Specifications
- Shopping cart with:
  1. `addItem(name, price)`
  2. `removeItem(name)` (safely handling nonexistent items)
  3. `total()` / `calculateTotal()` (calculating subtotal and applying a **10% discount strictly above $100.00**).

---

## Repository Structure

```text
lab-6/
├── package.json            # Node.js project manifest (ES Modules & test scripts)
├── item.js                 # Domain model helper: frozen Item representation
├── oopCart.js              # Activity 1: Stateful OOP ShoppingCart class (#items)
├── functionalCart.js       # Activity 2: Pure functional shopping cart module
├── test.js                 # Activity 3 & 4: Unified test suite with node:test & node:assert
├── tradeoffExtension.js    # Activity 4: Concrete state extension (discount codes)
├── index.js                # Interactive console demonstration runner
└── README.md               # Comprehensive evaluation report & documentation
```

---

## Activity 1: Generate the OOP Version

### Design & Paradigm Philosophy
In the Object-Oriented paradigm, **state and behavior are packaged together** into an instance:
- **Encapsulated Private State:** Uses ES2022 private fields (`#items = []`) to protect internal collections from unauthorized external modification.
- **In-Place Mutation:** Methods like `addItem()` and `removeItem()` mutate the internal array in place (`this.#items.push()`, `this.#items.splice()`).
- **OOP Habit of Thought:** The cart is an active entity that holds data and knows how to act upon it.

### Implementation (`oopCart.js`)
```javascript
import { createItem } from './item.js';

export class ShoppingCart {
  static DISCOUNT_THRESHOLD = 100.0;
  static DISCOUNT_RATE = 0.10; // 10% discount above $100

  #items;

  constructor() {
    this.#items = [];
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

  total() {
    const subtotal = this.#items.reduce((sum, item) => sum + item.price, 0);
    if (subtotal > ShoppingCart.DISCOUNT_THRESHOLD) {
      return subtotal * (1.0 - ShoppingCart.DISCOUNT_RATE);
    }
    return subtotal;
  }

  get count() {
    return this.#items.length;
  }
}
```

---

## Activity 2: Convert to a Functional Style

### Purity & Immutability in JavaScript
Before diving into functional code, we must recognize when AI-generated code is **not actually pure**:
- In JavaScript, standard arrays are **mutable by reference**. A function that takes an array and calls `array.push()` or returns a standard mutable array fails the purity test because callers can mutate it via `cart[0].price = 0`.
- To achieve true functional purity:
  1. We enforce immutability with `Object.freeze()`. Any in-place mutation attempts in strict mode throw a `TypeError`.
  2. Every operation is a **pure function**: it takes arguments, performs non-destructive operations (using `spread`, `slice`, and `reduce`), and returns a brand-new frozen array.
  3. **Referential Transparency:** Given the same cart snapshot, `calculateTotal(cart)` will always yield the exact same total with no hidden side effects or shared-memory leaks.

### The Two Biggest Differences

| Dimension | Object-Oriented (OOP) | Functional Programming (FP) |
| :--- | :--- | :--- |
| **Mutation vs. Creation** | Mutates existing memory in place (`splice`, `push`). | Never mutates in place; allocates and returns a new frozen snapshot (`[...cart, newItem]`). |
| **Shared State & Aliasing** | Variables pointing to the same instance share internal state (`cartB = cartA; cartB.addItem(...)` mutates `cartA`). | Values are immutable. Aliased variables refer to identical frozen snapshots without risk of accidental mutation. |

### Implementation (`functionalCart.js`)
```javascript
import { createItem } from './item.js';

export const DISCOUNT_THRESHOLD = 100.0;
export const DISCOUNT_RATE = 0.10;

export function createCart() {
  return Object.freeze([]);
}

export function addItem(cart, name, price) {
  const newItem = createItem(name, price);
  return Object.freeze([...cart, newItem]);
}

export function removeItem(cart, name) {
  const index = cart.findIndex(item => item.name === name);
  if (index === -1) return cart;
  return Object.freeze([...cart.slice(0, index), ...cart.slice(index + 1)]);
}

export function calculateTotal(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  if (subtotal > DISCOUNT_THRESHOLD) {
    return subtotal * (1.0 - DISCOUNT_RATE);
  }
  return subtotal;
}
```

---

## Activity 3: Test Both Against One Shared Suite

Using Node's native test runner (`node:test`) and strict assertions (`node:assert/strict`), a shared adapter executes the **exact same 5 test cases** against both backends.

### The 5 Shared Lab Test Cases
1. **Empty Cart:** Total is `$0.00` and item count is `0`.
2. **Single Item:** Item at `$45.50` produces `$45.50` (no discount).
3. **Discount Boundary at exactly $100.00:** Subtotal of `$100.00` produces `$100.00` (condition `> 100` is strictly false).
4. **Discount Boundary at $100.01:** Subtotal of `$100.01` triggers 10% discount: `100.01 * 0.90 = $90.009`.
5. **Remove Nonexistent Item:** Gracefully handles non-present items; cart state and total remain unaffected.

### Test Execution Output (`node --test test.js`)
```text
▶ Activity 3: Unified Shared Suite (5 Core Test Cases)
  ▶ Backend: OOP ShoppingCart
    ✔ Case 1: Empty cart has a total of 0.0 and 0 items (0.86ms)
    ✔ Case 2: Single item under $100 receives no discount (0.33ms)
    ✔ Case 3: Discount boundary at exactly $100.00 receives no discount (0.17ms)
    ✔ Case 4: Discount boundary at $100.01 triggers 10% discount (0.18ms)
    ✔ Case 5: Removing a nonexistent item does not crash and leaves cart unchanged (0.22ms)
  ✔ Backend: OOP ShoppingCart (2.82ms)
  ▶ Backend: Functional ShoppingCart
    ✔ Case 1: Empty cart has a total of 0.0 and 0 items (0.35ms)
    ✔ Case 2: Single item under $100 receives no discount (0.22ms)
    ✔ Case 3: Discount boundary at exactly $100.00 receives no discount (0.16ms)
    ✔ Case 4: Discount boundary at $100.01 triggers 10% discount (0.16ms)
    ✔ Case 5: Removing a nonexistent item does not crash and leaves cart unchanged (3.62ms)
  ✔ Backend: Functional ShoppingCart (4.95ms)
✔ Activity 3: Unified Shared Suite (5 Core Test Cases) (8.32ms)

▶ Paradigm-Specific Verification & Deep Dive
  ✔ Verifies true immutability in Functional Cart (Object.isFrozen) (0.78ms)
  ✔ Contrasts OOP shared-reference aliasing with Functional safety (0.18ms)
  ✔ Verifies combined discount calculation for multiple small items (0.18ms)
✔ Paradigm-Specific Verification & Deep Dive (2.08ms)

▶ Activity 4: State Extension Tests (Discount History)
  ✔ OOP state extension accumulates discount codes in-place across method calls (0.68ms)
  ✔ Functional state extension produces explicit immutable snapshots (0.18ms)
✔ Activity 4: State Extension Tests (Discount History) (0.94ms)

ℹ tests 15
ℹ suites 5
ℹ pass 15
ℹ fail 0
```

---

## Activity 4: State Extension Trade-Off (Discount-Code History)

To evaluate real-world extensibility, both models were extended with a feature requiring cart-wide state tracking across multiple calls: **a running promo discount-code history** (`SAVE5`, `VIP15`).

```mermaid
flowchart TD
    subgraph OOP["OOP Paradigm (In-Place Mutation)"]
        O1["cart = new ExtendedOOPCart()"] -->|cart.applyDiscountCode('SAVE5')| O2["Mutates internal state in-place<br>#discountHistory = ['SAVE5']"]
        O2 -->|cart.applyDiscountCode('VIP15')| O3["Mutates again in-place<br>#discountHistory = ['SAVE5', 'VIP15']"]
    end
    subgraph FP["Functional Paradigm (Explicit Snapshots)"]
        F1["s0 = createExtendedCart()"] -->|applyDiscountCodeExt(s0, 'SAVE5')| F2["s1 = new CartState(['SAVE5'])"]
        F2 -->|applyDiscountCodeExt(s1, 'VIP15')| F3["s2 = new CartState(['SAVE5', 'VIP15'])"]
        F1 -.->|Original snapshot intact| F1
    end
```

---

## Core Paradigm Evaluation: Simplicity, Reliability & Efficiency

```mermaid
quadrantChart
    title Paradigm Comparison across Core Attributes
    x-axis Low Efficiency --> High Efficiency
    y-axis Low Reliability --> High Reliability
    quadrant-1 High Efficiency & High Reliability
    quadrant-2 Low Efficiency & High Reliability
    quadrant-3 Low Efficiency & Low Reliability
    quadrant-4 High Efficiency & Low Reliability
    OOP (In-place Mutation): [0.82, 0.45]
    Functional (Pure Snapshots): [0.48, 0.92]
```

### 1. Simplicity

#### OOP Perspective
- **Syntactic Simplicity:** Very low ceremony for developers accustomed to imperative programming. Adding the promo code feature required adding one line to the constructor (`this.#discountHistory = []`) and one method (`applyDiscountCode`).
- **Mental Model:** Natural when modeling real-world physical analogies ("a cart is a physical container; when I apply a coupon, the cart remembers it").
- **Trade-off:** Simplicity breaks down as systems scale. Object state becomes a hidden web of variables whose interactions are hard to trace without step-debugging.

#### Functional Perspective
- **Cognitive Simplicity:** Every function is a self-contained "black box." A developer reading `calculateTotal(cart)` only needs to understand its arguments; no hidden variables or global flags exist.
- **Plumbing Overhead:** Higher syntactic ceremony. Adding state requires modeling an explicit state container (`CartState: { items, discountHistory }`) and propagating it through all transform functions.

---

### 2. Reliability

#### OOP Perspective
- **Temporal Coupling Risk:** Method call order matters critically. If a caller invokes `total()` before or after `applyDiscountCode()`, the result changes. In complex systems with asynchronous operations or event listeners, race conditions easily mutate object state unpredictably.
- **Aliasing Hazards:** Demonstrated in `test.js`:
  ```javascript
  const cartA = new ShoppingCart();
  const cartB = cartA; // Shared reference
  cartB.addItem('Headphones', 80.00);
  // cartA is silently mutated without direct interaction!
  ```

#### Functional Perspective
- **Pristine Determinism:** Pure functions with immutable inputs cannot be altered by outside actors. Tests do not require mock resets, setup, or teardown steps.
- **Zero Aliasing Bugs:** Because data structures are frozen (`Object.freeze`), separate variables can safely point to the same snapshot without any possibility of accidental side-effect mutations.
- **Auditability & Time Travel:** Previous snapshots (`s0`, `s1`, `s2`) remain in memory, enabling trivial undo/redo, audit logging, and replay capabilities.

---

### 3. Efficiency

#### OOP Perspective
- **High Memory & CPU Efficiency:** In-place operations (`push`, `splice`) modify the underlying array buffer directly without allocating new objects or arrays.
- **Minimal Garbage Collection:** The object instance remains in memory, avoiding continuous allocation and reclamation cycles. Ideal for high-throughput, latency-critical applications.

#### Functional Perspective
- **Allocation Overhead:** Each `addItem` and `removeItem` allocates a new array via the spread operator (`[...cart, item]`) and wraps it in `Object.freeze()`.
- **GC Pressure at Scale:** While negligible for typical web carts (e.g., 20–50 items), processing thousands of updates per second in large collections creates significant garbage collector churn unless using specialized persistent data structures (such as HAMTs / Immutable.js).

---

### Comprehensive Attribute Comparison Matrix

| Evaluation Attribute | Object-Oriented Programming (OOP) | Functional Programming (FP) | Practical Verdict |
| :--- | :--- | :--- | :--- |
| **Simplicity** | **High in small scopes:** Less boilerplate, direct method invocation, intuitive state accumulation. | **High in isolation:** Pristine local reasoning, but requires explicit state container plumbing across calls. | **OOP** wins for rapid state accumulation; **FP** wins for local component reasoning. |
| **Reliability** | **Moderate:** Prone to temporal coupling, hidden state mutation, and aliasing bugs across references. | **Very High:** Complete immunity to side-effects, deterministic testability, zero shared-memory bugs. | **FP** wins decisively; elimination of mutable state eradicates an entire class of production bugs. |
| **Efficiency** | **Very High:** In-place array mutations, minimal allocations, zero GC pressure on updates. | **Moderate:** Reallocates arrays and objects on every modification; relies on garbage collector. | **OOP** wins on raw execution speed and memory footprint in unoptimized JS engines. |

---

## Architectural Conclusion: Which Paradigm Suits Which Problem?

1. **Choose OOP when:**
   - Building **stateful entity lifecycles** with frequent in-place updates (e.g., GUI UI widgets, game physics engines, active socket connections).
   - High-throughput environments where allocation churn and garbage collection pauses cannot be tolerated.

2. **Choose Functional Programming when:**
   - Building **data transformation pipelines, financial transaction engines, payment gateways, and business rule calculators**.
   - Systems requiring multi-step auditing, concurrent event streams, or strict compliance where state corruption must be mathematically impossible.

---

## How to Run

### 1. Run Automated Unit Tests (Native `node:test`)
```bash
cd /home/abdullah/Desktop/Uni/SDC/LAB-6
npm test
# or: node --test test.js
```

### 2. Run Interactive Console Demonstration
```bash
npm start
# or: node index.js
```
