export const parseNumberToSouthwestAirlines = (phoneNumber: any) => {
  let formattedNumber = phoneNumber.replace(/\D/g, "");

  if (formattedNumber.startsWith("1")) {
    formattedNumber = formattedNumber.substring(1);
  }

  return formattedNumber;
};

export const toCapitalCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatDateToSouthwestAirlines = (date: any) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options as any);
};
