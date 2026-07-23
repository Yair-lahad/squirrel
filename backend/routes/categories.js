const express = require('express');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/api/categories/rules', categoriesController.listRules);
router.post('/api/categories/rules', categoriesController.createRule);
router.put('/api/categories/rules/:id', categoriesController.updateRule);
router.delete('/api/categories/rules/:id', categoriesController.deleteRule);
router.post('/api/categories/rules/:id/promote', categoriesController.promoteRule);
router.post('/api/categories/apply', categoriesController.applyRules);

router.get('/api/categories', categoriesController.listCategories);
router.post('/api/categories', categoriesController.createCategory);
router.put('/api/categories/:id', categoriesController.renameCategory);
router.delete('/api/categories/:id', categoriesController.deleteCategory);

module.exports = router;
