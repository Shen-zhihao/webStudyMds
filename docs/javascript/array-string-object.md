---
title: "数组、字符串、对象的常用方法"
sidebar_position: 3
---

# 对象:
##### 创建对象(引用类型)
```javascript
1、构造函数创建：
	var obj = new object();

2、字面量对象创建：
	{}表示创建对象，本质是new object();
	var obj = {键值对，键值对，键值对 };   //key默认是字符串，""可加可不加，包含原型链信息；

3、方法创建
  var obj = Object.create(null)     // 创建的对象不含原型链
```

##### 判断是否是object
```javascript
1、Object.prototype.toString.call(obj) === '[object Object]'
2、instanceof ：任何引用类型([]、{})  obj instanceof Object  -> true;
3、constructor:查看构造函数,返回构造函数名（除了Null、Undefined） arr.constructor.name ;  
              (返回构造函数) arr.constructor  obj.constructor === Object；
4、Object.getPrototypeOf(obj) === Object.prototype ；
```

##### 判断是否是空对象
```javascript
1、使用Object.keys()方法获取对象的所有键，并检查键的数量是否为0。如果键的数量为0，表示对象为空对象。
	function isEmptyObject(obj){
   	return Object.keys(obj).length === 0;
	}

2、使用JSON.stringify()方法将对象转换为字符串，并检查字符串的长度是否为2。如果字符串长度为2，表示对象为空对象。
	function isEmptyObject(obj){
   	return JSON.stringify(obj) === "{}";
	}

3、Reflect.ownKeys(obj) 返回目标对象自身的属性key组成的数组。
   Reflect.ownKeys(obj).length === 0   // 对象为空

4、以上方法都不适用于包含原型属性的对象，要判断一个对象是否为空对象，并且适用于包含原型属性的对象，可以使用以下方法：
	function isEmptyObject(obj){
  	 for(var key in obj) {
    	   if(obj.hasOwnProperty(key))
       	    return false;
   	}
   	return true;
	}
```

##### 对象的操作（读取、赋值、删除、转换）
```javascript
1、使用.操作符访问对象的属性
	obj.age

2、访问对象的属性[]
	obj['age'];   

3、删除对象的属性delete：
	delete obj.age;

4、对象转原始类型：
  调用了 Symbol.toPrimitive 方法，返回一个函数
```

##### 对象的方法
```javascript
1、Object.is:比较两个值是否相等：
    Object.is(value1,value2) // Object.is(NaN,NaN) -> true    Object.is({},{}) -> false

2、Object.assign:对象合并：
    Object.assign(target，obj1,obj2,)

3、取出对象的key（对象自有的可枚举属性，非定义在原型链上的）或值：
    const obj = { foo: 'bar', baz: 42 };
    obj.prototype.name = 'aaa';    // 无法用 Object.keys 获取

    //取出对象的key Object.keys
    Object.keys(obj)   => ["foo", "baz"]   

    //取出对象的值 Object.values
    Object.values(obj) => ["bar", 42]

4、Object.hasOwnProperty() ：key的判断；方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性（也就是，是否有指定的键）。 
   const object1 = {property1：42};
   console.log(object1.hasOwnProperty('property1'));

5、Object.hasOwn() ：检查某个对象自身是否拥有某个属性,接收两个参数，一个是对象，一个是属性(ES13)。 
   const object1 = {property1：42};
   console.log(Object.hasOwn(object1,'property1'));

6、Object.entries() ：返回键值对组成的数组；成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对数组。
     Object.entries(obj) => [ ["foo", "bar"], ["baz", 42] ]

7、Object.fromEntries() : 把键值对列表转换为一个对象，这个方法是和 Object.entries() 相对的。
  数组转换：
     Object.fromEntries([['foo', 1], ['bar', 2] ])    =>   {foo: 1, bar: 2}

8、Object.getPrototypeOf()：用于获取指定对象的原型（即 `[[Prototype]]` 属性的值）。
   Object.getPrototypeOf(obj) 可以获取对象 `obj` 的原型对象。

9、Object.defineProperty(obj, prop, desc) : 直接在一个对象上定义一个新属性，或者修改一个已经存在的属性;
																						obj :  第一个参数就是要在哪个对象身上添加或者修改属性
																						prop : 第二个参数就是添加或修改的属性名
                                            desc ： 配置项，一般是一个对象（value：当前值  get：读取时内部调用的函数  set：写入时内部调用的函数 enumerable：是否可以遍历  configurable：是否可再次修改配置项 writable：是否可重写）
   Object.defineProperty(Object.prototype,'sex',{
       value:"男",       //设置属性值
       enumerable:true,  //控制属性是否可以枚举，默认值是false
       writable:true,    //控制属性是否可以被修改，默认值是false
       configurable:true //控制属性是否可以被删除，默认值是false
       get(){}
       set(){}
    })

10、Object.getOwnPropertyDescriptor(obj,str):获取对象的属性描述符。
    Object.getOwnPropertyDescriptor({name:'aaa',age:18},'name');  // {value: 'aaa', writable: true, enumerable: true, configurable: true}

11、queryString快速转换为对象：
     const queryString = "?name=jimmy&age=18&height=1.88";
     const paramObj = Object.fromEntries(new URLSearchParams(queryString));
     console.log(paramObj);   =>   { name: 'jimmy', age: '18', height: '1.88' }

12、js对象转queryString:
	function objectToQueryString(obj) {
   	 const params = new URLSearchParams();
    	for (let key in obj) {
       	 if (obj.hasOwnProperty(key)) {
         	   params.append(key, obj[key]);
       	 }
    	}
   	 return params.toString();
	}
	const obj = { name: "John", age: 30, job: "developer" };
	const queryString = objectToQueryString(obj);
	console.log(queryString);     =>  "name=John&age=30&job=developer"
```

##### json字符串
```javascript
var str = '{"username":"lisi","age"= 18}';    //外层''，内层属性名(key)加"";

将json转化为字符串(JSON.stringify)：
  var str = JSON.stringify(obj);

将json字符串转化为json对象(JSON.parse)：
  var str = '{"username":"lisi","age"= 18}';
  var o2 = JSON.parse(str);
```

##### typeof 和 instance 区别
| 特性 | `typeof` | `instanceof` |
| --- | --- | --- |
| **用途** | 判断基本类型 | 判断对象是否为某构造函数的实例 |
| **能否识别**** **`**null**` | ❌ 返回 `"object"` | ❌ `null instanceof Object`→ 报错（null 不是对象） |
| **能否识别数组** | ❌ 返回 `"object"` | ✅ `arr instanceof Array`→ `true` |
| **能否识别函数** | ✅ 返回 `"function"` | ✅ `fn instanceof Function` → `true` |
| **跨窗口安全** | ✅ 安全 | ❌ 不安全 |
| **性能** | 极快（编译期可确定） | 较慢（需遍历原型链） |


# 数组: 
##### 数组的创建(引用类型)
```javascript
1、使用构造函数创建：
var arr = new Array(10);     //长度为10的空数组
var arr = Array.from({ length:10 }, (_, index) => index); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
2、使用字面量方式创建   []表示数组；
var arr3 = [];
var arr4['你好'，'再见']；
3、清空数组
arr.length = 0;
4、清除数组
arr = null;
```

##### 判断是否是数组
```javascript
const arr = [1,2,3]
数组自带：Array.isArray(arr)方法
数组原型：Array.prototype.isPrototypeOf(arr) === Array.prototype 方法
原型方法：Object.prototype.toString.call(arr) 方法
非严谨方法：arr instanceof Array
```

##### 遍历
```javascript
1、for循环
  for(i = 0;i<arr.length;i++){
    console.log(arr[i]);
  }   //正序遍历
2、for in 用来遍历对象（只能遍历可枚举属性，遍历对象的键，会遍历对象的原型链）：
遍历对象（无序存储）：
   for (var key in o){
    console.log(key , o[key]);
  }
遍历数组（有序存储）（空元素无法遍历，不建议使用for in 遍历数组，因为输出的顺序是不固定的）：
  for (var i in arr){
    console.log(arr[i]);
  }
3、for...of 是ES6的标准，该方法遍历的是对象的属性所对应的值(value：键值)，所以它用来遍历数组时得到每个元素的值：
for…of 语句在可迭代对象（包括 Array，Map，Set，String，TypedArray，arguments 对象等等）

4、for await...of （ES9，使用了for await...of ，外层需要async）
for await...of 语句创建一个循环，该循环遍历异步可迭代对象以及同步可迭代对象，包括：内置的String，Array，类似数组对象 (例如arguments或 NodeList)，TypedArray，Map，Set 和用户定义的异步/同步迭代器。它使用对象的每个不同属性的值调用要执行的语句来调用自定义迭代钩子。
```

##### 数组的常用API
```javascript
1、Array.prototype.push()：在数组尾部插入一个或多个元素,返回length；
	arr.push(1,2,[4]);   //不会展开数组

2、Array.prototype.pop():删除数组中最后一个元素并返回被删除的元素,如说是空数组返回undefined；
	arr.pop();

3、Array.prototype.concat():连接（合并）一个或多个数组；不改变原有数组而是新建数组；返回一个新数组；
	用Array.prototype.concat 复制的数组属于浅拷贝，第一层数组属于新建（深拷贝），内部嵌套的数组属于内存地址（浅拷贝）；

4、Array.prototype.join():将数组中每个元素都转换成字符串连接起来(toString),返回一个新字符串；
	arr.join([aeparator]):[aeparator]是分隔符，默认为 , (null和undefined没有toString方法，默认为空)；
	var str = arr.join();

5、Array.prototype.reverse():用于颠倒数组的所有参数，返回原数组；
	arr.reverse();

6、Array.prototype.sort():通过特定的规则给数组排序（默认转化为字符串按照Unicode编码排序），返回排序后的原数组；
  arr.sort(function (a, b) {
    return a - b;
  }); //升序
  arr.sort(function (a, b) {
    return b - a;
  }); //降序
  arr.sort(function () {
    return -1; //倒序排序
    return 1; //不变
  });
//按照对象的某个属性值的大小顺序进行排序（从小到大）
  list.sort(function (obj1, obj2) {
    let val1 = +obj1.relation_mark;
    let val2 = +obj2.relation_mark;
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  });

7、Array.prototype.shift():将数组的第一个元素移出数组，其他元素前移，长度减一，返回被删除的元素；

8、Array.prototype.unshift(value):在数组的头部插入元素，返回length；
  
9、Array.prototype.toString():将数组中所有的元素进行toString操作，返回一个新字符串；

10、Array.prototype.slice(start，end?):数组中截取一个片段，包含start不包含end；返回一个新数组，支持链式调用；
    start(number):开始索引，默认值为0；
    end(number)：结束索引，不写就是默认到最后一项;
    结果是新数组的浅拷贝；
    
11、Array.prototype.splice(start，deleteCount,value):删除数组中的元素（start处）修改原数组，返回值是所有被删除的元素组成的数组；
    start:开始索引；
    deleteCount ：删除步长；
    value：插入的元素；  

12、Array.prototype.indexOf():用于在数组中查找元素，如果找到元素则返回索引下标，如果没有返回-1；
   arr.indexOf(selectIndex,[fromIndex]):
   selectIndex:索引的元素；
   fromIndex:开始索引的位置；

   [2, 5, 9, 1, 5, 9, 2].indexOf(5);  // 输出: 1
    
13、 Array.prototype.forEach():遍历数组为每个数组执行回调函数，修改原数组；
     arr.forEach(function(val){
         //todo
    });   
    
14、Array.prototype.filter():用于在数组中进行检索，检查每一个元素是否符合给定布尔表达式的条件，将符合表达式的元素组成一个新数组；返回一个通过布尔表达式的元素组成的新数组；
   var newArr = arr.filter(function(val){    //val 为arr中的每一个参数
       return 布尔表达式;                 //返回满足表达式(true)的元素
   }): 
   
15、Array.prototype.map():数组的数据映射（遍历数组为每个数组执行回调函数；修改或操作数组中的元素）,返回一个修改后的新数组； 
    arr.map(function(val){
       //函数表达式
       return    ;
    }) 

16、Array.prototype.flatMap():与 map 方法和深度depth为1的flat几乎相同(map后Array.flat(1)）;
    
17、Array.prototype.reduce():归并、统计；返回归并结果是一个数组；
    arr.reduce(callback,object):
        object:传入到回调函数的对象；
        callback参数：默认值：prev：上一个   第一次被调用时，是数组的第一个元素；第二次调用时，是上一次的返回值；
                            next：下一个   始终是数组的下一个元素；
        存在参数object时：object
                            currentValue    
 		求和：var resule = arr.reduce(function(prev,next){return prev+next;})       
 		统计：var result = arr2.reduce(function (obj,cur){cur % 2? obj.odd++:obj.even++; return obj },{odd:0,even:0} )

18、Array.prototype.from(obj [,callback]):    将类数组转化为数组并操作，返回一个新数组；
    let arr = Array.from(a)
    Array.from({ length: 5 }, (v, i) => i)   // [0,1,2,3,4]
    
19、Array.prototype.of(value):              将一组数值转化为数组，返回一个新数组；  
    Array.of(1,2,[3,4],{id:5})               // [1,2,[3,4],{id:5}]

20、Array.prototype.copywithin(target, start, end):  将数组中的元素拷贝到其他位置，返回当前数组；
                                                    target:覆盖的起始索引  start:copy数据的起始索引  end:copy数据的结束索引。
    
21、Array.prototype.find(callback):         查找满足条件的第一个元素 

22、Array.prototype.findIndex(callback):    查找满足条件的第一个元素的索引

23、Array.prototype.includes('value'):      检查某个数组中是否包含某个值，返回一个布尔值

24、Array.prototype.at():                   接收一个整数值并返回该索引的项目，允许正数和负数;用于取出数组中的项。
   	Array.at(-1); 

25、 Array.prototype.flat()：   该方法可以按照指定的深度将多维数组展开，然后作为一个新数组返回，深度的默认值为 1。如果想要全部展开，只需传递一个 Infinity（无穷大）即可。  
     Array.flat(Infinity);

26、Array.prototype.findLast(callback):         查找满足条件的最后元素 

27、Array.prototype.findLastIndex(callback):    查找满足条件的最后元素的索引

28、Array.prototype.findLast(n => n)：          根据条件从数组的最后一个元素向前查找元素

29、Array.prototype.toReversed()                                
// toReversed() 是 reverse() 方法的非破坏性版本，该方法返回一个新数组，新数组的元素顺序与原数组相反。
// 方法实现:
  if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
      return this.slice().reverse();
    };
  }

30、Array.prototype.toSorted(compareFn)                         
// toSorted() 是 sort() 方法的非破坏性版本，该方法返回一个新数组，新数组的元素是原数组元素的排序结果。
// 方法实现:
  if (!Array.prototype.toSorted) {
    Array.prototype.toSorted = function (compareFn) {
      return this.slice().sort(compareFn);
    };
  }

31、Array.prototype.toSpliced(start, deleteCount, ...items)     
// toSpliced 是 splice() 方法的非破坏性版本，该方法返回一个新数组（它会返回更新后的数组，原数组不会变化，并且我们无法再得到已经删除的元素）。
// 方法实现:
  if (!Array.prototype.toSpliced) {
    Array.prototype.toSpliced = function (start, deleteCount, ...items) {
      const copy = this.slice();
      copy.splice(start, deleteCount, ...items);
      return copy;
    };
  }

32、Array.prototype.with(index, value)                          
// 它是 arr[index] = value 的非破坏性版本，该方法不修改原数组，返回一个新数组，新数组在指定索引位置的元素被替换为指定值。
// 方法实现:
  if (!Array.prototype.with) {
    Array.prototype.with = function (index, value) {
      const copy = this.slice();
      copy[index] = value;
      return copy;
    };
  }

33、Array.prototype.some(callback(currentValue,index,arr),thisValue) // 该方法用于检测数组中的元素是否满足指定条件（函数提供）；不会对空数组进行检测； 不会改变原始数组。

  const numbers = [1, 3, 5, 8, 9];
  const hasEvenNumber = numbers.some(element => element % 2 === 0);
  console.log(hasEvenNumber); // 输出: true

  const obj = {
    even: 2,
    odd: 3,
    check: function() {
      return this.even % 2 === 0;
    }
  }; 
  const numbers = [1, 3, 5, obj.even, 9]; 
  const hasEvenNumber = numbers.some(function(element) {
    return this.check();
  }, obj);
  console.log(hasEvenNumber); // 输出: true


34、 Array.prototype.fill(value, start, end)                   // 该方法用于将一个固定值替换数组的元素，直接修改原数组
                                                                	value 必需。填充的值。
																																	start 可选。开始填充位置。
																																	end 可选。停止填充位置 (默认为 array.length)
	let arr1 = [1, 2, 3, 4, 56, 7, 7, 8, 9];
	arr1.fill(4, 2, 5);          //   [1, 2, 4, 4, 4, 7, 7, 8, 9]

35、Array.prototype.groupBy()：  该方法将一个数组按照某个属性进行分组,返回一个新数组
    // Object.groupBy(data,callback)
  	const people = [  { name: 'Alice', age: 20 },  { name: 'Bob', age: 25 },  { name: 'Charlie', age: 30 }];
		const groups = people.groupBy(p => p.age);
  	// { 20: [{ name: 'Alice', age: 20 }], 25: [{ name: 'Bob', age: 25 }], 30: [{ name: 'Charlie', age: 30 }] }

```

# 字符串：
##### 字符串的不可变性:
字符串在创建后是不可变的，每次对字符串进行操作，都会返回一个新的字符串。

##### 常用Api
```javascript
1、String.prototype.charAt():在字符串中获取指定索引的字符；返回一个字符；
    str.charAt(index)
    
2、String.prototype.charCodeAt():返回字符串中指定索引字符对应的Unicode编码；返回一个Unicode编码；
    str.charCodeAt(index) 
    数字48-57；大写字母：65-90；小写字母：97-122；
   String.prototype.fromCharCode(unicode) :返回Unicode对应的字符；
   
3、String.prototype.concat() ：将所有字符连接起来；返回一个新字符串；
    str.concat(value)
    
4、String.prototype.indexOf():在str中查找匹配的字符串；返回第一个满足条件的索引值或-1；
    str.indexOf(searchstr,fromindex):
    searchstr：需要在字符串中查找的字符串；
    fromindex：开始查找的位置；
     
5、 String.prototype.lastIndexOf():用于在字符串中从后向前查找字符串；返回第一个满足条件的索引值或-1；
    str.lastIndexOf(searchstr,fromindex):
    searchstr：需要在字符串中查找的字符串；
    fromindex：开始查找的位置；
    
6、 String.prototype.slice():截取字符串中的字符串片段(索引可以为负数)；返回一个新字符串；如果没有截取到字符串返回空字符串；
    str.slice(start,end):包含start,不包含end；

7、  String.prototype.split():将字符串用指定的分离器切割成多个字符串；返回所有字符串组成的新数组；
     str.split(sep): 
     sep:分离器，用于切割字符串  
     var mail = 'nihao@qq.com';
     var str = mail.split('@');

8、String.prototype.substr():用于在字符串中截取字符串，从start开始；返回一个新字符串；
    str.substr(start,length):
    start：开始索引；
    length：长度；     
    
9、String.prototype.substring():用于在字符串中截取片段；返回一个新字符串；
    str.substring(start,end):包含start,不包含end；
                             当start>end时，自动交换两个参数位置；当参数<0或非数字时，当做0；
    start：开始索引； 
    end:结束索引；   
   
10、String.prototype.toUpperCase()：转大写
   String.prototype.toLowerCase() ：转小写      

11、 String.prototype.at():方法接收一个整数值并返回该索引的项目，允许正数和负数;用于取出字符串中的项。 

12、String.prototype.trim() ：去除字符串前后空格。

13、String.prototype.padStart(): 字符串补全长度,从头部开始，返回一个新的字符串，支持链式调用。
   String.prototype.padStart(10,'*')  =>  从头开始处用* 补齐10位

14、String.prototype.padEnd(): 字符串补全长度,从尾部开始，返回一个新的字符串，支持链式调用。
   String.prototype.padEnd(10,'*')  =>  从尾开始处用* 补齐10位

15、String.prototype.trimStart()：方法从字符串的开头删除空格，trimLeft()是此方法的别名。

16、String.prototype.trimEnd()：方法从一个字符串的右端移除空白字符，trimRight()是此方法的别名。

17、String.prototype.replaceAll()：新字符串中所有满足 pattern 的部分都会被replacement 替换；返回一个新字符串；原始字符串保持不变。
  'aabbcc'.replaceAll('b', '.');  =>  'aa..cc'
```

# 深浅拷贝:
##### 对象的浅拷贝
```javascript
1、const obj2 = Object.assign({},obj1)      //相当于对象合并,新增的对象方法     
2、const obj2 = {...obj1}                   //展开运算,对于第一层是深拷贝，往下是浅拷贝

const obj = {a:1,b:2}
const obj2 = {...obj}
obj2.a = 3;
console.log(obj,obj2)    //  {a:1,b:2}   {a:3,b:2}

const obj = {obj2:{a:1,b:2}}
const obj3 = {...obj}
obj3.obj2.a = 3;
console.log(obj,obj3)  // {obj2:{a:3,b:2}}  {obj2:{a:3,b:2}}
```

##### 数组的拷贝
```javascript
concat方法 和 展开运算 对于一维数组基本类型是深拷贝，对于二维数组是浅拷贝；

const arr2 = [].concat(arr1);           //数组合并
const arr2 = [...arr1];                 //数组展开
```

##### ES6新增深拷贝方法 structuredClone()
```javascript
适用于：
1、克隆无限嵌套的对象和数组
2、克隆循环引用
3、克隆各种 JavaScript 类型，例如 Date 、 Set 、 Map 、 RegExp 、Error、 ArrayBuffer 、 Blob 、 File 、 ImageData 等等
4、转移任何可转移对象

const original = {
    a: 1,
    b: { c: 2 },
    d: [3, 4],
    e: new Date(),
    f: new Map([['key', 'value']])
};

const clone = structuredClone(original);

需要注意的是，structuredClone() 并不支持所有类型，例如 Symbol 对象、Function 对象、DOM以及其他一些不可序列化的对象就不能被复制。
```

##### 对象的深拷贝
```javascript
// 只能处理基本对象、数组和原子类型。任何其他类型都可以以难以预测的方式处理
const obj2 = JSON.parse(JSON.stringify(obj1)) 
```

##### 循环遍历深拷贝
```javascript
// 不考虑循环引用的基本写法
function deepCopy(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] && typeof obj[key] === 'object') {
        newobj[key] = deepCopy(obj[key]);
      } else {
        newobj[key] = obj[key];
      }
    }
  }
  return newobj;
}


// 使用递归的方式来拷贝正则表达式。以下是一个示例代码：
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  let clone = Array.isArray(obj) ? [] : {};
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
}

通过递归的方式，我们检查对象的每个属性值。如果属性值是正则表达式，我们通过创建一个新的正则表达式对象来进行深拷贝。
对于其他类型的属性值，我们继续递归调用 `deepClone` 函数来进行深拷贝。
```

##### 深拷贝解决对象的循环引用
```javascript
核心思路：可以使用递归实现深拷贝，并使用一个Map来记录已经拷贝过的对象，避免循环引用的问题。
function deepClone(value) {
  const cache = new Map();
  function _deepClone(value) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    if (cache.has(value)) {
      return cache.get(value);
    }
    const result = Array.isArray(value) ? [] : {};
    cache.set(value, result);
    for (const key in value) {
      result[key] = _deepClone(value[key]);
    }
    return result;
  }
  return _deepClone(value);
}
```

##### 深拷贝高级用法解决循环引用
```javascript
function deepClone(obj) {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel(); // 通信
    port1.postMessage(obj);
    port2.onmessage = (msg) => {
      resolve(msg.data);
    }
  })
}
const obj2 = await deepClone({'a':1,'b':2});
```

