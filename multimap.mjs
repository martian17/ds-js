import {arrcpy,arreq} from "./arrutil.mjs";
import {rand32,shiftCombine32} from "./bitutil.mjs";
import {newMapTally,mapeq} from "./maputil.mjs";

export class MultiMap{
    map = new Map;
    own = Symbol();// unique value that doesn't collide
    size = 0;
    set(){
        let lst = [...arguments];
        let val = lst.pop();
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new Map);
            map = map.get(k);
        }
        if(!map.has(this.own))this.size++;
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
		if(ret)this.size--;
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


export class MultiMapAlpha{
    hashes = new Map;
    uses = new Map;
    contentMap = new Map;
    size = 0;
    
    //sum of all hashes
    createMush(lst){
        let {hashes} = this;
        let mush = 0;
        for(let obj of lst){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                hash = rand32();
                hashes.set(obj,hash);
            }
            mush = shiftCombine32(mush,hash);
        }
        return mush;
    }
    
    getMush(lst){//[mush,err]
        let {contentMap,hashes} = this;
        let mush = 0;
        for(let obj of lst){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                return [0,true];
            }
            mush = shiftCombine32(mush,hash);
        }
        if(!contentMap.has(mush)){
            return [0,true];
        }
        return [mush,false];
    }
    
    getBucket(lst){
        let [mush,err] = this.getMush(lst);
        if(err){
            return null;
        }
        return this.contentMap.get(mush);
    }
    
    incrementUses(lst){
        let {uses} = this;
        for(let obj of lst){
            if(uses.has(obj)){
                uses.set(obj,uses.get(obj)+1);
            }else{
                uses.set(obj,1);
            }
        }
    }
    
    hasHashes(lst){
        let {hashes} = this;
        for(let obj of lst){
            if(!hashes.has(obj)){
                return false;
            }
        }
        return true;
    }
    
    decrementUses(lst){
        let {uses,hashes} = this;
        for(let obj of lst){
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
    
    set(...lst){
        let {contentMap} = this;
        let val = lst.pop();
        let mush = this.createMush(lst);
        let bucket;
        if(contentMap.has(mush)){
            bucket = contentMap.get(mush);
        }else{
            bucket = [];
            contentMap.set(mush,bucket);
        }
        for(let slot of bucket){
            let [lst1] = slot;
            if(arreq(lst,lst1)){
                slot[1] = val;
                return val;
            }
        }
        //if no match is found in the bucket
        this.size++;
		this.incrementUses(lst);
        bucket.push([lst,val]);
        return val;
    }
    
    get(...lst){
        let bucket = this.getBucket(lst);
        if(bucket === null){
            return undefined;
        }
        //find the match in the bucket
        for(let [lst1,val] of bucket){
            if(arreq(lst,lst1))return val;
        }
        return undefined;
    }
    
    has(...lst){
        let bucket = this.getBucket(lst);
        if(bucket === null){
            return false;
        }
        //find the match in the bucket
        for(let [lst1,val] of bucket){
            if(arreq(lst,lst1))return true;
        }
        return false;
    }
    
    delete(...lst){
        let {contentMap} = this;
        let [mush,err] = this.getMush(lst);
        if(err)return false;
        let bucket = contentMap.get(mush);
        //find the match in the bucket
        for(let i = 0; i < bucket.length; i++){
            let [lst1,val] = bucket[i];
            if(arreq(lst,lst1)){
                if(bucket.length === 1){
                    contentMap.delete(mush);
                }else{
                    bucket.splice(i,1);
                }
				this.size--;
                this.decrementUses(lst);
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
}





export class OrderAgnosticMultiMap{
    hashes = new Map;
    uses = new Map;
    contentMap = new Map;
    size = 0;

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
                return val;
            }
        }
        //if no match is found in the bucket
        this.size++;
		this.incrementUses(tally);
        bucket.push([tally,val]);
        return val
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
            return false;
        }
        //find the match in the bucket
        for(let [tally1,val] of bucket){
            if(mapeq(tally,tally1))return true;
        }
        return false;
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
				this.size--;
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

class MultiWeakMap extends MultiMap{
    map = new WeakMap;
    set(){
        let lst = [...arguments];
        let val = lst.pop();
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new WeakMap);
            map = map.get(k);
        }
        if(!map.has(this.own))this.size++;
		map.set(this.own,val);// to avoid collision between the same level
        return val;
    }
}


