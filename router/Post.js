const router = require("express").Router();
const { json } = require("express");
const Post = require("../Models/Post");
const User = require("../Models/User");

const { verifyToken } = require("./verifytoken");

//Create Post
router.post("/user/post" , verifyToken , async(req , res)=>{
        try {
            
            const user = await User.findOne(req.user._id);
            if (user){
                let {title , image , video} = req.body;
                let newpost = new Post({
                    title , image , video , user:req.user.id
                })
                // await User.updateOne({$push:{post:newpost},{user:req.user.id});       
                const post = await newpost.save();
                res.status(200).json(post); }
        } catch (error) {
                    return res.status(500).json("Internal error occured at creat post")
        }
})

//uplode post by one user
router.get("/get/post",verifyToken,async(req,res)=>{
    try {
        const mypost= await Post.findOne({user:req.user.id});
        if(!mypost){
            return res.status(401).json("You don't have any postes")
        }
        res.status(200).json(mypost);
        
    } catch (error) {
        return res.status(500).json("internal server error at uploade post");
        
    }
})

//update user post
router.put("/update/post/:id",verifyToken,async(req,res)=>{
    try {
        let post =await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json("post dose not found!");
        }
        post= await Post.findByIdAndUpdate(req.params.id,{
            $set:req.body},{new:true})
        let updatepost =await post.save();
        res.status(200).json(updatepost);
    } catch (error) {
        return res.status(500).json("internal error occure at updatePost..")
    }

})
///like 
router.put("/:id/like",verifyToken,async(req,res)=>{
    try {
    
        const post = await Post.findById(req.params.id);
        if(!post.like.includes(req.body.user)){
            if(post.dislike.includes(req.body.user)){
                await post.updateOne({$pull:{dislike:req.body.user}})
                
            }
            await post.updateOne({$push:{like:req.body.user}})
            return res.status(200).json("post has been liked") 

        }
        else{
            await post.updateOne({$pull:{like:req.body.user}})
            res.status(400).json("post has been unliked")
        }
        
    } catch (error) {
        return res.status(500).json("internal server error at like op..")
            
    }

})

/// dislike
router.put("/:id/dislike",verifyToken,async(req,res)=>{
    try {
    
        const post = await Post.findById(req.params.id);
        if(!post.dislike.includes(req.body.user)){
            
            if(post.like.includes(req.body.user)){
                await post.updateOne({$pull:{like:req.body.user}})
                
            }
            await post.updateOne({$push:{dislike:req.body.user}})
            return res.status(200).json("post has been disliked")
            

        }
        else{
            await post.updateOne({$pull:{dislike:req.body.user}})
            res.status(400).json("post has been unliked")
        }
        
    } catch (error) {
        return res.status(500),json("internal server error at dislike op.. ")
            
    }

})

//comment
router.put("/comment/post",verifyToken,async(req,res)=>{
    try {
        const {comment,postid}=req.body;
        const comments={
            user:req.user.id,
            username:req.user.username,
            comment

        }
        const post =await Post.findById(postid);
        post.comments.push(comments);
        await post.save();
        res.status(200).json(post); 
        
    } catch (error) {
        return res.status(500),json("internal server error at comment op.. ")
        
    }

})


//delete post
router.delete("/delete/post/:id",verifyToken,async(req,res)=>{
    try {
        const post = await Post.findById({_id:req.params.id})
        if(post){
            await Post.findByIdAndDelete({_id:req.params.id});
        
            return res.status(200).json("Your post has been deleted");
        }else{
            return res.status(400).json("You not allow to delete this post..");
        }
        
    } catch (error) {
        return res.status(500).json("internal server error at delete post")
        
    }
})


module.exports = router;
