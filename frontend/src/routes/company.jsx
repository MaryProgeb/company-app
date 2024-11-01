import axios from 'axios';

import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { useNavigate, useParams } from "react-router-dom";
import Autocomplete from "../autocomplete";

export default function Company() {
  let { companyId }  = useParams();
  const navigate = useNavigate();

  const [errors, setErrors] = useState(null)

  const [company, setCompany] = useState({
    name: undefined,
    code: undefined,
    date_established: undefined,
    capital: undefined,
  });

  const [shareholders, setShareholders] = useState([
    { type: "PERSON", person: null, company: null, target_company_share: 0 },
  ]);

  const [savedCompany, setSavedCompany] = useState(false);

  useEffect(() => {
    if (savedCompany) {
      axios.get(`/companies/${companyId}/`).then((res) => {
        const data = res.data;
        setCompany({
          name: data.name,
          code: data.code,
          date_established: data.date_established,
          capital: data.capital,
        });
        setShareholders(data.shareholders);
      });
    }
  }, [savedCompany]);

  useEffect(() => {
    if (!isNaN(Number.parseInt(companyId))) {
      setSavedCompany(true);
    }
  }, [companyId]);

  const handleCompanyInput = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setCompany({ ...company, [name]: value });
  };

  const handleShareholdersInput = (event, index) => {
    event.preventDefault();
    const { name, value } = event.target;

    const shareholdersCopy = [...shareholders]
    if (name == "type") {
      shareholdersCopy[index]["id"] = null
      shareholdersCopy[index]["name"] = null
    }
    shareholdersCopy[index][name] = value
    setShareholders([...shareholdersCopy])
  };

  const handleAddShareholder = () => {
    setShareholders([
      ...shareholders,
      {
        type: "PERSON",
        person: null,
        company: null,
        target_company_share: 0,
      },
    ]);
  };

  const handleRemoveShareholder = (index) => {
    const shareholdersCopy = [...shareholders]
    shareholdersCopy.splice(index, 1)
    setShareholders(shareholdersCopy)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let shareholdersCopy = [...shareholders];
    shareholdersCopy = shareholdersCopy.map((x) => {
      if (x["type"] == "PERSON") {
        return { ...x, person: x.id };
      } else {
        return { ...x, company: x.id };
      }
    });

    const payload = {
      ...company,
      shareholders: [...shareholdersCopy],
    };

    axios
      .post("/companies/", payload)
      .then((res) => {
        const company_id = res.data["id"];
        navigate(`/companies/${company_id}`);
      })
      .catch((error) => {
        setErrors(error.response.data);
      });
  };

  const handleAutocomplete = (data, index) => {
    const shareholdersCopy = [...shareholders]
    shareholdersCopy[index]["id"] = data.id
    shareholdersCopy[index]["name"] = data.name
    setShareholders([...shareholdersCopy])
  };

  return (
    <Container>
      {savedCompany ? (
        <>
          <Row>
            <Col>
              <h1>Osaühingu andmed</h1>
              <div>Nimi: {company.name}</div>
              <div>Registrikood: {company.code}</div>
              <div>Kapital: {company.capital}</div>
              <div>Asutamiskuupäev: {company.date_established}</div>
            </Col>
          </Row>
          <Row>
            <Col>
              <h2 className="mt-3">Osanikud</h2>
              {shareholders.map((shareholder, index) => (
                <div key={index}>
                  {shareholder.type == "PERSON" ? (
                    <>
                      <div>
                        {shareholder.person__name} ({shareholder.person__code})
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {shareholder.company__name} ({shareholder.company__code}
                        )
                      </div>
                    </>
                  )}
                  <div>Kapital: {shareholder.target_company_share}</div>
                  <div className="mb-3">
                    Asutaja? {shareholder.is_founder ? "Jah" : "Ei"}
                  </div>
                </div>
              ))}
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col>
            <h1>Osaühingu andmed</h1>
            <Form onSubmit={(e) => handleSubmit(e)}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>OÜ nimi</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  required
                  onChange={handleCompanyInput}
                />
                <div className="text-danger">{errors?.name}</div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="code">
                <Form.Label>Registrikood</Form.Label>
                <Form.Control
                  type="number"
                  name="code"
                  required
                  onChange={handleCompanyInput}
                />
                <div className="text-danger">{errors?.code}</div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="date_established">
                <Form.Label>Avamiskuupäev</Form.Label>
                <Form.Control
                  type="date"
                  name="date_established"
                  required
                  onChange={handleCompanyInput}
                />
                <div className="text-danger">{errors?.date_established}</div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="kapital">
                <Form.Label>Kapital</Form.Label>
                <Form.Control
                  type="number"
                  name="capital"
                  required
                  min="2500"
                  onChange={handleCompanyInput}
                />
                <div className="text-danger">{errors?.capital}</div>
              </Form.Group>

              {shareholders.map((shareholder, index) => (
                <div key={shareholder.name + index}>
                  <Row>
                    <h2>Osanik {index + 1}</h2>
                    <Col>
                      <Form.Group className="mb-3" controlId="shareholder_type">
                        <Form.Label>Tüüp</Form.Label>
                        <Form.Select
                          aria-label="Default select example"
                          name="type"
                          value={shareholder.type}
                          required
                          onChange={(e) => handleShareholdersInput(e, index)}
                        >
                          <option value="PERSON">Eraisik</option>
                          <option value="COMPANY">Ettevõte</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Autocomplete
                        sendDataToParent={(data) =>
                          handleAutocomplete(data, index)
                        }
                        searchType={
                          shareholder.type == "PERSON" ? "people" : "companies"
                        }
                        defValue={shareholder.name}
                        label="Otsi ja vali ripploendist"
                      />
                      {shareholder.type == "PERSON" ? (
                        <p>Näiteks Bill Gates, Elon Musk või isikukood</p>
                      ) : (
                        <p>Näiteks Swedbank, LHV või registrikood</p>
                      )}
                    </Col>
                    <Col>
                      <Form.Group
                        className="mb-3"
                        controlId="shareholder_capital"
                      >
                        <Form.Label>Osaniku osakapital</Form.Label>
                        <Form.Control
                          type="number"
                          name="target_company_share"
                          value={shareholder.target_company_share}
                          required
                          min="1"
                          onChange={(e) => handleShareholdersInput(e, index)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {shareholders.length > 1 && (
                    <Row>
                      <Col>
                        <Button
                          variant="outline-danger"
                          className="mb-3"
                          onClick={() => handleRemoveShareholder(index)}
                        >
                          Kustuta osanik {index + 1}
                        </Button>
                      </Col>
                    </Row>
                  )}
                </div>
              ))}

              <Row>
                <Col>
                  <Button
                    variant="outline-primary"
                    className="mb-3"
                    disabled={shareholders.some(
                      (x) => !x.name || !x.target_company_share
                    )}
                    onClick={handleAddShareholder}
                  >
                    Lisa osanik
                  </Button>
                </Col>
              </Row>
              {errors?.non_field_errors && (
                <>
                  {errors?.non_field_errors.map((error, index) => (
                    <Row className="mt-3 mb-3 text-danger" key={index}>
                      {error}
                    </Row>
                  ))}
                </>
              )}
              <Row>
                <Col>
                  <Button variant="primary" type="submit">
                    Salvesta
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      )}
    </Container>
  );
}
