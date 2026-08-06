import {Router} from 'express';
import {registerUser,loginUser,logoutUser,refreshAccessToken} from '../controllers/user.controller.js';
import {upload} from '../middleware/multer.middleware.js';
import {verifyJWT} from '../middleware/auth.middleware.js';
const router=Router();

router.route("/register")
    .get((req, res) => res.send("Now this request works in  browser!"))
    .post(
        upload.fields([ //middleware to handle multiple file uploads
            {
                name:"avatar",
                maxCount:1
            },{
                name:"coverImage",
                maxCount:1
            }
        ]),
        registerUser)


router.route("/login").post(loginUser)
//check that user login is working or not
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
export default router;
