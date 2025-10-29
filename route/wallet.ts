import { Router } from "express";
import { isAuthenticated } from "../middlewares";
import ctrl from "../controllers/wallet";

const router = Router();

// router.get("/", ctrl.getWallet);
router.get("/", isAuthenticated, ctrl.getWallet);

router.post("/create", isAuthenticated, ctrl.createWallet);

router.delete("/:walletId", isAuthenticated, ctrl.deleteWallet);

// router.put("/deposit", isAuthenticated, ctrl.depositMoney);

// router.put("/withdraw", isAuthenticated, ctrl.withdrawMoney);

// // router.get("/:walletId", (req, res) => {
// //   res.json({ message: "everything is okay" });
// // });

// router.get("/check", (req, res) => {
//   res.status(200).json({ message: "everything is okay" });
// });

export default router;
