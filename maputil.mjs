export const mapeq = function(a,b,cb){
    if(a.size !== b.size){
        return false;
    }
    if(!cb){
        for(let [key,val1] of a){
            if(!b.has(key))return false;
            let val2 = b.get(key);
            if(val1 !== val2)return false;
        }
    }else{
        for(let [key,val1] of a){
            if(!b.has(key))return false;
            let val2 = b.get(key);
            if(!cb(val1,val2))return false;
        }
    }
    return true;
};

export const mapFromObj = function(obj){
    let map = new Map;
    for(let key in obj){
        map.set(key,obj[key]);
    }
    return map;
};

export const mapFromEntries = function(arr){
    let map = new Map;
    for(let [key,val] of arr){
        map.set(key,val);
    }
    return map;
};

export const newMapTally = function(lst){
    let map = new Map;
    for(let val of lst){
        if(!map.has(val)){
            map.set(val,1);
        }else{
            map.set(val,map.get(val)+1);
        }
    }
    return map;
};


