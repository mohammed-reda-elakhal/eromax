<<<<<<< HEAD
const cloudinary= require('cloudinary');


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

});
//Cloundinary Upload Image
const cloudinaryUploadImage= async(fileToUpload)=>{
    try{
        const data = await cloudinary.uploader.upload(fileToUpload,{
            resource_type:'auto'
        });
        return data;

        
    }catch(error){

        return error;
    }
}

//Cloundinary Remove Image
const cloudinaryRemoveImage= async(imagePublicId)=>{
    try{
      const resullt= await cloudinary.uploader.destroy(imagePublicId);
      return resullt;

        
    }catch(error){

        return error;
    }
}
module.exports={
    cloudinaryRemoveImage,
    cloudinaryUploadImage
    
=======
const cloudinary = require("cloudinary")

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})

// Cloudinary upload Image
const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload , {
            resource_type  : 'auto',
        });
        return data;
    } catch (error) {
        return error
    }
}

// Cloudinary remove Image
const cloudinaryRemoveImage = async (ImagePublicId) => {
    try {
        const result  = await cloudinary.uploader.destroy(ImagePublicId)
        return result;
    } catch (error) {
        return error
    }
}

// Cloudinary remove multi Image
const cloudinaryRemoveMultiImage = async (publicIds) => {
    try {
        const result  = await cloudinary.v2.api.delete_resources(publicIds)
        return result;
    } catch (error) {
        return error
    }
}

module.exports = {
    cloudinaryRemoveImage , cloudinaryUploadImage , cloudinaryRemoveMultiImage
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
}