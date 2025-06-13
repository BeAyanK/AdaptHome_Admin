import React, { useEffect, useState } from "react";
import axios from "axios";

import { Col, Container, Form, Row, Button, Table } from "react-bootstrap";

const BASE_URL =
  "https://adapthomeadmin-default-rtdb.asia-southeast1.firebasedatabase.app/categories";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", imageUrl: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}.json`);
      const data = res.data || {};
      const loadedCategories = Object.entries(data).map(([id, category]) => ({
        id,
        ...category,
      }));
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/${editingId}.json`, form);
      } else {
        await axios.post(`${BASE_URL}.json`, form);
      }
      setForm({ title: "", imageUrl: "" });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}.json`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setForm({ title: category.title, imageUrl: category.imageUrl });
    setEditingId(category.id);
  };

  return (
    <Container className="mt-4 text-white">
      <h3 className="mb-3">Category Management</h3>

      <Form onSubmit={handleSubmit}>
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Group controlId="categoryTitle">
              <Form.Label>Category Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={5}>
            <Form.Group controlId="categoryImage">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Enter image URL"
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Button type="submit" variant="light" className="w-100">
              {editingId ? "Update" : "Add"} Category
            </Button>
          </Col>
        </Row>
      </Form>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Title</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.title}</td>
              <td>
                <img
                  src={cat.imageUrl?.trim() || "https://via.placeholder.com/50"}
                  alt={cat.title}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              </td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleEdit(cat)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CategoryPage;
