// The pantry and the recipe book for Moonlit Noodle Kitchen.
// Every dish is built by stacking its ingredients on the plate in the
// exact order listed here, first ingredient first.

export const INGREDIENTS = [
  { id: "noodles", name: "Noodles", color: "#f6c945" },
  { id: "pasta", name: "Pasta", color: "#f9e08a" },
  { id: "egg", name: "Egg", color: "#ffb703" },
  { id: "shrimp", name: "Shrimp", color: "#ff8fa3" },
  { id: "greens", name: "Greens", color: "#57cc5e" },
  { id: "tomato", name: "Tomato", color: "#ef476f" },
  { id: "mushroom", name: "Mushroom", color: "#c08552" },
  { id: "cheese", name: "Cheese", color: "#ffd60a" },
  { id: "dough", name: "Dough", color: "#e8c39e" },
  { id: "basil", name: "Basil", color: "#2a9d5f" },
];

export const RECIPES = [
  {
    id: "ramen",
    name: "Moonlight Ramen",
    steps: ["noodles", "egg", "shrimp", "greens"],
    points: 100,
    blurb: "A steaming bowl for night owls",
  },
  {
    id: "pasta",
    name: "Sunset Pasta",
    steps: ["pasta", "tomato", "basil", "cheese"],
    points: 110,
    blurb: "Golden hour, on a plate",
  },
  {
    id: "pie",
    name: "Forest Mushroom Pie",
    steps: ["dough", "mushroom", "cheese", "greens"],
    points: 120,
    blurb: "Warm, flaky and woodsy",
  },
  {
    id: "omelette",
    name: "Garden Omelette",
    steps: ["egg", "tomato", "cheese", "basil"],
    points: 90,
    blurb: "Breakfast, but make it midnight",
  },
];

export const CUSTOMER_NAMES = [
  "Pip the Postman",
  "Ada the Astronomer",
  "Noor the Night Bus Driver",
  "Felix the Fox Keeper",
  "June the Jazz Singer",
  "Marco the Map Maker",
  "Suki the Street Artist",
  "Omar the Owl Trainer",
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function recipeById(id) {
  return RECIPES.find((dish) => dish.id === id);
}
