export const nullobj = function(){
    return Object.create(null);
};
const sym = Symbol();

export const normalizeObject = function(obj,original=sym){
    if(original === sym)original = obj;
    if(obj instanceof Array){
        return obj.map(v=>normalizeObject(v,original));
    }
    const type = typeof obj;
    if(type === "number" || type === "string" || type === "boolean" || obj === null){
        return obj;
    }
    else if(typeof obj === "object"){
        const keys = Object.keys(obj).sort();
        const obj1 = {};
        for(let key of keys){
            obj1[key] = normalizeObject(obj[key],original);
        }
        return obj1;
    }else{
        console.log("type not supported:",obj,original);
        throw new Error("object type not supported");
    }
};


