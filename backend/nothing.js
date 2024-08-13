const UploadClientFi = asyncHandler(async (req, res) => {
    console.log("Received file upload request");
  
    if (!req.file) {
     return res.status(400).json({ message: "No file provided" });
    }
  
    try {
      const clientId = req.params.clientId;
      const client = await Client.findById(clientId);
  
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
  
      const imagePath = path.join(__dirname, `../files/${req.file.filename}`);
      const result = await cloudinaryUploadImage(imagePath);
      if (!result.success) {
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
  
      console.log("File uploaded to Cloudinary and saved to DB");
  
      res.status(200).json({ message: "File uploaded successfully", fileId: file._id });
    } catch (err) {
      console.error("Error uploading file", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  });