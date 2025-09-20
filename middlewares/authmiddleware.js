import jwt from "jsonwebtoken";
export default function authToken(req,res,nxt){
    const token = req.cookies.auth_token;
    if(!token) return res.status(401).json({error: "Unauthorized"});
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        nxt();
    }catch{
        return res.status(403).json({error: "Invalid or expired token"});
    }
}