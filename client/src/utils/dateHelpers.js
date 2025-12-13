export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthNumToName(num) {
  return monthNames[num - 1];
}

export function monthNameToNumber(name) {
  return monthNames.indexOf(name) + 1; // Jan → 1
}
