import React, { useEffect, useState } from "react";
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useSelector } from 'react-redux';
import {
  Container,
  Table,
  Form,
  Button,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  // Get auth state from Redux store
  const { isLoggedIn, isAdmin } = useSelector((state) => state.auth);

  const fetchOrders = async () => {
    if (!isLoggedIn || !isAdmin) return;
    
    setLoading(true);
    try {
      setError(null);
      
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded = Object.entries(data).map(([id, order]) => ({
          id,
          ...order,
        }));
        // Sort orders by date (newest first)
        loaded.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(loaded);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchOrders();
    }
  }, [isLoggedIn, isAdmin]);

  const handleStatusChange = (orderId, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    if (!isLoggedIn || !isAdmin) {
      setError("You must be logged in as admin to perform this action.");
      return;
    }

    setUpdatingId(orderId);
    try {
      setError(null);
      
      const orderRef = ref(database, `orders/${orderId}`);
      await update(orderRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      
      fetchOrders();
      
      // Clear the status update for this order
      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Show auth error if not logged in
  if (!isLoggedIn || !isAdmin) {
    return (
      <Container className="my-5 pt-5 text-white text-center">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>You must be logged in as an admin to access order management.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-4 text-white">
      <div className="d-flex justify-content-between align-items-center pt-4 mb-4">
        <h2>Order Management</h2>
        
        <Button variant="outline-light" onClick={fetchOrders} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Refresh"}
        </Button>
      </div>

      <hr className="my-5" />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No orders found</h5>
          <p>Orders will appear here when customers place them.</p>
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
                <th>Items</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <small className="font-monospace">{order.id}</small>
                  </td>
                  <td>
                    <span className={`badge bg-${getStatusBadgeVariant(order.status)}`}>
                      {order.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{order.paymentMethod || 'N/A'}</td>
                  <td>
                    <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <div>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <small className="text-muted">
                      {order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : ''}
                    </small>
                  </td>
                  <td>
                    {order.items && order.items.length > 0 ? (
                      <div style={{ maxWidth: "300px" }}>
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="mb-2 d-flex align-items-center gap-2 p-2 bg-dark rounded"
                          >
                            <Image
                              src={item.imageUrl || "https://via.placeholder.com/40x40?text=No+Image"}
                              alt={item.title || "Product"}
                              width={40}
                              height={40}
                              rounded
                              style={{ objectFit: "cover" }}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/40x40?text=No+Image";
                              }}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-bold">{item.title || "Unknown Product"}</div>
                              <small className="text-muted">
                                Qty: {item.quantity || 1} | ₹{Number(item.price || 0).toFixed(2)}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No items</span>
                    )}
                  </td>
                  <td>
                    {["cancelled", "delivered"].includes(order.status?.toLowerCase()) ? (
                      <span className="text-muted">
                        <small>Status cannot be changed</small>
                      </span>
                    ) : (
                      <div style={{ minWidth: "200px" }}>
                        <Form.Select
                          value={statusUpdates[order.id] || order.status
                            || "Select Status"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="placed">Placed</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                        <Button
                          variant="light"
                          className="mt-2 w-100"
                          onClick={() => updateStatus(order.id)}
                          disabled={!statusUpdates[order.id] || updatingId === order.id}
                        >
                          {updatingId === order.id ? (
                            <Spinner size="sm" animation="border" />
                          ) : (
                            "Update Status"
                          )}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default OrderPage;
