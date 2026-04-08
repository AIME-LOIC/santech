import express from 'express'
import { getAllUsers,getUserById,createUser,updateUser,deleteUser } from '../controller/user.js'
const router = express.Router();
router.get("api/getalluser",getAllUsers);
router.get("api/getuserbyid",getUserById);
router.post("api/createuser",createUser);
router.put("api/updateuser",updateUser);
router.delete("api/deleteuser",deleteUser);

export default router;

