export const toIsoDate = (ddmmyyyy: any) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
};
