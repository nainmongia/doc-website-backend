const express = require("express")
const router = express.Router()
const BlogsCategory_Controller = require("../controllers/BlogsCategory_Controller");

router.get("/blogs/category/get/all/brands", BlogsCategory_Controller.getAllBrands);
router.post("/blogs/category/create/category",BlogsCategory_Controller.createCategory);
router.post("/blogs/category/create/maincategory",BlogsCategory_Controller.createMainCategory);
router.get("/blogs/category/get/all/category",BlogsCategory_Controller.getAllCategory);
router.get("/blogs/category/get/category/for/addproduct",BlogsCategory_Controller.getCategoryByMainCategory);
router.patch("/blogs/category/update/all/main/category",BlogsCategory_Controller.updateMainCategory);
router.patch("/blogs/category/edit/category/:category_id",BlogsCategory_Controller.editCategory);
router.get("/blogs/category/get/category/:category_id",BlogsCategory_Controller.getCategorysById);
router.get("/blogs/category/search/in/category",BlogsCategory_Controller.searchInCategory);
router.get("/blogs/category/filter/category",BlogsCategory_Controller.filterForCategory);
router.get("/blogs/category/get/addproduct/maincategory",BlogsCategory_Controller.mainCategoryForProduct);
router.patch("/blogs/category/delete/main/category/image",BlogsCategory_Controller.deleteImage);
router.delete("/blogs/category/delete/category/",BlogsCategory_Controller.deleteCategory);

module.exports = router;