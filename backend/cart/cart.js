let cart = [];

function getCart() {
  return cart;
}

function addToCart(product, quantity = 1) {
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity
    });
  }

  return cart;
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);

  return cart;
}

function clearCart() {
  cart = [];

  return cart;
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};