import React, { useState } from "react";
import Form from 'react-bootstrap/Form';

export default ({ data = [], action = () => {}, current, next }) => {

  return (
    <>
      <Form.Select onChange={action({ current, next })}>
        <option value="0">Select Value</option>
        {data.map(({ id = 0, name = 0, communeId = 0 }) => (
          <option key={id} value={id} data-tag={ communeId }>
            {name}
          </option>
        ))}
      </Form.Select>
    </>
  );
};
