import express from "express"
import { Register,login } from "../controller/auth.js"

const AuthRoutes=express.Router()
AuthRoutes.post("/api/register",Register)
AuthRoutes.post("/api/login",login);

export default AuthRoutes