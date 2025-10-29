import { Router } from "express";
import ctrl from "../controllers/auth";
import { isAuthenticated } from "../middlewares";

const router = Router();

router.post("/signup", ctrl.signUp);

router.post("/signin", ctrl.signIn);

router.post("/signout", isAuthenticated, ctrl.signOut);

export default router;
