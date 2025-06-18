import React, { useEffect, useState } from "react";
import { ref, get, push, update, remove } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useSelector } from 'react-redux';
import { Col, Container, Form, Row, Button, Table, Alert, Spinner } from "react-bootstrap";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", imageUrl: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth state from Redux store
  const { isLoggedIn, isAdmin } = useSelector((state) => state.auth);

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    if (!isLoggedIn || !isAdmin) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedCategories = Object.entries(data).map(([id, category]) => ({
          id,
          ...category,
        }));
        setCategories(loadedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchCategories();
    }
  }, [isLoggedIn, isAdmin]);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !isAdmin) {
      setError("You must be logged in as admin to perform this action.");
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing category
        const categoryRef = ref(database, `categories/${editingId}`);
        await update(categoryRef, form);
      } else {
        // Add new category
        const categoriesRef = ref(database, 'categories');
        await push(categoriesRef, form);
      }
      
      setForm({ title: "", imageUrl: "" });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setError("Failed to save category. Please try again.");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    if (!isLoggedIn || !isAdmin) {
      setError("You must be logged in as admin to perform this action.");
      return;
    }

    try {
      setError(null);
      const categoryRef = ref(database, `categories/${id}`);
      await remove(categoryRef);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category. Please try again.");
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setForm({ title: category.title, imageUrl: category.imageUrl });
    setEditingId(category.id);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setForm({ title: "", imageUrl: "" });
    setEditingId(null);
  };

  // Show auth error if not logged in
  if (!isLoggedIn || !isAdmin) {
    return (
      <Container className="mt-10 text-white text-center">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>You must be logged in as an admin to access category management.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 pt-4 text-white">
      <h2 className="my-4 pt-4">Category Management</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group controlId="categoryTitle">
              <Form.Label>Category Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter category title"
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
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Enter image URL"
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <div className="d-flex gap-2">
              <Button type="submit" variant="outline-light" className="flex-grow-1">
                {editingId ? "Update" : "Add"} Category
              </Button>
              
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline-light"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Form>

      <hr className="my-5" />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No categories found</h5>
          <p>Add your first category using the form above.</p>
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Image</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className={editingId === cat.id ? "table-warning" : ""}>
                  <td>
                    <strong>{cat.title}</strong>
                  </td>
                  <td>
                    <img
                      src={cat.imageUrl?.trim() || "https://via.placeholder.com/60x60?text=No+Image"}
                      alt={cat.title}
                      style={{ 
                        width: "60px", 
                        height: "60px", 
                        objectFit: "cover",
                        borderRadius: "4px"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                      }}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-column">
                      <Button
                        variant={editingId === cat.id ? "warning" : "success"}
                        size="sm"
                        onClick={() => handleEdit(cat)}
                        disabled={editingId === cat.id}
                      >
                        {editingId === cat.id ? "Editing..." : "Edit"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
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

export default CategoryPage;
