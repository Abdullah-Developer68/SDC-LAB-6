/**
 * Domain item representation.
 * In functional programming, immutability is guaranteed by Object.freeze().
 *
 * @param {string} name - Name of the item
 * @param {number} price - Unit price (must be non-negative)
 * @returns {Readonly<{ name: string, price: number }>}
 */
export function createItem(name, price) {
  const numPrice = Number(price);
  if (Number.isNaN(numPrice) || numPrice < 0) {
    throw new TypeError(`Invalid price: ${price}. Must be a non-negative number.`);
  }
  return Object.freeze({
    name: String(name),
    price: numPrice
  });
}
