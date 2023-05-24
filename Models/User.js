const mongoose =require( "mongoose");
const uniqueValidator = require("mongoose-unique-validator")
//const bcrypt = require("bcrypt");

const UserSchema =new mongoose.Schema({


        username:{ type:String,  required:true },

        email:{ type:String,  required:true, unique:true },

        password:{ type:String, required:true },

        Followers:{ type:Array, default:0 },

        Following:{ type:Array, default:0 },

        phonenumber:{type:Number, unique:true },

        profile:{ type:String }
})  
// UserSchema.post("save", function(next){
//         console.log("user is created successfully");
// });
// UserSchema.pre("save", async function(next){
        
//         console.log("user is about to be save");
//         const salt = await bcrypt.genSalt();
//         this.password=await bcrypt.hash(this.password , salt);
//         next();
//         });
UserSchema.plugin(uniqueValidator);
module.exports=mongoose.model("User",UserSchema);