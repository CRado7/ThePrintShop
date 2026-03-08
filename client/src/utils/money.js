export function toMoney(n) {
    const num = Number(n || 0);
    return num.toLocaleString(undefined, {
      style: "currency",
      currency: "USD"
    });
  }
  
  export function round2(n) {
    return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
  }