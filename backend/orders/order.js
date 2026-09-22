let orders = [];
let nextOrderId = 1;

function createOrder(items) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = {
    id: nextOrderId++,
    items,
    total: Number(total.toFixed(2)),
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  return order;
}

function getOrders() {
  return orders;
}

function getOrderById(id) {
  return orders.find(order => order.id === id);
}

function updateOrderStatus(id, status) {
  const order = orders.find(order => order.id === id);

  if (!order) {
    return null;
  }

  order.status = status;

  return order;
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};