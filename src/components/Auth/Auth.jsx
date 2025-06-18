import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authActions, loginUser, createAdminUser } from '../../store/authSlice';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector((state) => state.auth.isLoading);
  const error = useSelector((state) => state.auth.error);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/product', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const submitHandler = async (event) => {
    event.preventDefault();

    const enteredEmail = email.trim();
    const enteredPassword = password.trim();

    if (!enteredEmail || !enteredPassword) {
      dispatch(authActions.setError('Please fill in all fields.'));
      return;
    }

    try {
      if (isCreatingAdmin) {
        // Create admin user (one-time setup)
        await dispatch(createAdminUser({ 
          email: enteredEmail, 
          password: enteredPassword 
        })).unwrap();
      } else {
        // Login existing admin
        await dispatch(loginUser({ 
          email: enteredEmail, 
          password: enteredPassword 
        })).unwrap();
      }
      
      navigate('/product', { replace: true });
    } catch (err) {
      // Error is already handled in the slice
      console.error('Auth error:', err);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(authActions.clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div>
      <h1 className="text-center mt-5 mb-5 pt-5 text-white">Tech-Infinite Admin</h1>
      <Container className="my-5">
        <Row className="justify-content-center my-4 py-4">
          <Col md={6}>
            <Form onSubmit={submitHandler}>
              <Form.Group className="my-3" controlId="email">
                <Form.Label className='text-white'>Admin Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group className="my-3" controlId="password">
                <Form.Label className='text-white'>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="my-3">
                  {error}
                </Alert>
              )}

              <div className="d-grid gap-2 pt-4">
                {!isLoading ? (
                  <>
                    <Button variant="light" type="submit">
                      {isCreatingAdmin ? 'Create Admin Account' : 'Login'}
                    </Button>
                    
                    <Button 
                      variant="outline-light" 
                      type="button"
                      onClick={() => setIsCreatingAdmin(!isCreatingAdmin)}
                      className="mt-2"
                    >
                      {isCreatingAdmin ? 'Switch to Login' : 'Create Admin Account'}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-white mt-2">
                      {isCreatingAdmin ? 'Creating admin account...' : 'Logging in...'}
                    </p>
                  </div>
                )}
              </div>
            </Form>

            <div className="mt-4 text-center">
              <small className="text-light">
                Only admin@techinf.com is allowed to access this system.
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;
