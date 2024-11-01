import axios from "axios";

import { useState } from "react";
import Form from "react-bootstrap/Form";

export default function Autocomplete({
  sendDataToParent,
  defValue,
  searchType,
  label,
}) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (event) => {
    const value = event.target.value;

    setInputValue(value);

    if (value.length > 0) {
      axios.get(`/${searchType}?search=${value}`).then((res) => {
        const data = res.data;
        setSuggestions(data);
      });
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (value) => {
    setInputValue(value.name);
    sendDataToParent(value);
    setSuggestions([]);
  };

  return (
    <div className="autocomplete-wrapper">
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="text"
          name={inputValue}
          defaultValue={defValue}
          required
          onChange={handleInputChange}
        />
      </Form.Group>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
