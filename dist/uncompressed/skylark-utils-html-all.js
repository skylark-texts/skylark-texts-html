/**
 * skylark-utils-html - The html features enhancement for skylark utils.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                exports: null
            };
            require(id);
        } else {
            map[id] = factory;
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.exports) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(window, args);
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-langx/skylark',[], function() {
    var skylark = {

    };
    return skylark;
});

define('skylark-utils/skylark',["skylark-langx/skylark"], function(skylark) {
    return skylark;
});

define('skylark-utils-html/html',[
    "skylark-utils/skylark"
], function(skylark) {
	return skylark.html = skylark.html || {};
});
define('skylark-utils-dom/skylark',["skylark-langx/skylark"], function(skylark) {
    return skylark;
});

define('skylark-langx/types',[
],function(){
    var type = (function() {
        var class2type = {};

        // Populate the class2type map
        "Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function(name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        return function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object";
        };
    })();

    function isArray(object) {
        return object && object.constructor === Array;
    }

    function isArrayLike(obj) {
        return !isString(obj) && !isHtmlNode(obj) && typeof obj.length == 'number' && !isFunction(obj);
    }

    function isBoolean(obj) {
        return typeof(obj) === "boolean";
    }

    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }

    function isEmptyObject(obj) {
        var name;
        for (name in obj) {
            if (obj[name] !== null) {
                return false;
            }
        }
        return true;
    }

    function isFunction(value) {
        return type(value) == "function";
    }

    function isHtmlNode(obj) {
        return obj && (obj instanceof Node);
    }

    function isInstanceOf( /*Object*/ value, /*Type*/ type) {
        //Tests whether the value is an instance of a type.
        if (value === undefined) {
            return false;
        } else if (value === null || type == Object) {
            return true;
        } else if (typeof value === "number") {
            return type === Number;
        } else if (typeof value === "string") {
            return type === String;
        } else if (typeof value === "boolean") {
            return type === Boolean;
        } else if (typeof value === "string") {
            return type === String;
        } else {
            return (value instanceof type) || (value && value.isInstanceOf ? value.isInstanceOf(type) : false);
        }
    }

    function isNumber(obj) {
        return typeof obj == 'number';
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isWindow(obj) {
        return obj && obj == obj.window;
    }

    function isSameOrigin(href) {
        if (href) {
            var origin = location.protocol + '//' + location.hostname;
            if (location.port) {
                origin += ':' + location.port;
            }
            return href.startsWith(origin);
        }
    }

    return {

        isArray: isArray,

        isArrayLike: isArrayLike,

        isBoolean: isBoolean,

        isDefined: isDefined,

        isDocument: isDocument,

        isEmptyObject: isEmptyObject,

        isFunction: isFunction,

        isHtmlNode: isHtmlNode,

        isNumber: isNumber,

        isObject: isObject,

        isPlainObject: isPlainObject,

        isString: isString,

        isSameOrigin: isSameOrigin,

        isWindow: isWindow,

        type: type
    };

});
define('skylark-langx/arrays',[
	"./types"
],function(types){
	var filter = Array.prototype.filter,
		isArrayLike = types.isArrayLike;

    function compact(array) {
        return filter.call(array, function(item) {
            return item != null;
        });
    }

    function each(obj, callback) {
        var length, key, i, undef, value;

        if (obj) {
            length = obj.length;

            if (length === undef) {
                // Loop object items
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        value = obj[key];
                        if (callback.call(value, key, value) === false) {
                            break;
                        }
                    }
                }
            } else {
                // Loop array items
                for (i = 0; i < length; i++) {
                    value = obj[i];
                    if (callback.call(value, i, value) === false) {
                        break;
                    }
                }
            }
        }

        return this;
    }

    function flatten(array) {
        if (isArrayLike(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (isArrayLike(item)) {
                    for (var j = 0; j < item.length; j++) {
                        result.push(item[j]);
                    }
                } else {
                    result.push(item);
                }
            }
            return result;
        } else {
            return array;
        }
        //return array.length > 0 ? concat.apply([], array) : array;
    }

    function grep(array, callback) {
        var out = [];

        each(array, function(i, item) {
            if (callback(item, i)) {
                out.push(item);
            }
        });

        return out;
    }

    function inArray(item, array) {
        if (!array) {
            return -1;
        }
        var i;

        if (array.indexOf) {
            return array.indexOf(item);
        }

        i = array.length;
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    }

    function makeArray(obj, offset, startWith) {
       if (isArrayLike(obj) ) {
        return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
      }

      // array of single index
      return [ obj ];             
    }

    function map(elements, callback) {
        var value, values = [],
            i, key
        if (isArrayLike(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback.call(elements[i], elements[i], i);
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback.call(elements[key], elements[key], key);
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    function uniq(array) {
        return filter.call(array, function(item, idx) {
            return array.indexOf(item) == idx;
        })
    }

    return {
        compact: compact,

        first : function(items,n) {
            if (n) {
                return items.slice(0,n);
            } else {
                return items[0];
            }
        },

	    each: each,

        flatten: flatten,

        inArray: inArray,

        makeArray: makeArray,

        map : map,
        
        uniq : uniq

    }
});
define('skylark-langx/objects',[
	"./types"
],function(types){
	var hasOwnProperty = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        isBoolean = types.isBoolean,
        isFunction = types.isFunction,
		isObject = types.isObject,
		isPlainObject = types.isPlainObject,
		isArray = types.isArray;

     // An internal function for creating assigner functions.
    function createAssigner(keysFunc, defaults) {
        return function(obj) {
          var length = arguments.length;
          if (defaults) obj = Object(obj);  
          if (length < 2 || obj == null) return obj;
          for (var index = 1; index < length; index++) {
            var source = arguments[index],
                keys = keysFunc(source),
                l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (!defaults || obj[key] === void 0) obj[key] = source[key];
            }
          }
          return obj;
       };
    }

    // Internal recursive comparison function for `isEqual`.
    var eq, deepEq;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

    eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null) return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    deepEq = function(a, b, aStack, bStack) {
        // Unwrap any wrapped objects.
        //if (a instanceof _) a = a._wrapped;
        //if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = Object.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (Object.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(b[key]!==undefined && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Retrieve all the property names of an object.
    function allKeys(obj) {
        if (!isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`.
    function keys(obj) {
        if (isObject(obj)) return [];
        var keys = [];
        for (var key in obj) if (has(obj, key)) keys.push(key);
        return keys;
    }

    function has(obj, path) {
        if (!isArray(path)) {
            return obj != null && hasOwnProperty.call(obj, path);
        }
        var length = path.length;
        for (var i = 0; i < length; i++) {
            var key = path[i];
            if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
            }
            obj = obj[key];
        }
        return !!length;
    }

   // Perform a deep comparison to check if two objects are equal.
    function isEqual(a, b) {
        return eq(a, b);
    }

    // Returns whether an object has a given set of `key:value` pairs.
    function isMatch(object, attrs) {
        var keys = keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
          var key = keys[i];
          if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    }    

    function _mixin(target, source, deep, safe) {
        for (var key in source) {
            //if (!source.hasOwnProperty(key)) {
            //    continue;
            //}
            if (safe && target[key] !== undefined) {
                continue;
            }
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                _mixin(target[key], source[key], deep, safe);
            } else if (source[key] !== undefined) {
                target[key] = source[key]
            }
        }
        return target;
    }

    function _parseMixinArgs(args) {
        var params = slice.call(arguments, 0),
            target = params.shift(),
            deep = false;
        if (isBoolean(params[params.length - 1])) {
            deep = params.pop();
        }

        return {
            target: target,
            sources: params,
            deep: deep
        };
    }

    function mixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, false);
        });
        return args.target;
    }

    function removeItem(items, item) {
        if (isArray(items)) {
            var idx = items.indexOf(item);
            if (idx != -1) {
                items.splice(idx, 1);
            }
        } else if (isPlainObject(items)) {
            for (var key in items) {
                if (items[key] == item) {
                    delete items[key];
                    break;
                }
            }
        }

        return this;
    }

    function result(obj, path, fallback) {
        if (!isArray(path)) {
            path = [path]
        };
        var length = path.length;
        if (!length) {
          return isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        for (var i = 0; i < length; i++) {
          var prop = obj == null ? void 0 : obj[path[i]];
          if (prop === void 0) {
            prop = fallback;
            i = length; // Ensure we don't continue iterating.
          }
          obj = isFunction(prop) ? prop.call(obj) : prop;
        }

        return obj;
    }

    function safeMixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, true);
        });
        return args.target;
    }

    // Retrieve the values of an object's properties.
    function values(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    }


    
    function clone( /*anything*/ src,checkCloneMethod) {
        var copy;
        if (src === undefined || src === null) {
            copy = src;
        } else if (checkCloneMethod && src.clone) {
            copy = src.clone();
        } else if (isArray(src)) {
            copy = [];
            for (var i = 0; i < src.length; i++) {
                copy.push(clone(src[i]));
            }
        } else if (isPlainObject(src)) {
            copy = {};
            for (var key in src) {
                copy[key] = clone(src[key]);
            }
        } else {
            copy = src;
        }

        return copy;

    }

    return {
        allKeys: allKeys,

        clone: clone,

        defaults : createAssigner(allKeys, true),

        has: has,

        isEqual: isEqual,

        isMatch: isMatch,

        keys: keys,

        mixin: mixin,

        removeItem: removeItem,

        result : result,
        
        safeMixin: safeMixin,

        values: values
    };

});
define('skylark-langx/klass',[
    "./arrays",
    "./objects",
    "./types"
],function(arrays,objects,types){
    var uniq = arrays.uniq,
        has = objects.has,
        mixin = objects.mixin,
        isArray = types.isArray,
        isDefined = types.isDefined;
    
    function inherit(ctor, base) {
        var f = function() {};
        f.prototype = base.prototype;

        ctor.prototype = new f();
    }


    var f1 = function() {
        function extendClass(ctor, props, options) {
            // Copy the properties to the prototype of the class.
            var proto = ctor.prototype,
                _super = ctor.superclass.prototype,
                noOverrided = options && options.noOverrided;

            for (var name in props) {
                if (name === "constructor") {
                    continue;
                }

                // Check if we're overwriting an existing function
                var prop = props[name];
                if (typeof props[name] == "function") {
                    proto[name] =  !prop._constructor && !noOverrided && typeof _super[name] == "function" ?
                          (function(name, fn, superFn) {
                            return function() {
                                var tmp = this.overrided;

                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this.overrided = superFn;

                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);

                                this.overrided = tmp;

                                return ret;
                            };
                        })(name, prop, _super[name]) :
                        prop;
                } else if (typeof prop == "object" && prop!==null && (prop.get)) {
                    Object.defineProperty(proto,name,prop);
                } else {
                    proto[name] = prop;
                }
            }
            return ctor;
        }

        function serialMixins(ctor,mixins) {
            var result = [];

            mixins.forEach(function(mixin){
                if (has(mixin,"__mixins__")) {
                     throw new Error("nested mixins");
                }
                var clss = [];
                while (mixin) {
                    clss.unshift(mixin);
                    mixin = mixin.superclass;
                }
                result = result.concat(clss);
            });

            result = uniq(result);

            result = result.filter(function(mixin){
                var cls = ctor;
                while (cls) {
                    if (mixin === cls) {
                        return false;
                    }
                    if (has(cls,"__mixins__")) {
                        var clsMixines = cls["__mixins__"];
                        for (var i=0; i<clsMixines.length;i++) {
                            if (clsMixines[i]===mixin) {
                                return false;
                            }
                        }
                    }
                    cls = cls.superclass;
                }
                return true;
            });

            if (result.length>0) {
                return result;
            } else {
                return false;
            }
        }

        function mergeMixins(ctor,mixins) {
            var newCtor =ctor;
            for (var i=0;i<mixins.length;i++) {
                var xtor = new Function();
                xtor.prototype = Object.create(newCtor.prototype);
                xtor.__proto__ = newCtor;
                xtor.superclass = null;
                mixin(xtor.prototype,mixins[i].prototype);
                xtor.prototype.__mixin__ = mixins[i];
                newCtor = xtor;
            }

            return newCtor;
        }

        return function createClass(props, parent, mixins,options) {
            if (isArray(parent)) {
                options = mixins;
                mixins = parent;
                parent = null;
            }
            parent = parent || Object;

            if (isDefined(mixins) && !isArray(mixins)) {
                options = mixins;
                mixins = false;
            }

            var innerParent = parent;

            if (mixins) {
                mixins = serialMixins(innerParent,mixins);
            }

            if (mixins) {
                innerParent = mergeMixins(innerParent,mixins);
            }


            var _constructor = props.constructor;
            if (_constructor === Object) {
                _constructor = function() {
                    if (this.init) {
                        return this.init.apply(this, arguments);
                    }
                };
            };

            var klassName = props.klassName || "",
                ctor = new Function(
                    "return function " + klassName + "() {" +
                    "var inst = this," +
                    " ctor = arguments.callee;" +
                    "if (!(inst instanceof ctor)) {" +
                    "inst = Object.create(ctor.prototype);" +
                    "}" +
                    "return ctor._constructor.apply(inst, arguments) || inst;" + 
                    "}"
                )();


            ctor._constructor = _constructor;
            // Populate our constructed prototype object
            ctor.prototype = Object.create(innerParent.prototype);

            // Enforce the constructor to be what we expect
            ctor.prototype.constructor = ctor;
            ctor.superclass = parent;

            // And make this class extendable
            ctor.__proto__ = innerParent;

            if (mixins) {
                ctor.__mixins__ = mixins;
            }

            if (!ctor.partial) {
                ctor.partial = function(props, options) {
                    return extendClass(this, props, options);
                };
            }
            if (!ctor.inherit) {
                ctor.inherit = function(props, mixins,options) {
                    return createClass(props, this, mixins,options);
                };
            }

            ctor.partial(props, options);

            return ctor;
        };
    }

    var createClass = f1();

    return createClass;
});
define('skylark-langx/ArrayStore',[
    "./klass"
],function(klass){
    var SimpleQueryEngine = function(query, options){
        // summary:
        //      Simple query engine that matches using filter functions, named filter
        //      functions or objects by name-value on a query object hash
        //
        // description:
        //      The SimpleQueryEngine provides a way of getting a QueryResults through
        //      the use of a simple object hash as a filter.  The hash will be used to
        //      match properties on data objects with the corresponding value given. In
        //      other words, only exact matches will be returned.
        //
        //      This function can be used as a template for more complex query engines;
        //      for example, an engine can be created that accepts an object hash that
        //      contains filtering functions, or a string that gets evaluated, etc.
        //
        //      When creating a new dojo.store, simply set the store's queryEngine
        //      field as a reference to this function.
        //
        // query: Object
        //      An object hash with fields that may match fields of items in the store.
        //      Values in the hash will be compared by normal == operator, but regular expressions
        //      or any object that provides a test() method are also supported and can be
        //      used to match strings by more complex expressions
        //      (and then the regex's or object's test() method will be used to match values).
        //
        // options: dojo/store/api/Store.QueryOptions?
        //      An object that contains optional information such as sort, start, and count.
        //
        // returns: Function
        //      A function that caches the passed query under the field "matches".  See any
        //      of the "query" methods on dojo.stores.
        //
        // example:
        //      Define a store with a reference to this engine, and set up a query method.
        //
        //  |   var myStore = function(options){
        //  |       //  ...more properties here
        //  |       this.queryEngine = SimpleQueryEngine;
        //  |       //  define our query method
        //  |       this.query = function(query, options){
        //  |           return QueryResults(this.queryEngine(query, options)(this.data));
        //  |       };
        //  |   };

        // create our matching query function
        switch(typeof query){
            default:
                throw new Error("Can not query with a " + typeof query);
            case "object": case "undefined":
                var queryObject = query;
                query = function(object){
                    for(var key in queryObject){
                        var required = queryObject[key];
                        if(required && required.test){
                            // an object can provide a test method, which makes it work with regex
                            if(!required.test(object[key], object)){
                                return false;
                            }
                        }else if(required != object[key]){
                            return false;
                        }
                    }
                    return true;
                };
                break;
            case "string":
                // named query
                if(!this[query]){
                    throw new Error("No filter function " + query + " was found in store");
                }
                query = this[query];
                // fall through
            case "function":
                // fall through
        }
        
        function filter(arr, callback, thisObject){
            // summary:
            //      Returns a new Array with those items from arr that match the
            //      condition implemented by callback.
            // arr: Array
            //      the array to iterate over.
            // callback: Function|String
            //      a function that is invoked with three arguments (item,
            //      index, array). The return of this function is expected to
            //      be a boolean which determines whether the passed-in item
            //      will be included in the returned array.
            // thisObject: Object?
            //      may be used to scope the call to callback
            // returns: Array
            // description:
            //      This function corresponds to the JavaScript 1.6 Array.filter() method, with one difference: when
            //      run over sparse arrays, this implementation passes the "holes" in the sparse array to
            //      the callback function with a value of undefined. JavaScript 1.6's filter skips the holes in the sparse array.
            //      For more details, see:
            //      https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
            // example:
            //  | // returns [2, 3, 4]
            //  | array.filter([1, 2, 3, 4], function(item){ return item>1; });

            // TODO: do we need "Ctr" here like in map()?
            var i = 0, l = arr && arr.length || 0, out = [], value;
            if(l && typeof arr == "string") arr = arr.split("");
            if(typeof callback == "string") callback = cache[callback] || buildFn(callback);
            if(thisObject){
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback.call(thisObject, value, i, arr)){
                        out.push(value);
                    }
                }
            }else{
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback(value, i, arr)){
                        out.push(value);
                    }
                }
            }
            return out; // Array
        }

        function execute(array){
            // execute the whole query, first we filter
            var results = filter(array, query);
            // next we sort
            var sortSet = options && options.sort;
            if(sortSet){
                results.sort(typeof sortSet == "function" ? sortSet : function(a, b){
                    for(var sort, i=0; sort = sortSet[i]; i++){
                        var aValue = a[sort.attribute];
                        var bValue = b[sort.attribute];
                        // valueOf enables proper comparison of dates
                        aValue = aValue != null ? aValue.valueOf() : aValue;
                        bValue = bValue != null ? bValue.valueOf() : bValue;
                        if (aValue != bValue){
                            // modified by lwf 2016/07/09
                            //return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                            return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                        }
                    }
                    return 0;
                });
            }
            // now we paginate
            if(options && (options.start || options.count)){
                var total = results.length;
                results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
                results.total = total;
            }
            return results;
        }
        execute.matches = query;
        return execute;
    };

    var QueryResults = function(results){
        // summary:
        //      A function that wraps the results of a store query with additional
        //      methods.
        // description:
        //      QueryResults is a basic wrapper that allows for array-like iteration
        //      over any kind of returned data from a query.  While the simplest store
        //      will return a plain array of data, other stores may return deferreds or
        //      promises; this wrapper makes sure that *all* results can be treated
        //      the same.
        //
        //      Additional methods include `forEach`, `filter` and `map`.
        // results: Array|dojo/promise/Promise
        //      The result set as an array, or a promise for an array.
        // returns:
        //      An array-like object that can be used for iterating over.
        // example:
        //      Query a store and iterate over the results.
        //
        //  |   store.query({ prime: true }).forEach(function(item){
        //  |       //  do something
        //  |   });

        if(!results){
            return results;
        }

        var isPromise = !!results.then;
        // if it is a promise it may be frozen
        if(isPromise){
            results = Object.delegate(results);
        }
        function addIterativeMethod(method){
            // Always add the iterative methods so a QueryResults is
            // returned whether the environment is ES3 or ES5
            results[method] = function(){
                var args = arguments;
                var result = Deferred.when(results, function(results){
                    //Array.prototype.unshift.call(args, results);
                    return QueryResults(Array.prototype[method].apply(results, args));
                });
                // forEach should only return the result of when()
                // when we're wrapping a promise
                if(method !== "forEach" || isPromise){
                    return result;
                }
            };
        }

        addIterativeMethod("forEach");
        addIterativeMethod("filter");
        addIterativeMethod("map");
        if(results.total == null){
            results.total = Deferred.when(results, function(results){
                return results.length;
            });
        }
        return results; // Object
    };

    var ArrayStore = klass({
        "klassName": "ArrayStore",

        "queryEngine": SimpleQueryEngine,
        
        "idProperty": "id",


        get: function(id){
            // summary:
            //      Retrieves an object by its identity
            // id: Number
            //      The identity to use to lookup the object
            // returns: Object
            //      The object in the store that matches the given id.
            return this.data[this.index[id]];
        },

        getIdentity: function(object){
            return object[this.idProperty];
        },

        put: function(object, options){
            var data = this.data,
                index = this.index,
                idProperty = this.idProperty;
            var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
            if(id in index){
                // object exists
                if(options && options.overwrite === false){
                    throw new Error("Object already exists");
                }
                // replace the entry in data
                data[index[id]] = object;
            }else{
                // add the new object
                index[id] = data.push(object) - 1;
            }
            return id;
        },

        add: function(object, options){
            (options = options || {}).overwrite = false;
            // call put with overwrite being false
            return this.put(object, options);
        },

        remove: function(id){
            // summary:
            //      Deletes an object by its identity
            // id: Number
            //      The identity to use to delete the object
            // returns: Boolean
            //      Returns true if an object was removed, falsy (undefined) if no object matched the id
            var index = this.index;
            var data = this.data;
            if(id in index){
                data.splice(index[id], 1);
                // now we have to reindex
                this.setData(data);
                return true;
            }
        },
        query: function(query, options){
            // summary:
            //      Queries the store for objects.
            // query: Object
            //      The query to use for retrieving objects from the store.
            // options: dojo/store/api/Store.QueryOptions?
            //      The optional arguments to apply to the resultset.
            // returns: dojo/store/api/Store.QueryResults
            //      The results of the query, extended with iterative methods.
            //
            // example:
            //      Given the following store:
            //
            //  |   var store = new Memory({
            //  |       data: [
            //  |           {id: 1, name: "one", prime: false },
            //  |           {id: 2, name: "two", even: true, prime: true},
            //  |           {id: 3, name: "three", prime: true},
            //  |           {id: 4, name: "four", even: true, prime: false},
            //  |           {id: 5, name: "five", prime: true}
            //  |       ]
            //  |   });
            //
            //  ...find all items where "prime" is true:
            //
            //  |   var results = store.query({ prime: true });
            //
            //  ...or find all items where "even" is true:
            //
            //  |   var results = store.query({ even: true });
            return QueryResults(this.queryEngine(query, options)(this.data));
        },

        setData: function(data){
            // summary:
            //      Sets the given data as the source for this store, and indexes it
            // data: Object[]
            //      An array of objects to use as the source of data.
            if(data.items){
                // just for convenience with the data format IFRS expects
                this.idProperty = data.identifier || this.idProperty;
                data = this.data = data.items;
            }else{
                this.data = data;
            }
            this.index = {};
            for(var i = 0, l = data.length; i < l; i++){
                this.index[data[i][this.idProperty]] = i;
            }
        },

        init: function(options) {
            for(var i in options){
                this[i] = options[i];
            }
            this.setData(this.data || []);
        }

    });

	return ArrayStore;
});
define('skylark-langx/aspect',[
],function(){

  var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments){
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if(around){
            var advised = advice(function(){
                return previous.advice(this, arguments);
            });
            signal = {
                remove: function(){
                    if(advised){
                        advised = dispatcher = advice = null;
                    }
                },
                advice: function(target, args){
                    return advised ?
                        advised.apply(target, args) :  // called the advised function
                        previous.advice(target, args); // cancelled, skip to next one
                }
            };
        }else{
            // create the remove handler
            signal = {
                remove: function(){
                    if(signal.advice){
                        var previous = signal.previous;
                        var next = signal.next;
                        if(!next && !previous){
                            delete dispatcher[type];
                        }else{
                            if(previous){
                                previous.next = next;
                            }else{
                                dispatcher[type] = next;
                            }
                            if(next){
                                next.previous = previous;
                            }
                        }

                        // remove the advice to signal that this signal has been removed
                        dispatcher = advice = signal.advice = null;
                    }
                },
                id: nextId++,
                advice: advice,
                receiveArguments: receiveArguments
            };
        }
        if(previous && !around){
            if(type == "after"){
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while(previous.next && (previous = previous.next)){}
                previous.next = signal;
                signal.previous = previous;
            }else if(type == "before"){
                // add to beginning
                dispatcher[type] = signal;
                signal.next = previous;
                previous.previous = signal;
            }
        }else{
            // around or first one just replaces
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type){
        return function(target, methodName, advice, receiveArguments){
            var existing = target[methodName], dispatcher;
            if(!existing || existing.target != target){
                // no dispatcher in place
                target[methodName] = dispatcher = function(){
                    var executionId = nextId;
                    // before advice
                    var args = arguments;
                    var before = dispatcher.before;
                    while(before){
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    // around advice
                    if(dispatcher.around){
                        var results = dispatcher.around.advice(this, args);
                    }
                    // after advice
                    var after = dispatcher.after;
                    while(after && after.id < executionId){
                        if(after.receiveArguments){
                            var newResults = after.advice.apply(this, args);
                            // change the return value only if a new value was returned
                            results = newResults === undefined ? results : newResults;
                        }else{
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if(existing){
                    dispatcher.around = {advice: function(target, args){
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }

    return {
        after: aspect("after"),
 
        around: aspect("around"),
        
        before: aspect("before")
    };
});
define('skylark-langx/funcs',[
    "./objects",
	"./types"
],function(objects,types){
	var mixin = objects.mixin,
        isFunction = types.isFunction,
        isString = types.isString;

    function defer(fn) {
        if (requestAnimationFrame) {
            requestAnimationFrame(fn);
        } else {
            setTimeoutout(fn);
        }
        return this;
    }

    function noop() {
    }

    function proxy(fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function() {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
            }
            return proxyFn;
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return proxy.apply(null, args)
            } else {
                return proxy(fn[context], fn);
            }
        } else {
            throw new TypeError("expected function");
        }
    }

    function debounce(fn, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                fn.apply(context, args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
   
    var delegate = (function() {
        // boodman/crockford delegation w/ cornford optimization
        function TMP() {}
        return function(obj, props) {
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if (props) {
                mixin(tmp, props);
            }
            return tmp; // Object
        };
    })();


    return {
        debounce: debounce,

        delegate: delegate,

        defer: defer,

        noop : noop,

        proxy: proxy,

        returnTrue: function() {
            return true;
        },

        returnFalse: function() {
            return false;
        }
    };
});
define('skylark-langx/Deferred',[
    "./arrays",
	"./funcs",
    "./objects"
],function(arrays,funcs,objects){
    "use strict";
    
    var  PGLISTENERS = Symbol ? Symbol() : '__pglisteners';

    var slice = Array.prototype.slice,
        proxy = funcs.proxy,
        makeArray = arrays.makeArray,
        result = objects.result,
        mixin = objects.mixin;

    mixin(Promise.prototype,{
        always: function(handler) {
            //this.done(handler);
            //this.fail(handler);
            this.then(handler,handler);
            return this;
        },
        done : function(handler) {
            this.then(handler);
            return this;
        },
        fail : function(handler) { 
            //return mixin(Promise.prototype.catch.call(this,handler),added);
            //return this.then(null,handler);
            this.catch(handler);
            return this;
        }
    });


    var Deferred = function() {
        var self = this,
            p = this.promise = new Promise(function(resolve, reject) {
                self._resolve = resolve;
                self._reject = reject;
            });

        wrapPromise(p,self);

        this[PGLISTENERS] = [];

        //this.resolve = Deferred.prototype.resolve.bind(this);
        //this.reject = Deferred.prototype.reject.bind(this);
        //this.progress = Deferred.prototype.progress.bind(this);

    };

    function wrapPromise(p,d) {
        var   added = {
                state : function() {
                    if (d.isResolved()) {
                        return 'resolved';
                    }
                    if (d.isRejected()) {
                        return 'rejected';
                    }
                    return 'pending';
                },
                then : function(onResolved,onRejected,onProgress) {
                    if (onProgress) {
                        this.progress(onProgress);
                    }
                    return mixin(Promise.prototype.then.call(this,
                            onResolved && function(args) {
                                if (args && args.__ctx__ !== undefined) {
                                    return onResolved.apply(args.__ctx__,args);
                                } else {
                                    return onResolved(args);
                                }
                            },
                            onRejected && function(args){
                                if (args && args.__ctx__ !== undefined) {
                                    return onRejected.apply(args.__ctx__,args);
                                } else {
                                    return onRejected(args);
                                }
                            }),added);
                },
                progress : function(handler) {
                    d[PGLISTENERS].push(handler);
                    return this;
                }

            };

        added.pipe = added.then;
        return mixin(p,added);

    }

    Deferred.prototype.resolve = function(value) {
        var args = slice.call(arguments);
        return this.resolveWith(null,args);
    };

    Deferred.prototype.resolveWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._resolve(args);
        this._resolved = true;
        return this;
    };

    Deferred.prototype.progress = function(value) {
        try {
          return this[PGLISTENERS].forEach(function (listener) {
            return listener(value);
          });
        } catch (error) {
          this.reject(error);
        }
        return this;
    };

    Deferred.prototype.reject = function(reason) {
        var args = slice.call(arguments);
        return this.rejectWith(null,args);
    };

    Deferred.prototype.rejectWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._reject(args);
        this._rejected = true;
        return this;
    };

    Deferred.prototype.isResolved = function() {
        return !!this._resolved;
    };

    Deferred.prototype.isRejected = function() {
        return !!this._rejected;
    };

    Deferred.prototype.then = function(callback, errback, progback) {
        var p = result(this,"promise");
        return p.then(callback, errback, progback);
    };

    Deferred.prototype.done  = Deferred.prototype.then;

    Deferred.all = function(array) {
        return wrapPromise(Promise.all(array));
    };

    Deferred.first = function(array) {
        return wrapPromise(Promise.race(array));
    };


    Deferred.when = function(valueOrPromise, callback, errback, progback) {
        var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
        var nativePromise = receivedPromise && valueOrPromise instanceof Promise;

        if (!receivedPromise) {
            if (arguments.length > 1) {
                return callback ? callback(valueOrPromise) : valueOrPromise;
            } else {
                return new Deferred().resolve(valueOrPromise);
            }
        } else if (!nativePromise) {
            var deferred = new Deferred(valueOrPromise.cancel);
            valueOrPromise.then(proxy(deferred.resolve,deferred), proxy(deferred.reject,deferred), deferred.progress);
            valueOrPromise = deferred.promise;
        }

        if (callback || errback || progback) {
            return valueOrPromise.then(callback, errback, progback);
        }
        return valueOrPromise;
    };

    Deferred.reject = function(err) {
        var d = new Deferred();
        d.reject(err);
        return d.promise;
    };

    Deferred.resolve = function(data) {
        var d = new Deferred();
        d.resolve.apply(d,arguments);
        return d.promise;
    };

    Deferred.immediate = Deferred.resolve;

    return Deferred;
});
define('skylark-langx/async',[
    "./Deferred",
    "./arrays"
],function(Deferred,arrays){
    var each = arrays.each;
    
    var async = {
        parallel : function(arr,args,ctx) {
            var rets = [];
            ctx = ctx || null;
            args = args || [];

            each(arr,function(i,func){
                rets.push(func.apply(ctx,args));
            });

            return Deferred.all(rets);
        },

        series : function(arr,args,ctx) {
            var rets = [],
                d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolve();
            each(arr,function(i,func){
                p = p.then(function(){
                    return func.apply(ctx,args);
                });
                rets.push(p);
            });

            return Deferred.all(rets);
        },

        waterful : function(arr,args,ctx) {
            var d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolveWith(ctx,args);

            each(arr,function(i,func){
                p = p.then(func);
            });
            return p;
        }
    };

	return async;	
});
define('skylark-langx/Evented',[
    "./klass",
    "./objects",
	"./types"
],function(klass,objects,types){
	var slice = Array.prototype.slice,
        isDefined = types.isDefined,
        isPlainObject = types.isPlainObject,
		isFunction = types.isFunction,
		isString = types.isString,
		isEmptyObject = types.isEmptyObject,
		mixin = objects.mixin;

    var Evented = klass({
        on: function(events, selector, data, callback, ctx, /*used internally*/ one) {
            var self = this,
                _hub = this._hub || (this._hub = {});

            if (isPlainObject(events)) {
                ctx = callback;
                each(events, function(type, fn) {
                    self.on(type, selector, data, fn, ctx, one);
                });
                return this;
            }

            if (!isString(selector) && !isFunction(callback)) {
                ctx = callback;
                callback = data;
                data = selector;
                selector = undefined;
            }

            if (isFunction(data)) {
                ctx = callback;
                callback = data;
                data = null;
            }

            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(name) {
                (_hub[name] || (_hub[name] = [])).push({
                    fn: callback,
                    selector: selector,
                    data: data,
                    ctx: ctx,
                    one: one
                });
            });

            return this;
        },

        one: function(events, selector, data, callback, ctx) {
            return this.on(events, selector, data, callback, ctx, 1);
        },

        trigger: function(e /*,argument list*/ ) {
            if (!this._hub) {
                return this;
            }

            var self = this;

            if (isString(e)) {
                e = new CustomEvent(e);
            }

            Object.defineProperty(e,"target",{
                value : this
            });

            var args = slice.call(arguments, 1);
            if (isDefined(args)) {
                args = [e].concat(args);
            } else {
                args = [e];
            }
            [e.type || e.name, "all"].forEach(function(eventName) {
                var listeners = self._hub[eventName];
                if (!listeners) {
                    return;
                }

                var len = listeners.length,
                    reCompact = false;

                for (var i = 0; i < len; i++) {
                    var listener = listeners[i];
                    if (e.data) {
                        if (listener.data) {
                            e.data = mixin({}, listener.data, e.data);
                        }
                    } else {
                        e.data = listener.data || null;
                    }
                    listener.fn.apply(listener.ctx, args);
                    if (listener.one) {
                        listeners[i] = null;
                        reCompact = true;
                    }
                }

                if (reCompact) {
                    self._hub[eventName] = compact(listeners);
                }

            });
            return this;
        },

        listened: function(event) {
            var evtArr = ((this._hub || (this._events = {}))[event] || []);
            return evtArr.length > 0;
        },

        listenTo: function(obj, event, callback, /*used internally*/ one) {
            if (!obj) {
                return this;
            }

            // Bind callbacks on obj,
            if (isString(callback)) {
                callback = this[callback];
            }

            if (one) {
                obj.one(event, callback, this);
            } else {
                obj.on(event, callback, this);
            }

            //keep track of them on listening.
            var listeningTo = this._listeningTo || (this._listeningTo = []),
                listening;

            for (var i = 0; i < listeningTo.length; i++) {
                if (listeningTo[i].obj == obj) {
                    listening = listeningTo[i];
                    break;
                }
            }
            if (!listening) {
                listeningTo.push(
                    listening = {
                        obj: obj,
                        events: {}
                    }
                );
            }
            var listeningEvents = listening.events,
                listeningEvent = listeningEvents[event] = listeningEvents[event] || [];
            if (listeningEvent.indexOf(callback) == -1) {
                listeningEvent.push(callback);
            }

            return this;
        },

        listenToOnce: function(obj, event, callback) {
            return this.listenTo(obj, event, callback, 1);
        },

        off: function(events, callback) {
            var _hub = this._hub || (this._hub = {});
            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(name) {
                var evts = _hub[name];
                var liveEvents = [];

                if (evts && callback) {
                    for (var i = 0, len = evts.length; i < len; i++) {
                        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                            liveEvents.push(evts[i]);
                    }
                }

                if (liveEvents.length) {
                    _hub[name] = liveEvents;
                } else {
                    delete _hub[name];
                }
            });

            return this;
        },
        unlistenTo: function(obj, event, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            for (var i = 0; i < listeningTo.length; i++) {
                var listening = listeningTo[i];

                if (obj && obj != listening.obj) {
                    continue;
                }

                var listeningEvents = listening.events;
                for (var eventName in listeningEvents) {
                    if (event && event != eventName) {
                        continue;
                    }

                    var listeningEvent = listeningEvents[eventName];

                    for (var j = 0; j < listeningEvent.length; j++) {
                        if (!callback || callback == listeningEvent[i]) {
                            listening.obj.off(eventName, listeningEvent[i], this);
                            listeningEvent[i] = null;
                        }
                    }

                    listeningEvent = listeningEvents[eventName] = compact(listeningEvent);

                    if (isEmptyObject(listeningEvent)) {
                        listeningEvents[eventName] = null;
                    }

                }

                if (isEmptyObject(listeningEvents)) {
                    listeningTo[i] = null;
                }
            }

            listeningTo = this._listeningTo = compact(listeningTo);
            if (isEmptyObject(listeningTo)) {
                this._listeningTo = null;
            }

            return this;
        }
    });

	return Evented;

});
define('skylark-langx/strings',[
],function(){

     /*
     * Converts camel case into dashes.
     * @param {String} str
     * @return {String}
     * @exapmle marginTop -> margin-top
     */
    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                    +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? JSON.parse(value) :
                    value) : value;
        } catch (e) {
            return value;
        }
    }

    function trim(str) {
        return str == null ? "" : String.prototype.trim.call(str);
    }
    function substitute( /*String*/ template,
        /*Object|Array*/
        map,
        /*Function?*/
        transform,
        /*Object?*/
        thisObject) {
        // summary:
        //    Performs parameterized substitutions on a string. Throws an
        //    exception if any parameter is unmatched.
        // template:
        //    a string with expressions in the form `${key}` to be replaced or
        //    `${key:format}` which specifies a format function. keys are case-sensitive.
        // map:
        //    hash to search for substitutions
        // transform:
        //    a function to process all parameters before substitution takes


        thisObject = thisObject || window;
        transform = transform ?
            proxy(thisObject, transform) : function(v) {
                return v;
            };

        function getObject(key, map) {
            if (key.match(/\./)) {
                var retVal,
                    getValue = function(keys, obj) {
                        var _k = keys.pop();
                        if (_k) {
                            if (!obj[_k]) return null;
                            return getValue(keys, retVal = obj[_k]);
                        } else {
                            return retVal;
                        }
                    };
                return getValue(key.split(".").reverse(), map);
            } else {
                return map[key];
            }
        }

        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
            function(match, key, format) {
                var value = getObject(key, map);
                if (format) {
                    value = getObject(format, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            }); // String
    }

	return {
        camelCase: function(str) {
            return str.replace(/-([\da-z])/g, function(a) {
                return a.toUpperCase().replace('-', '');
            });
        },


        dasherize: dasherize,

        deserializeValue: deserializeValue,

        lowerFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        serializeValue: function(value) {
            return JSON.stringify(value)
        },


        substitute: substitute,

        trim: trim,

        upperFirst: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
	} ; 

});
define('skylark-langx/Xhr',[
    "./arrays",
    "./Deferred",
    "./Evented",
    "./objects",
    "./funcs",
    "./types"
],function(arrays,Deferred,Evented,objects,funcs,types){
    var each = arrays.each,
        mixin = objects.mixin,
        noop = funcs.noop,
        isArray = types.isArray,
        isFunction = types.isFunction,
        isPlainObject = types.isPlainObject,
        type = types.type;
 
     var getAbsoluteUrl = (function() {
        var a;

        return function(url) {
            if (!a) a = document.createElement('a');
            a.href = url;

            return a.href;
        };
    })();
   
    var Xhr = (function(){
        var jsonpID = 0,
            key,
            name,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            scriptTypeRE = /^(?:text|application)\/javascript/i,
            xmlTypeRE = /^(?:text|application)\/xml/i,
            jsonType = 'application/json',
            htmlType = 'text/html',
            blankRE = /^\s*$/;

        var XhrDefaultOptions = {
            async: true,

            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: noop,
            // Callback that is executed if the request succeeds
            success: noop,
            // Callback that is executed the the server drops error
            error: noop,
            // Callback that is executed on request complete (both: error and success)
            complete: noop,
            // The context for the callbacks
            context: null,
            // Whether to trigger "global" Ajax events
            global: true,

            // MIME types mapping
            // IIS returns Javascript as "application/x-javascript"
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: 'application/json',
                xml: 'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain'
            },
            // Whether the request is to another domain
            crossDomain: false,
            // Default timeout
            timeout: 0,
            // Whether data should be serialized to string
            processData: true,
            // Whether the browser should be allowed to cache GET responses
            cache: true,

            xhrFields : {
                withCredentials : true
            }
        };

        function mimeToDataType(mime) {
            if (mime) {
                mime = mime.split(';', 2)[0];
            }
            if (mime) {
                if (mime == htmlType) {
                    return "html";
                } else if (mime == jsonType) {
                    return "json";
                } else if (scriptTypeRE.test(mime)) {
                    return "script";
                } else if (xmlTypeRE.test(mime)) {
                    return "xml";
                }
            }
            return "text";
        }

        function appendQuery(url, query) {
            if (query == '') return url
            return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }

        // serialize payload and append it to the URL for GET requests
        function serializeData(options) {
            options.data = options.data || options.query;
            if (options.processData && options.data && type(options.data) != "string") {
                options.data = param(options.data, options.traditional);
            }
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
                options.url = appendQuery(options.url, options.data);
                options.data = undefined;
            }
        }

        function serialize(params, obj, traditional, scope) {
            var t, array = isArray(obj),
                hash = isPlainObject(obj)
            each(obj, function(key, value) {
                t =type(value);
                if (scope) key = traditional ? scope :
                    scope + '[' + (hash || t == 'object' || t == 'array' ? key : '') + ']'
                // handle data in serializeArray() format
                if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
                else if (t == "array" || (!traditional && t == "object"))
                    serialize(params, value, traditional, key)
                else params.add(key, value)
            })
        }

        var param = function(obj, traditional) {
            var params = []
            params.add = function(key, value) {
                if (isFunction(value)) value = value()
                if (value == null) value = ""
                this.push(escape(key) + '=' + escape(value))
            }
            serialize(params, obj, traditional)
            return params.join('&').replace(/%20/g, '+')
        };

        var Xhr = Evented.inherit({
            klassName : "Xhr",

            _request  : function(args) {
                var _ = this._,
                    self = this,
                    options = mixin({},XhrDefaultOptions,_.options,args),
                    xhr = _.xhr = new XMLHttpRequest();

                serializeData(options)

                var dataType = options.dataType || options.handleAs,
                    mime = options.mimeType || options.accepts[dataType],
                    headers = options.headers,
                    xhrFields = options.xhrFields,
                    isFormData = options.data && options.data instanceof FormData,
                    basicAuthorizationToken = options.basicAuthorizationToken,
                    type = options.type,
                    url = options.url,
                    async = options.async,
                    user = options.user , 
                    password = options.password,
                    deferred = new Deferred(),
                    contentType = isFormData ? false : 'application/x-www-form-urlencoded';

                if (xhrFields) {
                    for (name in xhrFields) {
                        xhr[name] = xhrFields[name];
                    }
                }

                if (mime && mime.indexOf(',') > -1) {
                    mime = mime.split(',', 2)[0];
                }
                if (mime && xhr.overrideMimeType) {
                    xhr.overrideMimeType(mime);
                }

                //if (dataType) {
                //    xhr.responseType = dataType;
                //}

                var finish = function() {
                    xhr.onloadend = noop;
                    xhr.onabort = noop;
                    xhr.onprogress = noop;
                    xhr.ontimeout = noop;
                    xhr = null;
                }
                var onloadend = function() {
                    var result, error = false
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && getAbsoluteUrl(url).startsWith('file:'))) {
                        dataType = dataType || mimeToDataType(options.mimeType || xhr.getResponseHeader('content-type'));

                        result = xhr.responseText;
                        try {
                            if (dataType == 'script') {
                                eval(result);
                            } else if (dataType == 'xml') {
                                result = xhr.responseXML;
                            } else if (dataType == 'json') {
                                result = blankRE.test(result) ? null : JSON.parse(result);
                            } else if (dataType == "blob") {
                                result = Blob([xhrObj.response]);
                            } else if (dataType == "arraybuffer") {
                                result = xhr.reponse;
                            }
                        } catch (e) { 
                            error = e;
                        }

                        if (error) {
                            deferred.reject(error,xhr.status,xhr);
                        } else {
                            deferred.resolve(result,xhr.status,xhr);
                        }
                    } else {
                        deferred.reject(new Error(xhr.statusText),xhr.status,xhr);
                    }
                    finish();
                };

                var onabort = function() {
                    if (deferred) {
                        deferred.reject(new Error("abort"),xhr.status,xhr);
                    }
                    finish();                 
                }
 
                var ontimeout = function() {
                    if (deferred) {
                        deferred.reject(new Error("timeout"),xhr.status,xhr);
                    }
                    finish();                 
                }

                var onprogress = function(evt) {
                    if (deferred) {
                        deferred.progress(evt,xhr.status,xhr);
                    }
                }

                xhr.onloadend = onloadend;
                xhr.onabort = onabort;
                xhr.ontimeout = ontimeout;
                xhr.onprogress = onprogress;

                xhr.open(type, url, async, user, password);
               
                if (headers) {
                    for ( var key in headers) {
                        var value = headers[key];
 
                        if(key.toLowerCase() === 'content-type'){
                            contentType = headers[hdr];
                        } else {
                           xhr.setRequestHeader(key, value);
                        }
                    }
                }   

                if  (contentType && contentType !== false){
                    xhr.setRequestHeader('Content-Type', contentType);
                }

                if(!headers || !('X-Requested-With' in headers)){
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }


                //If basicAuthorizationToken is defined set its value into "Authorization" header
                if (basicAuthorizationToken) {
                    xhr.setRequestHeader("Authorization", basicAuthorizationToken);
                }

                xhr.send(options.data ? options.data : null);

                return deferred.promise;

            },

            "abort": function() {
                var _ = this._,
                    xhr = _.xhr;

                if (xhr) {
                    xhr.abort();
                }    
            },


            "request": function(args) {
                return this._request(args);
            },

            get : function(args) {
                args = args || {};
                args.type = "GET";
                return this._request(args);
            },

            post : function(args) {
                args = args || {};
                args.type = "POST";
                return this._request(args);
            },

            patch : function(args) {
                args = args || {};
                args.type = "PATCH";
                return this._request(args);
            },

            put : function(args) {
                args = args || {};
                args.type = "PUT";
                return this._request(args);
            },

            del : function(args) {
                args = args || {};
                args.type = "DELETE";
                return this._request(args);
            },

            "init": function(options) {
                this._ = {
                    options : options || {}
                };
            }
        });

        ["request","get","post","put","del","patch"].forEach(function(name){
            Xhr[name] = function(url,args) {
                var xhr = new Xhr({"url" : url});
                return xhr[name](args);
            };
        });

        Xhr.defaultOptions = XhrDefaultOptions;
        Xhr.param = param;

        return Xhr;
    })();

	return Xhr;	
});
define('skylark-langx/Restful',[
    "./Evented",
    "./objects",
    "./strings",
    "./Xhr"
],function(Evented,objects,strings,Xhr){
    var mixin = objects.mixin,
        substitute = strings.substitute;

    var Restful = Evented.inherit({
        "klassName" : "Restful",

        "idAttribute": "id",
        
        getBaseUrl : function(args) {
            //$$baseEndpoint : "/files/${fileId}/comments",
            var baseEndpoint = substitute(this.baseEndpoint,args),
                baseUrl = this.server + this.basePath + baseEndpoint;
            if (args[this.idAttribute]!==undefined) {
                baseUrl = baseUrl + "/" + args[this.idAttribute]; 
            }
            return baseUrl;
        },
        _head : function(args) {
            //get resource metadata .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
        },
        _get : function(args) {
            //get resource ,one or list .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, null if list
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            return Xhr.get(this.getBaseUrl(args),args);
        },
        _post  : function(args,verb) {
            //create or move resource .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            //verb : the verb ,ex: copy,touch,trash,untrash,watch
            var url = this.getBaseUrl(args);
            if (verb) {
                url = url + "/" + verb;
            }
            return Xhr.post(url, args);
        },

        _put  : function(args,verb) {
            //update resource .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            //verb : the verb ,ex: copy,touch,trash,untrash,watch
            var url = this.getBaseUrl(args);
            if (verb) {
                url = url + "/" + verb;
            }
            return Xhr.put(url, args);
        },

        _delete : function(args) {
            //delete resource . 
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}         

            // HTTP request : DELETE http://center.utilhub.com/registry/v1/apps/{appid}
            var url = this.getBaseUrl(args);
            return Xhr.del(url);
        },

        _patch : function(args){
            //update resource metadata. 
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            var url = this.getBaseUrl(args);
            return Xhr.patch(url, args);
        },
        query: function(params) {
            
            return this._post(params);
        },

        retrieve: function(params) {
            return this._get(params);
        },

        create: function(params) {
            return this._post(params);
        },

        update: function(params) {
            return this._put(params);
        },

        delete: function(params) {
            // HTTP request : DELETE http://center.utilhub.com/registry/v1/apps/{appid}
            return this._delete(params);
        },

        patch: function(params) {
           // HTTP request : PATCH http://center.utilhub.com/registry/v1/apps/{appid}
            return this._patch(params);
        },
        init: function(params) {
            mixin(this,params);
 //           this._xhr = XHRx();
       }
    });

    return Restful;
});
define('skylark-langx/Stateful',[
	"./Evented"
],function(Evented){
    var Stateful = Evented.inherit({
        init : function(attributes, options) {
            var attrs = attributes || {};
            options || (options = {});
            this.cid = uniqueId(this.cidPrefix);
            this.attributes = {};
            if (options.collection) this.collection = options.collection;
            if (options.parse) attrs = this.parse(attrs, options) || {};
            var defaults = result(this, 'defaults');
            attrs = mixin({}, defaults, attrs);
            this.set(attrs, options);
            this.changed = {};
        },

        // A hash of attributes whose current and previous value differ.
        changed: null,

        // The value returned during the last failed validation.
        validationError: null,

        // The default name for the JSON `id` attribute is `"id"`. MongoDB and
        // CouchDB users may want to set this to `"_id"`.
        idAttribute: 'id',

        // The prefix is used to create the client id which is used to identify models locally.
        // You may want to override this if you're experiencing name clashes with model ids.
        cidPrefix: 'c',


        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return clone(this.attributes);
        },


        // Get the value of an attribute.
        get: function(attr) {
          return this.attributes[attr];
        },

        // Returns `true` if the attribute contains a value that is not null
        // or undefined.
        has: function(attr) {
          return this.get(attr) != null;
        },

        // Set a hash of model attributes on the object, firing `"change"`. This is
        // the core primitive operation of a model, updating the data and notifying
        // anyone who needs to know about the change in state. The heart of the beast.
        set: function(key, val, options) {
          if (key == null) return this;

          // Handle both `"key", value` and `{key: value}` -style arguments.
          var attrs;
          if (typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options || (options = {});

          // Run validation.
          if (!this._validate(attrs, options)) return false;

          // Extract attributes and options.
          var unset      = options.unset;
          var silent     = options.silent;
          var changes    = [];
          var changing   = this._changing;
          this._changing = true;

          if (!changing) {
            this._previousAttributes = clone(this.attributes);
            this.changed = {};
          }

          var current = this.attributes;
          var changed = this.changed;
          var prev    = this._previousAttributes;

          // For each `set` attribute, update or delete the current value.
          for (var attr in attrs) {
            val = attrs[attr];
            if (!isEqual(current[attr], val)) changes.push(attr);
            if (!isEqual(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
          }

          // Update the `id`.
          if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

          // Trigger all relevant attribute changes.
          if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
          }

          // You might be wondering why there's a `while` loop here. Changes can
          // be recursively nested within `"change"` events.
          if (changing) return this;
          if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
          }
          this._pending = false;
          this._changing = false;
          return this;
        },

        // Remove an attribute from the model, firing `"change"`. `unset` is a noop
        // if the attribute doesn't exist.
        unset: function(attr, options) {
          return this.set(attr, void 0, mixin({}, options, {unset: true}));
        },

        // Clear all attributes on the model, firing `"change"`.
        clear: function(options) {
          var attrs = {};
          for (var key in this.attributes) attrs[key] = void 0;
          return this.set(attrs, mixin({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !isEmptyObject(this.changed);
          return this.changed[attr] !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          if (!diff) return this.hasChanged() ? clone(this.changed) : false;
          var old = this._changing ? this._previousAttributes : this.attributes;
          var changed = {};
          for (var attr in diff) {
            var val = diff[attr];
            if (isEqual(old[attr], val)) continue;
            changed[attr] = val;
          }
          return !isEmptyObject(changed) ? changed : false;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;
          return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          return clone(this._previousAttributes);
        },

        // Create a new model with identical attributes to this one.
        clone: function() {
          return new this.constructor(this.attributes);
        },

        // A model is new if it has never been saved to the server, and lacks an id.
        isNew: function() {
          return !this.has(this.idAttribute);
        },

        // Check if the model is currently in a valid state.
        isValid: function(options) {
          return this._validate({}, mixin({}, options, {validate: true}));
        },

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
        _validate: function(attrs, options) {
          if (!options.validate || !this.validate) return true;
          attrs = mixin({}, this.attributes, attrs);
          var error = this.validationError = this.validate(attrs, options) || null;
          if (!error) return true;
          this.trigger('invalid', this, error, mixin(options, {validationError: error}));
          return false;
        }
    });

	return Stateful;
});
define('skylark-langx/langx',[
    "./skylark",
    "./arrays",
    "./ArrayStore",
    "./aspect",
    "./async",
    "./Deferred",
    "./Evented",
    "./funcs",
    "./klass",
    "./objects",
    "./Restful",
    "./Stateful",
    "./strings",
    "./types",
    "./Xhr"
], function(skylark,arrays,ArrayStore,aspect,async,Deferred,Evented,funcs,klass,objects,Restful,Stateful,strings,types,Xhr) {
    "use strict";
    var toString = {}.toString,
        concat = Array.prototype.concat,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        filter = Array.prototype.filter,
        mixin = objects.mixin,
        safeMixin = objects.safeMixin,
        isFunction = types.isFunction;


    function createEvent(type, props) {
        var e = new CustomEvent(type, props);

        return safeMixin(e, props);
    }
    

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    function getQueryParams(url) {
        var url = url || window.location.href,
            segs = url.split("?"),
            params = {};

        if (segs.length > 1) {
            segs[1].split("&").forEach(function(queryParam) {
                var nv = queryParam.split('=');
                params[nv[0]] = nv[1];
            });
        }
        return params;
    }


    function toPixel(value) {
        // style values can be floats, client code may want
        // to round for integer pixels.
        return parseFloat(value) || 0;
    }


    var _uid = 1;

    function uid(obj) {
        return obj._uid || (obj._uid = _uid++);
    }

    var idCounter = 0;
    function uniqueId (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    }


    function langx() {
        return langx;
    }

    mixin(langx, {
        createEvent : createEvent,

        funcArg: funcArg,

        getQueryParams: getQueryParams,

        toPixel: toPixel,

        uid: uid,

        uniqueId: uniqueId,

        URL: typeof window !== "undefined" ? window.URL || window.webkitURL : null

    });


    mixin(langx, arrays,aspect,funcs,objects,strings,types,{
        ArrayStore : ArrayStore,

        async : async,
        
        Deferred: Deferred,

        Evented: Evented,

        klass : klass,

        Restful: Restful,
        
        Stateful: Stateful,

        Xhr: Xhr

    });

    return skylark.langx = langx;
});
define('skylark-utils-dom/langx',[
    "skylark-langx/langx"
], function(langx) {
    return langx;
});

define('skylark-utils-dom/browser',[
    "./skylark",
    "./langx"
], function(skylark,langx) {
    var checkedCssProperties = {
        "transitionproperty": "TransitionProperty",
    };

    var css3PropPrefix = "",
        css3StylePrefix = "",
        css3EventPrefix = "",

        cssStyles = {},
        cssProps = {},

        vendorPrefix,
        vendorPrefixRE,
        vendorPrefixesRE = /^(Webkit|webkit|O|Moz|moz|ms)(.*)$/,

        document = window.document,
        testEl = document.createElement("div"),

        matchesSelector = testEl.webkitMatchesSelector ||
                          testEl.mozMatchesSelector ||
                          testEl.oMatchesSelector ||
                          testEl.matchesSelector,

        requestFullScreen = testEl.requestFullscreen || 
                            testEl.webkitRequestFullscreen || 
                            testEl.mozRequestFullScreen || 
                            testEl.msRequestFullscreen,

        exitFullScreen =  document.exitFullscreen ||
                          document.webkitCancelFullScreen ||
                          document.mozCancelFullScreen ||
                          document.msExitFullscreen,

        testStyle = testEl.style;

    for (var name in testStyle) {
        var matched = name.match(vendorPrefixRE || vendorPrefixesRE);
        if (matched) {
            if (!vendorPrefixRE) {
                vendorPrefix = matched[1];
                vendorPrefixRE = new RegExp("^(" + vendorPrefix + ")(.*)$");

                css3StylePrefix = vendorPrefix;
                css3PropPrefix = '-' + vendorPrefix.toLowerCase() + '-';
                css3EventPrefix = vendorPrefix.toLowerCase();
            }

            cssStyles[langx.lowerFirst(matched[2])] = name;
            var cssPropName = langx.dasherize(matched[2]);
            cssProps[cssPropName] = css3PropPrefix + cssPropName;

        }
    }


    function normalizeCssEvent(name) {
        return css3EventPrefix ? css3EventPrefix + name : name.toLowerCase();
    }

    function normalizeCssProperty(name) {
        return cssProps[name] || name;
    }

    function normalizeStyleProperty(name) {
        return cssStyles[name] || name;
    }

    function browser() {
        return browser;
    }

    langx.mixin(browser, {
        css3PropPrefix: css3PropPrefix,

        isIE : !!/msie/i.exec( window.navigator.userAgent ),

        normalizeStyleProperty: normalizeStyleProperty,

        normalizeCssProperty: normalizeCssProperty,

        normalizeCssEvent: normalizeCssEvent,

        matchesSelector: matchesSelector,

        requestFullScreen : requestFullScreen,

        exitFullscreen : requestFullScreen,

        location: function() {
            return window.location;
        },

        support : {

        }

    });

    testEl = null;

    return skylark.browser = browser;
});

define('skylark-utils-dom/styler',[
    "./skylark",
    "./langx"
], function(skylark, langx) {
    var every = Array.prototype.every,
        forEach = Array.prototype.forEach,
        camelCase = langx.camelCase,
        dasherize = langx.dasherize;

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    var cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        classReCache = {

        };

    function classRE(name) {
        return name in classReCache ?
            classReCache[name] : (classReCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    // access className property while respecting SVGAnimatedString
    /*
     * Adds the specified class(es) to each element in the set of matched elements.
     * @param {HTMLElement} node
     * @param {String} value
     */
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    function disabled(elm, value ) {
        if (arguments.length < 2) {
            return !!this.dom.disabled;
        }

        elm.disabled = value;

        return this;
    }

    var elementDisplay = {};

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }
    /*
     * Display the matched elements.
     * @param {HTMLElement} elm
     */
    function show(elm) {
        styler.css(elm, "display", "");
        if (styler.css(elm, "display") == "none") {
            styler.css(elm, "display", defaultDisplay(elm.nodeName));
        }
        return this;
    }

    function isInvisible(elm) {
        return styler.css(elm, "display") == "none" || styler.css(elm, "opacity") == 0;
    }

    /*
     * Hide the matched elements.
     * @param {HTMLElement} elm
     */
    function hide(elm) {
        styler.css(elm, "display", "none");
        return this;
    }

    /*
     * Adds the specified class(es) to each element in the set of matched elements.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function addClass(elm, name) {
        if (!name) return this
        var cls = className(elm),
            names;
        if (langx.isString(name)) {
            names = name.split(/\s+/g);
        } else {
            names = name;
        }
        names.forEach(function(klass) {
            var re = classRE(klass);
            if (!cls.match(re)) {
                cls += (cls ? " " : "") + klass;
            }
        });

        className(elm, cls);

        return this;
    }
    /*
     * Get the value of a computed style property for the first element in the set of matched elements or set one or more CSS properties for every matched element.
     * @param {HTMLElement} elm
     * @param {String} property
     * @param {Any} value
     */
    function css(elm, property, value) {
        if (arguments.length < 3) {
            var computedStyle,
                computedStyle = getComputedStyle(elm, '')
            if (langx.isString(property)) {
                return elm.style[camelCase(property)] || computedStyle.getPropertyValue(dasherize(property))
            } else if (langx.isArrayLike(property)) {
                var props = {}
                forEach.call(property, function(prop) {
                    props[prop] = (elm.style[camelCase(prop)] || computedStyle.getPropertyValue(dasherize(prop)))
                })
                return props
            }
        }

        var css = '';
        if (typeof(property) == 'string') {
            if (!value && value !== 0) {
                elm.style.removeProperty(dasherize(property));
            } else {
                css = dasherize(property) + ":" + maybeAddPx(property, value)
            }
        } else {
            for (key in property) {
                if (property[key] === undefined) {
                    continue;
                }
                if (!property[key] && property[key] !== 0) {
                    elm.style.removeProperty(dasherize(key));
                } else {
                    css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                }
            }
        }

        elm.style.cssText += ';' + css;
        return this;
    }

    /*
     * Determine whether any of the matched elements are assigned the given class.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function hasClass(elm, name) {
        var re = classRE(name);
        return elm.className && elm.className.match(re);
    }

    /*
     * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function removeClass(elm, name) {
        if (name) {
            var cls = className(elm),
                names;

            if (langx.isString(name)) {
                names = name.split(/\s+/g);
            } else {
                names = name;
            }

            names.forEach(function(klass) {
                var re = classRE(klass);
                if (cls.match(re)) {
                    cls = cls.replace(re, " ");
                }
            });

            className(elm, cls.trim());
        } else {
            className(elm, "");
        }

        return this;
    }

    /*
     * Add or remove one or more classes from the specified element.
     * @param {HTMLElement} elm
     * @param {String} name
     * @param {} when
     */
    function toggleClass(elm, name, when) {
        var self = this;
        name.split(/\s+/g).forEach(function(klass) {
            if (when === undefined) {
                when = !self.hasClass(elm, klass);
            }
            if (when) {
                self.addClass(elm, klass);
            } else {
                self.removeClass(elm, klass)
            }
        });

        return self;
    }

    var styler = function() {
        return styler;
    };

    langx.mixin(styler, {
        autocssfix: false,
        cssHooks: {

        },

        addClass: addClass,
        className: className,
        css: css,
        disabled : disabled,        
        hasClass: hasClass,
        hide: hide,
        isInvisible: isInvisible,
        removeClass: removeClass,
        show: show,
        toggleClass: toggleClass
    });

    return skylark.styler = styler;
});
define('skylark-utils-dom/noder',[
    "./skylark",
    "./langx",
    "./browser",
    "./styler"
], function(skylark, langx, browser, styler) {
    var isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g),
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        div = document.createElement("div"),
        table = document.createElement('table'),
        tableBody = document.createElement('tbody'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': tableBody,
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            '*': div
        },
        rootNodeRE = /^(?:body|html)$/i,
        map = Array.prototype.map,
        slice = Array.prototype.slice;

    function ensureNodes(nodes, copyByClone) {
        if (!langx.isArrayLike(nodes)) {
            nodes = [nodes];
        }
        if (copyByClone) {
            nodes = map.call(nodes, function(node) {
                return node.cloneNode(true);
            });
        }
        return langx.flatten(nodes);
    }

    function nodeName(elm, chkName) {
        var name = elm.nodeName && elm.nodeName.toLowerCase();
        if (chkName !== undefined) {
            return name === chkName.toLowerCase();
        }
        return name;
    };

    function after(node, placing, copyByClone) {
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone),
                refNode = refNode.nextSibling;

            for (var i = 0; i < nodes.length; i++) {
                if (refNode) {
                    parent.insertBefore(nodes[i], refNode);
                } else {
                    parent.appendChild(nodes[i]);
                }
            }
        }
        return this;
    }

    function append(node, placing, copyByClone) {
        var parentNode = node,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            parentNode.appendChild(nodes[i]);
        }
        return this;
    }

    function before(node, placing, copyByClone) {
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone);
            for (var i = 0; i < nodes.length; i++) {
                parent.insertBefore(nodes[i], refNode);
            }
        }
        return this;
    }
    /*   
     * Get the children of the specified node, including text and comment nodes.
     * @param {HTMLElement} elm
     */
    function contents(elm) {
        if (nodeName(elm, "iframe")) {
            return elm.contentDocument;
        }
        return elm.childNodes;
    }

    /*   
     * Create a element and set attributes on it.
     * @param {HTMLElement} tag
     * @param {props} props
     * @param } parent
     */
    function createElement(tag, props, parent) {
        var node = document.createElement(tag);
        if (props) {
            for (var name in props) {
                node.setAttribute(name, props[name]);
            }
        }
        if (parent) {
            append(parent, node);
        }
        return node;
    }

    /*   
     * Create a DocumentFragment from the HTML fragment.
     * @param {String} html
     */
    function createFragment(html) {
        // A special case optimization for a single tag
        html = langx.trim(html);
        if (singleTagRE.test(html)) {
            return [createElement(RegExp.$1)];
        }

        var name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) {
            name = "*"
        }
        var container = containers[name];
        container.innerHTML = "" + html;
        dom = slice.call(container.childNodes);

        dom.forEach(function(node) {
            container.removeChild(node);
        })

        return dom;
    }

    /*   
     * Create a deep copy of the set of matched elements.
     * @param {HTMLElement} node
     * @param {Boolean} deep
     */
    function clone(node, deep) {
        var self = this,
            clone;

        // TODO: Add feature detection here in the future
        if (!isIE || node.nodeType !== 1 || deep) {
            return node.cloneNode(deep);
        }

        // Make a HTML5 safe shallow copy
        if (!deep) {
            clone = document.createElement(node.nodeName);

            // Copy attribs
            each(self.getAttribs(node), function(attr) {
                self.setAttrib(clone, attr.nodeName, self.getAttrib(node, attr.nodeName));
            });

            return clone;
        }
    }

    /*   
     * Check to see if a dom node is a descendant of another dom node .
     * @param {String} node
     * @param {Node} child
     */
    function contains(node, child) {
        return isChildOf(child, node);
    }

    /*   
     * Create a new Text node.
     * @param {String} text
     * @param {Node} child
     */
    function createTextNode(text) {
        return document.createTextNode(text);
    }

    /*   
     * Get the current document object.
     */
    function doc() {
        return document;
    }

    /*   
     * Remove all child nodes of the set of matched elements from the DOM.
     * @param {Object} node
     */
    function empty(node) {
        while (node.hasChildNodes()) {
            var child = node.firstChild;
            node.removeChild(child);
        }
        return this;
    }

    var fulledEl = null;

    function fullScreen(el) {
        if (el === false) {
            browser.exitFullScreen.apply(document);
        } else if (el) {
            browser.requestFullScreen.apply(el);
            fulledEl = el;
        } else {
            return (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            )
        }
    }

   var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
 
    /*   
     * Get the HTML contents of the first element in the set of matched elements.
     * @param {HTMLElement} node
     * @param {String} html
     */
    function html(node, html) {
        if (html === undefined) {
            return node.innerHTML;
        } else {
            this.empty(node);
            html = html || "";
            if (langx.isString(html)) {
                html = html.replace( rxhtmlTag, "<$1></$2>" );
            }
            if (langx.isString(html) || langx.isNumber(html)) {               
                node.innerHTML = html;
            } else if (langx.isArrayLike(html)) {
                for (var i = 0; i < html.length; i++) {
                    node.appendChild(html[i]);
                }
            } else {
                node.appendChild(html);
            }
        }
    }


    /*   
     * Check to see if a dom node is a descendant of another dom node.
     * @param {Node} node
     * @param {Node} parent
     * @param {Node} directly
     */
    function isChildOf(node, parent, directly) {
        if (directly) {
            return node.parentNode === parent;
        }
        if (document.documentElement.contains) {
            return parent.contains(node);
        }
        while (node) {
            if (parent === node) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    }

    /*   
     * Check to see if a dom node is a descendant of another dom node.
     * @param {Node} node
     * @param {Node} parent
     * @param {Node} directly
     */
    function isDoc(node) {
        return node != null && node.nodeType == node.DOCUMENT_NODE
    }

    /*   
     * Get the owner document object for the specified element.
     * @param {Node} elm
     */
    function ownerDoc(elm) {
        if (!elm) {
            return document;
        }

        if (elm.nodeType == 9) {
            return elm;
        }

        return elm.ownerDocument;
    }

    /*   
     *
     * @param {Node} elm
     */
    function ownerWindow(elm) {
        var doc = ownerDoc(elm);
        return doc.defaultView || doc.parentWindow;
    }

    /*   
     * insert one or more nodes as the first children of the specified node.
     * @param {Node} node
     * @param {Node or ArrayLike} placing
     * @param {Boolean Optional} copyByClone
     */
    function prepend(node, placing, copyByClone) {
        var parentNode = node,
            refNode = parentNode.firstChild,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            if (refNode) {
                parentNode.insertBefore(nodes[i], refNode);
            } else {
                parentNode.appendChild(nodes[i]);
            }
        }
        return this;
    }

    /*   
     *
     * @param {Node} elm
     */
    function offsetParent(elm) {
        var parent = elm.offsetParent || document.body;
        while (parent && !rootNodeRE.test(parent.nodeName) && styler.css(parent, "position") == "static") {
            parent = parent.offsetParent;
        }
        return parent;
    }

    /*   
     *
     * @param {Node} elm
     * @param {Node} params
     */
    function overlay(elm, params) {
        var overlayDiv = createElement("div", params);
        styler.css(overlayDiv, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0x7FFFFFFF,
            opacity: 0.7
        });
        elm.appendChild(overlayDiv);
        return overlayDiv;

    }

    /*   
     * Remove the set of matched elements from the DOM.
     * @param {Node} node
     */
    function remove(node) {
        if (node && node.parentNode) {
            try {
                node.parentNode.removeChild(node);
            } catch (e) {
                console.warn("The node is already removed", e);
            }
        }
        return this;
    }

    function removeChild(node,children) {
        if (!langx.isArrayLike(children)) {
            children = [children];
        }
        for (var i=0;i<children.length;i++) {
            node.removeChild(children[i]);
        }

        return this;
    }
    /*   
     * Replace an old node with the specified node.
     * @param {Node} node
     * @param {Node} oldNode
     */
    function replace(node, oldNode) {
        oldNode.parentNode.replaceChild(node, oldNode);
        return this;
    }

    /*   
     * Replace an old node with the specified node.
     * @param {HTMLElement} elm
     * @param {Node} params
     */
    function throb(elm, params) {
        params = params || {};
        var self = this,
            text = params.text,
            style = params.style,
            time = params.time,
            callback = params.callback,
            timer,
            throbber = this.createElement("div", {
                className: params.className || "throbber",
                style: style
            }),
            _overlay = overlay(throbber, {
                className: 'overlay fade'
            }),
            throb = this.createElement("div", {
                className: "throb"
            }),
            textNode = this.createTextNode(text || ""),
            remove = function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (throbber) {
                    self.remove(throbber);
                    throbber = null;
                }
            },
            update = function(params) {
                if (params && params.text && throbber) {
                    textNode.nodeValue = params.text;
                }
            };
        throb.appendChild(textNode);
        throbber.appendChild(throb);
        elm.appendChild(throbber);
        var end = function() {
            remove();
            if (callback) callback();
        };
        if (time) {
            timer = setTimeout(end, time);
        }

        return {
            remove: remove,
            update: update
        };
    }

    /*   
     * traverse the specified node and its descendants, perform the callback function on each
     * @param {Node} node
     * @param {Function} fn
     */
    function traverse(node, fn) {
        fn(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            traverse(node.childNodes[i], fn);
        }
        return this;
    }

    /*   
     *
     * @param {Node} node
     */
    function reverse(node) {
        var firstChild = node.firstChild;
        for (var i = node.children.length - 1; i > 0; i--) {
            if (i > 0) {
                var child = node.children[i];
                node.insertBefore(child, firstChild);
            }
        }
    }

    /*   
     * Wrap an HTML structure around each element in the set of matched elements.
     * @param {Node} node
     * @param {Node} wrapperNode
     */
    function wrapper(node, wrapperNode) {
        if (langx.isString(wrapperNode)) {
            wrapperNode = this.createFragment(wrapperNode).firstChild;
        }
        node.parentNode.insertBefore(wrapperNode, node);
        wrapperNode.appendChild(node);
    }

    /*   
     * Wrap an HTML structure around the content of each element in the set of matched
     * @param {Node} node
     * @param {Node} wrapperNode
     */
    function wrapperInner(node, wrapperNode) {
        var childNodes = slice.call(node.childNodes);
        node.appendChild(wrapperNode);
        for (var i = 0; i < childNodes.length; i++) {
            wrapperNode.appendChild(childNodes[i]);
        }
        return this;
    }

    /*   
     * Remove the parents of the set of matched elements from the DOM, leaving the matched
     * @param {Node} node
     */
    function unwrap(node) {
        var child, parent = node.parentNode;
        if (parent) {
            if (this.isDoc(parent.parentNode)) return;
            parent.parentNode.insertBefore(node, parent);
        }
    }

    function noder() {
        return noder;
    }

    langx.mixin(noder, {
        body: function() {
            return document.body;
        },

        clone: clone,
        contents: contents,

        createElement: createElement,

        createFragment: createFragment,

        contains: contains,

        createTextNode: createTextNode,

        doc: doc,

        empty: empty,

        fullScreen: fullScreen,

        html: html,

        isChildOf: isChildOf,

        isDoc: isDoc,

        isWindow: langx.isWindow,

        offsetParent: offsetParent,

        ownerDoc: ownerDoc,

        ownerWindow: ownerWindow,

        after: after,

        before: before,

        prepend: prepend,

        append: append,

        remove: remove,

        removeChild : removeChild,

        replace: replace,

        throb: throb,

        traverse: traverse,

        reverse: reverse,

        wrapper: wrapper,

        wrapperInner: wrapperInner,

        unwrap: unwrap
    });

    return skylark.noder = noder;
});
define('skylark-utils-dom/css',[
    "./skylark",
    "./langx",
    "./noder"
], function(skylark, langx, noder) {

    var head = document.getElementsByTagName("head")[0],
        count = 0,
        sheetsByUrl = {},
        sheetsById = {},
        defaultSheetId = _createStyleSheet(),
        defaultSheet = sheetsById[defaultSheetId],
        rulesPropName = ("cssRules" in defaultSheet) ? "cssRules" : "rules",
        insertRuleFunc,
        deleteRuleFunc = defaultSheet.deleteRule || defaultSheet.removeRule;

    if (defaultSheet.insertRule) {
        var _insertRule = defaultSheet.insertRule;
        insertRuleFunc = function(selector, css, index) {
            _insertRule.call(this, selector + "{" + css + "}", index);
        };
    } else {
        insertRuleFunc = defaultSheet.addRule;
    }

    function normalizeSelector(selectorText) {
        var selector = [],
            last, len;
        last = defaultSheet[rulesPropName].length;
        insertRuleFunc.call(defaultSheet, selectorText, ';');
        len = defaultSheet[rulesPropName].length;
        for (var i = len - 1; i >= last; i--) {
            selector.push(_sheet[_rules][i].selectorText);
            deleteRuleFunc.call(defaultSheet, i);
        }
        return selector.reverse().join(', ');
    }

    /*
     * create a stylesheet element.
     * @param {Boolean} external
     * @param {Object} options
     * @param {String} [options.media = null]
     */
    function _createStyleSheet(external,options ) {
        var node,
            props = {
                type : "text/css"
            },
            id = (count++);

        options = options || {};
        if (options.media) {
            props.media = options.media;
        }

        if (external) {
            node = noder.create("link",langx.mixin(props,{
                rel  : "stylesheet",
                async : false
            }));
        } else {
            node = noder.createElement("style",props);
        }

        noder.append(head,node);
        sheetsById[id] = {
            id : id,
            node :node
        };

        return id;
    }

    function createStyleSheet(css,options) {
        if (!options) {
            options = {};
        }
        var sheetId = _createStyleSheet(false,options);
        if (css) {
            addSheetRules(sheetId,css);
        }

        return sheetId;
    }

    function loadStyleSheet(url, options) {
        var sheet = sheetsByUrl[url];
        if (!sheet) {
            var sheetId = _createStyleSheet(true,options);

            sheet = sheetsByUrl[url] = sheetsById[sheetId];
            langx.mixin(sheet,{
                state: 0, //0:unload,1:loaded,-1:loaderror
                url : url,
                deferred : new langx.Deferred()
            });

            var node = sheet.node;

            startTime = new Date().getTime();

            node.onload = function() {
                sheet.state = 1;
                sheet.deferred.resolve(sheet.id);
            },
            node.onerror = function(e) {
                sheet.state = -1;
                sheet.deferred.reject(e);
            };

            node.href = sheet.url;
        }
        return sheet.deferred.promise;
    }

    function deleteSheetRule(sheetId, rule) {
        var sheet = sheetsById[sheetId];
        if (langx.isNumber(rule)) {
            deleteRuleFunc.call(sheet, rule);
        } else {
            langx.each(sheet[rulesPropName], function(i, _rule) {
                if (rule === _rule) {
                    deleteRuleFunc.call(sheet, i);
                    return false;
                }
            });
        }
        return this;
    }

    function deleteRule(rule) {
        deleteSheetRule(defaultSheetId, rule);
        return this;
    }

    function removeStyleSheet(sheetId) {
        if (sheetId === defaultSheetId) {
            throw new Error("The default stylesheet can not be deleted");
        }
        var sheet = sheetsById[sheetId];
        delete sheetsById[sheetId];

        noder.remove(sheet.node);
        return this;
    }

    /*
     * insert a rule to the default stylesheet.
     * @param {String} selector
     * @param {String} css
     * @param {Number} index 
     */
    function insertRule(selector, css, index) {
        return this.insertSheetRule(defaultSheetId, selector, css, index);
    }

    /*
     * Add rules to the default stylesheet.
     * @param {Object} rules
     */
    function addRules(rules) {
        return this.addRules(defaultSheetId,rules);
    }

    /*
     * insert a rule to the stylesheet specified by sheetId.
     * @param {Number} sheetId  
     * @param {String} selector
     * @param {String} css
     * @param {Number} index 
     */
    function insertSheetRule(sheetId, selector, css, index) {
        if (!selector || !css) {
            return -1;
        }

        var sheet = sheetsById[sheetId];
        index = index || sheet[rulesPropName].length;

        return insertRuleFunc.call(sheet, selector, css, index);
    }

    /*
     * Add  rules to stylesheet.
     * @param {Number} sheetId  
     * @param {Object|String} rules
     * @return this
     * @example insertSheetRules(sheetId,{
     * 
     * });
     */
    function addSheetRules(sheetId,rules) {
        var sheet = sheetsById[sheetId],
            css;
        if (langx.isString(rules)) {
            css = rules;
        } else {
            css = toString(rules);
        }

        noder.append(sheet.node,noder.createTextNode(css));
        
        return this;
    }

    function isAtRule(str) {
        return str.startsWith("@");
    }

    function toString(json){
        var adjust = function(parentName,name,depth) {
            if (parentName) {
                if (isAtRule(parentName)) {
                    depth += 1;
                } else {
                    name =  parentName + " " + name;
                }                
            }
            return {
                name : name,
                depth : depth
            }
        };

        var strNode = function (name, values, depth) {
            var str = "",
                atFlg = isAtRule(name);


            if (isAtRule(name)) {
                // at rule
                if (langx.isString(values)) {
                    // an at rule without block
                    // ex: (1) @charset 'utf8';
                    str = css.SPACE.repeat(depth) + name.trim() + " \"" + values.trim() + " \";\n";
                } else {
                    // an at rule with block, ex :
                    //  @media 'screen' {
                    //  }
                    str += css.SPACE.repeat(depth) + name.trim() + " {\n";
                    str += strNode("",values,depth+1);
                    str += css.SPACE.repeat(depth) + " }\n";
                }
            } else {
                // a selector or a property
                if (langx.isString(values)) {
                    // a css property 
                    // ex : (1) font-color : red;
                    str = css.SPACE.repeat(depth) + name.trim() ;
                    if (atFlg) {
                        str = str +  " \"" + values.trim() + " \";\n";
                    } else {
                        str = str + ': ' + values.trim() + ";\n";
                    }

                } else {
                    // a selector rule 
                    // ex : (1) .class1 : {
                    //            font-color : red;
                    //          }
                    if (langx.isArray(values)) {
                        // array for ordering
                        for (var n =0; n<values.length; n ++) {
                           str +=  strNode(name,values[n],depth);
                        }
                    } else {
                        // plain object

                        if (name) {
                            str += css.SPACE.repeat(depth) + name.trim() + " {\n";

                            for (var n in values) {
                                var value =values[n];
                                if (langx.isString(value)) {
                                    // css property
                                    str += strNode(n,value,depth+1)
                                }
                            }

                            str += css.SPACE.repeat(depth) + "}\n";
                        }

                        for (var n in values) {
                            var value =values[n];
                            if (!langx.isString(value)) {
                                var adjusted = adjust(name,n,depth);
                                str +=  strNode(adjusted.name,value,adjusted.depth);
                            } 
                        }

                    }
                }
            }   

            return str;
        };


        return strNode("",json,0);
    }
 

    function css() {
        return css;
    }

    langx.mixin(css, {
        SPACE : "\t",

        addRules : addRules,

        addSheetRules : addSheetRules,

        createStyleSheet: createStyleSheet,

        deleteSheetRule : deleteSheetRule,

        deleteRule : deleteRule,

        insertRule : insertRule,

        insertSheetRule : insertSheetRule,

        removeStyleSheet : removeStyleSheet,

        toString : toString
    });

    return skylark.css = css;
});

define('skylark-utils/css',[
    "skylark-utils-dom/css"
], function(css) {
    return css;
});

define('skylark-utils-css/css',[
    "skylark-utils/skylark",
    "skylark-utils/css"
], function(skylark, css) {
	
	return css;
});
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
        http://jsbeautifier.org/

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are (default in brackets):
        indent_size (4)                   — indentation size,
        indent_char (space)               — character to indent with,
        selector_separator_newline (true) - separate selectors with newline or
                                            not (e.g. "a,\nbr" or "a, br")
        end_with_newline (false)          - end with a newline

    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t',
      'selector_separator': ' ',
      'end_with_newline': false,
    });
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/

define('skylark-utils-css/primitives/beautify-css',[],function() {
    function css_beautify(source_text, options) {
        options = options || {};
        var indentSize = options.indent_size || 4;
        var indentCharacter = options.indent_char || ' ';
        var selectorSeparatorNewline = (options.selector_separator_newline === undefined) ? true : options.selector_separator_newline;
        var end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;

        // compatibility
        if (typeof indentSize === "string") {
            indentSize = parseInt(indentSize, 10);
        }


        // tokenizer
        var whiteRe = /^\s+$/;
        var wordRe = /[\w$\-_]/;

        var pos = -1,
            ch;

        function next() {
            ch = source_text.charAt(++pos);
            return ch || '';
        }

        function peek(skipWhitespace) {
            var prev_pos = pos;
            if (skipWhitespace) {
                eatWhitespace();
            }
            result = source_text.charAt(pos + 1) || '';
            pos = prev_pos - 1;
            next();
            return result;
        }

        function eatString(endChars) {
            var start = pos;
            while (next()) {
                if (ch === "\\") {
                    next();
                } else if (endChars.indexOf(ch) !== -1) {
                    break;
                } else if (ch === "\n") {
                    break;
                }
            }
            return source_text.substring(start, pos + 1);
        }

        function peekString(endChar) {
            var prev_pos = pos;
            var str = eatString(endChar);
            pos = prev_pos - 1;
            next();
            return str;
        }

        function eatWhitespace() {
            var result = '';
            while (whiteRe.test(peek())) {
                next()
                result += ch;
            }
            return result;
        }

        function skipWhitespace() {
            var result = '';
            if (ch && whiteRe.test(ch)) {
                result = ch;
            }
            while (whiteRe.test(next())) {
                result += ch
            }
            return result;
        }

        function eatComment(singleLine) {
            var start = pos;
            var singleLine = peek() === "/";
            next();
            while (next()) {
                if (!singleLine && ch === "*" && peek() === "/") {
                    next();
                    break;
                } else if (singleLine && ch === "\n") {
                    return source_text.substring(start, pos);
                }
            }

            return source_text.substring(start, pos) + ch;
        }


        function lookBack(str) {
            return source_text.substring(pos - str.length, pos).toLowerCase() ===
                str;
        }

        // Nested pseudo-class if we are insideRule
        // and the next special character found opens
        // a new block
        function foundNestedPseudoClass() {
            for (var i = pos + 1; i < source_text.length; i++){
                var ch = source_text.charAt(i);
                if (ch === "{"){
                    return true;
                } else if (ch === ";" || ch === "}" || ch === ")") {
                    return false;
                }
            }
            return false;
        }

        // printer
        var basebaseIndentString = source_text.match(/^[\t ]*/)[0];
        var singleIndent = new Array(indentSize + 1).join(indentCharacter);
        var indentLevel = 0;
        var nestedLevel = 0;

        function indent() {
            indentLevel++;
            basebaseIndentString += singleIndent;
        }

        function outdent() {
            indentLevel--;
            basebaseIndentString = basebaseIndentString.slice(0, -indentSize);
        }

        var print = {};
        print["{"] = function(ch) {
            print.singleSpace();
            output.push(ch);
            print.newLine();
        };
        print["}"] = function(ch) {
            print.newLine();
            output.push(ch);
            print.newLine();
        };

        print._lastCharWhitespace = function() {
            return whiteRe.test(output[output.length - 1]);
        };

        print.newLine = function(keepWhitespace) {
            if (!keepWhitespace) {
                print.trim();
            }

            if (output.length) {
                output.push('\n');
            }
            if (basebaseIndentString) {
                output.push(basebaseIndentString);
            }
        };
        print.singleSpace = function() {
            if (output.length && !print._lastCharWhitespace()) {
                output.push(' ');
            }
        };

        print.trim = function() {
            while (print._lastCharWhitespace()) {
                output.pop();
            }
        };


        var output = [];
        if (basebaseIndentString) {
            output.push(basebaseIndentString);
        }
        /*_____________________--------------------_____________________*/

        var insideRule = false;
        var enteringConditionalGroup = false;
        var top_ch = '';
        var last_top_ch = '';

        while (true) {
            var whitespace = skipWhitespace();
            var isAfterSpace = whitespace !== '';
            var isAfterNewline = whitespace.indexOf('\n') !== -1;
            var last_top_ch = top_ch;
            var top_ch = ch;

            if (!ch) {
                break;
            } else if (ch === '/' && peek() === '*') { /* css comment */
                var header = lookBack("");
                print.newLine();
                output.push(eatComment());
                print.newLine();
                if (header) {
                    print.newLine(true);
                }
            } else if (ch === '/' && peek() === '/') { // single line comment
                if (!isAfterNewline && last_top_ch !== '{') {
                    print.trim();
                }
                print.singleSpace();
                output.push(eatComment());
                print.newLine();
            } else if (ch === '@') {
                // pass along the space we found as a separate item
                if (isAfterSpace) {
                    print.singleSpace();
                }
                output.push(ch);

                // strip trailing space, if present, for hash property checks
                var variableOrRule = peekString(": ,;{}()[]/='\"").replace(/\s$/, '');

                // might be a nesting at-rule
                if (variableOrRule in css_beautify.NESTED_AT_RULE) {
                    nestedLevel += 1;
                    if (variableOrRule in css_beautify.CONDITIONAL_GROUP_RULE) {
                        enteringConditionalGroup = true;
                    }
                } else if (': '.indexOf(variableOrRule[variableOrRule.length -1]) >= 0) {
                    //we have a variable, add it and insert one space before continuing
                    next();
                    variableOrRule = eatString(": ").replace(/\s$/, '');
                    output.push(variableOrRule);
                    print.singleSpace();
                }
            } else if (ch === '{') {
                if (peek(true) === '}') {
                    eatWhitespace();
                    next();
                    print.singleSpace();
                    output.push("{}");
                } else {
                    indent();
                    print["{"](ch);
                    // when entering conditional groups, only rulesets are allowed
                    if (enteringConditionalGroup) {
                        enteringConditionalGroup = false;
                        insideRule = (indentLevel > nestedLevel);
                    } else {
                        // otherwise, declarations are also allowed
                        insideRule = (indentLevel >= nestedLevel);
                    }
                }
            } else if (ch === '}') {
                outdent();
                print["}"](ch);
                insideRule = false;
                if (nestedLevel) {
                    nestedLevel--;
                }
            } else if (ch === ":") {
                eatWhitespace();
                if ((insideRule || enteringConditionalGroup) &&
                        !(lookBack("&") || foundNestedPseudoClass())) {
                    // 'property: value' delimiter
                    // which could be in a conditional group query
                    output.push(':');
                    print.singleSpace();
                } else {
                    // sass/less parent reference don't use a space
                    // sass nested pseudo-class don't use a space
                    if (peek() === ":") {
                        // pseudo-element
                        next();
                        output.push("::");
                    } else {
                        // pseudo-class
                        output.push(':');
                    }
                }
            } else if (ch === '"' || ch === '\'') {
                if (isAfterSpace) {
                    print.singleSpace();
                }
                output.push(eatString(ch));
            } else if (ch === ';') {
                output.push(ch);
                print.newLine();
            } else if (ch === '(') { // may be a url
                if (lookBack("url")) {
                    output.push(ch);
                    eatWhitespace();
                    if (next()) {
                        if (ch !== ')' && ch !== '"' && ch !== '\'') {
                            output.push(eatString(')'));
                        } else {
                            pos--;
                        }
                    }
                } else {
                    if (isAfterSpace) {
                        print.singleSpace();
                    }
                    output.push(ch);
                    eatWhitespace();
                }
            } else if (ch === ')') {
                output.push(ch);
            } else if (ch === ',') {
                output.push(ch);
                eatWhitespace();
                if (!insideRule && selectorSeparatorNewline) {
                    print.newLine();
                } else {
                    print.singleSpace();
                }
            } else if (ch === ']') {
                output.push(ch);
            } else if (ch === '[') {
                if (isAfterSpace) {
                    print.singleSpace();
                }
                output.push(ch);
            } else if (ch === '=') { // no whitespace before or after
                eatWhitespace();
                output.push(ch);
            } else {
                if (isAfterSpace) {
                    print.singleSpace();
                }

                output.push(ch);
            }
        }


        var sweetCode = output.join('').replace(/[\r\n\t ]+$/, '');

        // establish end_with_newline
        if (end_with_newline) {
            sweetCode += "\n";
        }

        return sweetCode;
    }

    // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
    css_beautify.NESTED_AT_RULE = {
        "@page": true,
        "@font-face": true,
        "@keyframes": true,
        // also in CONDITIONAL_GROUP_RULE below
        "@media": true,
        "@supports": true,
        "@document": true
    };
    css_beautify.CONDITIONAL_GROUP_RULE = {
        "@media": true,
        "@supports": true,
        "@document": true
    };

    return {
        css_beautify: css_beautify
    };
});

define('skylark-utils-css/beautify',[
    "./css",
    "./primitives/beautify-css"
], function(css, beautifyCss) {

	return css.beautify = beautifyCss.css_beautify;
});
define('skylark-utils-dom/finder',[
    "./skylark",
    "./langx",
    "./browser",
    "./noder"
], function(skylark, langx, browser, noder, velm) {
    var local = {},
        filter = Array.prototype.filter,
        slice = Array.prototype.slice,
        nativeMatchesSelector = browser.matchesSelector;

    /*
    ---
    name: Slick.Parser
    description: Standalone CSS3 Selector parser
    provides: Slick.Parser
    ...
    */
    ;
    (function() {

        var parsed,
            separatorIndex,
            combinatorIndex,
            reversed,
            cache = {},
            reverseCache = {},
            reUnescape = /\\/g;

        var parse = function(expression, isReversed) {
            if (expression == null) return null;
            if (expression.Slick === true) return expression;
            expression = ('' + expression).replace(/^\s+|\s+$/g, '');
            reversed = !!isReversed;
            var currentCache = (reversed) ? reverseCache : cache;
            if (currentCache[expression]) return currentCache[expression];
            parsed = {
                Slick: true,
                expressions: [],
                raw: expression,
                reverse: function() {
                    return parse(this.raw, true);
                }
            };
            separatorIndex = -1;
            while (expression != (expression = expression.replace(regexp, parser)));
            parsed.length = parsed.expressions.length;
            return currentCache[parsed.raw] = (reversed) ? reverse(parsed) : parsed;
        };

        var reverseCombinator = function(combinator) {
            if (combinator === '!') return ' ';
            else if (combinator === ' ') return '!';
            else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
            else return '!' + combinator;
        };

        var reverse = function(expression) {
            var expressions = expression.expressions;
            for (var i = 0; i < expressions.length; i++) {
                var exp = expressions[i];
                var last = {
                    parts: [],
                    tag: '*',
                    combinator: reverseCombinator(exp[0].combinator)
                };

                for (var j = 0; j < exp.length; j++) {
                    var cexp = exp[j];
                    if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
                    cexp.combinator = cexp.reverseCombinator;
                    delete cexp.reverseCombinator;
                }

                exp.reverse().push(last);
            }
            return expression;
        };

        var escapeRegExp = (function() {
            // Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
            var from = /(?=[\-\[\]{}()*+?.\\\^$|,#\s])/g,
                to = '\\';
            return function(string) {
                return string.replace(from, to)
            }
        }())

        var regexp = new RegExp(
            "^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:+)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
            .replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
            .replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
            .replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
        );

        function parser(
            rawMatch,

            separator,
            combinator,
            combinatorChildren,

            tagName,
            id,
            className,

            attributeKey,
            attributeOperator,
            attributeQuote,
            attributeValue,

            pseudoMarker,
            pseudoClass,
            pseudoQuote,
            pseudoClassQuotedValue,
            pseudoClassValue
        ) {
            if (separator || separatorIndex === -1) {
                parsed.expressions[++separatorIndex] = [];
                combinatorIndex = -1;
                if (separator) return '';
            }

            if (combinator || combinatorChildren || combinatorIndex === -1) {
                combinator = combinator || ' ';
                var currentSeparator = parsed.expressions[separatorIndex];
                if (reversed && currentSeparator[combinatorIndex])
                    currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
                currentSeparator[++combinatorIndex] = {
                    combinator: combinator,
                    tag: '*'
                };
            }

            var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

            if (tagName) {
                currentParsed.tag = tagName.replace(reUnescape, '');

            } else if (id) {
                currentParsed.id = id.replace(reUnescape, '');

            } else if (className) {
                className = className.replace(reUnescape, '');

                if (!currentParsed.classList) currentParsed.classList = [];
                if (!currentParsed.classes) currentParsed.classes = [];
                currentParsed.classList.push(className);
                currentParsed.classes.push({
                    value: className,
                    regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
                });

            } else if (pseudoClass) {
                pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
                pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

                if (!currentParsed.pseudos) currentParsed.pseudos = [];
                currentParsed.pseudos.push({
                    key: pseudoClass.replace(reUnescape, ''),
                    value: pseudoClassValue,
                    type: pseudoMarker.length == 1 ? 'class' : 'element'
                });

            } else if (attributeKey) {
                attributeKey = attributeKey.replace(reUnescape, '');
                attributeValue = (attributeValue || '').replace(reUnescape, '');

                var test, regexp;

                switch (attributeOperator) {
                    case '^=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue));
                        break;
                    case '$=':
                        regexp = new RegExp(escapeRegExp(attributeValue) + '$');
                        break;
                    case '~=':
                        regexp = new RegExp('(^|\\s)' + escapeRegExp(attributeValue) + '(\\s|$)');
                        break;
                    case '|=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue) + '(-|$)');
                        break;
                    case '=':
                        test = function(value) {
                            return attributeValue == value;
                        };
                        break;
                    case '*=':
                        test = function(value) {
                            return value && value.indexOf(attributeValue) > -1;
                        };
                        break;
                    case '!=':
                        test = function(value) {
                            return attributeValue != value;
                        };
                        break;
                    default:
                        test = function(value) {
                            return !!value;
                        };
                }

                if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function() {
                    return false;
                };

                if (!test) test = function(value) {
                    return value && regexp.test(value);
                };

                if (!currentParsed.attributes) currentParsed.attributes = [];
                currentParsed.attributes.push({
                    key: attributeKey,
                    operator: attributeOperator,
                    value: attributeValue,
                    test: test
                });

            }

            return '';
        };

        // Slick NS

        var Slick = (this.Slick || {});

        Slick.parse = function(expression) {
            return parse(expression);
        };

        Slick.escapeRegExp = escapeRegExp;

        if (!this.Slick) this.Slick = Slick;

    }).apply(local);


    var simpleClassSelectorRE = /^\.([\w-]*)$/,
        simpleIdSelectorRE = /^#([\w-]*)$/,
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        slice = Array.prototype.slice;


    local.parseSelector = local.Slick.parse;


    var pseudos = local.pseudos = {
        // custom pseudos
        "button": function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === "button" || name === "button";
        },

        'checked': function(elm) {
            return !!elm.checked;
        },

        'contains': function(elm, idx, nodes, text) {
            if ($(this).text().indexOf(text) > -1) return this
        },

        'disabled': function(elm) {
            return !!elm.disabled;
        },

        'enabled': function(elm) {
            return !elm.disabled;
        },

        'eq': function(elm, idx, nodes, value) {
            return (idx == value);
        },

        'even': function(elm, idx, nodes, value) {
            return (idx % 2) === 0;
        },

        'focus': function(elm) {
            return document.activeElement === elm && (elm.href || elm.type || elm.tabindex);
        },

        'first': function(elm, idx) {
            return (idx === 0);
        },

        'gt': function(elm, idx, nodes, value) {
            return (idx > value);
        },

        'has': function(elm, idx, nodes, sel) {
            return find(elm, sel);
        },

        // Element/input types
        "header": function(elem) {
            return rheader.test(elem.nodeName);
        },

        'hidden': function(elm) {
            return !local.pseudos["visible"](elm);
        },

        "input": function(elem) {
            return rinputs.test(elem.nodeName);
        },

        'last': function(elm, idx, nodes) {
            return (idx === nodes.length - 1);
        },

        'lt': function(elm, idx, nodes, value) {
            return (idx < value);
        },

        'not': function(elm, idx, nodes, sel) {
            return !matches(elm, sel);
        },

        'odd': function(elm, idx, nodes, value) {
            return (idx % 2) === 1;
        },

        /*   
         * Get the parent of each element in the current set of matched elements.
         * @param {Object} elm
         */
        'parent': function(elm) {
            return !!elm.parentNode;
        },

        'selected': function(elm) {
            return !!elm.selected;
        },

        'text': function(elm) {
            return elm.type === "text";
        },

        'visible': function(elm) {
            return elm.offsetWidth && elm.offsetWidth
        }
    };

    ["first", "eq", "last"].forEach(function(item) {
        pseudos[item].isArrayFilter = true;
    });



    pseudos["nth"] = pseudos["eq"];

    function createInputPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === type;
        };
    }

    function createButtonPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === "input" || name === "button") && elem.type === type;
        };
    }

    // Add button/input type pseudos
    for (i in {
        radio: true,
        checkbox: true,
        file: true,
        password: true,
        image: true
    }) {
        pseudos[i] = createInputPseudo(i);
    }
    for (i in {
        submit: true,
        reset: true
    }) {
        pseudos[i] = createButtonPseudo(i);
    }


    local.divide = function(cond) {
        var nativeSelector = "",
            customPseudos = [],
            tag,
            id,
            classes,
            attributes,
            pseudos;


        if (id = cond.id) {
            nativeSelector += ("#" + id);
        }
        if (classes = cond.classes) {
            for (var i = classes.length; i--;) {
                nativeSelector += ("." + classes[i].value);
            }
        }
        if (attributes = cond.attributes) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].operator) {
                    nativeSelector += ("[" + attributes[i].key + attributes[i].operator + JSON.stringify(attributes[i].value) + "]");
                } else {
                    nativeSelector += ("[" + attributes[i].key + "]");
                }
            }
        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (this.pseudos[part.key]) {
                    customPseudos.push(part);
                } else {
                    if (part.value !== undefined) {
                        nativeSelector += (":" + part.key + "(" + JSON.stringify(part))
                    }
                }
            }
        }

        if (tag = cond.tag) {
            if (tag !== "*") {
                nativeSelector = tag.toUpperCase() + nativeSelector;
            }
        }

        if (!nativeSelector) {
            nativeSelector = "*";
        }

        return {
            nativeSelector: nativeSelector,
            customPseudos: customPseudos
        }

    };

    local.check = function(node, cond, idx, nodes, arrayFilte) {
        var tag,
            id,
            classes,
            attributes,
            pseudos,

            i, part, cls, pseudo;

        if (!arrayFilte) {
            if (tag = cond.tag) {
                var nodeName = node.nodeName.toUpperCase();
                if (tag == '*') {
                    if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
                } else {
                    if (nodeName != (tag || "").toUpperCase()) return false;
                }
            }

            if (id = cond.id) {
                if (node.getAttribute('id') != id) {
                    return false;
                }
            }


            if (classes = cond.classes) {
                for (i = classes.length; i--;) {
                    cls = node.getAttribute('class');
                    if (!(cls && classes[i].regexp.test(cls))) return false;
                }
            }

            if (attributes = cond.attributes) {
                for (i = attributes.length; i--;) {
                    part = attributes[i];
                    if (part.operator ? !part.test(node.getAttribute(part.key)) : !node.hasAttribute(part.key)) return false;
                }
            }

        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (pseudo = this.pseudos[part.key]) {
                    if ((arrayFilte && pseudo.isArrayFilter) || (!arrayFilte && !pseudo.isArrayFilter)) {
                        if (!pseudo(node, idx, nodes, part.value)) {
                            return false;
                        }
                    }
                } else {
                    if (!arrayFilte && !nativeMatchesSelector.call(node, part.key)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    local.match = function(node, selector) {

        var parsed;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            parsed = selector;
        }

        if (!parsed) {
            return true;
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            simpleExpCounter = 0,
            i,
            currentExpression;
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];
                if (this.check(node, exp)) {
                    return true;
                }
                simpleExpCounter++;
            }
        }

        if (simpleExpCounter == parsed.length) {
            return false;
        }

        var nodes = this.query(document, parsed),
            item;
        for (i = 0; item = nodes[i++];) {
            if (item === node) {
                return true;
            }
        }
        return false;
    };


    local.filterSingle = function(nodes, exp) {
        var matchs = filter.call(nodes, function(node, idx) {
            return local.check(node, exp, idx, nodes, false);
        });

        matchs = filter.call(matchs, function(node, idx) {
            return local.check(node, exp, idx, matchs, true);
        });
        return matchs;
    };

    local.filter = function(nodes, selector) {
        var parsed;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            return local.filterSingle(nodes, selector);
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            i,
            currentExpression,
            ret = [];
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];

                var matchs = local.filterSingle(nodes, exp);

                ret = langx.uniq(ret.concat(matchs));
            } else {
                throw new Error("not supported selector:" + selector);
            }
        }

        return ret;

    };

    local.combine = function(elm, bit) {
        var op = bit.combinator,
            cond = bit,
            node1,
            nodes = [];

        switch (op) {
            case '>': // direct children
                nodes = children(elm, cond);
                break;
            case '+': // next sibling
                node1 = nextSibling(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '^': // first child
                node1 = firstChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '~': // next siblings
                nodes = nextSiblings(elm, cond);
                break;
            case '++': // next sibling and previous sibling
                var prev = previousSibling(elm, cond, true),
                    next = nextSibling(elm, cond, true);
                if (prev) {
                    nodes.push(prev);
                }
                if (next) {
                    nodes.push(next);
                }
                break;
            case '~~': // next siblings and previous siblings
                nodes = siblings(elm, cond);
                break;
            case '!': // all parent nodes up to document
                nodes = ancestors(elm, cond);
                break;
            case '!>': // direct parent (one level)
                node1 = parent(elm, cond);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!+': // previous sibling
                nodes = previousSibling(elm, cond, true);
                break;
            case '!^': // last child
                node1 = lastChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!~': // previous siblings
                nodes = previousSiblings(elm, cond);
                break;
            default:
                var divided = this.divide(bit);
                nodes = slice.call(elm.querySelectorAll(divided.nativeSelector));
                if (divided.customPseudos) {
                    for (var i = divided.customPseudos.length - 1; i >= 0; i--) {
                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes, false)
                        });

                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes, true)
                        });
                    }
                }
                break;

        }
        return nodes;
    }

    local.query = function(node, selector, single) {


        var parsed = this.Slick.parse(selector);

        var
            founds = [],
            currentExpression, currentBit,
            expressions = parsed.expressions;

        for (var i = 0;
            (currentExpression = expressions[i]); i++) {
            var currentItems = [node],
                found;
            for (var j = 0;
                (currentBit = currentExpression[j]); j++) {
                found = langx.map(currentItems, function(item, i) {
                    return local.combine(item, currentBit)
                });
                if (found) {
                    currentItems = found;
                }
            }
            if (found) {
                founds = founds.concat(found);
            }
        }

        return founds;
    }

    /*
     * Get the nearest ancestor of the specified element,optional matched by a selector.
     * @param {HTMLElement} node
     * @param {String Optional } selector
     * @param {Object} root
     */
    function ancestor(node, selector, root) {
        var rootIsSelector = root && langx.isString(root);
        while (node = node.parentNode) {
            if (matches(node, selector)) {
                return node;
            }
            if (root) {
                if (rootIsSelector) {
                    if (matches(node, root)) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            }
        }
        return null;
    }

    /*
     * Get the ancestors of the specitied element , optionally filtered by a selector.
     * @param {HTMLElement} node
     * @param {String Optional } selector
     * @param {Object} root
     */
    function ancestors(node, selector, root) {
        var ret = [],
            rootIsSelector = root && langx.isString(root);
        while ((node = node.parentNode) && (node.nodeType !== 9)) {
            ret.push(node);
            if (root) {
                if (rootIsSelector) {
                    if (matches(node, root)) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            }

        }

        if (selector) {
            ret = local.filter(ret, selector);
        }
        return ret;
    }

    /*
     * Returns a element by its ID.
     * @param {string} id
     */
    function byId(id, doc) {
        doc = doc || noder.doc();
        return doc.getElementById(id);
    }

    /*
     * Get the children of the specified element , optionally filtered by a selector.
     * @param {string} node
     * @param {String optionlly} selector
     */
    function children(node, selector) {
        var childNodes = node.childNodes,
            ret = [];
        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if (node.nodeType == 1) {
                ret.push(node);
            }
        }
        if (selector) {
            ret = local.filter(ret, selector);
        }
        return ret;
    }

    function closest(node, selector) {
        while (node && !(matches(node, selector))) {
            node = node.parentNode;
        }

        return node;
    }

    /*
     * Get the decendant of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function descendants(elm, selector) {
        // Selector
        try {
            return slice.call(elm.querySelectorAll(selector));
        } catch (matchError) {
            //console.log(matchError);
        }
        return local.query(elm, selector);
    }

    /*
     * Get the nearest decendent of the specified element,optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function descendant(elm, selector) {
        // Selector
        try {
            return elm.querySelector(selector);
        } catch (matchError) {
            //console.log(matchError);
        }
        var nodes = local.query(elm, selector);
        if (nodes.length > 0) {
            return nodes[0];
        } else {
            return null;
        }
    }

    /*
     * Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function find(elm, selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        if (matches(elm, selector)) {
            return elm;
        } else {
            return descendant(elm, selector);
        }
    }

    /*
     * Get the findAll of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function findAll(elm, selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        return descendants(elm, selector);
    }

    /*
     * Get the first child of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {String} first
     */
    function firstChild(elm, selector, first) {
        var childNodes = elm.childNodes,
            node = childNodes[0];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (first) {
                    break;
                }
            }
            node = node.nextSibling;
        }

        return null;
    }

    /*
     * Get the last child of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {String } last
     */
    function lastChild(elm, selector, last) {
        var childNodes = elm.childNodes,
            node = childNodes[childNodes.length - 1];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (last) {
                    break;
                }
            }
            node = node.previousSibling;
        }

        return null;
    }

    /*
     * Check the specified element against a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function matches(elm, selector) {
        if (!selector || !elm || elm.nodeType !== 1) {
            return false
        }

        if (langx.isString(selector)) {
            try {
                return nativeMatchesSelector.call(elm, selector.replace(/\[([^=]+)=\s*([^'"\]]+?)\s*\]/g, '[$1="$2"]'));
            } catch (matchError) {
                //console.log(matchError);
            }
            return local.match(elm, selector);
        } else if (langx.isArrayLike(selector)) {
            return langx.inArray(elm, selector) > -1;
        } else if (langx.isPlainObject(selector)) {
            return local.check(elm, selector);
        } else {
            return elm === selector;
        }

    }

    /*
     * Get the nearest next sibing of the specitied element , optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {Boolean Optional} adjacent
     */
    function nextSibling(elm, selector, adjacent) {
        var node = elm.nextSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.nextSibling;
        }
        return null;
    }

    /*
     * Get the next siblings of the specified element , optional filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function nextSiblings(elm, selector) {
        var node = elm.nextSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }

    /*
     * Get the parent element of the specified element. if a selector is provided, it retrieves the parent element only if it matches that selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function parent(elm, selector) {
        var node = elm.parentNode;
        if (node && (!selector || matches(node, selector))) {
            return node;
        }

        return null;
    }

    /*
     * Get hte nearest previous sibling of the specified element ,optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {Boolean Optional } adjacent
     */
    function previousSibling(elm, selector, adjacent) {
        var node = elm.previousSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.previousSibling;
        }
        return null;
    }

    /*
     * Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function previousSiblings(elm, selector) {
        var node = elm.previousSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.previousSibling;
        }
        return ret;
    }

    /*
     * Selects all sibling elements that follow after the “prev” element, have the same parent, and match the filtering “siblings” selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function siblings(elm, selector) {
        var node = elm.parentNode.firstChild,
            ret = [];
        while (node) {
            if (node.nodeType == 1 && node !== elm) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }

    var finder = function() {
        return finder;
    };

    langx.mixin(finder, {

        ancestor: ancestor,

        ancestors: ancestors,

        byId: byId,

        children: children,

        closest: closest,

        descendant: descendant,

        descendants: descendants,

        find: find,

        findAll: findAll,

        firstChild: firstChild,

        lastChild: lastChild,

        matches: matches,

        nextSibling: nextSibling,

        nextSiblings: nextSiblings,

        parent: parent,

        previousSibling: previousSibling,

        previousSiblings: previousSiblings,

        pseudos: local.pseudos,

        siblings: siblings
    });

    return skylark.finder = finder;
});
define('skylark-utils-dom/scripter',[
    "./skylark",
    "./langx",
    "./noder",
    "./finder"
], function(skylark, langx, noder, finder) {

    var head = document.getElementsByTagName('head')[0],
        scriptsByUrl = {},
        scriptElementsById = {},
        count = 0;

    function scripter() {
        return scripter;
    }

    langx.mixin(scripter, {
        /*
         * Load a script from a url into the document.
         * @param {} url
         * @param {} loadedCallback
         * @param {} errorCallback
         */
        loadJavaScript: function(url, loadedCallback, errorCallback) {
            var script = scriptsByUrl[url];
            if (!script) {
                script = scriptsByUrl[url] = {
                    state: 0, //0:unload,1:loaded,-1:loaderror
                    loadedCallbacks: [],
                    errorCallbacks: []
                }
            }

            script.loadedCallbacks.push(loadedCallback);
            script.errorCallbacks.push(errorCallback);

            if (script.state === 1) {
                script.node.onload();
            } else if (script.state === -1) {
                script.node.onerror();
            } else {
                var node = script.node = document.createElement("script"),
                    id = script.id = (count++);

                node.type = "text/javascript";
                node.async = false;
                node.defer = false;
                startTime = new Date().getTime();
                head.appendChild(node);

                node.onload = function() {
                        script.state = 1;

                        var callbacks = script.loadedCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    },
                    node.onerror = function() {
                        script.state = -1;
                        var callbacks = script.errorCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    };
                node.src = url;

                scriptElementsById[id] = node;
            }
            return script.id;
        },
        /*
         * Remove the specified script from the document.
         * @param {Number} id
         */
        deleteJavaScript: function(id) {
            var node = scriptElementsById[id];
            if (node) {
                var url = node.src;
                noder.remove(node);
                delete scriptElementsById[id];
                delete scriptsByUrl[url];
            }
        }
    });

    return skylark.scripter = scripter;
});
define('skylark-utils/scripter',[
    "skylark-utils-dom/scripter"
], function(scripter) {
    return scripter;
});

define('skylark-utils-js/js',[
    "skylark-utils/skylark",
    "skylark-utils/scripter"
], function(skylark, scripter) {
	
	return scripter;
});
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>
  Parsing improvements for brace-less statements by Liam Newman <bitwiseman@gmail.com>


  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          - indentation size,
    indent_char (default space)      - character to indent with,
    preserve_newlines (default true) - whether existing line breaks should be preserved,
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

    jslint_happy (default false) - if true, then jslint-stricter mode is enforced.

            jslint_happy        !jslint_happy
            ---------------------------------
            function ()         function()

            switch () {         switch() {
            case 1:               case 1:
              break;                break;
            }                   }

    space_after_anon_function (default false) - should the space before an anonymous function's parens be added, "function()" vs "function ()",
          NOTE: This option is overriden by jslint_happy (i.e. if jslint_happy is true, space_after_anon_function is true by design)

    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.

    space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",

    unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"

    wrap_line_length (default unlimited) - lines should wrap at next opportunity after this number of characters.
          NOTE: This is not a hard limit. Lines will continue until a point where a newline would
                be preserved if it were present.

    end_with_newline (default false)  - end output with a newline


    e.g

    js_beautify(js_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });

*/

define('skylark-utils-js/primitives/beautify-js',[],function() {

    var acorn = {};
    (function (exports) {
      // This section of code is taken from acorn.
      //
      // Acorn was written by Marijn Haverbeke and released under an MIT
      // license. The Unicode regexps (for identifiers and whitespace) were
      // taken from [Esprima](http://esprima.org) by Ariya Hidayat.
      //
      // Git repositories for Acorn are available at
      //
      //     http://marijnhaverbeke.nl/git/acorn
      //     https://github.com/marijnh/acorn.git

      // ## Character categories

      // Big ugly regular expressions that match characters in the
      // whitespace, identifier, and identifier-start categories. These
      // are only applied when a character is found to actually have a
      // code point above 128.

      var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
      var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
      var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
      var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
      var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

      // Whether a single character denotes a newline.

      var newline = exports.newline = /[\n\r\u2028\u2029]/;

      // Matches a whole line break (where CRLF is considered a single
      // line break). Used to count lines.

      var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

      // Test whether a given character code starts an identifier.

      var isIdentifierStart = exports.isIdentifierStart = function(code) {
        if (code < 65) return code === 36;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123)return true;
        return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
      };

      // Test whether a given character is part of an identifier.

      var isIdentifierChar = exports.isIdentifierChar = function(code) {
        if (code < 48) return code === 36;
        if (code < 58) return true;
        if (code < 65) return false;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123)return true;
        return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
      };
    })(acorn);

    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    function trim(s) {
        return s.replace(/^\s+|\s+$/g, '');
    }

    function js_beautify(js_source_text, options) {
        "use strict";
        var beautifier = new Beautifier(js_source_text, options);
        return beautifier.beautify();
    }

    var MODE = {
            BlockStatement: 'BlockStatement', // 'BLOCK'
            Statement: 'Statement', // 'STATEMENT'
            ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
            ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
            ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
            Conditional: 'Conditional', //'(COND-EXPRESSION)',
            Expression: 'Expression' //'(EXPRESSION)'
        };

    function Beautifier(js_source_text, options) {
        "use strict";
        var output
        var tokens = [], token_pos;
        var Tokenizer;
        var current_token;
        var last_type, last_last_text, indent_string;
        var flags, previous_flags, flag_store;
        var prefix;

        var handlers, opt;
        var baseIndentString = '';

        handlers = {
            'TK_START_EXPR': handle_start_expr,
            'TK_END_EXPR': handle_end_expr,
            'TK_START_BLOCK': handle_start_block,
            'TK_END_BLOCK': handle_end_block,
            'TK_WORD': handle_word,
            'TK_RESERVED': handle_word,
            'TK_SEMICOLON': handle_semicolon,
            'TK_STRING': handle_string,
            'TK_EQUALS': handle_equals,
            'TK_OPERATOR': handle_operator,
            'TK_COMMA': handle_comma,
            'TK_BLOCK_COMMENT': handle_block_comment,
            'TK_INLINE_COMMENT': handle_inline_comment,
            'TK_COMMENT': handle_comment,
            'TK_DOT': handle_dot,
            'TK_UNKNOWN': handle_unknown,
            'TK_EOF': handle_eof
        };

        function create_flags(flags_base, mode) {
            var next_indent_level = 0;
            if (flags_base) {
                next_indent_level = flags_base.indentation_level;
                if (!output.just_added_newline() &&
                    flags_base.line_indent_level > next_indent_level) {
                    next_indent_level = flags_base.line_indent_level;
                }
            }

            var next_flags = {
                mode: mode,
                parent: flags_base,
                last_text: flags_base ? flags_base.last_text : '', // last token text
                last_word: flags_base ? flags_base.last_word : '', // last 'TK_WORD' passed
                declaration_statement: false,
                declaration_assignment: false,
                multiline_frame: false,
                if_block: false,
                else_block: false,
                do_block: false,
                do_while: false,
                in_case_statement: false, // switch(..){ INSIDE HERE }
                in_case: false, // we're on the exact line with "case 0:"
                case_body: false, // the indented case-action block
                indentation_level: next_indent_level,
                line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
                start_line_index: output.get_line_number(),
                ternary_depth: 0
            };
            return next_flags;
        }

        // Some interpreters have unexpected results with foo = baz || bar;
        options = options ? options : {};
        opt = {};

        // compatibility
        if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
            opt.brace_style = options.braces_on_own_line ? "expand" : "collapse";
        }
        opt.brace_style = options.brace_style ? options.brace_style : (opt.brace_style ? opt.brace_style : "collapse");

        // graceful handling of deprecated option
        if (opt.brace_style === "expand-strict") {
            opt.brace_style = "expand";
        }


        opt.indent_size = options.indent_size ? parseInt(options.indent_size, 10) : 4;
        opt.indent_char = options.indent_char ? options.indent_char : ' ';
        opt.preserve_newlines = (options.preserve_newlines === undefined) ? true : options.preserve_newlines;
        opt.break_chained_methods = (options.break_chained_methods === undefined) ? false : options.break_chained_methods;
        opt.max_preserve_newlines = (options.max_preserve_newlines === undefined) ? 0 : parseInt(options.max_preserve_newlines, 10);
        opt.space_in_paren = (options.space_in_paren === undefined) ? false : options.space_in_paren;
        opt.space_in_empty_paren = (options.space_in_empty_paren === undefined) ? false : options.space_in_empty_paren;
        opt.jslint_happy = (options.jslint_happy === undefined) ? false : options.jslint_happy;
        opt.space_after_anon_function = (options.space_after_anon_function === undefined) ? false : options.space_after_anon_function;
        opt.keep_array_indentation = (options.keep_array_indentation === undefined) ? false : options.keep_array_indentation;
        opt.space_before_conditional = (options.space_before_conditional === undefined) ? true : options.space_before_conditional;
        opt.unescape_strings = (options.unescape_strings === undefined) ? false : options.unescape_strings;
        opt.wrap_line_length = (options.wrap_line_length === undefined) ? 0 : parseInt(options.wrap_line_length, 10);
        opt.e4x = (options.e4x === undefined) ? false : options.e4x;
        opt.end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;


        // force opt.space_after_anon_function to true if opt.jslint_happy
        if(opt.jslint_happy) {
            opt.space_after_anon_function = true;
        }

        if(options.indent_with_tabs){
            opt.indent_char = '\t';
            opt.indent_size = 1;
        }

        //----------------------------------
        indent_string = '';
        while (opt.indent_size > 0) {
            indent_string += opt.indent_char;
            opt.indent_size -= 1;
        }

        var preindent_index = 0;
        if(js_source_text && js_source_text.length) {
            while ( (js_source_text.charAt(preindent_index) === ' ' ||
                    js_source_text.charAt(preindent_index) === '\t')) {
                baseIndentString += js_source_text.charAt(preindent_index);
                preindent_index += 1;
            }
            js_source_text = js_source_text.substring(preindent_index);
        }

        last_type = 'TK_START_BLOCK'; // last token type
        last_last_text = ''; // pre-last token text
        output = new Output(indent_string, baseIndentString);


        // Stack of parsing/formatting states, including MODE.
        // We tokenize, parse, and output in an almost purely a forward-only stream of token input
        // and formatted output.  This makes the beautifier less accurate than full parsers
        // but also far more tolerant of syntax errors.
        //
        // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
        // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
        // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
        // most full parsers would die, but the beautifier gracefully falls back to
        // MODE.BlockStatement and continues on.
        flag_store = [];
        set_mode(MODE.BlockStatement);

        this.beautify = function() {

            /*jshint onevar:true */
            var local_token, sweet_code;
            Tokenizer = new tokenizer(js_source_text, opt, indent_string);
            tokens = Tokenizer.tokenize();
            token_pos = 0;

            while (local_token = get_token()) {
                for(var i = 0; i < local_token.comments_before.length; i++) {
                    // The cleanest handling of inline comments is to treat them as though they aren't there.
                    // Just continue formatting and the behavior should be logical.
                    // Also ignore unknown tokens.  Again, this should result in better behavior.
                    handle_token(local_token.comments_before[i]);
                }
                handle_token(local_token);

                last_last_text = flags.last_text;
                last_type = local_token.type;
                flags.last_text = local_token.text;

                token_pos += 1;
            }

            sweet_code = output.get_code();
            if (opt.end_with_newline) {
                sweet_code += '\n';
            }

            return sweet_code;
        };

        function handle_token(local_token) {
            var newlines = local_token.newlines;
            var keep_whitespace = opt.keep_array_indentation && is_array(flags.mode);

            if (keep_whitespace) {
                for (i = 0; i < newlines; i += 1) {
                    print_newline(i > 0);
                }
            } else {
                if (opt.max_preserve_newlines && newlines > opt.max_preserve_newlines) {
                    newlines = opt.max_preserve_newlines;
                }

                if (opt.preserve_newlines) {
                    if (local_token.newlines > 1) {
                        print_newline();
                        for (var i = 1; i < newlines; i += 1) {
                            print_newline(true);
                        }
                    }
                }
            }

            current_token = local_token;
            handlers[current_token.type]();
        }

        // we could use just string.split, but
        // IE doesn't like returning empty strings

        function split_newlines(s) {
            //return s.split(/\x0d\x0a|\x0a/);

            s = s.replace(/\x0d/g, '');
            var out = [],
                idx = s.indexOf("\n");
            while (idx !== -1) {
                out.push(s.substring(0, idx));
                s = s.substring(idx + 1);
                idx = s.indexOf("\n");
            }
            if (s.length) {
                out.push(s);
            }
            return out;
        }

        function allow_wrap_or_preserved_newline(force_linewrap) {
            force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

            // Never wrap the first token on a line
            if (output.just_added_newline()) {
                return
            }

            if ((opt.preserve_newlines && current_token.wanted_newline) || force_linewrap) {
                print_newline(false, true);
            } else if (opt.wrap_line_length) {
                var proposed_line_length = output.current_line.get_character_count() + current_token.text.length +
                    (output.space_before_token ? 1 : 0);
                if (proposed_line_length >= opt.wrap_line_length) {
                    print_newline(false, true);
                }
            }
        }

        function print_newline(force_newline, preserve_statement_flags) {
            if (!preserve_statement_flags) {
                if (flags.last_text !== ';' && flags.last_text !== ',' && flags.last_text !== '=' && last_type !== 'TK_OPERATOR') {
                    while (flags.mode === MODE.Statement && !flags.if_block && !flags.do_block) {
                        restore_mode();
                    }
                }
            }

            if (output.add_new_line(force_newline)) {
                flags.multiline_frame = true;
            }
        }

        function print_token_line_indentation() {
            if (output.just_added_newline()) {
                if (opt.keep_array_indentation && is_array(flags.mode) && current_token.wanted_newline) {
                    output.current_line.push(current_token.whitespace_before);
                    output.space_before_token = false;
                } else if (output.set_indent(flags.indentation_level)) {
                    flags.line_indent_level = flags.indentation_level;
                }
            }
        }

        function print_token(printable_token) {
            printable_token = printable_token || current_token.text;
            print_token_line_indentation();
            output.add_token(printable_token);
        }

        function indent() {
            flags.indentation_level += 1;
        }

        function deindent() {
            if (flags.indentation_level > 0 &&
                ((!flags.parent) || flags.indentation_level > flags.parent.indentation_level))
                flags.indentation_level -= 1;
        }

        function set_mode(mode) {
            if (flags) {
                flag_store.push(flags);
                previous_flags = flags;
            } else {
                previous_flags = create_flags(null, mode);
            }

            flags = create_flags(previous_flags, mode);
        }

        function is_array(mode) {
            return mode === MODE.ArrayLiteral;
        }

        function is_expression(mode) {
            return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
        }

        function restore_mode() {
            if (flag_store.length > 0) {
                previous_flags = flags;
                flags = flag_store.pop();
                if (previous_flags.mode === MODE.Statement) {
                    output.remove_redundant_indentation(previous_flags);
                }
            }
        }

        function start_of_object_property() {
            return flags.parent.mode === MODE.ObjectLiteral && flags.mode === MODE.Statement && (
                (flags.last_text === ':' && flags.ternary_depth === 0) || (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set'])));
        }

        function start_of_statement() {
            if (
                    (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const']) && current_token.type === 'TK_WORD') ||
                    (last_type === 'TK_RESERVED' && flags.last_text === 'do') ||
                    (last_type === 'TK_RESERVED' && flags.last_text === 'return' && !current_token.wanted_newline) ||
                    (last_type === 'TK_RESERVED' && flags.last_text === 'else' && !(current_token.type === 'TK_RESERVED' && current_token.text === 'if')) ||
                    (last_type === 'TK_END_EXPR' && (previous_flags.mode === MODE.ForInitializer || previous_flags.mode === MODE.Conditional)) ||
                    (last_type === 'TK_WORD' && flags.mode === MODE.BlockStatement
                        && !flags.in_case
                        && !(current_token.text === '--' || current_token.text === '++')
                        && current_token.type !== 'TK_WORD' && current_token.type !== 'TK_RESERVED') ||
                    (flags.mode === MODE.ObjectLiteral && (
                        (flags.last_text === ':' && flags.ternary_depth === 0) || (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set']))))
                ) {

                set_mode(MODE.Statement);
                indent();

                if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const']) && current_token.type === 'TK_WORD') {
                    flags.declaration_statement = true;
                }

                // Issue #276:
                // If starting a new statement with [if, for, while, do], push to a new line.
                // if (a) if (b) if(c) d(); else e(); else f();
                if (!start_of_object_property()) {
                    allow_wrap_or_preserved_newline(
                        current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['do', 'for', 'if', 'while']));
                }

                return true;
            }
            return false;
        }

        function all_lines_start_with(lines, c) {
            for (var i = 0; i < lines.length; i++) {
                var line = trim(lines[i]);
                if (line.charAt(0) !== c) {
                    return false;
                }
            }
            return true;
        }

        function each_line_matches_indent(lines, indent) {
            var i = 0,
                len = lines.length,
                line;
            for (; i < len; i++) {
                line = lines[i];
                // allow empty lines to pass through
                if (line && line.indexOf(indent) !== 0) {
                    return false;
                }
            }
            return true;
        }

        function is_special_word(word) {
            return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
        }

        function get_token(offset) {
            var index = token_pos + (offset || 0);
            return (index < 0 || index >= tokens.length) ? null : tokens[index];
        }

        function handle_start_expr() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
            }

            var next_mode = MODE.Expression;
            if (current_token.text === '[') {

                if (last_type === 'TK_WORD' || flags.last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (last_type === 'TK_RESERVED' && in_array(flags.last_text, Tokenizer.line_starters)) {
                        output.space_before_token = true;
                    }
                    set_mode(next_mode);
                    print_token();
                    indent();
                    if (opt.space_in_paren) {
                        output.space_before_token = true;
                    }
                    return;
                }

                next_mode = MODE.ArrayLiteral;
                if (is_array(flags.mode)) {
                    if (flags.last_text === '[' ||
                        (flags.last_text === ',' && (last_last_text === ']' || last_last_text === '}'))) {
                        // ], [ goes to new line
                        // }, [ goes to new line
                        if (!opt.keep_array_indentation) {
                            print_newline();
                        }
                    }
                }

            } else {
                if (last_type === 'TK_RESERVED' && flags.last_text === 'for') {
                    next_mode = MODE.ForInitializer;
                } else if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['if', 'while'])) {
                    next_mode = MODE.Conditional;
                } else {
                    // next_mode = MODE.Expression;
                }
            }

            if (flags.last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || flags.last_text === '.') {
                // TODO: Consider whether forcing this is required.  Review failing tests when removed.
                allow_wrap_or_preserved_newline(current_token.wanted_newline);
                // do nothing on (( and )( and ][ and ]( and .(
            } else if (!(last_type === 'TK_RESERVED' && current_token.text === '(') && last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                output.space_before_token = true;
            } else if ((last_type === 'TK_RESERVED' && (flags.last_word === 'function' || flags.last_word === 'typeof')) ||
                (flags.last_text === '*' && last_last_text === 'function')) {
                // function() vs function ()
                if (opt.space_after_anon_function) {
                    output.space_before_token = true;
                }
            } else if (last_type === 'TK_RESERVED' && (in_array(flags.last_text, Tokenizer.line_starters) || flags.last_text === 'catch')) {
                if (opt.space_before_conditional) {
                    output.space_before_token = true;
                }
            }

            // Support of this kind of newline preservation.
            // a = (b &&
            //     (c || d));
            if (current_token.text === '(') {
                if (last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
                    if (!start_of_object_property()) {
                        allow_wrap_or_preserved_newline();
                    }
                }
            }

            set_mode(next_mode);
            print_token();
            if (opt.space_in_paren) {
                output.space_before_token = true;
            }

            // In all cases, if we newline while inside an expression it should be indented.
            indent();
        }

        function handle_end_expr() {
            // statements inside expressions are not valid syntax, but...
            // statements must all be closed when their container closes
            while (flags.mode === MODE.Statement) {
                restore_mode();
            }

            if (flags.multiline_frame) {
                allow_wrap_or_preserved_newline(current_token.text === ']' && is_array(flags.mode) && !opt.keep_array_indentation);
            }

            if (opt.space_in_paren) {
                if (last_type === 'TK_START_EXPR' && ! opt.space_in_empty_paren) {
                    // () [] no inner space in empty parens like these, ever, ref #320
                    output.trim();
                    output.space_before_token = false;
                } else {
                    output.space_before_token = true;
                }
            }
            if (current_token.text === ']' && opt.keep_array_indentation) {
                print_token();
                restore_mode();
            } else {
                restore_mode();
                print_token();
            }
            output.remove_redundant_indentation(previous_flags);

            // do {} while () // no statement required after
            if (flags.do_while && previous_flags.mode === MODE.Conditional) {
                previous_flags.mode = MODE.Expression;
                flags.do_block = false;
                flags.do_while = false;

            }
        }

        function handle_start_block() {
            // Check if this is should be treated as a ObjectLiteral
            var next_token = get_token(1)
            var second_token = get_token(2)
            if (second_token && (
                    (second_token.text === ':' && in_array(next_token.type, ['TK_STRING', 'TK_WORD', 'TK_RESERVED']))
                    || (in_array(next_token.text, ['get', 'set']) && in_array(second_token.type, ['TK_WORD', 'TK_RESERVED']))
                )) {
                // We don't support TypeScript,but we didn't break it for a very long time.
                // We'll try to keep not breaking it.
                if (!in_array(last_last_text, ['class','interface'])) {
                    set_mode(MODE.ObjectLiteral);
                } else {
                    set_mode(MODE.BlockStatement);
                }
            } else {
                set_mode(MODE.BlockStatement);
            }

            var empty_braces = !next_token.comments_before.length &&  next_token.text === '}';
            var empty_anonymous_function = empty_braces && flags.last_word === 'function' &&
                last_type === 'TK_END_EXPR';

            if (opt.brace_style === "expand" ||
                (opt.brace_style === "none" && current_token.wanted_newline)) {
                if (last_type !== 'TK_OPERATOR' &&
                    (empty_anonymous_function ||
                        last_type === 'TK_EQUALS' ||
                        (last_type === 'TK_RESERVED' && is_special_word(flags.last_text) && flags.last_text !== 'else'))) {
                    output.space_before_token = true;
                } else {
                    print_newline(false, true);
                }
            } else { // collapse
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        output.space_before_token = true;
                    }
                } else {
                    // if TK_OPERATOR or TK_START_EXPR
                    if (is_array(previous_flags.mode) && flags.last_text === ',') {
                        if (last_last_text === '}') {
                            // }, { in array context
                            output.space_before_token = true;
                        } else {
                            print_newline(); // [a, b, c, {
                        }
                    }
                }
            }
            print_token();
            indent();
        }

        function handle_end_block() {
            // statements must all be closed when their container closes
            while (flags.mode === MODE.Statement) {
                restore_mode();
            }
            var empty_braces = last_type === 'TK_START_BLOCK';

            if (opt.brace_style === "expand") {
                if (!empty_braces) {
                    print_newline();
                }
            } else {
                // skip {}
                if (!empty_braces) {
                    if (is_array(flags.mode) && opt.keep_array_indentation) {
                        // we REALLY need a newline here, but newliner would skip that
                        opt.keep_array_indentation = false;
                        print_newline();
                        opt.keep_array_indentation = true;

                    } else {
                        print_newline();
                    }
                }
            }
            restore_mode();
            print_token();
        }

        function handle_word() {
            if (current_token.type === 'TK_RESERVED' && flags.mode !== MODE.ObjectLiteral &&
                in_array(current_token.text, ['set', 'get'])) {
                current_token.type = 'TK_WORD';
            }

            if (current_token.type === 'TK_RESERVED' && flags.mode === MODE.ObjectLiteral) {
                var next_token = get_token(1);
                if (next_token.text == ':') {
                    current_token.type = 'TK_WORD';
                }
            }

            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
            } else if (current_token.wanted_newline && !is_expression(flags.mode) &&
                (last_type !== 'TK_OPERATOR' || (flags.last_text === '--' || flags.last_text === '++')) &&
                last_type !== 'TK_EQUALS' &&
                (opt.preserve_newlines || !(last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const', 'set', 'get'])))) {

                print_newline();
            }

            if (flags.do_block && !flags.do_while) {
                if (current_token.type === 'TK_RESERVED' && current_token.text === 'while') {
                    // do {} ## while ()
                    output.space_before_token = true;
                    print_token();
                    output.space_before_token = true;
                    flags.do_while = true;
                    return;
                } else {
                    // do {} should always have while as the next word.
                    // if we don't see the expected while, recover
                    print_newline();
                    flags.do_block = false;
                }
            }

            // if may be followed by else, or not
            // Bare/inline ifs are tricky
            // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
            if (flags.if_block) {
                if (!flags.else_block && (current_token.type === 'TK_RESERVED' && current_token.text === 'else')) {
                    flags.else_block = true;
                } else {
                    while (flags.mode === MODE.Statement) {
                        restore_mode();
                    }
                    flags.if_block = false;
                    flags.else_block = false;
                }
            }

            if (current_token.type === 'TK_RESERVED' && (current_token.text === 'case' || (current_token.text === 'default' && flags.in_case_statement))) {
                print_newline();
                if (flags.case_body || opt.jslint_happy) {
                    // switch cases following one another
                    deindent();
                    flags.case_body = false;
                }
                print_token();
                flags.in_case = true;
                flags.in_case_statement = true;
                return;
            }

            if (current_token.type === 'TK_RESERVED' && current_token.text === 'function') {
                if (in_array(flags.last_text, ['}', ';']) || (output.just_added_newline() && ! in_array(flags.last_text, ['[', '{', ':', '=', ',']))) {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    if ( !output.just_added_blankline() && !current_token.comments_before.length) {
                        print_newline();
                        print_newline(true);
                    }
                }
                if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD') {
                    if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set', 'new', 'return', 'export'])) {
                        output.space_before_token = true;
                    } else if (last_type === 'TK_RESERVED' && flags.last_text === 'default' && last_last_text === 'export') {
                        output.space_before_token = true;
                    } else {
                        print_newline();
                    }
                } else if (last_type === 'TK_OPERATOR' || flags.last_text === '=') {
                    // foo = function
                    output.space_before_token = true;
                } else if (!flags.multiline_frame && (is_expression(flags.mode) || is_array(flags.mode))) {
                    // (function
                } else {
                    print_newline();
                }
            }

            if (last_type === 'TK_COMMA' || last_type === 'TK_START_EXPR' || last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
                if (!start_of_object_property()) {
                    allow_wrap_or_preserved_newline();
                }
            }

            if (current_token.type === 'TK_RESERVED' &&  in_array(current_token.text, ['function', 'get', 'set'])) {
                print_token();
                flags.last_word = current_token.text;
                return;
            }

            prefix = 'NONE';

            if (last_type === 'TK_END_BLOCK') {
                if (!(current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['else', 'catch', 'finally']))) {
                    prefix = 'NEWLINE';
                } else {
                    if (opt.brace_style === "expand" ||
                        opt.brace_style === "end-expand" ||
                        (opt.brace_style === "none" && current_token.wanted_newline)) {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        output.space_before_token = true;
                    }
                }
            } else if (last_type === 'TK_SEMICOLON' && flags.mode === MODE.BlockStatement) {
                // TODO: Should this be for STATEMENT as well?
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD' ||
                (flags.last_text === '*' && last_last_text === 'function')) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                output.space_before_token = true;
                prefix = 'NEWLINE';
            }

            if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, Tokenizer.line_starters) && flags.last_text !== ')') {
                if (flags.last_text === 'else' || flags.last_text === 'export') {
                    prefix = 'SPACE';
                } else {
                    prefix = 'NEWLINE';
                }

            }

            if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['else', 'catch', 'finally'])) {
                if (last_type !== 'TK_END_BLOCK' ||
                    opt.brace_style === "expand" ||
                    opt.brace_style === "end-expand" ||
                    (opt.brace_style === "none" && current_token.wanted_newline)) {
                    print_newline();
                } else {
                    output.trim(true);
                    var line = output.current_line;
                    // If we trimmed and there's something other than a close block before us
                    // put a newline back in.  Handles '} // comment' scenario.
                    if (line.last() !== '}') {
                        print_newline();
                    }
                    output.space_before_token = true;
                }
            } else if (prefix === 'NEWLINE') {
                if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
                    // no newline between 'return nnn'
                    output.space_before_token = true;
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || !(current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['var', 'let', 'const']))) && flags.last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (current_token.type === 'TK_RESERVED' && current_token.text === 'if' && flags.last_text === 'else') {
                            // no newline for } else if {
                            output.space_before_token = true;
                        } else {
                            print_newline();
                        }
                    }
                } else if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, Tokenizer.line_starters) && flags.last_text !== ')') {
                    print_newline();
                }
            } else if (flags.multiline_frame && is_array(flags.mode) && flags.last_text === ',' && last_last_text === '}') {
                print_newline(); // }, in lists get a newline treatment
            } else if (prefix === 'SPACE') {
                output.space_before_token = true;
            }
            print_token();
            flags.last_word = current_token.text;

            if (current_token.type === 'TK_RESERVED' && current_token.text === 'do') {
                flags.do_block = true;
            }

            if (current_token.type === 'TK_RESERVED' && current_token.text === 'if') {
                flags.if_block = true;
            }
        }

        function handle_semicolon() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
                // Semicolon can be the start (and end) of a statement
                output.space_before_token = false;
            }
            while (flags.mode === MODE.Statement && !flags.if_block && !flags.do_block) {
                restore_mode();
            }
            print_token();
        }

        function handle_string() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
                // One difference - strings want at least a space before
                output.space_before_token = true;
            } else if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD') {
                output.space_before_token = true;
            } else if (last_type === 'TK_COMMA' || last_type === 'TK_START_EXPR' || last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
                if (!start_of_object_property()) {
                    allow_wrap_or_preserved_newline();
                }
            } else {
                print_newline();
            }
            print_token();
        }

        function handle_equals() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
            }

            if (flags.declaration_statement) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.declaration_assignment = true;
            }
            output.space_before_token = true;
            print_token();
            output.space_before_token = true;
        }

        function handle_comma() {
            if (flags.declaration_statement) {
                if (is_expression(flags.parent.mode)) {
                    // do not break on comma, for(var a = 1, b = 2)
                    flags.declaration_assignment = false;
                }

                print_token();

                if (flags.declaration_assignment) {
                    flags.declaration_assignment = false;
                    print_newline(false, true);
                } else {
                    output.space_before_token = true;
                }
                return;
            }

            print_token();
            if (flags.mode === MODE.ObjectLiteral ||
                (flags.mode === MODE.Statement && flags.parent.mode === MODE.ObjectLiteral)) {
                if (flags.mode === MODE.Statement) {
                    restore_mode();
                }
                print_newline();
            } else {
                // EXPR or DO_BLOCK
                output.space_before_token = true;
            }

        }

        function handle_operator() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
            }

            if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                output.space_before_token = true;
                print_token();
                return;
            }

            // hack for actionscript's import .*;
            if (current_token.text === '*' && last_type === 'TK_DOT') {
                print_token();
                return;
            }

            if (current_token.text === ':' && flags.in_case) {
                flags.case_body = true;
                indent();
                print_token();
                print_newline();
                flags.in_case = false;
                return;
            }

            if (current_token.text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                return;
            }

            // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
            // if there is a newline between -- or ++ and anything else we should preserve it.
            if (current_token.wanted_newline && (current_token.text === '--' || current_token.text === '++')) {
                print_newline(false, true);
            }

            // Allow line wrapping between operators
            if (last_type === 'TK_OPERATOR') {
                allow_wrap_or_preserved_newline();
            }

            var space_before = true;
            var space_after = true;

            if (in_array(current_token.text, ['--', '++', '!', '~']) || (in_array(current_token.text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(flags.last_text, Tokenizer.line_starters) || flags.last_text === ','))) {
                // unary operators (and binary +/- pretending to be unary) special cases

                space_before = false;
                space_after = false;

                if (flags.last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }

                if (last_type === 'TK_RESERVED' || last_type === 'TK_END_EXPR') {
                    space_before = true;
                } else if (last_type === 'TK_OPERATOR') {
                    space_before =
                        (in_array(current_token.text, ['--', '-']) && in_array(flags.last_text, ['--', '-'])) ||
                        (in_array(current_token.text, ['++', '+']) && in_array(flags.last_text, ['++', '+']));
                }

                if ((flags.mode === MODE.BlockStatement || flags.mode === MODE.Statement) && (flags.last_text === '{' || flags.last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            } else if (current_token.text === ':') {
                if (flags.ternary_depth === 0) {
                    // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
                    space_before = false;
                } else {
                    flags.ternary_depth -= 1;
                }
            } else if (current_token.text === '?') {
                flags.ternary_depth += 1;
            } else if (current_token.text === '*' && last_type === 'TK_RESERVED' && flags.last_text === 'function') {
                space_before = false;
                space_after = false;
            }
            output.space_before_token = output.space_before_token || space_before;
            print_token();
            output.space_before_token = space_after;
        }

        function handle_block_comment() {
            var lines = split_newlines(current_token.text);
            var j; // iterator for this case
            var javadoc = false;
            var starless = false;
            var lastIndent = current_token.whitespace_before;
            var lastIndentLength = lastIndent.length;

            // block comment starts with a new line
            print_newline(false, true);
            if (lines.length > 1) {
                if (all_lines_start_with(lines.slice(1), '*')) {
                    javadoc = true;
                }
                else if (each_line_matches_indent(lines.slice(1), lastIndent)) {
                    starless = true;
                }
            }

            // first line always indented
            print_token(lines[0]);
            for (j = 1; j < lines.length; j++) {
                print_newline(false, true);
                if (javadoc) {
                    // javadoc: reformat and re-indent
                    print_token(' ' + trim(lines[j]));
                } else if (starless && lines[j].length > lastIndentLength) {
                    // starless: re-indent non-empty content, avoiding trim
                    print_token(lines[j].substring(lastIndentLength));
                } else {
                    // normal comments output raw
                    output.add_token(lines[j]);
                }
            }

            // for comments of more than one line, make sure there's a new line after
            print_newline(false, true);
        }

        function handle_inline_comment() {
            output.space_before_token = true;
            print_token();
            output.space_before_token = true;
        }

        function handle_comment() {
            if (current_token.wanted_newline) {
                print_newline(false, true);
            } else {
                output.trim(true);
            }

            output.space_before_token = true;
            print_token();
            print_newline(false, true);
        }

        function handle_dot() {
            if (start_of_statement()) {
                // The conditional starts the statement if appropriate.
            }

            if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
                output.space_before_token = true;
            } else {
                // allow preserved newlines before dots in general
                // force newlines on dots after close paren when break_chained - for bar().baz()
                allow_wrap_or_preserved_newline(flags.last_text === ')' && opt.break_chained_methods);
            }

            print_token();
        }

        function handle_unknown() {
            print_token();

            if (current_token.text[current_token.text.length - 1] === '\n') {
                print_newline();
            }
        }

        function handle_eof() {
            // Unwind any open statements
            while (flags.mode === MODE.Statement) {
                restore_mode();
            }
        }
    }


    function OutputLine(parent) {
        var _character_count = 0;
        // use indent_count as a marker for lines that have preserved indentation
        var _indent_count = -1;

        var _items = [];
        var _empty = true;

        this.set_indent = function(level) {
            _character_count = parent.baseIndentLength + level * parent.indent_length
            _indent_count = level;
        }

        this.get_character_count = function() {
            return _character_count;
        }

        this.is_empty = function() {
            return _empty;
        }

        this.last = function() {
            if (!this._empty) {
              return _items[_items.length - 1];
            } else {
              return null;
            }
        }

        this.push = function(input) {
            _items.push(input);
            _character_count += input.length;
            _empty = false;
        }

        this.remove_indent = function() {
            if (_indent_count > 0) {
                _indent_count -= 1;
                _character_count -= parent.indent_length
            }
        }

        this.trim = function() {
            while (this.last() === ' ') {
                var item = _items.pop();
                _character_count -= 1;
            }
            _empty = _items.length === 0;
        }

        this.toString = function() {
            var result = '';
            if (!this._empty) {
                if (_indent_count >= 0) {
                    result = parent.indent_cache[_indent_count];
                }
                result += _items.join('')
            }
            return result;
        }
    }

    function Output(indent_string, baseIndentString) {
        baseIndentString = baseIndentString || '';
        this.indent_cache = [ baseIndentString ];
        this.baseIndentLength = baseIndentString.length;
        this.indent_length = indent_string.length;

        var lines =[];
        this.baseIndentString = baseIndentString;
        this.indent_string = indent_string;
        this.current_line = null;
        this.space_before_token = false;

        this.get_line_number = function() {
            return lines.length;
        }

        // Using object instead of string to allow for later expansion of info about each line
        this.add_new_line = function(force_newline) {
            if (this.get_line_number() === 1 && this.just_added_newline()) {
                return false; // no newline on start of file
            }

            if (force_newline || !this.just_added_newline()) {
                this.current_line = new OutputLine(this);
                lines.push(this.current_line);
                return true;
            }

            return false;
        }

        // initialize
        this.add_new_line(true);

        this.get_code = function() {
            var sweet_code = lines.join('\n').replace(/[\r\n\t ]+$/, '');
            return sweet_code;
        }

        this.set_indent = function(level) {
            // Never indent your first output indent at the start of the file
            if (lines.length > 1) {
                while(level >= this.indent_cache.length) {
                    this.indent_cache.push(this.indent_cache[this.indent_cache.length - 1] + this.indent_string);
                }

                this.current_line.set_indent(level);
                return true;
            }
            this.current_line.set_indent(0);
            return false;
        }

        this.add_token = function(printable_token) {
            this.add_space_before_token();
            this.current_line.push(printable_token);
        }

        this.add_space_before_token = function() {
            if (this.space_before_token && !this.just_added_newline()) {
                this.current_line.push(' ');
            }
            this.space_before_token = false;
        }

        this.remove_redundant_indentation = function (frame) {
            // This implementation is effective but has some issues:
            //     - can cause line wrap to happen too soon due to indent removal
            //           after wrap points are calculated
            // These issues are minor compared to ugly indentation.

            if (frame.multiline_frame ||
                frame.mode === MODE.ForInitializer ||
                frame.mode === MODE.Conditional) {
                return;
            }

            // remove one indent from each line inside this section
            var index = frame.start_line_index;
            var line;

            var output_length = lines.length;
            while (index < output_length) {
                lines[index].remove_indent();
                index++;
            }
        }

        this.trim = function(eat_newlines) {
            eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

            this.current_line.trim(indent_string, baseIndentString);

            while (eat_newlines && lines.length > 1 &&
                this.current_line.is_empty()) {
                lines.pop();
                this.current_line = lines[lines.length - 1]
                this.current_line.trim();
            }
        }

        this.just_added_newline = function() {
            return this.current_line.is_empty();
        }

        this.just_added_blankline = function() {
            if (this.just_added_newline()) {
                if (lines.length === 1) {
                    return true; // start of the file and newline = blank
                }

                var line = lines[lines.length - 2];
                return line.is_empty();
            }
            return false;
        }
    }


    var Token = function(type, text, newlines, whitespace_before, mode, parent) {
        this.type = type;
        this.text = text;
        this.comments_before = [];
        this.newlines = newlines || 0;
        this.wanted_newline = newlines > 0;
        this.whitespace_before = whitespace_before || '';
        this.parent = null;
    }

    function tokenizer(input, opts, indent_string) {

        var whitespace = "\n\r\t ".split('');
        var digit = /[0-9]/;

        var punct = ('+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! ~ , : ? ^ ^= |= :: =>'
                +' <%= <% %> <?= <? ?>').split(' '); // try to be a good boy and try not to break the markup language identifiers

        // words which should always start on new line.
        this.line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,yield,import,export'.split(',');
        var reserved_words = this.line_starters.concat(['do', 'in', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof']);

        var n_newlines, whitespace_before_token, in_html_comment, tokens, parser_pos;
        var input_length;

        this.tokenize = function() {
            // cache the source's length.
            input_length = input.length
            parser_pos = 0;
            in_html_comment = false
            tokens = [];

            var next, last;
            var token_values;
            var open = null;
            var open_stack = [];
            var comments = [];

            while (!(last && last.type === 'TK_EOF')) {
                token_values = tokenize_next();
                next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
                while(next.type === 'TK_INLINE_COMMENT' || next.type === 'TK_COMMENT' ||
                    next.type === 'TK_BLOCK_COMMENT' || next.type === 'TK_UNKNOWN') {
                    comments.push(next);
                    token_values = tokenize_next();
                    next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
                }

                if (comments.length) {
                    next.comments_before = comments;
                    comments = [];
                }

                if (next.type === 'TK_START_BLOCK' || next.type === 'TK_START_EXPR') {
                    next.parent = last;
                    open = next;
                    open_stack.push(next);
                }  else if ((next.type === 'TK_END_BLOCK' || next.type === 'TK_END_EXPR') &&
                    (open && (
                        (next.text === ']' && open.text === '[') ||
                        (next.text === ')' && open.text === '(') ||
                        (next.text === '}' && open.text === '}')))) {
                    next.parent = open.parent;
                    open = open_stack.pop();
                }

                tokens.push(next);
                last = next;
            }

            return tokens;
        }

        function tokenize_next() {
            var i, resulting_string;
            var whitespace_on_this_line = [];

            n_newlines = 0;
            whitespace_before_token = '';

            if (parser_pos >= input_length) {
                return ['', 'TK_EOF'];
            }

            var last_token;
            if (tokens.length) {
                last_token = tokens[tokens.length-1];
            } else {
                // For the sake of tokenizing we can pretend that there was on open brace to start
                last_token = new Token('TK_START_BLOCK', '{');
            }


            var c = input.charAt(parser_pos);
            parser_pos += 1;

            while (in_array(c, whitespace)) {

                if (c === '\n') {
                    n_newlines += 1;
                    whitespace_on_this_line = [];
                } else if (n_newlines) {
                    if (c === indent_string) {
                        whitespace_on_this_line.push(indent_string);
                    } else if (c !== '\r') {
                        whitespace_on_this_line.push(' ');
                    }
                }

                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;
            }

            if(whitespace_on_this_line.length) {
                whitespace_before_token = whitespace_on_this_line.join('');
            }

            if (digit.test(c)) {
                var allow_decimal = true;
                var allow_e = true;
                var local_digit = digit;

                if (c === '0' && parser_pos < input_length && /[Xx]/.test(input.charAt(parser_pos))) {
                    // switch to hex number, no decimal or e, just hex digits
                    allow_decimal = false;
                    allow_e = false;
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    local_digit = /[0123456789abcdefABCDEF]/
                } else {
                    // we know this first loop will run.  It keeps the logic simpler.
                    c = '';
                    parser_pos -= 1
                }

                // Add the digits
                while (parser_pos < input_length && local_digit.test(input.charAt(parser_pos))) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;

                    if (allow_decimal && parser_pos < input_length && input.charAt(parser_pos) === '.') {
                        c += input.charAt(parser_pos);
                        parser_pos += 1;
                        allow_decimal = false;
                    }

                    if (allow_e && parser_pos < input_length && /[Ee]/.test(input.charAt(parser_pos))) {
                        c += input.charAt(parser_pos);
                        parser_pos += 1;

                        if (parser_pos < input_length && /[+-]/.test(input.charAt(parser_pos))) {
                            c += input.charAt(parser_pos);
                            parser_pos += 1;
                        }

                        allow_e = false;
                        allow_decimal = false;
                    }
                }

                return [c, 'TK_WORD'];
            }

            if (acorn.isIdentifierStart(input.charCodeAt(parser_pos-1))) {
                if (parser_pos < input_length) {
                    while (acorn.isIdentifierChar(input.charCodeAt(parser_pos))) {
                        c += input.charAt(parser_pos);
                        parser_pos += 1;
                        if (parser_pos === input_length) {
                            break;
                        }
                    }
                }

                if (!(last_token.type === 'TK_DOT' ||
                        (last_token.type === 'TK_RESERVED' && in_array(last_token.text, ['set', 'get'])))
                    && in_array(c, reserved_words)) {
                    if (c === 'in') { // hack for 'in' operator
                        return [c, 'TK_OPERATOR'];
                    }
                    return [c, 'TK_RESERVED'];
                }

                return [c, 'TK_WORD'];
            }

            if (c === '(' || c === '[') {
                return [c, 'TK_START_EXPR'];
            }

            if (c === ')' || c === ']') {
                return [c, 'TK_END_EXPR'];
            }

            if (c === '{') {
                return [c, 'TK_START_BLOCK'];
            }

            if (c === '}') {
                return [c, 'TK_END_BLOCK'];
            }

            if (c === ';') {
                return [c, 'TK_SEMICOLON'];
            }

            if (c === '/') {
                var comment = '';
                // peek for comment /* ... */
                var inline_comment = true;
                if (input.charAt(parser_pos) === '*') {
                    parser_pos += 1;
                    if (parser_pos < input_length) {
                        while (parser_pos < input_length && !(input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/')) {
                            c = input.charAt(parser_pos);
                            comment += c;
                            if (c === "\n" || c === "\r") {
                                inline_comment = false;
                            }
                            parser_pos += 1;
                            if (parser_pos >= input_length) {
                                break;
                            }
                        }
                    }
                    parser_pos += 2;
                    if (inline_comment && n_newlines === 0) {
                        return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                    } else {
                        return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                    }
                }
                // peek for comment // ...
                if (input.charAt(parser_pos) === '/') {
                    comment = c;
                    while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                        comment += input.charAt(parser_pos);
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                    return [comment, 'TK_COMMENT'];
                }

            }

            if (c === '`' || c === "'" || c === '"' || // string
                (
                    (c === '/') || // regexp
                    (opts.e4x && c === "<" && input.slice(parser_pos - 1).match(/^<([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])\s*([-a-zA-Z:0-9_.]+=('[^']*'|"[^"]*"|{[^{}]*})\s*)*\/?\s*>/)) // xml
                ) && ( // regex and xml can only appear in specific locations during parsing
                    (last_token.type === 'TK_RESERVED' && in_array(last_token.text , ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
                    (last_token.type === 'TK_END_EXPR' && last_token.text === ')' &&
                        last_token.parent && last_token.parent.type === 'TK_RESERVED' && in_array(last_token.parent.text, ['if', 'while', 'for'])) ||
                    (in_array(last_token.type, ['TK_COMMENT', 'TK_START_EXPR', 'TK_START_BLOCK',
                        'TK_END_BLOCK', 'TK_OPERATOR', 'TK_EQUALS', 'TK_EOF', 'TK_SEMICOLON', 'TK_COMMA'
                    ]))
                )) {

                var sep = c,
                    esc = false,
                    has_char_escapes = false;

                resulting_string = c;

                if (sep === '/') {
                    //
                    // handle regexp
                    //
                    var in_char_class = false;
                    while (parser_pos < input_length &&
                            ((esc || in_char_class || input.charAt(parser_pos) !== sep) &&
                            !acorn.newline.test(input.charAt(parser_pos)))) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            } else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                    }
                } else if (opts.e4x && sep === '<') {
                    //
                    // handle e4x xml literals
                    //
                    var xmlRegExp = /<(\/?)([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])\s*([-a-zA-Z:0-9_.]+=('[^']*'|"[^"]*"|{[^{}]*})\s*)*(\/?)\s*>/g;
                    var xmlStr = input.slice(parser_pos - 1);
                    var match = xmlRegExp.exec(xmlStr);
                    if (match && match.index === 0) {
                        var rootTag = match[2];
                        var depth = 0;
                        while (match) {
                            var isEndTag = !! match[1];
                            var tagName = match[2];
                            var isSingletonTag = ( !! match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
                            if (tagName === rootTag && !isSingletonTag) {
                                if (isEndTag) {
                                    --depth;
                                } else {
                                    ++depth;
                                }
                            }
                            if (depth <= 0) {
                                break;
                            }
                            match = xmlRegExp.exec(xmlStr);
                        }
                        var xmlLength = match ? match.index + match[0].length : xmlStr.length;
                        parser_pos += xmlLength - 1;
                        return [xmlStr.slice(0, xmlLength), "TK_STRING"];
                    }
                } else {
                    //
                    // handle string
                    //
                    // Template strings can travers lines without escape characters.
                    // Other strings cannot
                    while (parser_pos < input_length &&
                            (esc || (input.charAt(parser_pos) !== sep &&
                            (sep === '`' || !acorn.newline.test(input.charAt(parser_pos)))))) {
                        resulting_string += input.charAt(parser_pos);
                        if (esc) {
                            if (input.charAt(parser_pos) === 'x' || input.charAt(parser_pos) === 'u') {
                                has_char_escapes = true;
                            }
                            esc = false;
                        } else {
                            esc = input.charAt(parser_pos) === '\\';
                        }
                        parser_pos += 1;
                    }

                }

                if (has_char_escapes && opts.unescape_strings) {
                    resulting_string = unescape_string(resulting_string);
                }

                if (parser_pos < input_length && input.charAt(parser_pos) === sep) {
                    resulting_string += sep;
                    parser_pos += 1;

                    if (sep === '/') {
                        // regexps may have modifiers /regexp/MOD , so fetch those, too
                        // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
                        while (parser_pos < input_length && acorn.isIdentifierStart(input.charCodeAt(parser_pos))) {
                            resulting_string += input.charAt(parser_pos);
                            parser_pos += 1;
                        }
                    }
                }
                return [resulting_string, 'TK_STRING'];
            }

            if (c === '#') {

                if (tokens.length === 0 && input.charAt(parser_pos) === '!') {
                    // shebang
                    resulting_string = c;
                    while (parser_pos < input_length && c !== '\n') {
                        c = input.charAt(parser_pos);
                        resulting_string += c;
                        parser_pos += 1;
                    }
                    return [trim(resulting_string) + '\n', 'TK_UNKNOWN'];
                }



                // Spidermonkey-specific sharp variables for circular references
                // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
                // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
                var sharp = '#';
                if (parser_pos < input_length && digit.test(input.charAt(parser_pos))) {
                    do {
                        c = input.charAt(parser_pos);
                        sharp += c;
                        parser_pos += 1;
                    } while (parser_pos < input_length && c !== '#' && c !== '=');
                    if (c === '#') {
                        //
                    } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                        sharp += '[]';
                        parser_pos += 2;
                    } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                        sharp += '{}';
                        parser_pos += 2;
                    }
                    return [sharp, 'TK_WORD'];
                }
            }

            if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
                parser_pos += 3;
                c = '<!--';
                while (input.charAt(parser_pos) !== '\n' && parser_pos < input_length) {
                    c += input.charAt(parser_pos);
                    parser_pos++;
                }
                in_html_comment = true;
                return [c, 'TK_COMMENT'];
            }

            if (c === '-' && in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
                in_html_comment = false;
                parser_pos += 2;
                return ['-->', 'TK_COMMENT'];
            }

            if (c === '.') {
                return [c, 'TK_DOT'];
            }

            if (in_array(c, punct)) {
                while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }

                if (c === ',') {
                    return [c, 'TK_COMMA'];
                } else if (c === '=') {
                    return [c, 'TK_EQUALS'];
                } else {
                    return [c, 'TK_OPERATOR'];
                }
            }

            return [c, 'TK_UNKNOWN'];
        }


        function unescape_string(s) {
            var esc = false,
                out = '',
                pos = 0,
                s_hex = '',
                escaped = 0,
                c;

            while (esc || pos < s.length) {

                c = s.charAt(pos);
                pos++;

                if (esc) {
                    esc = false;
                    if (c === 'x') {
                        // simple hex-escape \x24
                        s_hex = s.substr(pos, 2);
                        pos += 2;
                    } else if (c === 'u') {
                        // unicode-escape, \u2134
                        s_hex = s.substr(pos, 4);
                        pos += 4;
                    } else {
                        // some common escape, e.g \n
                        out += '\\' + c;
                        continue;
                    }
                    if (!s_hex.match(/^[0123456789abcdefABCDEF]+$/)) {
                        // some weird escaping, bail out,
                        // leaving whole string intact
                        return s;
                    }

                    escaped = parseInt(s_hex, 16);

                    if (escaped >= 0x00 && escaped < 0x20) {
                        // leave 0x00...0x1f escaped
                        if (c === 'x') {
                            out += '\\x' + s_hex;
                        } else {
                            out += '\\u' + s_hex;
                        }
                        continue;
                    } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
                        // single-quote, apostrophe, backslash - escape these
                        out += '\\' + String.fromCharCode(escaped);
                    } else if (c === 'x' && escaped > 0x7e && escaped <= 0xff) {
                        // we bail out on \x7f..\xff,
                        // leaving whole string escaped,
                        // as it's probably completely binary
                        return s;
                    } else {
                        out += String.fromCharCode(escaped);
                    }
                } else if (c === '\\') {
                    esc = true;
                } else {
                    out += c;
                }
            }
            return out;
        }

    }

    return { js_beautify: js_beautify };
});

define('skylark-utils-js/beautify',[
    "./js",
    "./primitives/beautify-js"
], function(js, beautifyJs) {

	return js.beautify = beautifyJs.js_beautify;
});
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
    http://jsbeautifier.org/

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_inner_html (default false)  — indent <head> and <body> sections,
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    wrap_line_length (default 250)            -  maximum amount of characters per line (0 = disable)
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.
    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"
    preserve_newlines (default true) - whether existing line breaks before elements should be preserved
                                        Only works before elements, not inside tags or for text.
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk
    indent_handlebars (default false) - format and indent {{#foo}} and {{/foo}}
    end_with_newline (false)          - end with a newline


    e.g.

    style_html(html_source, {
      'indent_inner_html': false,
      'indent_size': 2,
      'indent_char': ' ',
      'wrap_line_length': 78,
      'brace_style': 'expand',
      'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u'],
      'preserve_newlines': true,
      'max_preserve_newlines': 5,
      'indent_handlebars': false
    });
*/

define('skylark-utils-html/primitives/beautify-html',[
    "skylark-utils-css/beautify",
    "skylark-utils-js/beautify"
], function(beautifyCss, beautifyHtml) {

    function trim(s) {
        return s.replace(/^\s+|\s+$/g, '');
    }

    function ltrim(s) {
        return s.replace(/^\s+/g, '');
    }

    function rtrim(s) {
        return s.replace(/\s+$/g,'');
    }

    function style_html(html_source, options, js_beautify, css_beautify) {
        //Wrapper function to invoke all the necessary constructors and deal with the output.

        var multi_parser,
            indent_inner_html,
            indent_size,
            indent_character,
            wrap_line_length,
            brace_style,
            unformatted,
            preserve_newlines,
            max_preserve_newlines,
            indent_handlebars,
            end_with_newline;

        options = options || {};

        // backwards compatibility to 1.3.4
        if ((options.wrap_line_length === undefined || parseInt(options.wrap_line_length, 10) === 0) &&
                (options.max_char !== undefined && parseInt(options.max_char, 10) !== 0)) {
            options.wrap_line_length = options.max_char;
        }

        indent_inner_html = (options.indent_inner_html === undefined) ? false : options.indent_inner_html;
        indent_size = (options.indent_size === undefined) ? 4 : parseInt(options.indent_size, 10);
        indent_character = (options.indent_char === undefined) ? ' ' : options.indent_char;
        brace_style = (options.brace_style === undefined) ? 'collapse' : options.brace_style;
        wrap_line_length =  parseInt(options.wrap_line_length, 10) === 0 ? 32786 : parseInt(options.wrap_line_length || 250, 10);
        unformatted = options.unformatted || ['a', 'span', 'img', 'bdo', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd', 'var', 'cite', 'abbr', 'acronym', 'q', 'sub', 'sup', 'tt', 'i', 'b', 'big', 'small', 'u', 's', 'strike', 'font', 'ins', 'del', 'pre', 'address', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        preserve_newlines = (options.preserve_newlines === undefined) ? true : options.preserve_newlines;
        max_preserve_newlines = preserve_newlines ?
            (isNaN(parseInt(options.max_preserve_newlines, 10)) ? 32786 : parseInt(options.max_preserve_newlines, 10))
            : 0;
        indent_handlebars = (options.indent_handlebars === undefined) ? false : options.indent_handlebars;
        end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;

        function Parser() {

            this.pos = 0; //Parser position
            this.token = '';
            this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
            this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
                parent: 'parent1',
                parentcount: 1,
                parent1: ''
            };
            this.tag_type = '';
            this.token_text = this.last_token = this.last_text = this.token_type = '';
            this.newlines = 0;
            this.indent_content = indent_inner_html;

            this.Utils = { //Uilities made available to the various functions
                whitespace: "\n\r\t ".split(''),
                single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed,?php,?,?='.split(','), //all the single tags for HTML
                extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
                in_array: function(what, arr) {
                    for (var i = 0; i < arr.length; i++) {
                        if (what === arr[i]) {
                            return true;
                        }
                    }
                    return false;
                }
            };

            // Return true iff the given text is composed entirely of
            // whitespace.
            this.is_whitespace = function(text) {
                for (var n = 0; n < text.length; text++) {
                    if (!this.Utils.in_array(text.charAt(n), this.Utils.whitespace)) {
                        return false;
                    }
                }
                return true;
            }

            this.traverse_whitespace = function() {
                var input_char = '';

                input_char = this.input.charAt(this.pos);
                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    this.newlines = 0;
                    while (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                        if (preserve_newlines && input_char === '\n' && this.newlines <= max_preserve_newlines) {
                            this.newlines += 1;
                        }

                        this.pos++;
                        input_char = this.input.charAt(this.pos);
                    }
                    return true;
                }
                return false;
            };

            // Append a space to the given content (string array) or, if we are
            // at the wrap_line_length, append a newline/indentation.
            this.space_or_wrap = function(content) {
                if (this.line_char_count >= this.wrap_line_length) { //insert a line when the wrap_line_length is reached
                    this.print_newline(false, content);
                    this.print_indentation(content);
                } else {
                    this.line_char_count++;
                    content.push(' ');
                }
            };

            this.get_content = function() { //function to capture regular content between tags
                var input_char = '',
                    content = [],
                    space = false; //if a space is needed

                while (this.input.charAt(this.pos) !== '<') {
                    if (this.pos >= this.input.length) {
                        return content.length ? content.join('') : ['', 'TK_EOF'];
                    }

                    if (this.traverse_whitespace()) {
                        this.space_or_wrap(content);
                        continue;
                    }

                    if (indent_handlebars) {
                        // Handlebars parsing is complicated.
                        // {{#foo}} and {{/foo}} are formatted tags.
                        // {{something}} should get treated as content, except:
                        // {{else}} specifically behaves like {{#if}} and {{/if}}
                        var peek3 = this.input.substr(this.pos, 3);
                        if (peek3 === '{{#' || peek3 === '{{/') {
                            // These are tags and not content.
                            break;
                        } else if (this.input.substr(this.pos, 2) === '{{') {
                            if (this.get_tag(true) === '{{else}}') {
                                break;
                            }
                        }
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;
                    this.line_char_count++;
                    content.push(input_char); //letter at-a-time (or string) inserted to an array
                }
                return content.length ? content.join('') : '';
            };

            this.get_contents_to = function(name) { //get the full content of a script or style to pass to js_beautify
                if (this.pos === this.input.length) {
                    return ['', 'TK_EOF'];
                }
                var input_char = '';
                var content = '';
                var reg_match = new RegExp('</' + name + '\\s*>', 'igm');
                reg_match.lastIndex = this.pos;
                var reg_array = reg_match.exec(this.input);
                var end_script = reg_array ? reg_array.index : this.input.length; //absolute end of script
                if (this.pos < end_script) { //get everything in between the script tags
                    content = this.input.substring(this.pos, end_script);
                    this.pos = end_script;
                }
                return content;
            };

            this.record_tag = function(tag) { //function to record a tag and its parent in this.tags Object
                if (this.tags[tag + 'count']) { //check for the existence of this tag type
                    this.tags[tag + 'count']++;
                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                } else { //otherwise initialize this tag type
                    this.tags[tag + 'count'] = 1;
                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                }
                this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
                this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
            };

            this.retrieve_tag = function(tag) { //function to retrieve the opening tag to the corresponding closer
                if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
                    var temp_parent = this.tags.parent; //check to see if it's a closable tag.
                    while (temp_parent) { //till we reach '' (the initial value);
                        if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
                            break;
                        }
                        temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
                    }
                    if (temp_parent) { //if we caught something
                        this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
                        this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
                    }
                    delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
                    delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
                    if (this.tags[tag + 'count'] === 1) {
                        delete this.tags[tag + 'count'];
                    } else {
                        this.tags[tag + 'count']--;
                    }
                }
            };

            this.indent_to_tag = function(tag) {
                // Match the indentation level to the last use of this tag, but don't remove it.
                if (!this.tags[tag + 'count']) {
                    return;
                }
                var temp_parent = this.tags.parent;
                while (temp_parent) {
                    if (tag + this.tags[tag + 'count'] === temp_parent) {
                        break;
                    }
                    temp_parent = this.tags[temp_parent + 'parent'];
                }
                if (temp_parent) {
                    this.indent_level = this.tags[tag + this.tags[tag + 'count']];
                }
            };

            this.get_tag = function(peek) { //function to get a full tag and parse its type
                var input_char = '',
                    content = [],
                    comment = '',
                    space = false,
                    tag_start, tag_end,
                    tag_start_char,
                    orig_pos = this.pos,
                    orig_line_char_count = this.line_char_count;

                peek = peek !== undefined ? peek : false;

                do {
                    if (this.pos >= this.input.length) {
                        if (peek) {
                            this.pos = orig_pos;
                            this.line_char_count = orig_line_char_count;
                        }
                        return content.length ? content.join('') : ['', 'TK_EOF'];
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;

                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
                        space = true;
                        continue;
                    }

                    if (input_char === "'" || input_char === '"') {
                        input_char += this.get_unformatted(input_char);
                        space = true;

                    }

                    if (input_char === '=') { //no space before =
                        space = false;
                    }

                    if (content.length && content[content.length - 1] !== '=' && input_char !== '>' && space) {
                        //no space after = or before >
                        this.space_or_wrap(content);
                        space = false;
                    }

                    if (indent_handlebars && tag_start_char === '<') {
                        // When inside an angle-bracket tag, put spaces around
                        // handlebars not inside of strings.
                        if ((input_char + this.input.charAt(this.pos)) === '{{') {
                            input_char += this.get_unformatted('}}');
                            if (content.length && content[content.length - 1] !== ' ' && content[content.length - 1] !== '<') {
                                input_char = ' ' + input_char;
                            }
                            space = true;
                        }
                    }

                    if (input_char === '<' && !tag_start_char) {
                        tag_start = this.pos - 1;
                        tag_start_char = '<';
                    }

                    if (indent_handlebars && !tag_start_char) {
                        if (content.length >= 2 && content[content.length - 1] === '{' && content[content.length - 2] == '{') {
                            if (input_char === '#' || input_char === '/') {
                                tag_start = this.pos - 3;
                            } else {
                                tag_start = this.pos - 2;
                            }
                            tag_start_char = '{';
                        }
                    }

                    this.line_char_count++;
                    content.push(input_char); //inserts character at-a-time (or string)

                    if (content[1] && content[1] === '!') { //if we're in a comment, do something special
                        // We treat all comments as literals, even more than preformatted tags
                        // we just look for the appropriate close tag
                        content = [this.get_comment(tag_start)];
                        break;
                    }

                    if (indent_handlebars && tag_start_char === '{' && content.length > 2 && content[content.length - 2] === '}' && content[content.length - 1] === '}') {
                        break;
                    }
                } while (input_char !== '>');

                var tag_complete = content.join('');
                var tag_index;
                var tag_offset;

                if (tag_complete.indexOf(' ') !== -1) { //if there's whitespace, thats where the tag name ends
                    tag_index = tag_complete.indexOf(' ');
                } else if (tag_complete[0] === '{') {
                    tag_index = tag_complete.indexOf('}');
                } else { //otherwise go with the tag ending
                    tag_index = tag_complete.indexOf('>');
                }
                if (tag_complete[0] === '<' || !indent_handlebars) {
                    tag_offset = 1;
                } else {
                    tag_offset = tag_complete[2] === '#' ? 3 : 2;
                }
                var tag_check = tag_complete.substring(tag_offset, tag_index).toLowerCase();
                if (tag_complete.charAt(tag_complete.length - 2) === '/' ||
                    this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
                    if (!peek) {
                        this.tag_type = 'SINGLE';
                    }
                } else if (indent_handlebars && tag_complete[0] === '{' && tag_check === 'else') {
                    if (!peek) {
                        this.indent_to_tag('if');
                        this.tag_type = 'HANDLEBARS_ELSE';
                        this.indent_content = true;
                        this.traverse_whitespace();
                    }
                } else if (this.is_unformatted(tag_check, unformatted)) { // do not reformat the "unformatted" tags
                    comment = this.get_unformatted('</' + tag_check + '>', tag_complete); //...delegate to get_unformatted function
                    content.push(comment);
                    tag_end = this.pos - 1;
                    this.tag_type = 'SINGLE';
                } else if (tag_check === 'script' &&
                    (tag_complete.search('type') === -1 ||
                    (tag_complete.search('type') > -1 &&
                    tag_complete.search(/\b(text|application)\/(x-)?(javascript|ecmascript|jscript|livescript)/) > -1))) {
                    if (!peek) {
                        this.record_tag(tag_check);
                        this.tag_type = 'SCRIPT';
                    }
                } else if (tag_check === 'style' &&
                    (tag_complete.search('type') === -1 ||
                    (tag_complete.search('type') > -1 && tag_complete.search('text/css') > -1))) {
                    if (!peek) {
                        this.record_tag(tag_check);
                        this.tag_type = 'STYLE';
                    }
                } else if (tag_check.charAt(0) === '!') { //peek for <! comment
                    // for comments content is already correct.
                    if (!peek) {
                        this.tag_type = 'SINGLE';
                        this.traverse_whitespace();
                    }
                } else if (!peek) {
                    if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
                        this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
                        this.tag_type = 'END';
                    } else { //otherwise it's a start-tag
                        this.record_tag(tag_check); //push it on the tag stack
                        if (tag_check.toLowerCase() !== 'html') {
                            this.indent_content = true;
                        }
                        this.tag_type = 'START';
                    }

                    // Allow preserving of newlines after a start or end tag
                    if (this.traverse_whitespace()) {
                        this.space_or_wrap(content);
                    }

                    if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
                        this.print_newline(false, this.output);
                        if (this.output.length && this.output[this.output.length - 2] !== '\n') {
                            this.print_newline(true, this.output);
                        }
                    }
                }

                if (peek) {
                    this.pos = orig_pos;
                    this.line_char_count = orig_line_char_count;
                }

                return content.join(''); //returns fully formatted tag
            };

            this.get_comment = function(start_pos) { //function to return comment content in its entirety
                // this is will have very poor perf, but will work for now.
                var comment = '',
                    delimiter = '>',
                    matched = false;

                this.pos = start_pos;
                input_char = this.input.charAt(this.pos);
                this.pos++;

                while (this.pos <= this.input.length) {
                    comment += input_char;

                    // only need to check for the delimiter if the last chars match
                    if (comment[comment.length - 1] === delimiter[delimiter.length - 1] &&
                        comment.indexOf(delimiter) !== -1) {
                        break;
                    }

                    // only need to search for custom delimiter for the first few characters
                    if (!matched && comment.length < 10) {
                        if (comment.indexOf('<![if') === 0) { //peek for <![if conditional comment
                            delimiter = '<![endif]>';
                            matched = true;
                        } else if (comment.indexOf('<![cdata[') === 0) { //if it's a <[cdata[ comment...
                            delimiter = ']]>';
                            matched = true;
                        } else if (comment.indexOf('<![') === 0) { // some other ![ comment? ...
                            delimiter = ']>';
                            matched = true;
                        } else if (comment.indexOf('<!--') === 0) { // <!-- comment ...
                            delimiter = '-->';
                            matched = true;
                        }
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;
                }

                return comment;
            };

            this.get_unformatted = function(delimiter, orig_tag) { //function to return unformatted content in its entirety

                if (orig_tag && orig_tag.toLowerCase().indexOf(delimiter) !== -1) {
                    return '';
                }
                var input_char = '';
                var content = '';
                var min_index = 0;
                var space = true;
                do {

                    if (this.pos >= this.input.length) {
                        return content;
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;

                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                        if (!space) {
                            this.line_char_count--;
                            continue;
                        }
                        if (input_char === '\n' || input_char === '\r') {
                            content += '\n';
                            /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
                for (var i=0; i<this.indent_level; i++) {
                  content += this.indent_string;
                }
                space = false; //...and make sure other indentation is erased
                */
                            this.line_char_count = 0;
                            continue;
                        }
                    }
                    content += input_char;
                    this.line_char_count++;
                    space = true;

                    if (indent_handlebars && input_char === '{' && content.length && content[content.length - 2] === '{') {
                        // Handlebars expressions in strings should also be unformatted.
                        content += this.get_unformatted('}}');
                        // These expressions are opaque.  Ignore delimiters found in them.
                        min_index = content.length;
                    }
                } while (content.toLowerCase().indexOf(delimiter, min_index) === -1);
                return content;
            };

            this.get_token = function() { //initial handler for token-retrieval
                var token;

                if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
                    var type = this.last_token.substr(7);
                    token = this.get_contents_to(type);
                    if (typeof token !== 'string') {
                        return token;
                    }
                    return [token, 'TK_' + type];
                }
                if (this.current_mode === 'CONTENT') {
                    token = this.get_content();
                    if (typeof token !== 'string') {
                        return token;
                    } else {
                        return [token, 'TK_CONTENT'];
                    }
                }

                if (this.current_mode === 'TAG') {
                    token = this.get_tag();
                    if (typeof token !== 'string') {
                        return token;
                    } else {
                        var tag_name_type = 'TK_TAG_' + this.tag_type;
                        return [token, tag_name_type];
                    }
                }
            };

            this.get_full_indent = function(level) {
                level = this.indent_level + level || 0;
                if (level < 1) {
                    return '';
                }

                return Array(level + 1).join(this.indent_string);
            };

            this.is_unformatted = function(tag_check, unformatted) {
                //is this an HTML5 block-level link?
                if (!this.Utils.in_array(tag_check, unformatted)) {
                    return false;
                }

                if (tag_check.toLowerCase() !== 'a' || !this.Utils.in_array('a', unformatted)) {
                    return true;
                }

                //at this point we have an  tag; is its first child something we want to remain
                //unformatted?
                var next_tag = this.get_tag(true /* peek. */ );

                // test next_tag to see if it is just html tag (no external content)
                var tag = (next_tag || "").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);

                // if next_tag comes back but is not an isolated tag, then
                // let's treat the 'a' tag as having content
                // and respect the unformatted option
                if (!tag || this.Utils.in_array(tag, unformatted)) {
                    return true;
                } else {
                    return false;
                }
            };

            this.printer = function(js_source, indent_character, indent_size, wrap_line_length, brace_style) { //handles input/output and some other printing functions

                this.input = js_source || ''; //gets the input for the Parser
                this.output = [];
                this.indent_character = indent_character;
                this.indent_string = '';
                this.indent_size = indent_size;
                this.brace_style = brace_style;
                this.indent_level = 0;
                this.wrap_line_length = wrap_line_length;
                this.line_char_count = 0; //count to see if wrap_line_length was exceeded

                for (var i = 0; i < this.indent_size; i++) {
                    this.indent_string += this.indent_character;
                }

                this.print_newline = function(force, arr) {
                    this.line_char_count = 0;
                    if (!arr || !arr.length) {
                        return;
                    }
                    if (force || (arr[arr.length - 1] !== '\n')) { //we might want the extra line
                        if ((arr[arr.length - 1] !== '\n')) {
                            arr[arr.length - 1] = rtrim(arr[arr.length - 1]);
                        }
                        arr.push('\n');
                    }
                };

                this.print_indentation = function(arr) {
                    for (var i = 0; i < this.indent_level; i++) {
                        arr.push(this.indent_string);
                        this.line_char_count += this.indent_string.length;
                    }
                };

                this.print_token = function(text) {
                    // Avoid printing initial whitespace.
                    if (this.is_whitespace(text) && !this.output.length) {
                        return;
                    }
                    if (text || text !== '') {
                        if (this.output.length && this.output[this.output.length - 1] === '\n') {
                            this.print_indentation(this.output);
                            text = ltrim(text);
                        }
                    }
                    this.print_token_raw(text);
                };

                this.print_token_raw = function(text) {
                    // If we are going to print newlines, truncate trailing
                    // whitespace, as the newlines will represent the space.
                    if (this.newlines > 0) {
                        text = rtrim(text);
                    }

                    if (text && text !== '') {
                        if (text.length > 1 && text[text.length - 1] === '\n') {
                            // unformatted tags can grab newlines as their last character
                            this.output.push(text.slice(0, -1));
                            this.print_newline(false, this.output);
                        } else {
                            this.output.push(text);
                        }
                    }

                    for (var n = 0; n < this.newlines; n++) {
                        this.print_newline(n > 0, this.output);
                    }
                    this.newlines = 0;
                };

                this.indent = function() {
                    this.indent_level++;
                };

                this.unindent = function() {
                    if (this.indent_level > 0) {
                        this.indent_level--;
                    }
                };
            };
            return this;
        }

        /*_____________________--------------------_____________________*/

        multi_parser = new Parser(); //wrapping functions Parser
        multi_parser.printer(html_source, indent_character, indent_size, wrap_line_length, brace_style); //initialize starting values

        while (true) {
            var t = multi_parser.get_token();
            multi_parser.token_text = t[0];
            multi_parser.token_type = t[1];

            if (multi_parser.token_type === 'TK_EOF') {
                break;
            }

            switch (multi_parser.token_type) {
                case 'TK_TAG_START':
                    multi_parser.print_newline(false, multi_parser.output);
                    multi_parser.print_token(multi_parser.token_text);
                    if (multi_parser.indent_content) {
                        multi_parser.indent();
                        multi_parser.indent_content = false;
                    }
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_STYLE':
                case 'TK_TAG_SCRIPT':
                    multi_parser.print_newline(false, multi_parser.output);
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_END':
                    //Print new line only if the tag has no content and has child
                    if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
                        var tag_name = multi_parser.token_text.match(/\w+/)[0];
                        var tag_extracted_from_last_output = null;
                        if (multi_parser.output.length) {
                            tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/(?:<|{{#)\s*(\w+)/);
                        }
                        if (tag_extracted_from_last_output === null ||
                            tag_extracted_from_last_output[1] !== tag_name) {
                            multi_parser.print_newline(false, multi_parser.output);
                        }
                    }
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_SINGLE':
                    // Don't add a newline before elements that should remain unformatted.
                    var tag_check = multi_parser.token_text.match(/^\s*<([a-z-]+)/i);
                    if (!tag_check || !multi_parser.Utils.in_array(tag_check[1], unformatted)) {
                        multi_parser.print_newline(false, multi_parser.output);
                    }
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_HANDLEBARS_ELSE':
                    multi_parser.print_token(multi_parser.token_text);
                    if (multi_parser.indent_content) {
                        multi_parser.indent();
                        multi_parser.indent_content = false;
                    }
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_CONTENT':
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'TAG';
                    break;
                case 'TK_STYLE':
                case 'TK_SCRIPT':
                    if (multi_parser.token_text !== '') {
                        multi_parser.print_newline(false, multi_parser.output);
                        var text = multi_parser.token_text,
                            _beautifier,
                            script_indent_level = 1;
                        if (multi_parser.token_type === 'TK_SCRIPT') {
                            _beautifier = typeof js_beautify === 'function' && js_beautify;
                        } else if (multi_parser.token_type === 'TK_STYLE') {
                            _beautifier = typeof css_beautify === 'function' && css_beautify;
                        }

                        if (options.indent_scripts === "keep") {
                            script_indent_level = 0;
                        } else if (options.indent_scripts === "separate") {
                            script_indent_level = -multi_parser.indent_level;
                        }

                        var indentation = multi_parser.get_full_indent(script_indent_level);
                        if (_beautifier) {
                            // call the Beautifier if avaliable
                            text = _beautifier(text.replace(/^\s*/, indentation), options);
                        } else {
                            // simply indent the string otherwise
                            var white = text.match(/^\s*/)[0];
                            var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
                            var reindent = multi_parser.get_full_indent(script_indent_level - _level);
                            text = text.replace(/^\s*/, indentation)
                                .replace(/\r\n|\r|\n/g, '\n' + reindent)
                                .replace(/\s+$/, '');
                        }
                        if (text) {
                            multi_parser.print_token_raw(text);
                            multi_parser.print_newline(true, multi_parser.output);
                        }
                    }
                    multi_parser.current_mode = 'TAG';
                    break;
                default:
                    // We should not be getting here but we don't want to drop input on the floor
                    // Just output the text and move on
                    if (multi_parser.token_text !== '') {
                        multi_parser.print_token(multi_parser.token_text);
                    }
                    break;
            }
            multi_parser.last_token = multi_parser.token_type;
            multi_parser.last_text = multi_parser.token_text;
        }
        var sweet_code = multi_parser.output.join('').replace(/[\r\n\t ]+$/, '');
        if (end_with_newline) {
            sweet_code += '\n';
        }
        return sweet_code;
    }


    return {
      html_beautify: function(html_source, options) {
        return style_html(html_source, options, beautifyJs, beautifyCss);
      }
    };

});

define('skylark-utils-html/beautify',[
    "./html",
    "./primitives/beautify-html"
], function(html, beautifyHtml) {

	return html.beautify = beautifyHtml.html_beautify;
});
define('skylark-utils-html/main',[
    "./html",
    "./beautify"
], function(html) {
    return html;
});

define('skylark-utils-html', ['skylark-utils-html/main'], function (main) { return main; });


},this);