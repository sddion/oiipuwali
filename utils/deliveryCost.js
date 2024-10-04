export const calculateDeliveryCost = (distance) => {
    if (distance <= 1) {
      return 10.5; // Base fee for distances up to 1 km
    } else {
      return 20 + Math.ceil(distance - 2) * 7.5; // Base fee + 7.5 rupees per additional km
    }
  };