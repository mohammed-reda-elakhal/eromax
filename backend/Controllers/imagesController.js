const asyncHandler = require("express-async-handler");
const path = require("path");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const { Client } = require("../Models/Client");
const { Admin } = require("../Models/Admin");
const { Livreur } = require("../Models/Livreur");
const { Team } = require("../Models/Team");
const fs = require("fs");
const { Store } = require("../Models/Store");
const File = require("../Models/File");
const { log } = require("console");





/** -------------------------------------------
 * @desc Upload client photo
 * @router /api/client/photo/:id
 * @method POST
 * @access private
 -------------------------------------------
*/
const clientPhotoController = asyncHandler(async (req, res) => {
    console.log('Inside clientPhotoController controller');
    // Validation 
    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    // 2. get image path 
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    const client = await Client.findById(req.params.id);
    if (!client) {
        return res.status(404).json({ message: "Client not found" });
    }
    // 4. Get the store from db
    // 5. Delete the old profile photo if exists 
    if (client.profile.publicId !== null) {
        await cloudinaryRemoveImage(client.profile.publicId);
    }
    // 6. change image url in DB
    client.profile = {
        url: result.secure_url,
        publicId: result.public_id
    };
    await client.save();
    // 7. send response to client 
    res.status(200).json({ message: 'Photo successfully uploaded', image: client.profile });

    // 8. Remove Image from the server 
    fs.unlinkSync(imagePath);
});


/**
 * @desc Update user profile photo
 * @router PUT /api/:role/photo/:id
 * @method PUT
 * @access Private
 */
const updateProfilePhotoController = asyncHandler(async (req, res) => {

    const { role , id } = req.params;

    // Validate role
    const validRoles = ['client', 'livreur', 'team','admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid user role" });
    }

    // Validate file presence
    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    // Define the image path
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    try {
        // Upload to Cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        // Find the user based on role

        let user;
        switch (role) {
            case 'client':
                user = await Client.findById(id);
                break;
            case 'livreur':
                user = await Livreur.findById(id);
                break;
            case 'admin':
                user = await Admin.findById(id);
                break;
            case 'team':
                user = await Team.findById(id);
                break;
            default:
                // This case is already handled above, but added for completeness
                return res.status(400).json({ message: "Invalid user role" });
        }

        if (!user) {
            
            console.log(user);
            
            return res.status(404).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
            
        }

        // Remove old profile photo if exists
        if (user.profile && user.profile.publicId) {
            const removeResult = await cloudinaryRemoveImage(user.profile.publicId);
        }

        // Update profile with new image
        user.profile = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await user.save();

        // Respond with success and updated image data
        res.status(200).json({ message: 'Photo successfully update', image: user.profile,user:user });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    } finally {
        // Remove the uploaded file from server after processing
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
});

const uploadProfilePhotoController = asyncHandler(async (req, res) => {
        console.log('Inside uploadProfilePhotoController');

        const { id } = req.params;
        const { role } = req.user; // Get role from token


        // Valider le rôle
        const validRoles = ['client', 'livreur', 'team','admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid user role" });
        }

        // Validate file presence
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

            // Définir le chemin de l'image
            const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

            try {
                // Téléchargement sur Cloudinary
                const result = await cloudinaryUploadImage(imagePath);
                console.log('Cloudinary upload result:', result);

                // Recherche de l'utilisateur en fonction du rôle
                let user;
                switch (role) {
                    case 'client':
                        user = await Client.findById(id);
                        break;
                    case 'admin':
                        user= await Admin.findById(id) ; 
                        break ;
                    case 'livreur':
                        user = await Livreur.findById(id);
                        break;
                    case 'team':
                        user = await Team.findById(id);
                        break;
                    default:
                        return res.status(400).json({ message: "Invalid user role" });
                }

                if (!user) {
                    return res.status(404).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
                }

                // Supprimer l'ancienne photo de profil si elle existe
                if (user.profile && user.profile.publicId) {
                    const removeResult = await cloudinaryRemoveImage(user.profile.publicId);
                }

                // Mise à jour du profil avec la nouvelle image
                user.profile = {
                    url: result.secure_url,
                    publicId: result.public_id
                };

                await user.save();

                // Répondre avec succès et les données de la nouvelle image
                res.status(200).json({ message: 'Photo successfully uploaded', image: user.profile });

            } catch (error) {
                console.error('Error in uploadProfilePhotoController:', error);
                res.status(500).json({ message: "Server Error" });
            } finally {
                // Supprimer le fichier uploadé du serveur après le traitement
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        });


const storePhotoController= asyncHandler(async(req,res)=>{

    console.log('Inside storePhotoController controller');
    //Validation 
    if(!req.file){
        return req.status(400).json({message:"no file provided"});
    }
    //2. get image path 
    const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    //3. Upload to cloudinary
    const result= await cloudinaryUploadImage(imagePath)
    console.log(result);
    //4. Get the store from db
    const store= await Store.findById(req.params.id);
    //5. Delete the old profile photo if exists 
    if(store.image.publicId !== null){
        await cloudinaryRemoveImage(store.image.publicId);
    
    }
    //6. change image url in DB
    store.image={
        url:result.secure_url,
        publicId : result.public_id
    }
    await store.save();
    //7. send response to client 
    res.status(200).json({ message: 'Photo successfully uploaded', image: store.image });
    
    
    //8. Remove Image from the server 
    fs.unlinkSync(imagePath);
    
    
    });

const updatePhotoStoreController = asyncHandler(async (req, res) => {
    console.log('Inside updatePhotoStoreController');

    // Check if a file is provided in the request
    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    // Define image path from the uploaded file
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    try {
        // Upload the new image to Cloudinary
        const result = await cloudinaryUploadImage(imagePath);
        console.log('Uploaded image result:', result);

        // Find the store by ID in the database
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        // Remove the old image from Cloudinary if it exists
        if (store.image && store.image.publicId) {
            await cloudinaryRemoveImage(store.image.publicId);
        }

        // Update the store's image details in the database
        store.image = {
            url: result.secure_url,
            publicId: result.public_id,
        };
        await store.save();

        // Send a successful response with the new image data
        res.status(200).json({
            message: 'Store photo successfully updated',
            image: store.image,
        });

    } catch (error) {
        console.error('Error updating store photo:', error);
        return res.status(500).json({ message: 'Error updating store photo' });
    } finally {
        // Remove the image from the server
        fs.unlinkSync(imagePath);
    }
});




/** -------------------------------------------
 * @desc Upload client files
 * @router /api/client/file/:id
 * @method POST
 * @access private
 -------------------------------------------
*/
const UploadClientFiles = asyncHandler(async (req, res) => {
    console.log("Received file upload request");

    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    try {
        const clientId = req.params.id;
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        const imagePath = path.join(__dirname, `../files/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        console.log(result);
        if (!result) {
            console.error("Failed to upload file to Cloudinary:", JSON.stringify(result.error));
            return res.status(500).json({ message: "Failed to upload file to Cloudinary", error: result.error });
        }
        const file = new File({
            filename: req.file.filename,
            contentType: req.file.mimetype,
            path: result.secure_url,
            publicId: result.public_id
        });

        await file.save();

        // Add file reference to client
        client.files.push(file._id);
        await client.save();

        // Remove file from server after uploading to Cloudinary
        fs.unlinkSync(imagePath);
        console.log("File uploaded to Cloudinary and saved to DB:", JSON.stringify(file));

        res.status(200).json({ message: "File uploaded successfully", fileId: file._id });
    } catch (err) {
        console.error("Error uploading file", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});


const uploadFiles = asyncHandler(async (req, res) => {
    console.log("Received file upload request");
  
    // Check if both files are present
    if (!req.files || !req.files.cinRecto || !req.files.cinVerso) {
      return res.status(400).json({ message: "Both CIN recto and verso are required." });
    }
  
    const { role, id } = req.params;
  
    try {
      // Verify user based on role
      let user;
      if (role === "client") {
        user = await Client.findById(id);
      } else if (role === "livreur") {
        user = await Livreur.findById(id);
      } else {
        return res.status(400).json({ message: "Invalid user type. Must be 'Client' or 'Livreur'." });
      }
  
      if (!user) {
        return res.status(404).json({ message: `${role} not found` });
      }
  
      // File paths
      const cinRectoPath = path.resolve(__dirname, "../files", req.files.cinRecto[0].filename);
      const cinVersoPath = path.resolve(__dirname, "../files", req.files.cinVerso[0].filename);
  
      // Cloudinary upload
      const cinRectoResult = await cloudinaryUploadImage(cinRectoPath);
      const cinVersoResult = await cloudinaryUploadImage(cinVersoPath);
  
      if (!cinRectoResult.secure_url || !cinVersoResult.secure_url) {
        console.error("Cloudinary upload failed for one or both files.");
        if (fs.existsSync(cinRectoPath)) fs.unlinkSync(cinRectoPath);
        if (fs.existsSync(cinVersoPath)) fs.unlinkSync(cinVersoPath);
        return res.status(500).json({ message: "Failed to upload files to Cloudinary" });
      }
  
      // Save to DB
      const newFile = new File({
        type: req.body.type || "CIN",
        userType: role,
        userId: id,
        cinRecto: {
          url: cinRectoResult.secure_url,
          publicId: cinRectoResult.public_id,
        },
        cinVerso: {
          url: cinVersoResult.secure_url,
          publicId: cinVersoResult.public_id,
        },
      });
  
      await newFile.save();
      user.files.push(newFile._id);
        await user.save();
  
      // Cleanup local files
      fs.unlinkSync(cinRectoPath);
      fs.unlinkSync(cinVersoPath);
  
      console.log("Files uploaded and saved to DB:", newFile);
  
      res.status(201).json({
        message: "Files uploaded successfully",
        file: newFile,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      
      // Cleanup files in case of error
      if (req.files) {
        const cinRectoPath = path.resolve(__dirname, "../files", req.files.cinRecto[0].filename);
        const cinVersoPath = path.resolve(__dirname, "../files", req.files.cinVerso[0].filename);
  
        if (fs.existsSync(cinRectoPath)) fs.unlinkSync(cinRectoPath);
        if (fs.existsSync(cinVersoPath)) fs.unlinkSync(cinVersoPath);
      }
  
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });

 module.exports={
    uploadProfilePhotoController,
    updateProfilePhotoController,
    storePhotoController,
    updatePhotoStoreController,
    UploadClientFiles,
    uploadFiles
 }