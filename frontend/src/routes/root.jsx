import axios from "axios";

import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { Link, Route, Routes } from 'react-router-dom';
import Company from "./company";

import "bootstrap/dist/css/bootstrap.min.css";

import "../App.css";

axios.defaults.baseURL = "http://localhost:8000";

function Root() {
  const [companies, setCompanies] = useState([]);

  const searchInputRef = useRef();

  const handleSearch = (e, query) => {
    e.preventDefault();
    let url;
    if (!query) {
      url = "/companies/";
    } else {
      url = `/companies/search/?q=${query}`;
    }

    axios.get(url).then((res) => {
      const data = res.data;
      setCompanies(data);
    });
  };

  useEffect(() => {
    axios.get("/companies/").then((res) => {
      const data = res.data;
      setCompanies(data);
    });
  }, []);

  return (
    <>
      <Navbar expand="lg" className="bg-light">
        <Container>
          <Navbar.Brand href="/">Osaühingute register</Navbar.Brand>
        </Container>
      </Navbar>
      <Container fluid="md" className="mt-5 content">
        <Routes>
          <Route
            path="*"
            element={
              <>
                <Form className="d-flex">
                  <Form.Control
                    ref={searchInputRef}
                    type="search"
                    placeholder="Otsing"
                    className="me-2"
                    aria-label="Search"
                  />
                  <Button
                    type="submit"
                    variant="outline-success"
                    onClick={(e) =>
                      handleSearch(e, searchInputRef.current.value)
                    }
                  >
                    Otsi
                  </Button>
                </Form>
                <Row className="mt-3 mb-3">
                  <Col>
                    <Link to={`companies/add`}>
                      <Button variant="primary">Loo uus osaühing</Button>
                    </Link>
                  </Col>
                </Row>
                {companies && (
                  <Row>
                    <Col>
                      <Table striped bordered>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Nimi</th>
                            <th>Registrikood</th>
                            <th>Detailid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {companies.map((company) => (
                            <tr key={company.id || company.pk}>
                              <td>{company.id ? company.id : company.pk}</td>
                              <td>{company.name}</td>
                              <td>{company.code}</td>
                              <td>
                                <Link to={`companies/${company.id | company.pk}`}>
                                  <Button variant="outline-success">Vaata</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                )}
              </>
            }
          />
          <Route path="companies/:companyId" element={<Company />} />
        </Routes>
      </Container>
    </>
  );
}

export default Root;
