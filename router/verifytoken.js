const jwt = require('jsonwebtoken');


const verifyToken = (req , res , next)=>{
        //const authHeader = req.headers.token;
        // console.log( req.headers.token)
        const validate_token = req.cookies.jwt; 
        if(validate_token){
                const token = validate_token;
                jwt.verify(token , process.env.JWTSEC , (err , decodedToken)=>{
                        if(err) return res.status(400).json("Some error occured");
                        
                        req.user = decodedToken;
                        console.log('decodedToken is ', decodedToken);
                        next();
                } )
        }else{
                return res.status(400).json("Access token is not valid, you are not authenticated!")
        }
}

module.exports  = {verifyToken};

