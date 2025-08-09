import express from "express";
import NftController from "../controller/NftController.js";

const router = express.Router();

router.post("/mint", NftController.mintNFT);
router.post("/sell", NftController.sellNFT);
router.post("/buy", NftController.buyNFT);
router.get("/owned", NftController.listOwnedNFTs);
router.get("/for-sale", NftController.listNFTsForSale);

router.post("/send", NftController.sendNFT);

export default router;
