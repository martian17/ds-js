export const showBits = function(n){
    let s = "";
    for(let i = 31; i >= 0; i--){
        s += ((n>>i)&1);
    }
    console.log(s);
};

export const rand32 = (()=>{
    let ab = new ArrayBuffer(8);
    let f = new Float64Array(ab);
    let u8 = new Uint8Array(ab);
    let i = new Int32Array(ab);
    
    return function(){
        f[0] = Math.random();
        u8[0] = u8[4];
        //console.log(showBits(i[0]),showBits(i[1]));
        //console.log(showBits(i[0]));
        return i[0];
    }
})();

//combine two hashes in an order specific way
export const shiftCombine32 = function(a,b){
    let q = b&31;
    let r = 32-q;
    let aa = a<<q|b>>>r;
    let bb = a>>>r|b<<q;
    return aa^bb;
    //return 0;
};