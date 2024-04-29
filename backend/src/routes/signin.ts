import express,{Request,Response} from 'express'
import { body } from "express-validator";
import jwt from 'jsonwebtoken'
import { Password } from '../services/password';
import { validateRequest } from "../middlewares/validate-request";
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post('/api/users/signin',[
body('password')
.trim()
.notEmpty()
.withMessage('You must supply a password')
],validateRequest,async(req:Request,res:Response)=>{
    
    const {email,password} = req.body

    const existingUser = await User.findOne({email})

    if(!existingUser){
        throw new BadRequestError('Invalid credentials')
    }
 
    const passwordMatch =  await Password.compare(existingUser.password,password) 

    if (!passwordMatch) {
        throw new BadRequestError('Invalid credentials')
    }

    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!);

    res.status(200).send({existingUser,userJwt});
})

export { router as signinRouter}