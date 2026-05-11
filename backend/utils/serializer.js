/**
 * Convierte BigInt a Number o String para JSON serialization
 */
const convertBigInt = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    // Convertir a número si es seguro, sino a string
    return obj > Number.MAX_SAFE_INTEGER ? obj.toString() : Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = convertBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
};

module.exports = { convertBigInt };
