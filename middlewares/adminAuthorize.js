export default function adminAuthorize(req,res,nxt){
    if(req.user._role !== "admin")
        return res.status(403).json({error: "Forbidden - Admins only"});
    nxt();
}