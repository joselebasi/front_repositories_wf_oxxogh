import React, { useState } from 'react';

const TechnicalLeaderForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    middle_name: '',
    last_name: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Middle Name:</label>
        <input
          type="text"
          name="middle_name"
          value={form.middle_name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default TechnicalLeaderForm;
