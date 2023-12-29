const express = require("express")
const router = express.Router()
const Blogs_Controllers = require("../controllers/Blogs_Controller")

// admin user routes
router.get("/admin/get/list/of/all/blogs",Blogs_Controllers.getAllBlogs);
router.get("/admin/get/single/blog/by/id/:blog_id",Blogs_Controllers.getBlogById);
router.get("/get/related/blogs/by/category/:blog_category",Blogs_Controllers.getBlogsByCategory);
router.get("/search/products/for/add/a/new/blog", Blogs_Controllers.seacrhForProductsInBlogs);
router.post("/admin/create/new/blog/for/website",Blogs_Controllers.createABlog);
router.patch("/admin/edit/blog/by/id/:blog_id",Blogs_Controllers.editABlogById);
router.delete("/delete/blogs", Blogs_Controllers.deleteBlogs);

// website routes
router.get("/website/get/all/blogs/for/blogs/page",Blogs_Controllers.getAllBlogsForBlogspage);
router.get("/website/get/single/blog/post/:blog_slug",Blogs_Controllers.getBlogBySlug);
router.get("/website/get/blogs/for/homepage",Blogs_Controllers.getHomePageBlogs);

module.exports = router