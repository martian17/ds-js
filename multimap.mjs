import {arrcpy} from "./arrutil.mjs";
import {rand32,shiftCombine32} from "./bitutil.mjs";
import {newMapTally,mapeq} from "./maputil.mjs";

class MultiMap{
    map = new Map;
    own = Symbol();// unique value that doesn't collide
    set(){
        let lst = [...arguments];
        let val = lst.pop();
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new Map);
            map = map.get(k);
        }
        map.set(this.own,val);// to avoid collision between the same level
        return val;
    }
    get(...lst){
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return undefined;
            map = map.get(k);
        }
        return map.get(this.own);
    }
    has(...lst){
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
        }
        return map.has(this.own);
    }
    delete(...lst){
        let map = this.map;
        let maps = [[null,map]];
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
            maps.push([k,map]);
        }
        let ret = map.delete(this.own);
        for(let i = maps.length-1; i > 0; i--){
            if(maps[i][1].size === 0){
                maps[i-1][1].delete(maps[i][0]);
            }else{
                break;
            }
        }
        return ret;
    }
    
    *iterator(){
        let keys = [];
        let own = this.own;
        let traverse = function*(map){
            for(let [key,val] of map){shiftCombine32
                if(key === own){
                    let res = arrcpy(keys);
                    res.push(val);
                    yield res;
                }else{
                    keys.push(key);
                    yield* traverse(val);
                    keys.pop();
                }
            }
        }
        yield* traverse(this.map);
    }
    [Symbol.iterator](){
        return this.iterator();
    }
};






export class OrderAgnosticMultiMap{
    hashes = new Map;
    uses = new Map;
    contentMap = new Map;
    
    //sum of all hashes
    createMush(tally){
        let {hashes} = this;
        let mush = 0;
        for(let [obj,cnt] of tally){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                hash = rand32();
                hashes.set(obj,hash);
            }
            mush ^= shiftCombine32(hash,cnt);
        }
        return mush;
    }
    
    getMush(tally){//[mush,err]
        let {contentMap,hashes} = this;
        let mush = 0;
        for(let [obj,cnt] of tally){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                return [0,true];
            }
            mush ^= shiftCombine32(hash,cnt);
        }
        if(!contentMap.has(mush)){
            return [0,true];
        }
        return [mush,false];
    }
    
    getBucket(tally){
        let [mush,err] = this.getMush(tally);
        if(err){
            return null;
        }
        return this.contentMap.get(mush);
    }
    
    incrementUses(tally){
        let {uses} = this;
        for(let [obj,cnt] of tally){
            if(uses.has(obj)){
                uses.set(obj,uses.get(obj)+1);
            }else{
                uses.set(obj,1);
            }
        }
    }
    
    hasHashes(tally){
        let {hashes} = this;
        for(let [obj] of tally){
            if(!hashes.has(obj)){
                return false;
            }
        }
        return true;
    }
    
    decrementUses(tally){
        let {uses,hashes} = this;
        for(let [obj,cnt] of tally){
            if(uses.has(obj)){
                let cnt = uses.get(obj)-1;
                if(cnt === 0){
                    //deletion is important to prevent memory leak
                    uses.delete(obj);
                    hashes.delete(obj);
                }else{
                    uses.set(obj,cnt);
                }
            }else{
                throw new Error("trying to decrement cnt for object that DNE");
            }
        }
    }
    
    set(){
        let {contentMap} = this;
        let lst = [...arguments];
        let val = lst.pop();
        let tally = newMapTally(lst);
        let mush = this.createMush(tally);
        let bucket;
        if(contentMap.has(mush)){
            bucket = contentMap.get(mush);
        }else{
            bucket = [];
            contentMap.set(mush,bucket);
        }
        for(let slot of bucket){
            let [tally1] = slot;
            if(mapeq(tally,tally1)){
                slot[1] = val;
                return;
            }
        }
        //if no match is found in the bucket
        this.incrementUses(tally);
        bucket.push([tally,val]);
    }
    
    get(...lst){
        let tally = newMapTally(lst);
        let bucket = this.getBucket(tally);
        if(bucket === null){
            return undefined;
        }
        //find the match in the bucket
        for(let [tally1,val] of bucket){
            if(mapeq(tally,tally1))return val;
        }
        return undefined;
    }
    
    has(...lst){
        let tally = newMapTally(lst);
        let bucket = this.getBucket(tally);
        if(bucket === null){
            return undefined;
        }
        //find the match in the bucket
        for(let [tally1,val] of bucket){
            if(mapeq(tally,tally1))return true;
        }
        return undefined;
    }
    
    delete(...lst){
        let {contentMap} = this;
        let tally = newMapTally(lst);
        let [mush,err] = this.getMush(tally);
        if(err)return false;
        let bucket = contentMap.get(mush);
        //find the match in the bucket
        for(let i = 0; i < bucket.length; i++){
            let [tally1,val] = bucket[i];
            if(mapeq(tally,tally1)){
                if(bucket.length === 1){
                    contentMap.delete(mush);
                }else{
                    bucket.splice(i,1);
                }
                this.decrementUses(tally);
                return true;
            }
        }
        return false;
    }
    
    *iterator(){
        for(let [_,bucket] of this.contentMap){
            for(let pair of bucket){//pair == [tally,value]
                yield pair;
            }
        }
    }
    [Symbol.iterator](){
        return this.iterator();
    }
};

