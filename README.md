# ds-js

Documentation is in WIP

## Usage
clone this repository to your project, and import necessary files as modules

## Modules
### multimap.mjs
#### multimap::MultiMap
```js
import {MultiMap} from "./ds-js/multimap.mjs";

let mm = new MultiMap;

let a = {a:"a"};
let b = {b:"b"};
let c = {c:"c"};

//basic operations
console.log(mm.set(a,b,c,"abc"));// "abc"
console.log(mm.get(a,b,c));// "abc"
console.log(mm.has(a,b,c));// true
console.log(mm.delete(a,b,c));// true

// overlapping keys can be handled fine as well
mm.set(a,b,"ab");
mm.set(a,"a");
console.log(mm.get(a,b));// "ab"
console.log(mm.get(a));// "a"
```

#### multimap::OrderAgnosticMultiMap
```js
import {OrderAgnosticMultiMap} from "./ds-js/multimap.mjs";

let mm = new OrderAgnosticMultiMap();

let a = {a:"a"};
let b = {b:"b"};
let c = {c:"c"};

mm.set(a,b,c,"abc");
mm.set(c,a,c,"cac");
mm.set(c,a,b,"cab");

for(let [tally,val] of mm){
    //key will be expressed as tallies of key objects
    console.log(tally,val);
}
//output
//Map(3) {{a:"a"} => 1, {b:"b"} => 1, {c:"c"} => 1} 'cab'
//Map(2) {{c:"c"} => 2, {a:"a"} => 1, } 'cac'
```
