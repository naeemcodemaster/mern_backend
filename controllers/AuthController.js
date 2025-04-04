import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/AuthValidation.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, EmailQueueName } from "../jobs/SendEmailQueueJob.js";
class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema)
            const payload = await validator.validate(body);


            // email Already exists
            const findUser = await prisma.users.findUnique({
                where: { email: payload.email }
            });
            if (findUser) {
                return res.status(400).json({ errors: { email: "Email already taken, Please use another email" } })
            }

            // Encrypt Password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            const user = await prisma.users.create({ data: payload })

            return res.json({ status: 200, message: "User created successfully", user })
        } catch (error) {
            console.log("Error is ", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages);
                return res.status(400).json({ errors: error.messages })
            } else {
                return res.status(500).json({ state: 500, message: "Something went wrong, Please try again!" })
            }
        }
    }

    static async login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            // Find User with Email
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
            })
            if (findUser) {
                if (!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({
                        errors: {
                            email: "Invalid Credentials"
                        }
                    });
                }

                // Issue token to user
                const pyaloadData = {
                    id:findUser.id,
                    email:findUser.email,
                    profile:findUser.profile,
                    name:findUser.name
                }
                const token = jwt.sign(pyaloadData,process.env.JWT_SECRET,{
                    expiresIn:"365d",
                })

                return res.json({message:"Logged In",access_token:`Bearer ${token}`})
            }

            return res.status(400).json({
                errors: {
                    email: "No user found with this Email"
                }
            });
        } catch (error) {
            console.log("Error is ", error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                // console.log(error.messages);
                return res.status(400).json({ errors: error.messages })
            } else {
                return res.status(500).json({ state: 500, message: "Something went wrong, Please try again!" })
            }
        }
    }



    // Send Test Email
    static async sendTestEmail(req,res){
        try {
            const {email} = req.query;
            const payload = [
                {
                    toEmail:email,
                    subject:"First Hey Testing Email",
                    body:"<h2>Testing Email</h2>"
                },

                {
                    toEmail:email,
                    subject:"Second Hey Testing Email",
                    body:"<h2>Testing Email 2</h2>"
                }

            ] 

            // await sendEmail(payload.toEmail,payload.subject,payload.body)
            // await sendEmail(payload.toEmail,"second email","second email body")
            // return res.status(200).json({message:"Email send successfully"})
            await emailQueue.add(EmailQueueName,payload)
            return res.status(200).json({message:"Job added successfully"})
        } catch (error) {
            logger.error({type:"Email Error",body:error})
            return res.status(500).json({message:"Something went wrong, Please try again later"})
        }
    }
}

export default AuthController