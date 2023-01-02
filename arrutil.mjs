export const newarr = function(n){
    let arr = [];
    for(let i = 0; i < n; i++){
        arr.push(0);
    }
    return arr;
};

export const arrcpy = function(arr){
    let arr1 = [];
    for(let val of arr){
        arr1.push(val);
    }
    return arr1;
}

export const range = function(a,b){
    if(b === undefined){
        b = a;
        a = 0;
    }
    let arr = [];
    if(a < b){
        for(let i = a; i < b; i++){
            arr.push(i);
        }
    }else{
        for(let i = a; i > b; i--){
            arr.push(i);
        }
    }
};

export const arreq = function(a,b,cb){
    if(a.length !== b.length){
        return false;
    }
    if(!cb){
        for(let i = 0; i < a.length; i++){
            if(a[i] !== b[i])return false;
        }
    }else{
        for(let i = 0; i < a.length; i++){
            if(!cb(a[i],b[i]))return false;
        }
    }
    return true;
};

export const arrSplit = function(arr,comp,inclusive){
    let res = [];
    let top = [];
    for(let val of arr){
        if(val === comp){
            if(inclusive)top.push(val);
            res.push(top);
            top = [];
        }else{
            top.push(val);
        }
    }
    res.push(top);
    return res;
};

export const arrLoopBack = function*(arr){
    for(let i = arr.length-1; i >= 0; i--){
        yield arr[i];
    }
};





