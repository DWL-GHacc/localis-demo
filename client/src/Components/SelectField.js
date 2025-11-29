import { Col, Form } from "react-bootstrap";

export default function SelectField({
  text,
  options,
  size,
  Component = Form.Select,
  value,
  onChange,
  palceholder,
  firstOption,
}) {
  let id = `select${text}`;
  return (
    <Col md={size}>
      <Form.Label htmlFor={id} column="sm-2">
        {text}
      </Form.Label>
      <Component
        id={id}
        value={value}
        palceholder={palceholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="">{firstOption}</option>

        {options &&
          options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
      </Component>
    </Col>
  );
}
