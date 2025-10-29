import { Router } from "express";
import { isAuthenticated } from "../middlewares";
import ctrl from "../controllers/transaction";

const router = Router();

// router.post("/buy", isAuthenticated, ctrl.buyToken);
// // router.post("/buy", ctrl.buyToken);
// router.post("/sell", isAuthenticated, ctrl.sellToken);

// router.post("/topup", isAuthenticated, ctrl.topUp);

// router.post("/withdraw", isAuthenticated, ctrl.withdraw);

router.get("/", isAuthenticated, ctrl.getTransactions);

// router.post("/", isAuthenticated, ctrl.transaction);
router.post("/buy", isAuthenticated, ctrl.buyTransaction);

router.post("/sell", isAuthenticated, ctrl.sellTransaction);

router.post("/topup", isAuthenticated, ctrl.topUpTransaction);

router.post("/withdraw", isAuthenticated, ctrl.withdrawTransaction);

// router.get("/", (req, res) => {
//   res.status(200).json({ message: "Hello!" });
// });

export default router;
