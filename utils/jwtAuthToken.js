import jwt from "jsonwebtoken"
const signToken=(id,role,email)=>{
    const Token=jwt.sign({_id:id,_role:role,_email:email},process.env.JWT_SECRET);
    return Token;
}
export default signToken;