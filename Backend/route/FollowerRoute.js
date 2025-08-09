import express from "express";
import FollowerController from "../controller/FollowerController.js";

const router = express.Router();

router.post("/follow", FollowerController.followUser);
router.post("/unfollow", FollowerController.unfollowUser);
router.get("/followers", FollowerController.getUserFollowers);
router.get("/following", FollowerController.getUserFollowing);
router.get("/getalluser", FollowerController.getAllUsers);
router.get("/name/:name", FollowerController.getUsersByName);

export default router;