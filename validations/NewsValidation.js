import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomError.js";
// Custom Error Reporter
vine.errorReporter = () => new CustomErrorReporter();
export const newsSchema = vine.object({
    title:vine.string().minLength(10).maxLength(200),
    content:vine.string().minLength(10).maxLength(20000),
    
})

