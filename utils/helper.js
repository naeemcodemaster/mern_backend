import { supportedMines } from "../config/filesystem.js"
import fs from 'fs';
import { v4 as uuid } from "uuid"
export const imageValidator = (size, mime) => {
    if (bytesToMB(size) > 2) {
        return "Image size must be less than 2 MB"
    }
    else if (!supportedMines.includes(mime)) {
        return "Image must be type of png,jpg,jpeg,svg,webp,gif";
    }

    return null;
}

export const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024)
}

export const generateRandomNum = () => {
    return uuid();
}


export const getImageUrl = (imgName) => {
    return `${process.env.APP_URL}/images/${imgName}`
}

export const removeImage = (imageName) => {
    console.log("image name is ", imageName);
    const path = process.cwd() + "/public/images/" + imageName;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}


export const uploadImage = (image) => {
    // Image upload
    const imageExt = image?.name.split(".");
    const imageName = generateRandomNum() + "." + imageExt[1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;

    image.mv(uploadPath, (err) => {
        if (err) {
            throw err;
        }
    })

    return imageName;

}