const express = require("express")
const router = express.Router()
const Category_Controller = require("../controllers/Category_Controller");

router.get("/brands/get/all/brands", Category_Controller.getAllBrands);
router.post("/brands/create/category",Category_Controller.createCategory);
router.post("/brands/create/maincategory",Category_Controller.createMainCategory);
router.get("/brands/get/all/category",Category_Controller.getAllCategory);
router.get("/brands/get/category/for/addproduct",Category_Controller.getCategoryByMainCategory);
router.patch("/brands/update/all/main/category",Category_Controller.updateMainCategory);
router.patch("/brands/edit/category/:category_id",Category_Controller.editCategory);
router.get("/brands/get/category/:category_id",Category_Controller.getCategorysById);
router.get("/brands/search/in/category",Category_Controller.searchInCategory);
router.get("/brands/filter/category",Category_Controller.filterForCategory);
router.get("/brands/get/addproduct/maincategory",Category_Controller.mainCategoryForProduct);
router.patch("/brands/delete/main/category/image",Category_Controller.deleteImage);
router.delete("/brands/delete/category/",Category_Controller.deleteCategory);

module.exports = router;