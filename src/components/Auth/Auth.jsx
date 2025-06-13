import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../../store/authSlice';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const API_Key = 'AIzaSyDVvJYqgz-adO06OWVJcGPCeEdwSMYz1is';
const SignIn_Url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
const adminEmails = ['ayan@g.com', 'aman@gmail.com'];

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //const isLogin = useSelector((state) => state.auth.isLogin);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const error = useSelector((state) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [confirmPassword, setConfirmPassword] = useState('');

  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  //const confirmPasswordInputRef = useRef();

  // const switchAuthModeHandler = () => {
  //   dispatch(authActions.toggleMode());
  // };

  const submitHandler = async (event) => {
    event.preventDefault();

    const enteredEmail = email.trim();
    const enteredPassword = password.trim();

    // if (!isLogin) {
    //   const confirmPasswordValue = confirmPassword.trim();
    //   if (enteredPassword !== confirmPasswordValue) {
    //     dispatch(authActions.setError('Passwords do not match!'));
    //     return;
    //   }
    //   if (enteredPassword.length < 6) {
    //     dispatch(authActions.setError('Password must be at least 6 characters.'));
    //     return;
    //   }
    // }

    dispatch(authActions.setLoading(true));
    dispatch(authActions.setError(null));

    // const url = isLogin
    //   ? `${SignIn_Url}${API_Key}`
    //   : `${SignUp_Url}${API_Key}`;

    try {
      const response = await axios.post(`${SignIn_Url}${API_Key}`, {
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      });

      const data = response.data;

        if (!adminEmails.includes(data.email)) {
        dispatch(authActions.setError('Access denied. Admins only.'));
        dispatch(authActions.setLoading(false));
        return;
      }

      dispatch(authActions.login({
        token: data.idToken,
        email: data.email,
      }));

      navigate('/home', { replace: true });


    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Authentication failed!';
      dispatch(authActions.setError(errorMessage));
    } finally {
      dispatch(authActions.setLoading(false));
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(authActions.setError(null));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <> <h1 className="text-center mt-4 mb-4">AdaptHome Admin</h1>
    <Container className="mt-5">
      
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="mb-4 text-center">Admin Login</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Your Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                ref={emailInputRef}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Your Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                ref={passwordInputRef}
              />
            </Form.Group>
            {/* {!isLogin && (
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  ref={confirmPasswordInputRef}
                />
              </Form.Group>
            )} */}
            {error && <p className="text-danger">{error}</p>}
            <div className="d-grid gap-2">
              {!isLoading ? (
                <Button variant="primary" type="submit">
                  Login
                </Button>
              ) : (
                <p>Sending request...</p>
              )}
            </div>
          </Form>
          {/* <div className="text-center mt-3">
            <Button variant="link" onClick={switchAuthModeHandler}>
              {isLogin ? 'Create new account' : 'Login with existing account'}
            </Button>
          </div> */}
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default Auth;
