import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema } from "../validations/AuthValidation.js";
import bcrypt from "bcryptjs";
class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema)
            const payload = await validator.validate(body);


            // email Already exists
            const findUser = await prisma.users.findUnique({
                where:{email:payload.email}
            });
            if(findUser){
                return res.status(400).json({errors:{email:"Email already taken, Please use another email"}})
            }

            // Encrypt Password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password,salt);

            const user = await prisma.users.create({data:payload})

            return res.json({ status:200,message:"User created successfully",user })
        } catch (error) {
            console.log("Error is ", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages);
                return res.status(400).json({ errors: error.messages })
            }else{
                return res.status(500).json({state:500,message:"Something went wrong, Please try again!"})
            }
        }
    }
}

export default AuthController