const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

const createProduct = asyncHandler (async (req, res) => {
    console.log(req.body)
    const {name, sku, category, quantity, price, description} = req.body

    // Validation
    if(!name || !category || !quantity || !description){
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    // Handle Image Upload
    let fileData = {}
    if(req.file){

             // save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"Pinvent App", resource_type: "image"})
        } catch (error) {
            console.log(error)
            res.status(500)
            throw new Error("Image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
        console.log(fileData)

    // Create product
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    })

    res.status(201).json(product)
    }

});

// Get All products
const getProducts = asyncHandler(async (req, res) =>{
   
     const products = await Product.find({user: req.user.id}).sort("-createdAt")
     res.status(200).json(products)
})

// Get Single Product
const getProduct = asyncHandler(async(req,res)=>{
    const product = await Product.findById(req.params.id)
    // if product does not exist
    if(!product){
        res.status(404)
        throw new Error("Product Not Found")
    }
    // Match product to it's user
    if(product.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User Not Authorized")
    }
    res.status(200).json(product)
})

// Delete Product
const deleteProduct = asyncHandler(async(req,res)=>{
    
        const product = await Product.findById(req.params.id)
        // if product does not exist
        if(!product){
            res.status(404)
            throw new Error("Product Not Found")
        }
        // Match product to it's user
        if(product.user.toString() !== req.user.id){
            res.status(401)
            throw new Error("User Not Authorized")
        }
        await product.remove()
        res.status(200).json(product)
    })
// Update product
  
const updateProduct = asyncHandler (async (req, res) => {
    
    const {name, category, quantity, price, description} = req.body;
    const {id} = req.params;

    const product = await Product.findById(id);

    //if product does not exist
    if(!product){
        res.status(404);
        throw new Error("Product not found")
    }
     // Match product to it's user
     if(product.user.toString() !== req.user.id){
        res.status(401)
        throw new Error("User Not Authorized")
    }
  
    // Handle Image Upload
    let fileData = {}
    if(req.file){

             // save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"Pinvent App", resource_type: "image"})
        } catch (error) {
            console.log(error)
            res.status(500)
            throw new Error("Image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
    }

    // Update product

    const updateProduct = await Product.findByIdAndUpdate(
        {_id:id},
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData ).length === 0? product?.image: fileData,
        },
        {
            new: true,
            runValidators: true
        }
    )

    res.status(201).json(updateProduct)
   });



module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
}