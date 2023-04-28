import {newarr} from "./arrutil.mjs";

export const matmul = function(mat1,mat2){
    const width = mat1[0].length;
    const height = mat1.length;
    const mat3 = newarr(height).map(_=>newarr(height));
    for(let i = 0; i < height; i++){
        for(let j = 0; j < height; j++){
            let res = 0;
            for(let k = 0; k < width; k++){
                res += mat1[i][k]*mat2[k][j];
            }
            mat3[i][j] = res;
        }
    }
    return mat3;
};

export const matvec = function(mat,vec1){
    const width = mat[0].length;
    const height = mat.length;
    const vec2 = vec1.map(v=>0);
    for(let i = 0; i < height; i++){
        let res = 0;
        for(let j = 0; j < width; j++){
            res += mat[i][j]*vec1[j];
        }
        vec2[i] = res;
    }
    return vec2;
};

export const matinv = function(mat){
    const width = mat.length;
    const mat2 = newarr(width).map(_=>newarr(width));
    const rows = [];
    for(let i = 0; i < width; i++){
        const row = [...mat[i]];
        for(let j = 0; j < width; j++){
            row.push(i==j?1:0);
        }
        rows.push(row);
    }
    //left to right
    for(let i = 0; i < width; i++){
        let max = -Infinity;
        let maxj = -1;
        for(let j = i; j < width; j++){
            const n = rows[j][i];
            if(n <= max)continue;
            max = n;
            maxj = j;
        }
        if(maxj === -1 || max === 0)throw new Error("Not invertible");
        const picked = rows[maxj];
        rows[maxj] = rows[i];
        rows[i] = picked;
        picked[i] = 1;
        for(let j = i+1; j < width*2; j++){
            picked[j] /= max;
        }
        for(let j = i+1; j < width; j++){
            const c = rows[j][i];
            if(c === 0)continue;
            rows[j][i] = 0;
            for(let k = i+1; k < width*2; k++){
                rows[j][k] = rows[j][k] - picked[k]*c;
            }
        }
    }
    //diagonalization complete
    //now make it into identity
    for(let i = 1; i < width; i++){
        const picked = rows[i];
        for(let j = 0; j < i; j++){
            const c = rows[j][i];
            rows[j][i] = 1;
            if(c === 0)continue;
            for(let k = i+1; k < width*2; k++){
                rows[j][k] = rows[j][k] - picked[k]*c;
            }
        }
    }
    //output
    const res = [];
    for(let i = 0; i < width; i++){
        res.push(rows[i].slice(width));
    }
    return res;
};



