import { useCodexStore } from "../stores/useCodexStore";
import { getCategoryLabel, getDefaultCategoryColor, getDefaultEntityName } from "../utils/codexDefaults";
import { WorldEntity } from "../types";

console.log("=== INICIO DE PRUEBAS: CATEGORÍAS PERSONALIZADAS Y REDISEÑO DE IDENTIDAD ===");

const store = useCodexStore.getState();

// 1. Limpieza inicial
useCodexStore.getState().loadCodex([], [], {}, [], []);
console.log("1. Estado inicial limpiado:", {
  entities: useCodexStore.getState().entities.length,
  customCategories: useCodexStore.getState().customEntityCategories.length,
});
console.assert(useCodexStore.getState().entities.length === 0, "Debe iniciar con 0 entidades");
console.assert(useCodexStore.getState().customEntityCategories.length === 0, "Debe iniciar con 0 categorías personalizadas");

// 2. Creación de una categoría personalizada
const newCat = useCodexStore.getState().addCustomEntityCategory({
  label: "Criaturas & Bestias",
  color: "#10B981",
  description: "Monstruos y fauna fantástica",
});

console.log("2. Categoría creada:", newCat);
console.assert(newCat.id.startsWith("cat-"), "ID de categoría personalizada debe iniciar con cat-");
console.assert(newCat.label === "Criaturas & Bestias", "Label correcto");
console.assert(useCodexStore.getState().customEntityCategories.length === 1, "Debe haber 1 categoría en el store");

// 3. getCategoryLabel, getDefaultCategoryColor, getDefaultEntityName con categoría personalizada
const currentCats = useCodexStore.getState().customEntityCategories;
const labelResolved = getCategoryLabel(newCat.id, currentCats);
console.log("3. getCategoryLabel resuelto:", labelResolved);
console.assert(labelResolved === "Criaturas & Bestias", "getCategoryLabel debe resolver la categoría personalizada");

const colorResolved = getDefaultCategoryColor(newCat.id, currentCats);
console.log("3b. getDefaultCategoryColor resuelto:", colorResolved);
console.assert(colorResolved === "#10B981", "getDefaultCategoryColor debe devolver el color de la categoría");

const defaultName = getDefaultEntityName(newCat.id, currentCats);
console.log("3c. getDefaultEntityName resuelto:", defaultName);
console.assert(defaultName === "Nuevo Criaturas & Bestias", "getDefaultEntityName debe usar el label");

// 4. Creación de entidades con categoría base y personalizada
const entCharacter = useCodexStore.getState().addEntity("character", "Valeria Vance");
const entCreature = useCodexStore.getState().addEntity(newCat.id, "Leviatán del Abismo");
useCodexStore.getState().updateEntity(entCreature.id, {
  subtitle: "Bestia de las profundidades",
  summary: "Monstruo colosal que habita en la Fosa de Cristal.",
  tags: ["acuático", "antiguo", "peligro-clase-s"],
});

console.log("4. Entidades creadas:", {
  character: entCharacter.name,
  creature: entCreature.name,
  creatureCategory: entCreature.category,
});
console.assert(useCodexStore.getState().entities.length === 2, "Deben haber 2 entidades");

// 5. getCategoriesSummary
const summary = useCodexStore.getState().getCategoriesSummary();
console.log("5. Resumen de categorías:", summary);
console.assert(summary.all === 2, "Total debe ser 2");
console.assert(summary.character === 1, "character debe ser 1");
console.assert(summary[newCat.id] === 1, "Categoría personalizada debe tener conteo 1");

// 6. getFilteredEntities por categoría personalizada
useCodexStore.getState().setSelectedCategory(newCat.id);
let filtered = useCodexStore.getState().getFilteredEntities();
console.log("6. Filtrado por categoría personalizada:", filtered.map((e) => e.name));
console.assert(filtered.length === 1, "Solo debe retornar la criatura");
console.assert(filtered[0].id === entCreature.id, "Debe ser el Leviatán");

// 7. getFilteredEntities con búsqueda combinada
useCodexStore.getState().setSearchQuery("abismo");
filtered = useCodexStore.getState().getFilteredEntities();
console.log("7. Filtrado combinado (categoría + búsqueda 'abismo'):", filtered.map((e) => e.name));
console.assert(filtered.length === 1, "Debe encontrar el Leviatán");

useCodexStore.getState().setSearchQuery("valeria");
filtered = useCodexStore.getState().getFilteredEntities();
console.log("7b. Filtrado con búsqueda 'valeria' en categoría de criaturas:", filtered.length);
console.assert(filtered.length === 0, "No debe coincidir porque Valeria es de categoría character");

// 8. Búsqueda global ("all")
useCodexStore.getState().setSelectedCategory("all");
filtered = useCodexStore.getState().getFilteredEntities();
console.log("8. Búsqueda global con query 'valeria':", filtered.map((e) => e.name));
console.assert(filtered.length === 1 && filtered[0].id === entCharacter.id, "Debe encontrar a Valeria");

// 9. Hidratación con loadCodex
useCodexStore.getState().setSearchQuery("");
const mockEntities: WorldEntity[] = [
  {
    id: "ent-1",
    name: "Rocketman",
    subtitle: "Héroe de antaño",
    category: newCat.id,
    summary: "El legendario héroe.",
    tags: ["héroe"],
    aliases: [],
    attributes: {},
    notes: "",
    color: "#3B82F6",
    relationships: [],
  },
];
useCodexStore.getState().loadCodex(mockEntities, [], {}, [], [newCat]);
console.log("9. Carga e hidratación:", {
  entities: useCodexStore.getState().entities.length,
  customCategories: useCodexStore.getState().customEntityCategories.length,
  entityCategory: useCodexStore.getState().entities[0].category,
});
console.assert(useCodexStore.getState().entities.length === 1, "Debe cargar 1 entidad");
console.assert(useCodexStore.getState().customEntityCategories.length === 1, "Debe cargar 1 categoría personalizada");
console.assert(useCodexStore.getState().entities[0].category === newCat.id, "Entidad debe mantener su categoría personalizada");

// 10. Eliminación de categoría personalizada
useCodexStore.getState().deleteCustomEntityCategory(newCat.id);
console.log("10. Categoría personalizada eliminada. Restantes:", useCodexStore.getState().customEntityCategories.length);
console.assert(useCodexStore.getState().customEntityCategories.length === 0, "Debe haber 0 categorías personalizadas");

console.log("=== TODAS LAS PRUEBAS DE CATEGORÍAS PERSONALIZADAS PASARON EXITOSAMENTE ===");
