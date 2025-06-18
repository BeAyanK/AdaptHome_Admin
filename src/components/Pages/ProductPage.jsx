import { useState, useEffect } from "react";
import { ref, get, push, update, remove } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useSelector } from 'react-redux';
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
  Alert,
  Image,
  Spinner,
} from "react-bootstrap";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth state from Redux store
  const { isLoggedIn, isAdmin } = useSelector((state) => state.auth);

  // Fetch products from Firebase
  const fetchProducts = async () => {
    if (!isLoggedIn || !isAdmin) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const productsRef = ref(database, 'products');
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedProducts = Object.entries(data).map(([id, product]) => ({
          id,
          ...product,
        }));
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to fetch products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    if (!isLoggedIn || !isAdmin) return;
    
    try {
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
      console.error('Failed to fetch categories:', error);
      setError("Failed to fetch categories. Please check your connection and try again.");
    }
  };

  // Fetch products and categories on component mount or auth change
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isLoggedIn, isAdmin]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn || !isAdmin) {
      setError("You must be logged in as admin to perform this action.");
      return;
    }

    try {
      setError(null);
      
      if (editingId) {
        // Update existing product
        const productRef = ref(database, `products/${editingId}`);
        await update(productRef, form);
      } else {
        // Add new product
        const productsRef = ref(database, 'products');
        await push(productsRef, form);
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
      setError("Failed to save product. Please try again.");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    if (!isLoggedIn || !isAdmin) {
      setError("You must be logged in as admin to perform this action.");
      return;
    }
    
    try {
      setError(null);
      const productRef = ref(database, `products/${id}`);
      await remove(productRef);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setError("Failed to delete product. Please try again.");
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

  // Cancel edit
  const handleCancelEdit = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
    });
    setEditingId(null);
  };

  // Show auth error if not logged in
  if (!isLoggedIn || !isAdmin) {
    return (
      <Container className="my-5 text-white text-center">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>You must be logged in as an admin to access product management.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4 pt-4 text-white">
      <h2 className="my-4 pt-4">Product Management</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit} className="mb-5">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Product Title</Form.Label>
              <Form.Control
                name="title"
                placeholder="Enter product title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                placeholder="Enter product description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                name="price"
                type="number"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                name="imageUrl"
                placeholder="Enter image URL"
                value={form.imageUrl}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
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
            </Form.Group>
          </Col>
          
          <Col xs={12}>
            <div className="d-flex my-4 ">
              <Button type="submit" variant="outline-light" size="lg">
                {editingId ? "Update Product" : "Add Product"}
              </Button>
              
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline-light" 
                  size="lg"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Form>

      <hr className="mb-5" />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No products found</h5>
          <p>Add your first product using the form above.</p>
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table  hover striped>
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Image</th>
                <th>Category</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className={editingId === prod.id ? "table-warning" : ""}>
                  <td>
                    <strong>{prod.title}</strong>
                  </td>
                  <td>
                    <div style={{ maxWidth: "200px" }}>
                      {prod.description.length > 50 
                        ? `${prod.description.substring(0, 50)}...` 
                        : prod.description
                      }
                    </div>
                  </td>
                  <td>
                    <strong>₹{Number(prod.price).toFixed(2)}</strong>
                  </td>
                  <td>
                    <Image
                      src={prod.imageUrl}
                      alt={prod.title}
                      width={60}
                      height={60}
                      rounded
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                      }}
                    />
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {prod.category || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-column">
                      <Button
                        size="sm"
                        variant={editingId === prod.id ? "warning" : "success"}
                        onClick={() => handleEdit(prod)}
                        disabled={editingId === prod.id}
                      >
                        {editingId === prod.id ? "Editing..." : "Edit"}
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
