export default function researcherAuthorize(req,res,nxt){
    if(req.user._role !== "researcher")
        return res.status(403).json({error: "Forbidden - Researchers only"});
    nxt();
}