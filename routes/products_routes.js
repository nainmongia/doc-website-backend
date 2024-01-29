const express = require("express");
const router = express.Router();
const Product_Controllers = require("../controllers/Products_Controller");
const paginationMiddleware = require("../utils/pagination");

// Add a review to a product
router.post("/product/add-review/:productId", Product_Controllers.addReview);

// Delete a review from a product
router.delete(
  "/product/delete-review/:productId/:reviewId",
  Product_Controllers.deleteReview
);

// Edit a review for a product
router.put("/product/edit-review", Product_Controllers.editReview);

// all products routes
router.get(
  "/all/products",
  paginationMiddleware(),
  Product_Controllers.getAllProducts
);

// all products routes
router.get("/all/productsadmin", Product_Controllers.getAllProductsAdmin);

router.get(
  "/get/single/product/:product_id",
  Product_Controllers.getproductById
);
router.get("/filter/products", Product_Controllers.filterProducts);


router.post(
  "/filter/products/multi_category",
  Product_Controllers.multiCategory
);

router.post("/rec", Product_Controllers.recommended);

router.get(
  "/admin/search/in/products",
  Product_Controllers.adminSearchProducts
);

router.get(
  "/search/in/products",
  paginationMiddleware(),
  Product_Controllers.searchProducts
);

// website search product with category
router.get(
  "/search/category/wise/products",
  paginationMiddleware(),
  Product_Controllers.searchProductsWithCategoryName
);

// website search product with  sub category
router.get(
  "/search/sub/category/wise/products",
  paginationMiddleware(),
  Product_Controllers.searchProductsWithSubCategoryName
);

// website search product with brands
router.get(
  "/search/brands/wise/products",
  paginationMiddleware(),
  Product_Controllers.searchProductsWithBrandName
);

router.patch("/edit/product/:product_id", Product_Controllers.editProduct);
router.patch(
  "/remove/product/image/:product_id/:product_image",
  Product_Controllers.deleteProductImage
);
router.patch(
  "/set/products/as/new/arrivals",
  Product_Controllers.setNewArrivalProducts
);
router.patch(
  "/remove/products/as/new/arrivals",
  Product_Controllers.removeNewArrivalProducts
);
router.patch(
  "/set/products/as/trending/products",
  Product_Controllers.setTrendingProducts
);
router.patch(
  "/remove/products/as/trending/products",
  Product_Controllers.removeTrendingProducts
);
router.post("/add/new/product", Product_Controllers.createProducts);
router.delete("/delete/product", Product_Controllers.deleteProducts);
router.get("/gethome", Product_Controllers.homeProducts);

//get products in website by filter
router.get(
  "/filter",
  paginationMiddleware(),
  Product_Controllers.getAllProductsFilter
);

module.exports = router;
