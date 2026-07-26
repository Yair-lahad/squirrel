# TODO

- **Rethink `exact` and `category` (merge) rule matching.** Current mechanism/wording isn't landing well - revisit both how they work and how they're labeled in the UI (`CategoriesPage.jsx`'s match-type dropdown, rules table).
- **Allow switching a rule between single-use and continuous after creation.** Right now the Once/Always choice only happens at creation time (`TransactionsTable.jsx`'s `ScopeToggle`); there's no way to edit an existing rule to flip its scope - currently you'd have to delete and recreate it.
