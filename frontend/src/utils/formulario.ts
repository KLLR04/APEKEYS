// Clase del control de formulario: agrega "is-invalid" (borde rojo) cuando hay error.
export const claseControl = (error?: string, base = 'form-control') =>
  error ? `${base} is-invalid` : base
