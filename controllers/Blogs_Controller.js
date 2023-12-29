const Blogs_Schema = require("../modals/Blogs")
const Products_Schema = require("../modals/Products")
const Blog_Category_Schema = require("../modals/BlogsCategory")
const Utils = require("../utils/Utils");

// creating new user 
const createABlog = async(req,res)=>{
console.log("Reqbody->",req.body)
    try{
        const create = new Blogs_Schema({
            blog_title:req.body?.blog_title,
            blog_slug:req.body?.blog_slug,
            blog_category:req.body?.blog_category,
            blog_author:req.body?.blog_author,
            author_bio:req.body?.author_bio,
            author_social_link:req.body?.author_social_link,
            author_profile:req.body?.author_profile,
            meta_title:req.body?.meta_title,
            meta_description:req.body?.meta_description,
            about_blog:req.body?.about_blog,
            blog_image:req.body?.blog_image,
            blog_sub_headings:req.body?.blog_sub_headings,
            blog_selected_products:req.body?.blog_selected_products
        }) 
        const result = await create.save();
        res.status(200).send({result:result,message:"blog created successfully !!"})

    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong")
    }
}

// SEARCH IN PRODUCTS for blogs
const seacrhForProductsInBlogs = async(req,res)=>{
    const searchValue = req.query.search;
    const searchRegex = Utils.createRegex(searchValue);
    let result;
    try {
      result = await Products_Schema.find({
        product_name: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
      if (!result.length > 0) {
        result = await Products_Schema.find({
          product_code: { $regex: searchRegex },
        }).sort({ createdAt: -1 });
      }
      res.status(200).send(result);
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong !!");
    }
}

//getting all users
const getAllBlogs = async(req,res)=>{
    try{
        const allBlogs = await Blogs_Schema.find({}).sort({createdAt:-1})
        res.status(200).json(allBlogs)

    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


// get user by id (who's logged in)
const getUserById = async (req,res)=>{
    try{
       
      
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:"Unauthenticated !!"})
    }
}

// edit admin by id
const editAdminByID = async(req,res)=>{
    const adminId=req.params.admin_id;
    try{
        if(!adminId){
            return res.send("please provide a admin id")
        }
        if(req.body.password){
            const find = await Blogs_Schema.findByIdAndUpdate(adminId,)
            if(!find){
                return res.send("admin not found")
            }
            return res.status(200).send("Password Updated success")
        }
        const findUser = await Blogs_Schema.findByIdAndUpdate(adminId,{$set:req.body})
        if(!findUser){
            return res.send("admin not found")
        }
        res.status(200).send("admin updated successfully !!")


    }catch(err){
        console.log(err)
        res.status(500).send("Something went wrong !!")
    }
}


const getHomePageBlogs=async(req,res)=>{
    try{
      const getblogs = await Blogs_Schema.find({}).sort({createdAt:-1}).limit(3);
      console.log("getblogs=>",getblogs);
      res.status(200).send({status:true,message:'success',data:getblogs})
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:"Unauthenticated !!"})
    }
}


const getAllBlogsForBlogspage=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; 
    const skip = (page - 1) * limit;
    try{
      const getAllBlogs = await Blogs_Schema.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
       const count = await Blogs_Schema.find({}).count();
      console.log("getAllBlogs=>",getAllBlogs);
      res.status(200).send({status:true,message:'success',data:getAllBlogs,pages:Math.ceil(count / limit)})
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:"Unauthenticated !!"})
    }
}

// get blog by slug
const getBlogBySlug = async (req,res)=>{
    const blogSlug = req.params?.blog_slug;
    try{
        if(!blogSlug) return res.status(404).send({status:false,message:'provide blog slug!'})
        // let blogSlugRegex = new RegExp(blogSlug, "i");
        const find = await Blogs_Schema.findOne({blog_slug:blogSlug})
        console.log("Blog=>",find)
        const findAllRelated = await Blogs_Schema.find({blog_category:find?.blog_category}).sort({createdAt:-1}).limit(3);
        res.status(200).send({status:true,message:'success',data:find,related_blog:findAllRelated})
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:"Unauthenticated !!"})
    }
}


const getBlogById = async (req,res)=>{
    const blog_id = req.params?.blog_id;
    try{
        if(!blog_id)return res.status(404).send({status:false,message:'provide blog id!'}) 
        const find = await Blogs_Schema.findById(blog_id)
        console.log("Blog=>",find)
        res.status(200).send({status:true,message:'success',data:find})
      
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:"Unauthenticated !!"})
    }
}


const editABlogById = async(req,res)=>{
    const blog_id = req.params?.blog_id;
    console.log("editABlogById->",req.body)
        try{
            if(!blog_id)return res.status(404).send({status:false,message:'provide blog id!'}) 
            const find = await Blogs_Schema.findById(blog_id)
            console.log("Blog=>",find)
            const update = await Blogs_Schema.findByIdAndUpdate(blog_id,{
                $set:{
                    blog_title:req.body?.blog_title,
                    blog_slug:req.body?.blog_slug,
                    meta_title:req.body?.meta_title,
                    meta_description:req.body?.meta_description,
                    blog_category:req.body?.blog_category,
                    author_bio:req.body?.author_bio,
                    author_social_link:req.body?.author_social_link,
                    author_profile:req.body?.author_profile,
                    blog_author:req.body?.blog_author,
                    about_blog:req.body?.about_blog,
                    blog_image:req.body?.blog_image,
                    blog_sub_headings:req.body?.blog_sub_headings,
                    blog_selected_products:req.body?.blog_selected_products
                }
            })

            res.status(200).send({status:true,message:"blog edit successfully !!"})
    
        }
        catch(err){
            console.log(err)
            res.status(500).send("Something went wrong")
        }
    }


// delete blogs
const deleteBlogs = async (req, res) => {
    // console.log("body=>",req.body)
    // console.log("body=>",req.body?.length)
    try {
      if (req.body?.length) {
        const deleteSelected = await Blogs_Schema.deleteMany({
          _id: {
            $in: req.body,
          },
        });
        if (!deleteSelected) {
          return res
            .status(200)
            .send({ message: "blogs delete failed", status: false });
        }
        return res
          .status(200)
          .send({ message: "blogs delete success", status: true });
      }
  
      res.status(200).send({ message: "blogs delete failed", status: false });
    } catch (err) {
      console.log(err);
      res.status(200).send({ message: "blogs delete failed", status: false });
    }
  };


const getBlogsByCategory = async(req,res)=>{
    const {blog_category} = req.params;
    console.log("req.params;",req.params);
    console.log("blog_category",blog_category);
    try {
        if(!blog_category) return res.status(404).send({status:false,message:'please provide a category'})
        const findAll = await Blogs_Schema.find({blog_category:blog_category}).limit(3);
        res.status(200).send({data:findAll, message: "success", status: true });
        
    } catch (err) {
        console.log(err);
        res.status(200).send({ message: "something went wrong!!", status: false });
      }
}


exports.getAllBlogs = getAllBlogs;
exports.getUserById = getUserById;
exports.createABlog = createABlog;
exports.editAdminByID = editAdminByID;
exports.seacrhForProductsInBlogs = seacrhForProductsInBlogs;
exports.getHomePageBlogs = getHomePageBlogs;
exports.getBlogBySlug = getBlogBySlug;
exports.getBlogById = getBlogById;
exports.editABlogById = editABlogById;
exports.deleteBlogs = deleteBlogs;
exports.getAllBlogsForBlogspage = getAllBlogsForBlogspage;
exports.getBlogsByCategory = getBlogsByCategory;
