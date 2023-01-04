export const vecadd = function(a,b){
    let c = [];
    for(let i = 0; i < a.length; i++){
        c.push(a[i]+b[i]);
    }
    return c;
}

export const vecsub = function(a,b){
    let c = [];
    for(let i = 0; i < a.length; i++){
        c.push(a[i]-b[i]);
    }
    return c;
}

export const vecmul = function(a,b){
    let c = [];
    for(let i = 0; i < a.length; i++){
        c.push(a[i]*b[i]);
    }
    return c;
}

export const vecdiv = function(a,b){
    let c = [];
    for(let i = 0; i < a.length; i++){
        c.push(a[i]+b[i]);
    }
    return c;
}

export const vecaddi = function(a,b){
    for(let i = 0; i < a.length; i++){
        a[i] += b[i];
    }
    return a;
}

export const vecsubi = function(a,b){
    for(let i = 0; i < a.length; i++){
        a[i] -= b[i];
    }
    return a;
}

export const vecmuli = function(a,b){
    for(let i = 0; i < a.length; i++){
        a[i] *= b[i];
    }
    return a;
}

export const vecdivi = function(a,b){
    for(let i = 0; i < a.length; i++){
        a[i] /= b[i];
    }
    return a;
}


export const vecLarger = function(a,b){
    for(let i = 0; i < a.length; i++){
        if(!(a[i] > b[i]))return false;
    }
    return true;
}

export const vecLargerEqual = function(a,b){
    for(let i = 0; i < a.length; i++){
        if(!(a[i] >= b[i]))return false;
    }
    return true;
}
