import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
  Alert,
  Image,
} from "react-bootstrap";

const PRODUCTS_URL =
  "https://adapthomeadmin-default-rtdb.asia-southeast1.firebasedatabase.app/products";
const CATEGORIES_URL =
  "https://adapthomeadmin-default-rtdb.asia-southeast1.firebasedatabase.app/categories";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch products from Firebase
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${PRODUCTS_URL}.json`);
      const data = res.data || {};
      const loadedProducts = Object.entries(data).map(([id, product]) => ({
        id,
        ...product,
      }));
      setProducts(loadedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${CATEGORIES_URL}.json`);
      const data = res.data || {};
      const loadedCategories = Object.entries(data).map(([id, cat]) => ({
        id,
        title: cat.title,
      }));
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${PRODUCTS_URL}/${editingId}.json`, form);
      } else {
        await axios.post(`${PRODUCTS_URL}.json`, form);
      }
      setForm({
        title: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "",
      });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${PRODUCTS_URL}/${id}.json`);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category || "",
    });
    setEditingId(product.id);
  };

  return (
    <Container className="my-5 text-white">
      <h2 className="mb-2">Product Management</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Control
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={6}>
            <Form.Control
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={6}>
            <Form.Control
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Col>
          <Col md={6}>
            <Form.Control
              name="imageUrl"
              placeholder="Image Url"
              value={form.imageUrl}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={6}>
            <Form.Select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} className="d-grid gap-2 mt-5">
            <Button type="submit" variant="light" size="lg">
              {editingId ? "Update Product" : "Add Product"}
            </Button>
          </Col>
        </Row>
      </Form>
      <hr className="my-5" />

      {products.length === 0 ? (
        <Alert variant="info" className="text-center">
          No products found.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table bordered hover striped>
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Image</th>
                <th>Categories</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td>{prod.title}</td>
                  <td>{prod.description}</td>
                  <td>₹{Number(prod.price).toFixed(2)}</td>
                  <td>
                    <Image
                      src={prod.imageUrl}
                      alt={prod.title}
                      width={50}
                      height={50}
                      rounded
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{prod.category || "N/A"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleEdit(prod)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(prod.id)}
                      >
                        Delete
                      </Button>
                    </div>
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

export default ProductPage;
