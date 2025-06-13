import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useDispatch, } from "react-redux";
import { Link } from "react-router-dom";
import { authActions } from "../../store/authSlice";
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const dispatch=useDispatch()

  const navigate=useNavigate()

  const logoutHandler=()=>{
navigate('/')
dispatch(authActions.logout())
  }


  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand>
          AdaptHome Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <>
              <Nav.Link as={Link} to="/product">
                Product
              </Nav.Link>
              <Nav.Link as={Link} to="/category">
                Category
              </Nav.Link>
              <Nav.Link as={Link} to="/orders">
                Orders
              </Nav.Link>
            </>
          </Nav>
          
          <Button onClick={logoutHandler}
            variant="outline-danger"
          >
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
