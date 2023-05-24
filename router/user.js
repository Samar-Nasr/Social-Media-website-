const router = require("express").Router();
const User = require("../Models/User");
const Post = require("../Models/Post");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTSEC = "#2@!@$ndja45883 r7##";  //anything
const { verifyToken } = require("./verifytoken");

// import express from "express";
// import { User } from "../Models/user";
// import { body, validationResult } from "express-validator";
// import { genSalt, hash, compare } from "bcryptjs";
// import { sign } from "jsonwebtoken";


//validation  & signUP
router.post("/create/user" ,
    body('email').isEmail(),
    body('password').isLength({ min: 6 }) ,
    body('username').isLength({ min: 3 }) ,
    body('phonenumber').isLength({ min: 11}) ,
    async(req , res)=>{
        const error = validationResult(req);
        if(!error.isEmpty()){
                    return res.status(400).json("some error occured")
        }
        try {
            let user = await User.findOne({email:req.body.email});
            if(user){
                    return res.status(200).json("Please login with correct password")
            };
            const salt = await bcrypt.genSalt(10);  //salt is added to pass then hashing
            const secpass = await bcrypt.hash(req.body.password , salt)
        
/// body schema creation
            user = await User.create({
                username:req.body.username,
                email:req.body.email,
                password:secpass,
                profile:req.body.profile,
                phonenumber:req.body.phonenumber
        });
        //this token is differebt from login token >>> and this can be deleted 
        // const accessToken = jwt.sign({
        //     id:user._id,
        //     username:user.username,
        // } , JWTSEC)
            await user.save();
            res.status(200).json({user });

            }catch(error){
            res.status(400).json("internal error occured at create user");
        };
});

//login
router.post("/login",
    body('email').isEmail(),
    body('password').isLength({min:6}), async(req,res)=>{
        const error=validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json("some err occured")
        }
        try{
        //const {email , password} = req.body
        const user =await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json("User does not found!!");
        }
        //authentication
        const ComparePassword = await bcrypt.compare(req.body.password, user.password);
        if (!ComparePassword){
            return res.status(400).json("password error")
        }
        //authorization ----> create token
        const accessToken = jwt.sign({
            id:user._id,
            username:user.username,
        } , process.env.JWTSEC  , {expiresIn : 2 * 24 * 60 * 60})
        // valid token or not 
        res.cookie("jwt" , accessToken)
        const {password, ...other}=user._doc
        res.status(200).json({other , accessToken});
    }
    catch(error){
        res.status(500).json("internal error occure at login..")
    }
})

///following
router.put("/following/:id",verifyToken ,async(req,res)=>{
    if(req.params.id !== req.body.user){
        const user = await User.findById(req.params.id);
        const otherusers = await User.findById(req.body.user);

        if(!user.Followers.includes(req.body.user)){
            await user.updateOne({$push:{Followers:req.body.user}});
            await otherusers.updateOne({$push:{Following:req.params.id}});
            return res.status(200).json("user has followed.");
        }else{
            return res.status(400).json("You already follow this User!");
        }

    }else{
        return res.status(400).json("you can't follow yourself");
    }

})

//fetch post from followers
router.get("/flw/:id",verifyToken,async(req,res)=>{
    try {
        const user= await User.findById(req.params.id);
        const followersPost = await Promise.all(
            user.Following.map((item)=>{
                return Post.find({user:item} )
            })
        )
        res.status(200).json(followersPost);

        
    } catch (error) {
        return res.status(500).json("internal server error ..");
        
    }
});

//update 
router.put("/update/:id",verifyToken,async(req,res)=>{
    const user= await User.findOne({_id:req.params.id});
    if(user){
        const salt= await bcrypt.genSalt( );
        const secpass = await bcrypt.hash(req.body.password,salt);

        const newUser={
            username:req.body.username,
            email:req.body.email,
            phonenumber:req.body.phonenumber,
            password:secpass,
            profile:req.body.profile
        }
        try {
            const updateUser =await User.findByIdAndUpdate({_id:req.params.id} , newUser, {new:true});
            res.status(200).send(updateUser);

        } catch (error) {
            return res.status(400).json("you aren't allow to update this profile");
        }
    }else{
        res.status(404).send("user not found!!");
    }

});

// get user
router.get("/get/user/:username" ,  async (req , res )=>{
    const user = await User.findOne({username:req.params.username});
    if (user){
        res.status(200).json(user)
    }
    else{
        res.status(404).json("user  not found ");
    }
});

//delete user account
router.delete("/delete/:id",verifyToken,async(req,res)=>{
    try {
        if(req.params.id !== req.user.id){
            return res.status(400).json("account does not match!")
        }else{
            await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("account has been deleted :(");
        }
        
    } catch (error) {
        return res.status(500).json("internal server error at delete account")
        
    }

})
//export{router}
module.exports=router;
