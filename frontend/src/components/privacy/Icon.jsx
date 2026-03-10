import React from 'react';

export const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none ${className}`}>
    {name}
  </span>
);
