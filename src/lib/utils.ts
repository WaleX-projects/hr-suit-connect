import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function dateToWords(dateString) {
  if (!dateString) return "";

  const [day, month, year] = dateString.split("/");

  const date = new Date(year, month - 1, day);

  const monthName = date.toLocaleString("en-GB", {
    month: "long",
  });

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(Number(day))} ${monthName} ${year}`;
}