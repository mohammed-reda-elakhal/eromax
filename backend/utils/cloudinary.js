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
    
}