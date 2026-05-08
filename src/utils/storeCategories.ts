export type StoreCategoryOption = {
  value: string;
  label: string;
};

export const storeCategories: StoreCategoryOption[] = [
  // Retail & Consumer Goods
  { value: "electronics", label: "Electronics & Technology" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "supermarket", label: "Supermarket / Grocery" },
  { value: "pharmacy", label: "Pharmacy & Health" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "automotive", label: "Automotive" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "household", label: "Home Goods" },
  { value: "pets", label: "Pet Supplies" },
  { value: "books", label: "Books & Stationery" },
  { value: "furniture", label: "Furniture" },
  { value: "toys", label: "Toys & Games" },
  { value: "hardware", label: "Hardware & DIY" },
  { value: "baby", label: "Baby & Kids" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "gardening", label: "Garden & Plants" },

  // Food & Dining
  { value: "restaurants", label: "Restaurants & Cafes" },
  { value: "food", label: "Food & Beverage" },
  { value: "bakeries", label: "Bakeries & Desserts" },

  // Professional Services
  { value: "software", label: "Software & IT Companies" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "legal", label: "Legal Services" },
  { value: "accounting", label: "Accounting & Finance" },
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },

  // Healthcare & Wellness
  { value: "hospitals", label: "Hospitals & Clinics" },
  { value: "dentists", label: "Dental Care" },
  { value: "veterinary", label: "Veterinary Services" },
  { value: "fitness", label: "Fitness & Gyms" },
  { value: "spas", label: "Spas & Wellness" },

  // Education & Learning
  { value: "schools", label: "Schools & Education" },
  { value: "libraries", label: "Libraries" },
  { value: "training", label: "Training & Courses" },

  // Financial Services
  { value: "banks", label: "Banks & ATMs" },
  { value: "financial", label: "Financial Services" },

  // Entertainment & Leisure
  { value: "entertainment", label: "Entertainment & Cinema" },
  { value: "hotels", label: "Hotels & Accommodation" },
  { value: "tourism", label: "Tourism & Travel" },
  { value: "parks", label: "Parks & Recreation" },

  // Transportation
  { value: "gas_stations", label: "Gas Stations" },
  { value: "parking", label: "Parking" },
  { value: "transport", label: "Transportation" },

  // Other Services
  { value: "repair", label: "Repair Services" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "construction", label: "Construction" },
  { value: "manufacturing", label: "Manufacturing" },
];
