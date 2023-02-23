import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
//import Button from "react-bootstrap/Button";
import Home from "./Home";
import Proposals from "./Proposals";
import ProposalsList from "./ProposalsList";



export default function App() {


  return (
  <>
  <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
  integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi"
  crossOrigin="anonymous"
/>

    

  <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#">puredemocracy.io</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
        <Nav.Link as={NavLink} to="/">
          Home
        </Nav.Link>
          <Nav.Link as={NavLink} to="/proposals">
          Proposals
        </Nav.Link>
        <Nav.Link as={NavLink} to="/proposals_list">
          Proposals list
        </Nav.Link>

            {/* <NavDropdown title="Link" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action4">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">
                Something else here
              </NavDropdown.Item>
            </NavDropdown> */}

          </Nav>
          
          <Form className="d-flex">
          
          
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Container fluid>
    <Routes>
    <Route path ="/" element={<Home />} />
    <Route path ="proposals" element={<Proposals />} />
    <Route path ="proposals_list" element={<ProposalsList />} />
    </Routes>
  
   </Container>
</>
  );
}