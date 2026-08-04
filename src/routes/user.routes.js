import {Router} from 'express';
import {registerUser} from '../controllers/user.controller.js';
const router=Router();

router.route("/register")
    .get((req, res) => res.send("Now this request works in  browser!"))
    .post(registerUser)

export default router;
