import {repeatStr} from "./strutil.mjs";

class MinHeapBase{
	heap = [-Infinity];
	items = [null];
	inspect(highlight){
		console.log("----");
		let {heap} = this;
		let nrows = Math.ceil(Math.log(heap.length)/Math.log(2));
		for(let i = 0; i < nrows; i++){
			let row = repeatStr(" ",2**(nrows-i-1)-1);
			let st = 2**i;
			let ed = st+st;
			for(let j = st; j < ed && j < heap.length; j++){
				if(j === highlight)row += "\u001b[43;1m";
				row += heap[j];
				if(j === highlight)row += "\u001b[0m";
				row += repeatStr(" ",2**(nrows-i)-1);
			}
			console.log(row);
		}
		console.log("----");
	}
	isEmpty(){
		return this.heap.length === 1;
	}
};


export class MinHeap extends MinHeapBase{
	add(item,p){
		//add to the tail, and bubble up
		let {items,heap} = this;
		let idx = heap.length;
		while(idx > 0){
			let pidx = Math.floor(idx/2);
			if(heap[pidx] <= p){
				heap[idx] = p;
				items[idx] = item;
				return;
			}else{
				heap[idx] = heap[pidx];
				items[idx] = items[pidx];
			}
			idx = pidx;
		}
	}
	pop(){
		//remove element from the top, and insert the tail
		let {items,heap} = this;
		if(heap.length === 1)return undefined;
		let res = items[1];
		let item = items.pop();
		let p = heap.pop();
		if(heap.length === 1)return res;
		let idx = 1;
		while(idx*2 < heap.length){
			let cidx = idx*2;
			if(cidx+1 < heap.length && heap[cidx+1] < heap[cidx]){
				cidx = cidx+1;
			}
			if(heap[cidx] >= p){
				break;
			}
			heap[idx] = heap[cidx];
			items[idx] = items[cidx];
			idx = cidx;
		}
		heap[idx] = p;
		items[idx] = item;
		return res;
	}
};

//with decrease key operation
export class UpdatableMinHeap extends MinHeapBase{
	idxMap = new Map;
	bubbleUp(idx,item,p){
		//console.log("bubbling up");
		let {items,heap,idxMap} = this;
		while(idx > 0){
			//this.inspect(idx);
			let pidx = Math.floor(idx/2);
			if(heap[pidx] <= p){
				heap[idx] = p;
				items[idx] = item;
				idxMap.set(item,idx);
				break;
			}else{
				heap[idx] = heap[pidx];
				items[idx] = items[pidx];
				idxMap.set(items[idx],idx);
			}
			idx = pidx;
		}
		//this.inspect(idx);
	}
	bubbleDown(idx,item,p){
		//console.log("bubbling down");
		let {items,heap,idxMap} = this;
		while(idx*2 < heap.length){
			//this.inspect(idx)
			let cidx = idx*2;
			if(cidx+1 < heap.length && heap[cidx+1] < heap[cidx]){
				cidx = cidx+1;
			}
			if(heap[cidx] >= p){
				break;
			}
			heap[idx] = heap[cidx];
			items[idx] = items[cidx];
			idxMap.set(items[idx],idx);
			idx = cidx;
		}
		heap[idx] = p;
		items[idx] = item;
		idxMap.set(item,idx);
		//this.inspect(idx);
	}
	add(item,p){
		//console.log("adding", p);
		if(this.has(item)){
			return this.update(item,p);
		}
		this.bubbleUp(this.heap.length,item,p);
	}
	pop(){
		//console.log("popping");
		let {items,heap,idxMap} = this;
		if(heap.length === 1)return undefined;
		let res = items[1];
		let item = items.pop();
		let p = heap.pop();
		if(heap.length === 1)return res;
		this.bubbleDown(1,item,p);
		idxMap.delete(res);
		return res;
	}
	peek(){
		return this.heap[1];
	}
	delete(item0){
		//console.log("deleting");
		let {items,heap,idxMap} = this;
		let idx = idxMap.get(item0);
		if(!idx)return false;
		idxMap.delete(item0);
		if(idx+1 === heap.length){
			items.pop();
			heap.pop();
			return true;
		}
		let item = items.pop();
		let p = heap.pop();
		if(heap[Math.floor(idx/2)] > p){
			this.bubbleUp(idx,item,p);
		}else{
			this.bubbleDown(idx,item,p);
		}
	}
	replace(item0,item,p){
		//console.log("replacing");
		let {items,heap,idxMap} = this;
		let idx = idxMap.get(item0);
		if(!idx)return false;
		idxMap.delete(item0);
		if(heap[Math.floor(idx/2)] > p){
			this.bubbleUp(idx,item,p);
		}else{
			this.bubbleDown(idx,item,p);
		}
		return true;
	}
	update(item,p){
		//console.log("updating");
		let {items,heap,idxMap} = this;
		let idx = idxMap.get(item);
		if(!idx)return false;
		if(heap[Math.floor(idx/2)] > p){
			this.bubbleUp(idx,item,p);
		}else{
			this.bubbleDown(idx,item,p);
		}
		return true;
	}
	has(item){
		this.idxMap.has(item);
	}
};

//alias
UpdatableMinHeap.prototype.set = UpdatableMinHeap.prototype.add;



export class MaxHeap extends MinHeap{
    add(item,p){
	super.add(item,-p);
    }
}


