import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Table,
  Form,
  Button,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";

const FIREBASE_ORDERS_URL =
  "https://adapthomeadmin-default-rtdb.asia-southeast1.firebasedatabase.app/orders";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${FIREBASE_ORDERS_URL}.json`);
      const data = res.data || {};
      const loaded = Object.entries(data).map(([id, order]) => ({
        id,
        ...order,
      }));
      setOrders(loaded);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    setUpdatingId(orderId);
    try {
      await axios.patch(`${FIREBASE_ORDERS_URL}/${orderId}.json`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container className="my-5 text-white">
      <h3 className="mb-4">Order Management</h3>

      {loading ? (
        <Spinner animation="border" />
      ) : orders.length === 0 ? (
        <Alert variant="info">No orders found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
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
                <td>{order.id}</td>
                <td>
                  <strong
                    className={`text-${
                      order.status === "cancelled" ? "danger" : "body"
                    }`}
                  >
                    {order.status}
                  </strong>
                </td>
                <td>{order.paymentMethod}</td>
                <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                <td>{new Date(order.orderDate).toLocaleString()}</td>
                <td>
                  {order.items && order.items.length > 0 ? (
                    <ul className="list-unstyled">
                      {order.items.map((item, index) => (
                        <li
                          key={index}
                          className="mb-2 d-flex align-items-center gap-2"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={40}
                            height={40}
                            rounded
                          />
                          <div>
                            <div>{item.title}</div>
                            <small>Qty: {item.quantity}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No items"
                  )}
                </td>
                <td>
                  {["cancelled", "delivered"].includes(order.status) ? (
                    <span className="text-muted">Not Available</span>
                  ) : (
                    <>
                      <Form.Select
                        value={statusUpdates[order.id] || order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        size="sm"
                      >
                        <option value="placed">Placed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => updateStatus(order.id)}
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Change Status"}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderPage;
