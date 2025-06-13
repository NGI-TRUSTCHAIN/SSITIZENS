export const transformCommerceErrorMessage = (errorData: any): string => {
  const translations: { [key: string]: string } = {
    email: "El email es requerido",
    full_name: "El nombre del responsable es requerido",
    store_id: "El nombre del comercio es requerido",
    cif: "El CIF es requerido",
    phone_number: "El teléfono es requerido",
  };

  let output: string[] = [];

  Object.entries(errorData).forEach(([key, value]) => {
    if (key === "email") {
      if (
        Array.isArray(value) &&
        value.includes("Profile with this Email already exists.")
      ) {
        output.push("El email ya existe.");
      } else if (translations[key]) {
        output.push(translations[key]);
      } else if (Array.isArray(value)) {
        output.push(`${key}: ${value.join(", ")}`);
      } else {
        output.push(`${key}: ${value}`);
      }
    } else if (translations[key]) {
      output.push(translations[key]);
    } else if (Array.isArray(value)) {
      output.push(`${key}: ${value.join(", ")}`);
    } else {
      output.push(`${key}: ${value}`);
    }
  });

  return output.join("\n");
};
