(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.figtree = {}));
}(this, function (exports) { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

	function _typeof(obj) {
	  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return _typeof2(obj);
	    };
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
	    };
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	});

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	var iterableToArrayLimit = _iterableToArrayLimit;

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

	var runtime_1 = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var runtime = (function (exports) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  exports.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration.
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          // If a rejected Promise was yielded, throw the rejection back
	          // into the async generator function so it can be handled there.
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  exports.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return exports.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        // Note: ["return"] must be used for ES3 parsing compatibility.
	        if (delegate.iterator["return"]) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined$1;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  exports.values = values;

	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined$1;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined$1;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined$1;
	      }

	      return ContinueSentinel;
	    }
	  };

	  // Regardless of whether this script is executing as a CommonJS module
	  // or not, return the runtime object so that we can declare the variable
	  // regeneratorRuntime in the outer scope, which allows this module to be
	  // injected easily by `bin/regenerator --include-runtime script.js`.
	  return exports;

	}(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	  module.exports
	));

	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  // This module should not be running in strict mode, so the above
	  // assignment should always work unless something is misconfigured. Just
	  // in case runtime.js accidentally runs in strict mode, we can escape
	  // strict mode using a global Function call. This could conceivably fail
	  // if a Content Security Policy forbids using Function, but in that case
	  // the proper solution is to fix the accidental strict mode problem. If
	  // you've misconfigured your bundler to force strict mode and applied a
	  // CSP to forbid Function, and you're not willing to fix either of those
	  // problems, please detail your unique predicament in a GitHub issue.
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	var regenerator = runtime_1;

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }

	    return arr2;
	  }
	}

	var arrayWithoutHoles = _arrayWithoutHoles;

	function _iterableToArray(iter) {
	  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
	}

	var iterableToArray = _iterableToArray;

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance");
	}

	var nonIterableSpread = _nonIterableSpread;

	function _toConsumableArray(arr) {
	  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
	}

	var toConsumableArray = _toConsumableArray;

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	var defineProperty = _defineProperty;

	function _objectSpread(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};
	    var ownKeys = Object.keys(source);

	    if (typeof Object.getOwnPropertySymbols === 'function') {
	      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
	        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	      }));
	    }

	    ownKeys.forEach(function (key) {
	      defineProperty(target, key, source[key]);
	    });
	  }

	  return target;
	}

	var objectSpread = _objectSpread;

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	var createClass = _createClass;

	var rngBrowser = createCommonjsModule(function (module) {
	// Unique ID creation requires a high quality random # generator.  In the
	// browser this is a little complicated due to unknown quality of Math.random()
	// and inconsistent support for the `crypto` API.  We do the best we can via
	// feature-detection

	// getRandomValues needs to be invoked in a context where "this" is a Crypto
	// implementation. Also, find the complete implementation of crypto on IE11.
	var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
	                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

	if (getRandomValues) {
	  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
	  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

	  module.exports = function whatwgRNG() {
	    getRandomValues(rnds8);
	    return rnds8;
	  };
	} else {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var rnds = new Array(16);

	  module.exports = function mathRNG() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return rnds;
	  };
	}
	});

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	  return ([bth[buf[i++]], bth[buf[i++]], 
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]]]).join('');
	}

	var bytesToUuid_1 = bytesToUuid;

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId;
	var _clockseq;

	// Previous uuid creation time
	var _lastMSecs = 0;
	var _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};
	  var node = options.node || _nodeId;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189
	  if (node == null || clockseq == null) {
	    var seedBytes = rngBrowser();
	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId = [
	        seedBytes[0] | 0x01,
	        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
	      ];
	    }
	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  }

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid_1(b);
	}

	var v1_1 = v1;

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rngBrowser)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid_1(rnds);
	}

	var v4_1 = v4;

	var uuid = v4_1;
	uuid.v1 = v1_1;
	uuid.v4 = v4_1;

	var uuid_1 = uuid;

	function ascending(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector(compare) {
	  if (compare.length === 1) compare = ascendingComparator(compare);
	  return {
	    left: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) < 0) lo = mid + 1;
	        else hi = mid;
	      }
	      return lo;
	    },
	    right: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) > 0) hi = mid;
	        else lo = mid + 1;
	      }
	      return lo;
	    }
	  };
	}

	function ascendingComparator(f) {
	  return function(d, x) {
	    return ascending(f(d), x);
	  };
	}

	var ascendingBisect = bisector(ascending);
	var bisectRight = ascendingBisect.right;

	function number(x) {
	  return x === null ? NaN : +x;
	}

	function range(start, stop, step) {
	  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	  var i = -1,
	      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	      range = new Array(n);

	  while (++i < n) {
	    range[i] = start + i * step;
	  }

	  return range;
	}

	var e10 = Math.sqrt(50),
	    e5 = Math.sqrt(10),
	    e2 = Math.sqrt(2);

	function ticks(start, stop, count) {
	  var reverse,
	      i = -1,
	      n,
	      ticks,
	      step;

	  stop = +stop, start = +start, count = +count;
	  if (start === stop && count > 0) return [start];
	  if (reverse = stop < start) n = start, start = stop, stop = n;
	  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

	  if (step > 0) {
	    start = Math.ceil(start / step);
	    stop = Math.floor(stop / step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) * step;
	  } else {
	    start = Math.floor(start * step);
	    stop = Math.ceil(stop * step);
	    ticks = new Array(n = Math.ceil(start - stop + 1));
	    while (++i < n) ticks[i] = (start - i) / step;
	  }

	  if (reverse) ticks.reverse();

	  return ticks;
	}

	function tickIncrement(start, stop, count) {
	  var step = (stop - start) / Math.max(0, count),
	      power = Math.floor(Math.log(step) / Math.LN10),
	      error = step / Math.pow(10, power);
	  return power >= 0
	      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
	      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
	}

	function tickStep(start, stop, count) {
	  var step0 = Math.abs(stop - start) / Math.max(0, count),
	      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	      error = step0 / step1;
	  if (error >= e10) step1 *= 10;
	  else if (error >= e5) step1 *= 5;
	  else if (error >= e2) step1 *= 2;
	  return stop < start ? -step1 : step1;
	}

	function max(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  return max;
	}

	function mean(values, valueof) {
	  var n = values.length,
	      m = n,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) sum += value;
	      else --m;
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
	      else --m;
	    }
	  }

	  if (m) return sum / m;
	}

	function min(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  return min;
	}

	var slice = Array.prototype.slice;

	function identity(x) {
	  return x;
	}

	var top = 1,
	    right = 2,
	    bottom = 3,
	    left = 4,
	    epsilon = 1e-6;

	function translateX(x) {
	  return "translate(" + (x + 0.5) + ",0)";
	}

	function translateY(y) {
	  return "translate(0," + (y + 0.5) + ")";
	}

	function number$1(scale) {
	  return function(d) {
	    return +scale(d);
	  };
	}

	function center(scale) {
	  var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
	  if (scale.round()) offset = Math.round(offset);
	  return function(d) {
	    return +scale(d) + offset;
	  };
	}

	function entering() {
	  return !this.__axis;
	}

	function axis(orient, scale) {
	  var tickArguments = [],
	      tickValues = null,
	      tickFormat = null,
	      tickSizeInner = 6,
	      tickSizeOuter = 6,
	      tickPadding = 3,
	      k = orient === top || orient === left ? -1 : 1,
	      x = orient === left || orient === right ? "x" : "y",
	      transform = orient === top || orient === bottom ? translateX : translateY;

	  function axis(context) {
	    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
	        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
	        spacing = Math.max(tickSizeInner, 0) + tickPadding,
	        range = scale.range(),
	        range0 = +range[0] + 0.5,
	        range1 = +range[range.length - 1] + 0.5,
	        position = (scale.bandwidth ? center : number$1)(scale.copy()),
	        selection = context.selection ? context.selection() : context,
	        path = selection.selectAll(".domain").data([null]),
	        tick = selection.selectAll(".tick").data(values, scale).order(),
	        tickExit = tick.exit(),
	        tickEnter = tick.enter().append("g").attr("class", "tick"),
	        line = tick.select("line"),
	        text = tick.select("text");

	    path = path.merge(path.enter().insert("path", ".tick")
	        .attr("class", "domain")
	        .attr("stroke", "currentColor"));

	    tick = tick.merge(tickEnter);

	    line = line.merge(tickEnter.append("line")
	        .attr("stroke", "currentColor")
	        .attr(x + "2", k * tickSizeInner));

	    text = text.merge(tickEnter.append("text")
	        .attr("fill", "currentColor")
	        .attr(x, k * spacing)
	        .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

	    if (context !== selection) {
	      path = path.transition(context);
	      tick = tick.transition(context);
	      line = line.transition(context);
	      text = text.transition(context);

	      tickExit = tickExit.transition(context)
	          .attr("opacity", epsilon)
	          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

	      tickEnter
	          .attr("opacity", epsilon)
	          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
	    }

	    tickExit.remove();

	    path
	        .attr("d", orient === left || orient == right
	            ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
	            : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

	    tick
	        .attr("opacity", 1)
	        .attr("transform", function(d) { return transform(position(d)); });

	    line
	        .attr(x + "2", k * tickSizeInner);

	    text
	        .attr(x, k * spacing)
	        .text(format);

	    selection.filter(entering)
	        .attr("fill", "none")
	        .attr("font-size", 10)
	        .attr("font-family", "sans-serif")
	        .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

	    selection
	        .each(function() { this.__axis = position; });
	  }

	  axis.scale = function(_) {
	    return arguments.length ? (scale = _, axis) : scale;
	  };

	  axis.ticks = function() {
	    return tickArguments = slice.call(arguments), axis;
	  };

	  axis.tickArguments = function(_) {
	    return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
	  };

	  axis.tickValues = function(_) {
	    return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
	  };

	  axis.tickFormat = function(_) {
	    return arguments.length ? (tickFormat = _, axis) : tickFormat;
	  };

	  axis.tickSize = function(_) {
	    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
	  };

	  axis.tickSizeInner = function(_) {
	    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
	  };

	  axis.tickSizeOuter = function(_) {
	    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
	  };

	  axis.tickPadding = function(_) {
	    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
	  };

	  return axis;
	}

	function axisBottom(scale) {
	  return axis(bottom, scale);
	}

	function axisLeft(scale) {
	  return axis(left, scale);
	}

	var noop = {value: function() {}};

	function dispatch() {
	  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
	    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
	    _[t] = [];
	  }
	  return new Dispatch(_);
	}

	function Dispatch(_) {
	  this._ = _;
	}

	function parseTypenames(typenames, types) {
	  return typenames.trim().split(/^|\s+/).map(function(t) {
	    var name = "", i = t.indexOf(".");
	    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
	    return {type: t, name: name};
	  });
	}

	Dispatch.prototype = dispatch.prototype = {
	  constructor: Dispatch,
	  on: function(typename, callback) {
	    var _ = this._,
	        T = parseTypenames(typename + "", _),
	        t,
	        i = -1,
	        n = T.length;

	    // If no callback was specified, return the callback of the given type and name.
	    if (arguments.length < 2) {
	      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
	      return;
	    }

	    // If a type was specified, set the callback for the given type and name.
	    // Otherwise, if a null callback was specified, remove callbacks of the given name.
	    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
	    while (++i < n) {
	      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
	      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
	    }

	    return this;
	  },
	  copy: function() {
	    var copy = {}, _ = this._;
	    for (var t in _) copy[t] = _[t].slice();
	    return new Dispatch(copy);
	  },
	  call: function(type, that) {
	    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  },
	  apply: function(type, that, args) {
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  }
	};

	function get(type, name) {
	  for (var i = 0, n = type.length, c; i < n; ++i) {
	    if ((c = type[i]).name === name) {
	      return c.value;
	    }
	  }
	}

	function set(type, name, callback) {
	  for (var i = 0, n = type.length; i < n; ++i) {
	    if (type[i].name === name) {
	      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
	      break;
	    }
	  }
	  if (callback != null) type.push({name: name, value: callback});
	  return type;
	}

	var xhtml = "http://www.w3.org/1999/xhtml";

	var namespaces = {
	  svg: "http://www.w3.org/2000/svg",
	  xhtml: xhtml,
	  xlink: "http://www.w3.org/1999/xlink",
	  xml: "http://www.w3.org/XML/1998/namespace",
	  xmlns: "http://www.w3.org/2000/xmlns/"
	};

	function namespace(name) {
	  var prefix = name += "", i = prefix.indexOf(":");
	  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
	}

	function creatorInherit(name) {
	  return function() {
	    var document = this.ownerDocument,
	        uri = this.namespaceURI;
	    return uri === xhtml && document.documentElement.namespaceURI === xhtml
	        ? document.createElement(name)
	        : document.createElementNS(uri, name);
	  };
	}

	function creatorFixed(fullname) {
	  return function() {
	    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
	  };
	}

	function creator(name) {
	  var fullname = namespace(name);
	  return (fullname.local
	      ? creatorFixed
	      : creatorInherit)(fullname);
	}

	function none() {}

	function selector(selector) {
	  return selector == null ? none : function() {
	    return this.querySelector(selector);
	  };
	}

	function selection_select(select) {
	  if (typeof select !== "function") select = selector(select);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
	        if ("__data__" in node) subnode.__data__ = node.__data__;
	        subgroup[i] = subnode;
	      }
	    }
	  }

	  return new Selection(subgroups, this._parents);
	}

	function empty() {
	  return [];
	}

	function selectorAll(selector) {
	  return selector == null ? empty : function() {
	    return this.querySelectorAll(selector);
	  };
	}

	function selection_selectAll(select) {
	  if (typeof select !== "function") select = selectorAll(select);

	  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        subgroups.push(select.call(node, node.__data__, i, group));
	        parents.push(node);
	      }
	    }
	  }

	  return new Selection(subgroups, parents);
	}

	function matcher(selector) {
	  return function() {
	    return this.matches(selector);
	  };
	}

	function selection_filter(match) {
	  if (typeof match !== "function") match = matcher(match);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	        subgroup.push(node);
	      }
	    }
	  }

	  return new Selection(subgroups, this._parents);
	}

	function sparse(update) {
	  return new Array(update.length);
	}

	function selection_enter() {
	  return new Selection(this._enter || this._groups.map(sparse), this._parents);
	}

	function EnterNode(parent, datum) {
	  this.ownerDocument = parent.ownerDocument;
	  this.namespaceURI = parent.namespaceURI;
	  this._next = null;
	  this._parent = parent;
	  this.__data__ = datum;
	}

	EnterNode.prototype = {
	  constructor: EnterNode,
	  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
	  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
	  querySelector: function(selector) { return this._parent.querySelector(selector); },
	  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
	};

	function constant(x) {
	  return function() {
	    return x;
	  };
	}

	var keyPrefix = "$"; // Protect against keys like “__proto__”.

	function bindIndex(parent, group, enter, update, exit, data) {
	  var i = 0,
	      node,
	      groupLength = group.length,
	      dataLength = data.length;

	  // Put any non-null nodes that fit into update.
	  // Put any null nodes into enter.
	  // Put any remaining data into enter.
	  for (; i < dataLength; ++i) {
	    if (node = group[i]) {
	      node.__data__ = data[i];
	      update[i] = node;
	    } else {
	      enter[i] = new EnterNode(parent, data[i]);
	    }
	  }

	  // Put any non-null nodes that don’t fit into exit.
	  for (; i < groupLength; ++i) {
	    if (node = group[i]) {
	      exit[i] = node;
	    }
	  }
	}

	function bindKey(parent, group, enter, update, exit, data, key) {
	  var i,
	      node,
	      nodeByKeyValue = {},
	      groupLength = group.length,
	      dataLength = data.length,
	      keyValues = new Array(groupLength),
	      keyValue;

	  // Compute the key for each node.
	  // If multiple nodes have the same key, the duplicates are added to exit.
	  for (i = 0; i < groupLength; ++i) {
	    if (node = group[i]) {
	      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
	      if (keyValue in nodeByKeyValue) {
	        exit[i] = node;
	      } else {
	        nodeByKeyValue[keyValue] = node;
	      }
	    }
	  }

	  // Compute the key for each datum.
	  // If there a node associated with this key, join and add it to update.
	  // If there is not (or the key is a duplicate), add it to enter.
	  for (i = 0; i < dataLength; ++i) {
	    keyValue = keyPrefix + key.call(parent, data[i], i, data);
	    if (node = nodeByKeyValue[keyValue]) {
	      update[i] = node;
	      node.__data__ = data[i];
	      nodeByKeyValue[keyValue] = null;
	    } else {
	      enter[i] = new EnterNode(parent, data[i]);
	    }
	  }

	  // Add any remaining nodes that were not bound to data to exit.
	  for (i = 0; i < groupLength; ++i) {
	    if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
	      exit[i] = node;
	    }
	  }
	}

	function selection_data(value, key) {
	  if (!value) {
	    data = new Array(this.size()), j = -1;
	    this.each(function(d) { data[++j] = d; });
	    return data;
	  }

	  var bind = key ? bindKey : bindIndex,
	      parents = this._parents,
	      groups = this._groups;

	  if (typeof value !== "function") value = constant(value);

	  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
	    var parent = parents[j],
	        group = groups[j],
	        groupLength = group.length,
	        data = value.call(parent, parent && parent.__data__, j, parents),
	        dataLength = data.length,
	        enterGroup = enter[j] = new Array(dataLength),
	        updateGroup = update[j] = new Array(dataLength),
	        exitGroup = exit[j] = new Array(groupLength);

	    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

	    // Now connect the enter nodes to their following update node, such that
	    // appendChild can insert the materialized enter node before this node,
	    // rather than at the end of the parent node.
	    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
	      if (previous = enterGroup[i0]) {
	        if (i0 >= i1) i1 = i0 + 1;
	        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
	        previous._next = next || null;
	      }
	    }
	  }

	  update = new Selection(update, parents);
	  update._enter = enter;
	  update._exit = exit;
	  return update;
	}

	function selection_exit() {
	  return new Selection(this._exit || this._groups.map(sparse), this._parents);
	}

	function selection_join(onenter, onupdate, onexit) {
	  var enter = this.enter(), update = this, exit = this.exit();
	  enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
	  if (onupdate != null) update = onupdate(update);
	  if (onexit == null) exit.remove(); else onexit(exit);
	  return enter && update ? enter.merge(update).order() : update;
	}

	function selection_merge(selection) {

	  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group0[i] || group1[i]) {
	        merge[i] = node;
	      }
	    }
	  }

	  for (; j < m0; ++j) {
	    merges[j] = groups0[j];
	  }

	  return new Selection(merges, this._parents);
	}

	function selection_order() {

	  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
	    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
	      if (node = group[i]) {
	        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
	        next = node;
	      }
	    }
	  }

	  return this;
	}

	function selection_sort(compare) {
	  if (!compare) compare = ascending$1;

	  function compareNode(a, b) {
	    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
	  }

	  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        sortgroup[i] = node;
	      }
	    }
	    sortgroup.sort(compareNode);
	  }

	  return new Selection(sortgroups, this._parents).order();
	}

	function ascending$1(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function selection_call() {
	  var callback = arguments[0];
	  arguments[0] = this;
	  callback.apply(null, arguments);
	  return this;
	}

	function selection_nodes() {
	  var nodes = new Array(this.size()), i = -1;
	  this.each(function() { nodes[++i] = this; });
	  return nodes;
	}

	function selection_node() {

	  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
	      var node = group[i];
	      if (node) return node;
	    }
	  }

	  return null;
	}

	function selection_size() {
	  var size = 0;
	  this.each(function() { ++size; });
	  return size;
	}

	function selection_empty() {
	  return !this.node();
	}

	function selection_each(callback) {

	  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
	      if (node = group[i]) callback.call(node, node.__data__, i, group);
	    }
	  }

	  return this;
	}

	function attrRemove(name) {
	  return function() {
	    this.removeAttribute(name);
	  };
	}

	function attrRemoveNS(fullname) {
	  return function() {
	    this.removeAttributeNS(fullname.space, fullname.local);
	  };
	}

	function attrConstant(name, value) {
	  return function() {
	    this.setAttribute(name, value);
	  };
	}

	function attrConstantNS(fullname, value) {
	  return function() {
	    this.setAttributeNS(fullname.space, fullname.local, value);
	  };
	}

	function attrFunction(name, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.removeAttribute(name);
	    else this.setAttribute(name, v);
	  };
	}

	function attrFunctionNS(fullname, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
	    else this.setAttributeNS(fullname.space, fullname.local, v);
	  };
	}

	function selection_attr(name, value) {
	  var fullname = namespace(name);

	  if (arguments.length < 2) {
	    var node = this.node();
	    return fullname.local
	        ? node.getAttributeNS(fullname.space, fullname.local)
	        : node.getAttribute(fullname);
	  }

	  return this.each((value == null
	      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
	      ? (fullname.local ? attrFunctionNS : attrFunction)
	      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
	}

	function defaultView(node) {
	  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
	      || (node.document && node) // node is a Window
	      || node.defaultView; // node is a Document
	}

	function styleRemove(name) {
	  return function() {
	    this.style.removeProperty(name);
	  };
	}

	function styleConstant(name, value, priority) {
	  return function() {
	    this.style.setProperty(name, value, priority);
	  };
	}

	function styleFunction(name, value, priority) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.style.removeProperty(name);
	    else this.style.setProperty(name, v, priority);
	  };
	}

	function selection_style(name, value, priority) {
	  return arguments.length > 1
	      ? this.each((value == null
	            ? styleRemove : typeof value === "function"
	            ? styleFunction
	            : styleConstant)(name, value, priority == null ? "" : priority))
	      : styleValue(this.node(), name);
	}

	function styleValue(node, name) {
	  return node.style.getPropertyValue(name)
	      || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
	}

	function propertyRemove(name) {
	  return function() {
	    delete this[name];
	  };
	}

	function propertyConstant(name, value) {
	  return function() {
	    this[name] = value;
	  };
	}

	function propertyFunction(name, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) delete this[name];
	    else this[name] = v;
	  };
	}

	function selection_property(name, value) {
	  return arguments.length > 1
	      ? this.each((value == null
	          ? propertyRemove : typeof value === "function"
	          ? propertyFunction
	          : propertyConstant)(name, value))
	      : this.node()[name];
	}

	function classArray(string) {
	  return string.trim().split(/^|\s+/);
	}

	function classList(node) {
	  return node.classList || new ClassList(node);
	}

	function ClassList(node) {
	  this._node = node;
	  this._names = classArray(node.getAttribute("class") || "");
	}

	ClassList.prototype = {
	  add: function(name) {
	    var i = this._names.indexOf(name);
	    if (i < 0) {
	      this._names.push(name);
	      this._node.setAttribute("class", this._names.join(" "));
	    }
	  },
	  remove: function(name) {
	    var i = this._names.indexOf(name);
	    if (i >= 0) {
	      this._names.splice(i, 1);
	      this._node.setAttribute("class", this._names.join(" "));
	    }
	  },
	  contains: function(name) {
	    return this._names.indexOf(name) >= 0;
	  }
	};

	function classedAdd(node, names) {
	  var list = classList(node), i = -1, n = names.length;
	  while (++i < n) list.add(names[i]);
	}

	function classedRemove(node, names) {
	  var list = classList(node), i = -1, n = names.length;
	  while (++i < n) list.remove(names[i]);
	}

	function classedTrue(names) {
	  return function() {
	    classedAdd(this, names);
	  };
	}

	function classedFalse(names) {
	  return function() {
	    classedRemove(this, names);
	  };
	}

	function classedFunction(names, value) {
	  return function() {
	    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
	  };
	}

	function selection_classed(name, value) {
	  var names = classArray(name + "");

	  if (arguments.length < 2) {
	    var list = classList(this.node()), i = -1, n = names.length;
	    while (++i < n) if (!list.contains(names[i])) return false;
	    return true;
	  }

	  return this.each((typeof value === "function"
	      ? classedFunction : value
	      ? classedTrue
	      : classedFalse)(names, value));
	}

	function textRemove() {
	  this.textContent = "";
	}

	function textConstant(value) {
	  return function() {
	    this.textContent = value;
	  };
	}

	function textFunction(value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    this.textContent = v == null ? "" : v;
	  };
	}

	function selection_text(value) {
	  return arguments.length
	      ? this.each(value == null
	          ? textRemove : (typeof value === "function"
	          ? textFunction
	          : textConstant)(value))
	      : this.node().textContent;
	}

	function htmlRemove() {
	  this.innerHTML = "";
	}

	function htmlConstant(value) {
	  return function() {
	    this.innerHTML = value;
	  };
	}

	function htmlFunction(value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    this.innerHTML = v == null ? "" : v;
	  };
	}

	function selection_html(value) {
	  return arguments.length
	      ? this.each(value == null
	          ? htmlRemove : (typeof value === "function"
	          ? htmlFunction
	          : htmlConstant)(value))
	      : this.node().innerHTML;
	}

	function raise() {
	  if (this.nextSibling) this.parentNode.appendChild(this);
	}

	function selection_raise() {
	  return this.each(raise);
	}

	function lower() {
	  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
	}

	function selection_lower() {
	  return this.each(lower);
	}

	function selection_append(name) {
	  var create = typeof name === "function" ? name : creator(name);
	  return this.select(function() {
	    return this.appendChild(create.apply(this, arguments));
	  });
	}

	function constantNull() {
	  return null;
	}

	function selection_insert(name, before) {
	  var create = typeof name === "function" ? name : creator(name),
	      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
	  return this.select(function() {
	    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
	  });
	}

	function remove() {
	  var parent = this.parentNode;
	  if (parent) parent.removeChild(this);
	}

	function selection_remove() {
	  return this.each(remove);
	}

	function selection_cloneShallow() {
	  return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
	}

	function selection_cloneDeep() {
	  return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
	}

	function selection_clone(deep) {
	  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
	}

	function selection_datum(value) {
	  return arguments.length
	      ? this.property("__data__", value)
	      : this.node().__data__;
	}

	var filterEvents = {};

	var event = null;

	if (typeof document !== "undefined") {
	  var element = document.documentElement;
	  if (!("onmouseenter" in element)) {
	    filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
	  }
	}

	function filterContextListener(listener, index, group) {
	  listener = contextListener(listener, index, group);
	  return function(event) {
	    var related = event.relatedTarget;
	    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
	      listener.call(this, event);
	    }
	  };
	}

	function contextListener(listener, index, group) {
	  return function(event1) {
	    var event0 = event; // Events can be reentrant (e.g., focus).
	    event = event1;
	    try {
	      listener.call(this, this.__data__, index, group);
	    } finally {
	      event = event0;
	    }
	  };
	}

	function parseTypenames$1(typenames) {
	  return typenames.trim().split(/^|\s+/).map(function(t) {
	    var name = "", i = t.indexOf(".");
	    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	    return {type: t, name: name};
	  });
	}

	function onRemove(typename) {
	  return function() {
	    var on = this.__on;
	    if (!on) return;
	    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
	      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
	        this.removeEventListener(o.type, o.listener, o.capture);
	      } else {
	        on[++i] = o;
	      }
	    }
	    if (++i) on.length = i;
	    else delete this.__on;
	  };
	}

	function onAdd(typename, value, capture) {
	  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
	  return function(d, i, group) {
	    var on = this.__on, o, listener = wrap(value, i, group);
	    if (on) for (var j = 0, m = on.length; j < m; ++j) {
	      if ((o = on[j]).type === typename.type && o.name === typename.name) {
	        this.removeEventListener(o.type, o.listener, o.capture);
	        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
	        o.value = value;
	        return;
	      }
	    }
	    this.addEventListener(typename.type, listener, capture);
	    o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
	    if (!on) this.__on = [o];
	    else on.push(o);
	  };
	}

	function selection_on(typename, value, capture) {
	  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

	  if (arguments.length < 2) {
	    var on = this.node().__on;
	    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
	      for (i = 0, o = on[j]; i < n; ++i) {
	        if ((t = typenames[i]).type === o.type && t.name === o.name) {
	          return o.value;
	        }
	      }
	    }
	    return;
	  }

	  on = value ? onAdd : onRemove;
	  if (capture == null) capture = false;
	  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
	  return this;
	}

	function dispatchEvent(node, type, params) {
	  var window = defaultView(node),
	      event = window.CustomEvent;

	  if (typeof event === "function") {
	    event = new event(type, params);
	  } else {
	    event = window.document.createEvent("Event");
	    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
	    else event.initEvent(type, false, false);
	  }

	  node.dispatchEvent(event);
	}

	function dispatchConstant(type, params) {
	  return function() {
	    return dispatchEvent(this, type, params);
	  };
	}

	function dispatchFunction(type, params) {
	  return function() {
	    return dispatchEvent(this, type, params.apply(this, arguments));
	  };
	}

	function selection_dispatch(type, params) {
	  return this.each((typeof params === "function"
	      ? dispatchFunction
	      : dispatchConstant)(type, params));
	}

	var root = [null];

	function Selection(groups, parents) {
	  this._groups = groups;
	  this._parents = parents;
	}

	function selection() {
	  return new Selection([[document.documentElement]], root);
	}

	Selection.prototype = selection.prototype = {
	  constructor: Selection,
	  select: selection_select,
	  selectAll: selection_selectAll,
	  filter: selection_filter,
	  data: selection_data,
	  enter: selection_enter,
	  exit: selection_exit,
	  join: selection_join,
	  merge: selection_merge,
	  order: selection_order,
	  sort: selection_sort,
	  call: selection_call,
	  nodes: selection_nodes,
	  node: selection_node,
	  size: selection_size,
	  empty: selection_empty,
	  each: selection_each,
	  attr: selection_attr,
	  style: selection_style,
	  property: selection_property,
	  classed: selection_classed,
	  text: selection_text,
	  html: selection_html,
	  raise: selection_raise,
	  lower: selection_lower,
	  append: selection_append,
	  insert: selection_insert,
	  remove: selection_remove,
	  clone: selection_clone,
	  datum: selection_datum,
	  on: selection_on,
	  dispatch: selection_dispatch
	};

	function select(selector) {
	  return typeof selector === "string"
	      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
	      : new Selection([[selector]], root);
	}

	function sourceEvent() {
	  var current = event, source;
	  while (source = current.sourceEvent) current = source;
	  return current;
	}

	function point(node, event) {
	  var svg = node.ownerSVGElement || node;

	  if (svg.createSVGPoint) {
	    var point = svg.createSVGPoint();
	    point.x = event.clientX, point.y = event.clientY;
	    point = point.matrixTransform(node.getScreenCTM().inverse());
	    return [point.x, point.y];
	  }

	  var rect = node.getBoundingClientRect();
	  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
	}

	function mouse(node) {
	  var event = sourceEvent();
	  if (event.changedTouches) event = event.changedTouches[0];
	  return point(node, event);
	}

	function define(constructor, factory, prototype) {
	  constructor.prototype = factory.prototype = prototype;
	  prototype.constructor = constructor;
	}

	function extend(parent, definition) {
	  var prototype = Object.create(parent.prototype);
	  for (var key in definition) prototype[key] = definition[key];
	  return prototype;
	}

	function Color() {}

	var darker = 0.7;
	var brighter = 1 / darker;

	var reI = "\\s*([+-]?\\d+)\\s*",
	    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
	    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
	    reHex3 = /^#([0-9a-f]{3})$/,
	    reHex6 = /^#([0-9a-f]{6})$/,
	    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
	    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
	    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
	    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
	    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
	    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

	var named = {
	  aliceblue: 0xf0f8ff,
	  antiquewhite: 0xfaebd7,
	  aqua: 0x00ffff,
	  aquamarine: 0x7fffd4,
	  azure: 0xf0ffff,
	  beige: 0xf5f5dc,
	  bisque: 0xffe4c4,
	  black: 0x000000,
	  blanchedalmond: 0xffebcd,
	  blue: 0x0000ff,
	  blueviolet: 0x8a2be2,
	  brown: 0xa52a2a,
	  burlywood: 0xdeb887,
	  cadetblue: 0x5f9ea0,
	  chartreuse: 0x7fff00,
	  chocolate: 0xd2691e,
	  coral: 0xff7f50,
	  cornflowerblue: 0x6495ed,
	  cornsilk: 0xfff8dc,
	  crimson: 0xdc143c,
	  cyan: 0x00ffff,
	  darkblue: 0x00008b,
	  darkcyan: 0x008b8b,
	  darkgoldenrod: 0xb8860b,
	  darkgray: 0xa9a9a9,
	  darkgreen: 0x006400,
	  darkgrey: 0xa9a9a9,
	  darkkhaki: 0xbdb76b,
	  darkmagenta: 0x8b008b,
	  darkolivegreen: 0x556b2f,
	  darkorange: 0xff8c00,
	  darkorchid: 0x9932cc,
	  darkred: 0x8b0000,
	  darksalmon: 0xe9967a,
	  darkseagreen: 0x8fbc8f,
	  darkslateblue: 0x483d8b,
	  darkslategray: 0x2f4f4f,
	  darkslategrey: 0x2f4f4f,
	  darkturquoise: 0x00ced1,
	  darkviolet: 0x9400d3,
	  deeppink: 0xff1493,
	  deepskyblue: 0x00bfff,
	  dimgray: 0x696969,
	  dimgrey: 0x696969,
	  dodgerblue: 0x1e90ff,
	  firebrick: 0xb22222,
	  floralwhite: 0xfffaf0,
	  forestgreen: 0x228b22,
	  fuchsia: 0xff00ff,
	  gainsboro: 0xdcdcdc,
	  ghostwhite: 0xf8f8ff,
	  gold: 0xffd700,
	  goldenrod: 0xdaa520,
	  gray: 0x808080,
	  green: 0x008000,
	  greenyellow: 0xadff2f,
	  grey: 0x808080,
	  honeydew: 0xf0fff0,
	  hotpink: 0xff69b4,
	  indianred: 0xcd5c5c,
	  indigo: 0x4b0082,
	  ivory: 0xfffff0,
	  khaki: 0xf0e68c,
	  lavender: 0xe6e6fa,
	  lavenderblush: 0xfff0f5,
	  lawngreen: 0x7cfc00,
	  lemonchiffon: 0xfffacd,
	  lightblue: 0xadd8e6,
	  lightcoral: 0xf08080,
	  lightcyan: 0xe0ffff,
	  lightgoldenrodyellow: 0xfafad2,
	  lightgray: 0xd3d3d3,
	  lightgreen: 0x90ee90,
	  lightgrey: 0xd3d3d3,
	  lightpink: 0xffb6c1,
	  lightsalmon: 0xffa07a,
	  lightseagreen: 0x20b2aa,
	  lightskyblue: 0x87cefa,
	  lightslategray: 0x778899,
	  lightslategrey: 0x778899,
	  lightsteelblue: 0xb0c4de,
	  lightyellow: 0xffffe0,
	  lime: 0x00ff00,
	  limegreen: 0x32cd32,
	  linen: 0xfaf0e6,
	  magenta: 0xff00ff,
	  maroon: 0x800000,
	  mediumaquamarine: 0x66cdaa,
	  mediumblue: 0x0000cd,
	  mediumorchid: 0xba55d3,
	  mediumpurple: 0x9370db,
	  mediumseagreen: 0x3cb371,
	  mediumslateblue: 0x7b68ee,
	  mediumspringgreen: 0x00fa9a,
	  mediumturquoise: 0x48d1cc,
	  mediumvioletred: 0xc71585,
	  midnightblue: 0x191970,
	  mintcream: 0xf5fffa,
	  mistyrose: 0xffe4e1,
	  moccasin: 0xffe4b5,
	  navajowhite: 0xffdead,
	  navy: 0x000080,
	  oldlace: 0xfdf5e6,
	  olive: 0x808000,
	  olivedrab: 0x6b8e23,
	  orange: 0xffa500,
	  orangered: 0xff4500,
	  orchid: 0xda70d6,
	  palegoldenrod: 0xeee8aa,
	  palegreen: 0x98fb98,
	  paleturquoise: 0xafeeee,
	  palevioletred: 0xdb7093,
	  papayawhip: 0xffefd5,
	  peachpuff: 0xffdab9,
	  peru: 0xcd853f,
	  pink: 0xffc0cb,
	  plum: 0xdda0dd,
	  powderblue: 0xb0e0e6,
	  purple: 0x800080,
	  rebeccapurple: 0x663399,
	  red: 0xff0000,
	  rosybrown: 0xbc8f8f,
	  royalblue: 0x4169e1,
	  saddlebrown: 0x8b4513,
	  salmon: 0xfa8072,
	  sandybrown: 0xf4a460,
	  seagreen: 0x2e8b57,
	  seashell: 0xfff5ee,
	  sienna: 0xa0522d,
	  silver: 0xc0c0c0,
	  skyblue: 0x87ceeb,
	  slateblue: 0x6a5acd,
	  slategray: 0x708090,
	  slategrey: 0x708090,
	  snow: 0xfffafa,
	  springgreen: 0x00ff7f,
	  steelblue: 0x4682b4,
	  tan: 0xd2b48c,
	  teal: 0x008080,
	  thistle: 0xd8bfd8,
	  tomato: 0xff6347,
	  turquoise: 0x40e0d0,
	  violet: 0xee82ee,
	  wheat: 0xf5deb3,
	  white: 0xffffff,
	  whitesmoke: 0xf5f5f5,
	  yellow: 0xffff00,
	  yellowgreen: 0x9acd32
	};

	define(Color, color, {
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  hex: function() {
	    return this.rgb().hex();
	  },
	  toString: function() {
	    return this.rgb() + "";
	  }
	});

	function color(format) {
	  var m;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
	      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format])
	      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	      : null;
	}

	function rgbn(n) {
	  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	}

	function rgba(r, g, b, a) {
	  if (a <= 0) r = g = b = NaN;
	  return new Rgb(r, g, b, a);
	}

	function rgbConvert(o) {
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Rgb;
	  o = o.rgb();
	  return new Rgb(o.r, o.g, o.b, o.opacity);
	}

	function rgb(r, g, b, opacity) {
	  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	}

	function Rgb(r, g, b, opacity) {
	  this.r = +r;
	  this.g = +g;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Rgb, rgb, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  rgb: function() {
	    return this;
	  },
	  displayable: function() {
	    return (0 <= this.r && this.r <= 255)
	        && (0 <= this.g && this.g <= 255)
	        && (0 <= this.b && this.b <= 255)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  hex: function() {
	    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
	  },
	  toString: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "rgb(" : "rgba(")
	        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	function hex(value) {
	  value = Math.max(0, Math.min(255, Math.round(value) || 0));
	  return (value < 16 ? "0" : "") + value.toString(16);
	}

	function hsla(h, s, l, a) {
	  if (a <= 0) h = s = l = NaN;
	  else if (l <= 0 || l >= 1) h = s = NaN;
	  else if (s <= 0) h = NaN;
	  return new Hsl(h, s, l, a);
	}

	function hslConvert(o) {
	  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Hsl;
	  if (o instanceof Hsl) return o;
	  o = o.rgb();
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      min = Math.min(r, g, b),
	      max = Math.max(r, g, b),
	      h = NaN,
	      s = max - min,
	      l = (max + min) / 2;
	  if (s) {
	    if (r === max) h = (g - b) / s + (g < b) * 6;
	    else if (g === max) h = (b - r) / s + 2;
	    else h = (r - g) / s + 4;
	    s /= l < 0.5 ? max + min : 2 - max - min;
	    h *= 60;
	  } else {
	    s = l > 0 && l < 1 ? 0 : h;
	  }
	  return new Hsl(h, s, l, o.opacity);
	}

	function hsl(h, s, l, opacity) {
	  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	}

	function Hsl(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hsl, hsl, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = this.h % 360 + (this.h < 0) * 360,
	        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	        l = this.l,
	        m2 = l + (l < 0.5 ? l : 1 - l) * s,
	        m1 = 2 * l - m2;
	    return new Rgb(
	      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	      hsl2rgb(h, m1, m2),
	      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	      this.opacity
	    );
	  },
	  displayable: function() {
	    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	        && (0 <= this.l && this.l <= 1)
	        && (0 <= this.opacity && this.opacity <= 1);
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

	var deg2rad = Math.PI / 180;
	var rad2deg = 180 / Math.PI;

	// https://beta.observablehq.com/@mbostock/lab-and-rgb
	var K = 18,
	    Xn = 0.96422,
	    Yn = 1,
	    Zn = 0.82521,
	    t0 = 4 / 29,
	    t1 = 6 / 29,
	    t2 = 3 * t1 * t1,
	    t3 = t1 * t1 * t1;

	function labConvert(o) {
	  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
	  if (o instanceof Hcl) {
	    if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
	    var h = o.h * deg2rad;
	    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
	  }
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = rgb2lrgb(o.r),
	      g = rgb2lrgb(o.g),
	      b = rgb2lrgb(o.b),
	      y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
	  if (r === g && g === b) x = z = y; else {
	    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
	    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
	  }
	  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
	}

	function lab(l, a, b, opacity) {
	  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
	}

	function Lab(l, a, b, opacity) {
	  this.l = +l;
	  this.a = +a;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Lab, lab, extend(Color, {
	  brighter: function(k) {
	    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  darker: function(k) {
	    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  rgb: function() {
	    var y = (this.l + 16) / 116,
	        x = isNaN(this.a) ? y : y + this.a / 500,
	        z = isNaN(this.b) ? y : y - this.b / 200;
	    x = Xn * lab2xyz(x);
	    y = Yn * lab2xyz(y);
	    z = Zn * lab2xyz(z);
	    return new Rgb(
	      lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
	      lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
	      lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
	      this.opacity
	    );
	  }
	}));

	function xyz2lab(t) {
	  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
	}

	function lab2xyz(t) {
	  return t > t1 ? t * t * t : t2 * (t - t0);
	}

	function lrgb2rgb(x) {
	  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
	}

	function rgb2lrgb(x) {
	  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	function hclConvert(o) {
	  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
	  if (!(o instanceof Lab)) o = labConvert(o);
	  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0, o.l, o.opacity);
	  var h = Math.atan2(o.b, o.a) * rad2deg;
	  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
	}

	function hcl(h, c, l, opacity) {
	  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	}

	function Hcl(h, c, l, opacity) {
	  this.h = +h;
	  this.c = +c;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hcl, hcl, extend(Color, {
	  brighter: function(k) {
	    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
	  },
	  darker: function(k) {
	    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
	  },
	  rgb: function() {
	    return labConvert(this).rgb();
	  }
	}));

	var A = -0.14861,
	    B = +1.78277,
	    C = -0.29227,
	    D = -0.90649,
	    E = +1.97294,
	    ED = E * D,
	    EB = E * B,
	    BC_DA = B * C - D * A;

	function cubehelixConvert(o) {
	  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
	      bl = b - l,
	      k = (E * (g - l) - C * bl) / D,
	      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
	      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
	  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
	}

	function cubehelix(h, s, l, opacity) {
	  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
	}

	function Cubehelix(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Cubehelix, cubehelix, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
	        l = +this.l,
	        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
	        cosh = Math.cos(h),
	        sinh = Math.sin(h);
	    return new Rgb(
	      255 * (l + a * (A * cosh + B * sinh)),
	      255 * (l + a * (C * cosh + D * sinh)),
	      255 * (l + a * (E * cosh)),
	      this.opacity
	    );
	  }
	}));

	function basis(t1, v0, v1, v2, v3) {
	  var t2 = t1 * t1, t3 = t2 * t1;
	  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
	      + (4 - 6 * t2 + 3 * t3) * v1
	      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
	      + t3 * v3) / 6;
	}

	function basis$1(values) {
	  var n = values.length - 1;
	  return function(t) {
	    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
	        v1 = values[i],
	        v2 = values[i + 1],
	        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
	        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
	    return basis((t - i / n) * n, v0, v1, v2, v3);
	  };
	}

	function constant$1(x) {
	  return function() {
	    return x;
	  };
	}

	function linear(a, d) {
	  return function(t) {
	    return a + t * d;
	  };
	}

	function exponential(a, b, y) {
	  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	    return Math.pow(a + t * b, y);
	  };
	}

	function hue(a, b) {
	  var d = b - a;
	  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
	}

	function gamma(y) {
	  return (y = +y) === 1 ? nogamma : function(a, b) {
	    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
	  };
	}

	function nogamma(a, b) {
	  var d = b - a;
	  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
	}

	var interpolateRgb = (function rgbGamma(y) {
	  var color = gamma(y);

	  function rgb$1(start, end) {
	    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
	        g = color(start.g, end.g),
	        b = color(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb$1.gamma = rgbGamma;

	  return rgb$1;
	})(1);

	function rgbSpline(spline) {
	  return function(colors) {
	    var n = colors.length,
	        r = new Array(n),
	        g = new Array(n),
	        b = new Array(n),
	        i, color;
	    for (i = 0; i < n; ++i) {
	      color = rgb(colors[i]);
	      r[i] = color.r || 0;
	      g[i] = color.g || 0;
	      b[i] = color.b || 0;
	    }
	    r = spline(r);
	    g = spline(g);
	    b = spline(b);
	    color.opacity = 1;
	    return function(t) {
	      color.r = r(t);
	      color.g = g(t);
	      color.b = b(t);
	      return color + "";
	    };
	  };
	}

	var rgbBasis = rgbSpline(basis$1);

	function array(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(na),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	}

	function date(a, b) {
	  var d = new Date;
	  return a = +a, b -= a, function(t) {
	    return d.setTime(a + b * t), d;
	  };
	}

	function interpolateNumber(a, b) {
	  return a = +a, b -= a, function(t) {
	    return a + b * t;
	  };
	}

	function object(a, b) {
	  var i = {},
	      c = {},
	      k;

	  if (a === null || typeof a !== "object") a = {};
	  if (b === null || typeof b !== "object") b = {};

	  for (k in b) {
	    if (k in a) {
	      i[k] = interpolateValue(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function(t) {
	    for (k in i) c[k] = i[k](t);
	    return c;
	  };
	}

	var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
	    reB = new RegExp(reA.source, "g");

	function zero(b) {
	  return function() {
	    return b;
	  };
	}

	function one(b) {
	  return function(t) {
	    return b(t) + "";
	  };
	}

	function interpolateString(a, b) {
	  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	      am, // current match in a
	      bm, // current match in b
	      bs, // string preceding current number in b, if any
	      i = -1, // index in s
	      s = [], // string constants and placeholders
	      q = []; // number interpolators

	  // Coerce inputs to strings.
	  a = a + "", b = b + "";

	  // Interpolate pairs of numbers in a & b.
	  while ((am = reA.exec(a))
	      && (bm = reB.exec(b))) {
	    if ((bs = bm.index) > bi) { // a string precedes the next number in b
	      bs = b.slice(bi, bs);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }
	    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	      if (s[i]) s[i] += bm; // coalesce with previous string
	      else s[++i] = bm;
	    } else { // interpolate non-matching numbers
	      s[++i] = null;
	      q.push({i: i, x: interpolateNumber(am, bm)});
	    }
	    bi = reB.lastIndex;
	  }

	  // Add remains of b.
	  if (bi < b.length) {
	    bs = b.slice(bi);
	    if (s[i]) s[i] += bs; // coalesce with previous string
	    else s[++i] = bs;
	  }

	  // Special optimization for only a single match.
	  // Otherwise, interpolate each of the numbers and rejoin the string.
	  return s.length < 2 ? (q[0]
	      ? one(q[0].x)
	      : zero(b))
	      : (b = q.length, function(t) {
	          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	          return s.join("");
	        });
	}

	function interpolateValue(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant$1(b)
	      : (t === "number" ? interpolateNumber
	      : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
	      : b instanceof color ? interpolateRgb
	      : b instanceof Date ? date
	      : Array.isArray(b) ? array
	      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
	      : interpolateNumber)(a, b);
	}

	function interpolateRound(a, b) {
	  return a = +a, b -= a, function(t) {
	    return Math.round(a + b * t);
	  };
	}

	var degrees = 180 / Math.PI;

	var identity$1 = {
	  translateX: 0,
	  translateY: 0,
	  rotate: 0,
	  skewX: 0,
	  scaleX: 1,
	  scaleY: 1
	};

	function decompose(a, b, c, d, e, f) {
	  var scaleX, scaleY, skewX;
	  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	  return {
	    translateX: e,
	    translateY: f,
	    rotate: Math.atan2(b, a) * degrees,
	    skewX: Math.atan(skewX) * degrees,
	    scaleX: scaleX,
	    scaleY: scaleY
	  };
	}

	var cssNode,
	    cssRoot,
	    cssView,
	    svgNode;

	function parseCss(value) {
	  if (value === "none") return identity$1;
	  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
	  cssNode.style.transform = value;
	  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
	  cssRoot.removeChild(cssNode);
	  value = value.slice(7, -1).split(",");
	  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
	}

	function parseSvg(value) {
	  if (value == null) return identity$1;
	  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
	  svgNode.setAttribute("transform", value);
	  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
	  value = value.matrix;
	  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
	}

	function interpolateTransform(parse, pxComma, pxParen, degParen) {

	  function pop(s) {
	    return s.length ? s.pop() + " " : "";
	  }

	  function translate(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push("translate(", null, pxComma, null, pxParen);
	      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
	    } else if (xb || yb) {
	      s.push("translate(" + xb + pxComma + yb + pxParen);
	    }
	  }

	  function rotate(a, b, s, q) {
	    if (a !== b) {
	      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
	      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "rotate(" + b + degParen);
	    }
	  }

	  function skewX(a, b, s, q) {
	    if (a !== b) {
	      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "skewX(" + b + degParen);
	    }
	  }

	  function scale(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
	      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
	    } else if (xb !== 1 || yb !== 1) {
	      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
	    }
	  }

	  return function(a, b) {
	    var s = [], // string constants and placeholders
	        q = []; // number interpolators
	    a = parse(a), b = parse(b);
	    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
	    rotate(a.rotate, b.rotate, s, q);
	    skewX(a.skewX, b.skewX, s, q);
	    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
	    a = b = null; // gc
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  };
	}

	var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
	var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

	var rho = Math.SQRT2;

	function cubehelix$1(hue) {
	  return (function cubehelixGamma(y) {
	    y = +y;

	    function cubehelix$1(start, end) {
	      var h = hue((start = cubehelix(start)).h, (end = cubehelix(end)).h),
	          s = nogamma(start.s, end.s),
	          l = nogamma(start.l, end.l),
	          opacity = nogamma(start.opacity, end.opacity);
	      return function(t) {
	        start.h = h(t);
	        start.s = s(t);
	        start.l = l(Math.pow(t, y));
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }

	    cubehelix$1.gamma = cubehelixGamma;

	    return cubehelix$1;
	  })(1);
	}

	cubehelix$1(hue);
	var cubehelixLong = cubehelix$1(nogamma);

	var frame = 0, // is an animation frame pending?
	    timeout = 0, // is a timeout pending?
	    interval = 0, // are any timers active?
	    pokeDelay = 1000, // how frequently we check for clock skew
	    taskHead,
	    taskTail,
	    clockLast = 0,
	    clockNow = 0,
	    clockSkew = 0,
	    clock = typeof performance === "object" && performance.now ? performance : Date,
	    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

	function now() {
	  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
	}

	function clearNow() {
	  clockNow = 0;
	}

	function Timer() {
	  this._call =
	  this._time =
	  this._next = null;
	}

	Timer.prototype = timer.prototype = {
	  constructor: Timer,
	  restart: function(callback, delay, time) {
	    if (typeof callback !== "function") throw new TypeError("callback is not a function");
	    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
	    if (!this._next && taskTail !== this) {
	      if (taskTail) taskTail._next = this;
	      else taskHead = this;
	      taskTail = this;
	    }
	    this._call = callback;
	    this._time = time;
	    sleep();
	  },
	  stop: function() {
	    if (this._call) {
	      this._call = null;
	      this._time = Infinity;
	      sleep();
	    }
	  }
	};

	function timer(callback, delay, time) {
	  var t = new Timer;
	  t.restart(callback, delay, time);
	  return t;
	}

	function timerFlush() {
	  now(); // Get the current time, if not already set.
	  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
	  var t = taskHead, e;
	  while (t) {
	    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
	    t = t._next;
	  }
	  --frame;
	}

	function wake() {
	  clockNow = (clockLast = clock.now()) + clockSkew;
	  frame = timeout = 0;
	  try {
	    timerFlush();
	  } finally {
	    frame = 0;
	    nap();
	    clockNow = 0;
	  }
	}

	function poke() {
	  var now = clock.now(), delay = now - clockLast;
	  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
	}

	function nap() {
	  var t0, t1 = taskHead, t2, time = Infinity;
	  while (t1) {
	    if (t1._call) {
	      if (time > t1._time) time = t1._time;
	      t0 = t1, t1 = t1._next;
	    } else {
	      t2 = t1._next, t1._next = null;
	      t1 = t0 ? t0._next = t2 : taskHead = t2;
	    }
	  }
	  taskTail = t0;
	  sleep(time);
	}

	function sleep(time) {
	  if (frame) return; // Soonest alarm already set, or will be.
	  if (timeout) timeout = clearTimeout(timeout);
	  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
	  if (delay > 24) {
	    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
	    if (interval) interval = clearInterval(interval);
	  } else {
	    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
	    frame = 1, setFrame(wake);
	  }
	}

	function timeout$1(callback, delay, time) {
	  var t = new Timer;
	  delay = delay == null ? 0 : +delay;
	  t.restart(function(elapsed) {
	    t.stop();
	    callback(elapsed + delay);
	  }, delay, time);
	  return t;
	}

	var emptyOn = dispatch("start", "end", "cancel", "interrupt");
	var emptyTween = [];

	var CREATED = 0;
	var SCHEDULED = 1;
	var STARTING = 2;
	var STARTED = 3;
	var RUNNING = 4;
	var ENDING = 5;
	var ENDED = 6;

	function schedule(node, name, id, index, group, timing) {
	  var schedules = node.__transition;
	  if (!schedules) node.__transition = {};
	  else if (id in schedules) return;
	  create(node, id, {
	    name: name,
	    index: index, // For context during callback.
	    group: group, // For context during callback.
	    on: emptyOn,
	    tween: emptyTween,
	    time: timing.time,
	    delay: timing.delay,
	    duration: timing.duration,
	    ease: timing.ease,
	    timer: null,
	    state: CREATED
	  });
	}

	function init(node, id) {
	  var schedule = get$1(node, id);
	  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
	  return schedule;
	}

	function set$1(node, id) {
	  var schedule = get$1(node, id);
	  if (schedule.state > STARTED) throw new Error("too late; already running");
	  return schedule;
	}

	function get$1(node, id) {
	  var schedule = node.__transition;
	  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
	  return schedule;
	}

	function create(node, id, self) {
	  var schedules = node.__transition,
	      tween;

	  // Initialize the self timer when the transition is created.
	  // Note the actual delay is not known until the first callback!
	  schedules[id] = self;
	  self.timer = timer(schedule, 0, self.time);

	  function schedule(elapsed) {
	    self.state = SCHEDULED;
	    self.timer.restart(start, self.delay, self.time);

	    // If the elapsed delay is less than our first sleep, start immediately.
	    if (self.delay <= elapsed) start(elapsed - self.delay);
	  }

	  function start(elapsed) {
	    var i, j, n, o;

	    // If the state is not SCHEDULED, then we previously errored on start.
	    if (self.state !== SCHEDULED) return stop();

	    for (i in schedules) {
	      o = schedules[i];
	      if (o.name !== self.name) continue;

	      // While this element already has a starting transition during this frame,
	      // defer starting an interrupting transition until that transition has a
	      // chance to tick (and possibly end); see d3/d3-transition#54!
	      if (o.state === STARTED) return timeout$1(start);

	      // Interrupt the active transition, if any.
	      if (o.state === RUNNING) {
	        o.state = ENDED;
	        o.timer.stop();
	        o.on.call("interrupt", node, node.__data__, o.index, o.group);
	        delete schedules[i];
	      }

	      // Cancel any pre-empted transitions.
	      else if (+i < id) {
	        o.state = ENDED;
	        o.timer.stop();
	        o.on.call("cancel", node, node.__data__, o.index, o.group);
	        delete schedules[i];
	      }
	    }

	    // Defer the first tick to end of the current frame; see d3/d3#1576.
	    // Note the transition may be canceled after start and before the first tick!
	    // Note this must be scheduled before the start event; see d3/d3-transition#16!
	    // Assuming this is successful, subsequent callbacks go straight to tick.
	    timeout$1(function() {
	      if (self.state === STARTED) {
	        self.state = RUNNING;
	        self.timer.restart(tick, self.delay, self.time);
	        tick(elapsed);
	      }
	    });

	    // Dispatch the start event.
	    // Note this must be done before the tween are initialized.
	    self.state = STARTING;
	    self.on.call("start", node, node.__data__, self.index, self.group);
	    if (self.state !== STARTING) return; // interrupted
	    self.state = STARTED;

	    // Initialize the tween, deleting null tween.
	    tween = new Array(n = self.tween.length);
	    for (i = 0, j = -1; i < n; ++i) {
	      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
	        tween[++j] = o;
	      }
	    }
	    tween.length = j + 1;
	  }

	  function tick(elapsed) {
	    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
	        i = -1,
	        n = tween.length;

	    while (++i < n) {
	      tween[i].call(node, t);
	    }

	    // Dispatch the end event.
	    if (self.state === ENDING) {
	      self.on.call("end", node, node.__data__, self.index, self.group);
	      stop();
	    }
	  }

	  function stop() {
	    self.state = ENDED;
	    self.timer.stop();
	    delete schedules[id];
	    for (var i in schedules) return; // eslint-disable-line no-unused-vars
	    delete node.__transition;
	  }
	}

	function interrupt(node, name) {
	  var schedules = node.__transition,
	      schedule,
	      active,
	      empty = true,
	      i;

	  if (!schedules) return;

	  name = name == null ? null : name + "";

	  for (i in schedules) {
	    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
	    active = schedule.state > STARTING && schedule.state < ENDING;
	    schedule.state = ENDED;
	    schedule.timer.stop();
	    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
	    delete schedules[i];
	  }

	  if (empty) delete node.__transition;
	}

	function selection_interrupt(name) {
	  return this.each(function() {
	    interrupt(this, name);
	  });
	}

	function tweenRemove(id, name) {
	  var tween0, tween1;
	  return function() {
	    var schedule = set$1(this, id),
	        tween = schedule.tween;

	    // If this node shared tween with the previous node,
	    // just assign the updated shared tween and we’re done!
	    // Otherwise, copy-on-write.
	    if (tween !== tween0) {
	      tween1 = tween0 = tween;
	      for (var i = 0, n = tween1.length; i < n; ++i) {
	        if (tween1[i].name === name) {
	          tween1 = tween1.slice();
	          tween1.splice(i, 1);
	          break;
	        }
	      }
	    }

	    schedule.tween = tween1;
	  };
	}

	function tweenFunction(id, name, value) {
	  var tween0, tween1;
	  if (typeof value !== "function") throw new Error;
	  return function() {
	    var schedule = set$1(this, id),
	        tween = schedule.tween;

	    // If this node shared tween with the previous node,
	    // just assign the updated shared tween and we’re done!
	    // Otherwise, copy-on-write.
	    if (tween !== tween0) {
	      tween1 = (tween0 = tween).slice();
	      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
	        if (tween1[i].name === name) {
	          tween1[i] = t;
	          break;
	        }
	      }
	      if (i === n) tween1.push(t);
	    }

	    schedule.tween = tween1;
	  };
	}

	function transition_tween(name, value) {
	  var id = this._id;

	  name += "";

	  if (arguments.length < 2) {
	    var tween = get$1(this.node(), id).tween;
	    for (var i = 0, n = tween.length, t; i < n; ++i) {
	      if ((t = tween[i]).name === name) {
	        return t.value;
	      }
	    }
	    return null;
	  }

	  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
	}

	function tweenValue(transition, name, value) {
	  var id = transition._id;

	  transition.each(function() {
	    var schedule = set$1(this, id);
	    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
	  });

	  return function(node) {
	    return get$1(node, id).value[name];
	  };
	}

	function interpolate(a, b) {
	  var c;
	  return (typeof b === "number" ? interpolateNumber
	      : b instanceof color ? interpolateRgb
	      : (c = color(b)) ? (b = c, interpolateRgb)
	      : interpolateString)(a, b);
	}

	function attrRemove$1(name) {
	  return function() {
	    this.removeAttribute(name);
	  };
	}

	function attrRemoveNS$1(fullname) {
	  return function() {
	    this.removeAttributeNS(fullname.space, fullname.local);
	  };
	}

	function attrConstant$1(name, interpolate, value1) {
	  var string00,
	      string1 = value1 + "",
	      interpolate0;
	  return function() {
	    var string0 = this.getAttribute(name);
	    return string0 === string1 ? null
	        : string0 === string00 ? interpolate0
	        : interpolate0 = interpolate(string00 = string0, value1);
	  };
	}

	function attrConstantNS$1(fullname, interpolate, value1) {
	  var string00,
	      string1 = value1 + "",
	      interpolate0;
	  return function() {
	    var string0 = this.getAttributeNS(fullname.space, fullname.local);
	    return string0 === string1 ? null
	        : string0 === string00 ? interpolate0
	        : interpolate0 = interpolate(string00 = string0, value1);
	  };
	}

	function attrFunction$1(name, interpolate, value) {
	  var string00,
	      string10,
	      interpolate0;
	  return function() {
	    var string0, value1 = value(this), string1;
	    if (value1 == null) return void this.removeAttribute(name);
	    string0 = this.getAttribute(name);
	    string1 = value1 + "";
	    return string0 === string1 ? null
	        : string0 === string00 && string1 === string10 ? interpolate0
	        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	  };
	}

	function attrFunctionNS$1(fullname, interpolate, value) {
	  var string00,
	      string10,
	      interpolate0;
	  return function() {
	    var string0, value1 = value(this), string1;
	    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
	    string0 = this.getAttributeNS(fullname.space, fullname.local);
	    string1 = value1 + "";
	    return string0 === string1 ? null
	        : string0 === string00 && string1 === string10 ? interpolate0
	        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	  };
	}

	function transition_attr(name, value) {
	  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
	  return this.attrTween(name, typeof value === "function"
	      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
	      : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
	      : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
	}

	function attrInterpolate(name, i) {
	  return function(t) {
	    this.setAttribute(name, i(t));
	  };
	}

	function attrInterpolateNS(fullname, i) {
	  return function(t) {
	    this.setAttributeNS(fullname.space, fullname.local, i(t));
	  };
	}

	function attrTweenNS(fullname, value) {
	  var t0, i0;
	  function tween() {
	    var i = value.apply(this, arguments);
	    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
	    return t0;
	  }
	  tween._value = value;
	  return tween;
	}

	function attrTween(name, value) {
	  var t0, i0;
	  function tween() {
	    var i = value.apply(this, arguments);
	    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
	    return t0;
	  }
	  tween._value = value;
	  return tween;
	}

	function transition_attrTween(name, value) {
	  var key = "attr." + name;
	  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	  if (value == null) return this.tween(key, null);
	  if (typeof value !== "function") throw new Error;
	  var fullname = namespace(name);
	  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
	}

	function delayFunction(id, value) {
	  return function() {
	    init(this, id).delay = +value.apply(this, arguments);
	  };
	}

	function delayConstant(id, value) {
	  return value = +value, function() {
	    init(this, id).delay = value;
	  };
	}

	function transition_delay(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each((typeof value === "function"
	          ? delayFunction
	          : delayConstant)(id, value))
	      : get$1(this.node(), id).delay;
	}

	function durationFunction(id, value) {
	  return function() {
	    set$1(this, id).duration = +value.apply(this, arguments);
	  };
	}

	function durationConstant(id, value) {
	  return value = +value, function() {
	    set$1(this, id).duration = value;
	  };
	}

	function transition_duration(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each((typeof value === "function"
	          ? durationFunction
	          : durationConstant)(id, value))
	      : get$1(this.node(), id).duration;
	}

	function easeConstant(id, value) {
	  if (typeof value !== "function") throw new Error;
	  return function() {
	    set$1(this, id).ease = value;
	  };
	}

	function transition_ease(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each(easeConstant(id, value))
	      : get$1(this.node(), id).ease;
	}

	function transition_filter(match) {
	  if (typeof match !== "function") match = matcher(match);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	        subgroup.push(node);
	      }
	    }
	  }

	  return new Transition(subgroups, this._parents, this._name, this._id);
	}

	function transition_merge(transition) {
	  if (transition._id !== this._id) throw new Error;

	  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group0[i] || group1[i]) {
	        merge[i] = node;
	      }
	    }
	  }

	  for (; j < m0; ++j) {
	    merges[j] = groups0[j];
	  }

	  return new Transition(merges, this._parents, this._name, this._id);
	}

	function start(name) {
	  return (name + "").trim().split(/^|\s+/).every(function(t) {
	    var i = t.indexOf(".");
	    if (i >= 0) t = t.slice(0, i);
	    return !t || t === "start";
	  });
	}

	function onFunction(id, name, listener) {
	  var on0, on1, sit = start(name) ? init : set$1;
	  return function() {
	    var schedule = sit(this, id),
	        on = schedule.on;

	    // If this node shared a dispatch with the previous node,
	    // just assign the updated shared dispatch and we’re done!
	    // Otherwise, copy-on-write.
	    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

	    schedule.on = on1;
	  };
	}

	function transition_on(name, listener) {
	  var id = this._id;

	  return arguments.length < 2
	      ? get$1(this.node(), id).on.on(name)
	      : this.each(onFunction(id, name, listener));
	}

	function removeFunction(id) {
	  return function() {
	    var parent = this.parentNode;
	    for (var i in this.__transition) if (+i !== id) return;
	    if (parent) parent.removeChild(this);
	  };
	}

	function transition_remove() {
	  return this.on("end.remove", removeFunction(this._id));
	}

	function transition_select(select) {
	  var name = this._name,
	      id = this._id;

	  if (typeof select !== "function") select = selector(select);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
	        if ("__data__" in node) subnode.__data__ = node.__data__;
	        subgroup[i] = subnode;
	        schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
	      }
	    }
	  }

	  return new Transition(subgroups, this._parents, name, id);
	}

	function transition_selectAll(select) {
	  var name = this._name,
	      id = this._id;

	  if (typeof select !== "function") select = selectorAll(select);

	  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
	          if (child = children[k]) {
	            schedule(child, name, id, k, children, inherit);
	          }
	        }
	        subgroups.push(children);
	        parents.push(node);
	      }
	    }
	  }

	  return new Transition(subgroups, parents, name, id);
	}

	var Selection$1 = selection.prototype.constructor;

	function transition_selection() {
	  return new Selection$1(this._groups, this._parents);
	}

	function styleNull(name, interpolate) {
	  var string00,
	      string10,
	      interpolate0;
	  return function() {
	    var string0 = styleValue(this, name),
	        string1 = (this.style.removeProperty(name), styleValue(this, name));
	    return string0 === string1 ? null
	        : string0 === string00 && string1 === string10 ? interpolate0
	        : interpolate0 = interpolate(string00 = string0, string10 = string1);
	  };
	}

	function styleRemove$1(name) {
	  return function() {
	    this.style.removeProperty(name);
	  };
	}

	function styleConstant$1(name, interpolate, value1) {
	  var string00,
	      string1 = value1 + "",
	      interpolate0;
	  return function() {
	    var string0 = styleValue(this, name);
	    return string0 === string1 ? null
	        : string0 === string00 ? interpolate0
	        : interpolate0 = interpolate(string00 = string0, value1);
	  };
	}

	function styleFunction$1(name, interpolate, value) {
	  var string00,
	      string10,
	      interpolate0;
	  return function() {
	    var string0 = styleValue(this, name),
	        value1 = value(this),
	        string1 = value1 + "";
	    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
	    return string0 === string1 ? null
	        : string0 === string00 && string1 === string10 ? interpolate0
	        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	  };
	}

	function styleMaybeRemove(id, name) {
	  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
	  return function() {
	    var schedule = set$1(this, id),
	        on = schedule.on,
	        listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

	    // If this node shared a dispatch with the previous node,
	    // just assign the updated shared dispatch and we’re done!
	    // Otherwise, copy-on-write.
	    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

	    schedule.on = on1;
	  };
	}

	function transition_style(name, value, priority) {
	  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
	  return value == null ? this
	      .styleTween(name, styleNull(name, i))
	      .on("end.style." + name, styleRemove$1(name))
	    : typeof value === "function" ? this
	      .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
	      .each(styleMaybeRemove(this._id, name))
	    : this
	      .styleTween(name, styleConstant$1(name, i, value), priority)
	      .on("end.style." + name, null);
	}

	function styleInterpolate(name, i, priority) {
	  return function(t) {
	    this.style.setProperty(name, i(t), priority);
	  };
	}

	function styleTween(name, value, priority) {
	  var t, i0;
	  function tween() {
	    var i = value.apply(this, arguments);
	    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
	    return t;
	  }
	  tween._value = value;
	  return tween;
	}

	function transition_styleTween(name, value, priority) {
	  var key = "style." + (name += "");
	  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	  if (value == null) return this.tween(key, null);
	  if (typeof value !== "function") throw new Error;
	  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
	}

	function textConstant$1(value) {
	  return function() {
	    this.textContent = value;
	  };
	}

	function textFunction$1(value) {
	  return function() {
	    var value1 = value(this);
	    this.textContent = value1 == null ? "" : value1;
	  };
	}

	function transition_text(value) {
	  return this.tween("text", typeof value === "function"
	      ? textFunction$1(tweenValue(this, "text", value))
	      : textConstant$1(value == null ? "" : value + ""));
	}

	function transition_transition() {
	  var name = this._name,
	      id0 = this._id,
	      id1 = newId();

	  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        var inherit = get$1(node, id0);
	        schedule(node, name, id1, i, group, {
	          time: inherit.time + inherit.delay + inherit.duration,
	          delay: 0,
	          duration: inherit.duration,
	          ease: inherit.ease
	        });
	      }
	    }
	  }

	  return new Transition(groups, this._parents, name, id1);
	}

	function transition_end() {
	  var on0, on1, that = this, id = that._id, size = that.size();
	  return new Promise(function(resolve, reject) {
	    var cancel = {value: reject},
	        end = {value: function() { if (--size === 0) resolve(); }};

	    that.each(function() {
	      var schedule = set$1(this, id),
	          on = schedule.on;

	      // If this node shared a dispatch with the previous node,
	      // just assign the updated shared dispatch and we’re done!
	      // Otherwise, copy-on-write.
	      if (on !== on0) {
	        on1 = (on0 = on).copy();
	        on1._.cancel.push(cancel);
	        on1._.interrupt.push(cancel);
	        on1._.end.push(end);
	      }

	      schedule.on = on1;
	    });
	  });
	}

	var id = 0;

	function Transition(groups, parents, name, id) {
	  this._groups = groups;
	  this._parents = parents;
	  this._name = name;
	  this._id = id;
	}

	function transition(name) {
	  return selection().transition(name);
	}

	function newId() {
	  return ++id;
	}

	var selection_prototype = selection.prototype;

	Transition.prototype = transition.prototype = {
	  constructor: Transition,
	  select: transition_select,
	  selectAll: transition_selectAll,
	  filter: transition_filter,
	  merge: transition_merge,
	  selection: transition_selection,
	  transition: transition_transition,
	  call: selection_prototype.call,
	  nodes: selection_prototype.nodes,
	  node: selection_prototype.node,
	  size: selection_prototype.size,
	  empty: selection_prototype.empty,
	  each: selection_prototype.each,
	  on: transition_on,
	  attr: transition_attr,
	  attrTween: transition_attrTween,
	  style: transition_style,
	  styleTween: transition_styleTween,
	  text: transition_text,
	  remove: transition_remove,
	  tween: transition_tween,
	  delay: transition_delay,
	  duration: transition_duration,
	  ease: transition_ease,
	  end: transition_end
	};

	function linear$1(t) {
	  return +t;
	}

	function cubicInOut(t) {
	  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
	}

	var pi = Math.PI;

	var tau = 2 * Math.PI;

	var defaultTiming = {
	  time: null, // Set on use.
	  delay: 0,
	  duration: 250,
	  ease: cubicInOut
	};

	function inherit(node, id) {
	  var timing;
	  while (!(timing = node.__transition) || !(timing = timing[id])) {
	    if (!(node = node.parentNode)) {
	      return defaultTiming.time = now(), defaultTiming;
	    }
	  }
	  return timing;
	}

	function selection_transition(name) {
	  var id,
	      timing;

	  if (name instanceof Transition) {
	    id = name._id, name = name._name;
	  } else {
	    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
	  }

	  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        schedule(node, name, id, i, group, timing || inherit(node, id));
	      }
	    }
	  }

	  return new Transition(groups, this._parents, name, id);
	}

	selection.prototype.interrupt = selection_interrupt;
	selection.prototype.transition = selection_transition;

	var pi$1 = Math.PI;

	var pi$2 = Math.PI,
	    tau$1 = 2 * pi$2,
	    epsilon$1 = 1e-6,
	    tauEpsilon = tau$1 - epsilon$1;

	function Path() {
	  this._x0 = this._y0 = // start of current subpath
	  this._x1 = this._y1 = null; // end of current subpath
	  this._ = "";
	}

	function path() {
	  return new Path;
	}

	Path.prototype = path.prototype = {
	  constructor: Path,
	  moveTo: function(x, y) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
	  },
	  closePath: function() {
	    if (this._x1 !== null) {
	      this._x1 = this._x0, this._y1 = this._y0;
	      this._ += "Z";
	    }
	  },
	  lineTo: function(x, y) {
	    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  quadraticCurveTo: function(x1, y1, x, y) {
	    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
	    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  arcTo: function(x1, y1, x2, y2, r) {
	    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
	    var x0 = this._x1,
	        y0 = this._y1,
	        x21 = x2 - x1,
	        y21 = y2 - y1,
	        x01 = x0 - x1,
	        y01 = y0 - y1,
	        l01_2 = x01 * x01 + y01 * y01;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x1,y1).
	    if (this._x1 === null) {
	      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
	    else if (!(l01_2 > epsilon$1));

	    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
	    // Equivalently, is (x1,y1) coincident with (x2,y2)?
	    // Or, is the radius zero? Line to (x1,y1).
	    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
	      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Otherwise, draw an arc!
	    else {
	      var x20 = x2 - x0,
	          y20 = y2 - y0,
	          l21_2 = x21 * x21 + y21 * y21,
	          l20_2 = x20 * x20 + y20 * y20,
	          l21 = Math.sqrt(l21_2),
	          l01 = Math.sqrt(l01_2),
	          l = r * Math.tan((pi$2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
	          t01 = l / l01,
	          t21 = l / l21;

	      // If the start tangent is not coincident with (x0,y0), line to.
	      if (Math.abs(t01 - 1) > epsilon$1) {
	        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
	      }

	      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
	    }
	  },
	  arc: function(x, y, r, a0, a1, ccw) {
	    x = +x, y = +y, r = +r;
	    var dx = r * Math.cos(a0),
	        dy = r * Math.sin(a0),
	        x0 = x + dx,
	        y0 = y + dy,
	        cw = 1 ^ ccw,
	        da = ccw ? a0 - a1 : a1 - a0;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x0,y0).
	    if (this._x1 === null) {
	      this._ += "M" + x0 + "," + y0;
	    }

	    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
	    else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
	      this._ += "L" + x0 + "," + y0;
	    }

	    // Is this arc empty? We’re done.
	    if (!r) return;

	    // Does the angle go the wrong way? Flip the direction.
	    if (da < 0) da = da % tau$1 + tau$1;

	    // Is this a complete circle? Draw two arcs to complete the circle.
	    if (da > tauEpsilon) {
	      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
	    }

	    // Is this arc non-empty? Draw an arc!
	    else if (da > epsilon$1) {
	      this._ += "A" + r + "," + r + ",0," + (+(da >= pi$2)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
	    }
	  },
	  rect: function(x, y, w, h) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
	  },
	  toString: function() {
	    return this._;
	  }
	};

	var prefix = "$";

	function Map$1() {}

	Map$1.prototype = map.prototype = {
	  constructor: Map$1,
	  has: function(key) {
	    return (prefix + key) in this;
	  },
	  get: function(key) {
	    return this[prefix + key];
	  },
	  set: function(key, value) {
	    this[prefix + key] = value;
	    return this;
	  },
	  remove: function(key) {
	    var property = prefix + key;
	    return property in this && delete this[property];
	  },
	  clear: function() {
	    for (var property in this) if (property[0] === prefix) delete this[property];
	  },
	  keys: function() {
	    var keys = [];
	    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
	    return keys;
	  },
	  values: function() {
	    var values = [];
	    for (var property in this) if (property[0] === prefix) values.push(this[property]);
	    return values;
	  },
	  entries: function() {
	    var entries = [];
	    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
	    return entries;
	  },
	  size: function() {
	    var size = 0;
	    for (var property in this) if (property[0] === prefix) ++size;
	    return size;
	  },
	  empty: function() {
	    for (var property in this) if (property[0] === prefix) return false;
	    return true;
	  },
	  each: function(f) {
	    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
	  }
	};

	function map(object, f) {
	  var map = new Map$1;

	  // Copy constructor.
	  if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

	  // Index array by numeric index or specified key function.
	  else if (Array.isArray(object)) {
	    var i = -1,
	        n = object.length,
	        o;

	    if (f == null) while (++i < n) map.set(i, object[i]);
	    else while (++i < n) map.set(f(o = object[i], i, object), o);
	  }

	  // Convert object to map.
	  else if (object) for (var key in object) map.set(key, object[key]);

	  return map;
	}

	function Set$1() {}

	var proto = map.prototype;

	Set$1.prototype = set$2.prototype = {
	  constructor: Set$1,
	  has: proto.has,
	  add: function(value) {
	    value += "";
	    this[prefix + value] = value;
	    return this;
	  },
	  remove: proto.remove,
	  clear: proto.clear,
	  values: proto.keys,
	  size: proto.size,
	  empty: proto.empty,
	  each: proto.each
	};

	function set$2(object, f) {
	  var set = new Set$1;

	  // Copy constructor.
	  if (object instanceof Set$1) object.each(function(value) { set.add(value); });

	  // Otherwise, assume it’s an array.
	  else if (object) {
	    var i = -1, n = object.length;
	    if (f == null) while (++i < n) set.add(object[i]);
	    else while (++i < n) set.add(f(object[i], i, object));
	  }

	  return set;
	}

	var EOL = {},
	    EOF = {},
	    QUOTE = 34,
	    NEWLINE = 10,
	    RETURN = 13;

	function objectConverter(columns) {
	  return new Function("d", "return {" + columns.map(function(name, i) {
	    return JSON.stringify(name) + ": d[" + i + "]";
	  }).join(",") + "}");
	}

	function customConverter(columns, f) {
	  var object = objectConverter(columns);
	  return function(row, i) {
	    return f(object(row), i, columns);
	  };
	}

	// Compute unique columns in order of discovery.
	function inferColumns(rows) {
	  var columnSet = Object.create(null),
	      columns = [];

	  rows.forEach(function(row) {
	    for (var column in row) {
	      if (!(column in columnSet)) {
	        columns.push(columnSet[column] = column);
	      }
	    }
	  });

	  return columns;
	}

	function pad(value, width) {
	  var s = value + "", length = s.length;
	  return length < width ? new Array(width - length + 1).join(0) + s : s;
	}

	function formatYear(year) {
	  return year < 0 ? "-" + pad(-year, 6)
	    : year > 9999 ? "+" + pad(year, 6)
	    : pad(year, 4);
	}

	function formatDate(date) {
	  var hours = date.getUTCHours(),
	      minutes = date.getUTCMinutes(),
	      seconds = date.getUTCSeconds(),
	      milliseconds = date.getUTCMilliseconds();
	  return isNaN(date) ? "Invalid Date"
	      : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
	      + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
	      : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
	      : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
	      : "");
	}

	function dsvFormat(delimiter) {
	  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
	      DELIMITER = delimiter.charCodeAt(0);

	  function parse(text, f) {
	    var convert, columns, rows = parseRows(text, function(row, i) {
	      if (convert) return convert(row, i - 1);
	      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
	    });
	    rows.columns = columns || [];
	    return rows;
	  }

	  function parseRows(text, f) {
	    var rows = [], // output rows
	        N = text.length,
	        I = 0, // current character index
	        n = 0, // current line number
	        t, // current token
	        eof = N <= 0, // current token followed by EOF?
	        eol = false; // current token followed by EOL?

	    // Strip the trailing newline.
	    if (text.charCodeAt(N - 1) === NEWLINE) --N;
	    if (text.charCodeAt(N - 1) === RETURN) --N;

	    function token() {
	      if (eof) return EOF;
	      if (eol) return eol = false, EOL;

	      // Unescape quotes.
	      var i, j = I, c;
	      if (text.charCodeAt(j) === QUOTE) {
	        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
	        if ((i = I) >= N) eof = true;
	        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
	        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
	        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
	      }

	      // Find next delimiter or newline.
	      while (I < N) {
	        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
	        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
	        else if (c !== DELIMITER) continue;
	        return text.slice(j, i);
	      }

	      // Return last token before EOF.
	      return eof = true, text.slice(j, N);
	    }

	    while ((t = token()) !== EOF) {
	      var row = [];
	      while (t !== EOL && t !== EOF) row.push(t), t = token();
	      if (f && (row = f(row, n++)) == null) continue;
	      rows.push(row);
	    }

	    return rows;
	  }

	  function preformatBody(rows, columns) {
	    return rows.map(function(row) {
	      return columns.map(function(column) {
	        return formatValue(row[column]);
	      }).join(delimiter);
	    });
	  }

	  function format(rows, columns) {
	    if (columns == null) columns = inferColumns(rows);
	    return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
	  }

	  function formatBody(rows, columns) {
	    if (columns == null) columns = inferColumns(rows);
	    return preformatBody(rows, columns).join("\n");
	  }

	  function formatRows(rows) {
	    return rows.map(formatRow).join("\n");
	  }

	  function formatRow(row) {
	    return row.map(formatValue).join(delimiter);
	  }

	  function formatValue(value) {
	    return value == null ? ""
	        : value instanceof Date ? formatDate(value)
	        : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
	        : value;
	  }

	  return {
	    parse: parse,
	    parseRows: parseRows,
	    format: format,
	    formatBody: formatBody,
	    formatRows: formatRows
	  };
	}

	var csv = dsvFormat(",");

	var tsv = dsvFormat("\t");

	function tree_add(d) {
	  var x = +this._x.call(null, d),
	      y = +this._y.call(null, d);
	  return add(this.cover(x, y), x, y, d);
	}

	function add(tree, x, y, d) {
	  if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

	  var parent,
	      node = tree._root,
	      leaf = {data: d},
	      x0 = tree._x0,
	      y0 = tree._y0,
	      x1 = tree._x1,
	      y1 = tree._y1,
	      xm,
	      ym,
	      xp,
	      yp,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) return tree._root = leaf, tree;

	  // Find the existing leaf for the new point, or add it.
	  while (node.length) {
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
	  }

	  // Is the new point is exactly coincident with the existing point?
	  xp = +tree._x.call(null, node.data);
	  yp = +tree._y.call(null, node.data);
	  if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

	  // Otherwise, split the leaf node until the old and new point are separated.
	  do {
	    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
	  return parent[j] = node, parent[i] = leaf, tree;
	}

	function addAll(data) {
	  var d, i, n = data.length,
	      x,
	      y,
	      xz = new Array(n),
	      yz = new Array(n),
	      x0 = Infinity,
	      y0 = Infinity,
	      x1 = -Infinity,
	      y1 = -Infinity;

	  // Compute the points and their extent.
	  for (i = 0; i < n; ++i) {
	    if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
	    xz[i] = x;
	    yz[i] = y;
	    if (x < x0) x0 = x;
	    if (x > x1) x1 = x;
	    if (y < y0) y0 = y;
	    if (y > y1) y1 = y;
	  }

	  // If there were no (valid) points, abort.
	  if (x0 > x1 || y0 > y1) return this;

	  // Expand the tree to cover the new points.
	  this.cover(x0, y0).cover(x1, y1);

	  // Add the new points.
	  for (i = 0; i < n; ++i) {
	    add(this, xz[i], yz[i], data[i]);
	  }

	  return this;
	}

	function tree_cover(x, y) {
	  if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

	  var x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1;

	  // If the quadtree has no extent, initialize them.
	  // Integer extent are necessary so that if we later double the extent,
	  // the existing quadrant boundaries don’t change due to floating point error!
	  if (isNaN(x0)) {
	    x1 = (x0 = Math.floor(x)) + 1;
	    y1 = (y0 = Math.floor(y)) + 1;
	  }

	  // Otherwise, double repeatedly to cover.
	  else {
	    var z = x1 - x0,
	        node = this._root,
	        parent,
	        i;

	    while (x0 > x || x >= x1 || y0 > y || y >= y1) {
	      i = (y < y0) << 1 | (x < x0);
	      parent = new Array(4), parent[i] = node, node = parent, z *= 2;
	      switch (i) {
	        case 0: x1 = x0 + z, y1 = y0 + z; break;
	        case 1: x0 = x1 - z, y1 = y0 + z; break;
	        case 2: x1 = x0 + z, y0 = y1 - z; break;
	        case 3: x0 = x1 - z, y0 = y1 - z; break;
	      }
	    }

	    if (this._root && this._root.length) this._root = node;
	  }

	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  return this;
	}

	function tree_data() {
	  var data = [];
	  this.visit(function(node) {
	    if (!node.length) do data.push(node.data); while (node = node.next)
	  });
	  return data;
	}

	function tree_extent(_) {
	  return arguments.length
	      ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
	      : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
	}

	function Quad(node, x0, y0, x1, y1) {
	  this.node = node;
	  this.x0 = x0;
	  this.y0 = y0;
	  this.x1 = x1;
	  this.y1 = y1;
	}

	function tree_find(x, y, radius) {
	  var data,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1,
	      y1,
	      x2,
	      y2,
	      x3 = this._x1,
	      y3 = this._y1,
	      quads = [],
	      node = this._root,
	      q,
	      i;

	  if (node) quads.push(new Quad(node, x0, y0, x3, y3));
	  if (radius == null) radius = Infinity;
	  else {
	    x0 = x - radius, y0 = y - radius;
	    x3 = x + radius, y3 = y + radius;
	    radius *= radius;
	  }

	  while (q = quads.pop()) {

	    // Stop searching if this quadrant can’t contain a closer node.
	    if (!(node = q.node)
	        || (x1 = q.x0) > x3
	        || (y1 = q.y0) > y3
	        || (x2 = q.x1) < x0
	        || (y2 = q.y1) < y0) continue;

	    // Bisect the current quadrant.
	    if (node.length) {
	      var xm = (x1 + x2) / 2,
	          ym = (y1 + y2) / 2;

	      quads.push(
	        new Quad(node[3], xm, ym, x2, y2),
	        new Quad(node[2], x1, ym, xm, y2),
	        new Quad(node[1], xm, y1, x2, ym),
	        new Quad(node[0], x1, y1, xm, ym)
	      );

	      // Visit the closest quadrant first.
	      if (i = (y >= ym) << 1 | (x >= xm)) {
	        q = quads[quads.length - 1];
	        quads[quads.length - 1] = quads[quads.length - 1 - i];
	        quads[quads.length - 1 - i] = q;
	      }
	    }

	    // Visit this point. (Visiting coincident points isn’t necessary!)
	    else {
	      var dx = x - +this._x.call(null, node.data),
	          dy = y - +this._y.call(null, node.data),
	          d2 = dx * dx + dy * dy;
	      if (d2 < radius) {
	        var d = Math.sqrt(radius = d2);
	        x0 = x - d, y0 = y - d;
	        x3 = x + d, y3 = y + d;
	        data = node.data;
	      }
	    }
	  }

	  return data;
	}

	function tree_remove(d) {
	  if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

	  var parent,
	      node = this._root,
	      retainer,
	      previous,
	      next,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1,
	      x,
	      y,
	      xm,
	      ym,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) return this;

	  // Find the leaf node for the point.
	  // While descending, also retain the deepest parent with a non-removed sibling.
	  if (node.length) while (true) {
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
	    if (!node.length) break;
	    if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
	  }

	  // Find the point to remove.
	  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
	  if (next = node.next) delete node.next;

	  // If there are multiple coincident points, remove just the point.
	  if (previous) return (next ? previous.next = next : delete previous.next), this;

	  // If this is the root point, remove it.
	  if (!parent) return this._root = next, this;

	  // Remove this leaf.
	  next ? parent[i] = next : delete parent[i];

	  // If the parent now contains exactly one leaf, collapse superfluous parents.
	  if ((node = parent[0] || parent[1] || parent[2] || parent[3])
	      && node === (parent[3] || parent[2] || parent[1] || parent[0])
	      && !node.length) {
	    if (retainer) retainer[j] = node;
	    else this._root = node;
	  }

	  return this;
	}

	function removeAll(data) {
	  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
	  return this;
	}

	function tree_root() {
	  return this._root;
	}

	function tree_size() {
	  var size = 0;
	  this.visit(function(node) {
	    if (!node.length) do ++size; while (node = node.next)
	  });
	  return size;
	}

	function tree_visit(callback) {
	  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
	  if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
	  while (q = quads.pop()) {
	    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
	      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
	      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
	      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
	      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
	    }
	  }
	  return this;
	}

	function tree_visitAfter(callback) {
	  var quads = [], next = [], q;
	  if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
	  while (q = quads.pop()) {
	    var node = q.node;
	    if (node.length) {
	      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
	      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
	      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
	      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
	    }
	    next.push(q);
	  }
	  while (q = next.pop()) {
	    callback(q.node, q.x0, q.y0, q.x1, q.y1);
	  }
	  return this;
	}

	function defaultX(d) {
	  return d[0];
	}

	function tree_x(_) {
	  return arguments.length ? (this._x = _, this) : this._x;
	}

	function defaultY(d) {
	  return d[1];
	}

	function tree_y(_) {
	  return arguments.length ? (this._y = _, this) : this._y;
	}

	function quadtree(nodes, x, y) {
	  var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
	  return nodes == null ? tree : tree.addAll(nodes);
	}

	function Quadtree(x, y, x0, y0, x1, y1) {
	  this._x = x;
	  this._y = y;
	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  this._root = undefined;
	}

	function leaf_copy(leaf) {
	  var copy = {data: leaf.data}, next = copy;
	  while (leaf = leaf.next) next = next.next = {data: leaf.data};
	  return copy;
	}

	var treeProto = quadtree.prototype = Quadtree.prototype;

	treeProto.copy = function() {
	  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
	      node = this._root,
	      nodes,
	      child;

	  if (!node) return copy;

	  if (!node.length) return copy._root = leaf_copy(node), copy;

	  nodes = [{source: node, target: copy._root = new Array(4)}];
	  while (node = nodes.pop()) {
	    for (var i = 0; i < 4; ++i) {
	      if (child = node.source[i]) {
	        if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
	        else node.target[i] = leaf_copy(child);
	      }
	    }
	  }

	  return copy;
	};

	treeProto.add = tree_add;
	treeProto.addAll = addAll;
	treeProto.cover = tree_cover;
	treeProto.data = tree_data;
	treeProto.extent = tree_extent;
	treeProto.find = tree_find;
	treeProto.remove = tree_remove;
	treeProto.removeAll = removeAll;
	treeProto.root = tree_root;
	treeProto.size = tree_size;
	treeProto.visit = tree_visit;
	treeProto.visitAfter = tree_visitAfter;
	treeProto.x = tree_x;
	treeProto.y = tree_y;

	var initialAngle = Math.PI * (3 - Math.sqrt(5));

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimal(1.23) returns ["123", 0].
	function formatDecimal(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	}

	function exponent(x) {
	  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
	}

	function formatGroup(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	}

	function formatNumerals(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	}

	// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
	var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  return new FormatSpecifier(specifier);
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	  var match;
	  this.fill = match[1] || " ";
	  this.align = match[2] || ">";
	  this.sign = match[3] || "-";
	  this.symbol = match[4] || "";
	  this.zero = !!match[5];
	  this.width = match[6] && +match[6];
	  this.comma = !!match[7];
	  this.precision = match[8] && +match[8].slice(1);
	  this.trim = !!match[9];
	  this.type = match[10] || "";
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width == null ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
	      + (this.trim ? "~" : "")
	      + this.type;
	};

	// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
	function formatTrim(s) {
	  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (s[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
	    }
	  }
	  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
	}

	var prefixExponent;

	function formatPrefixAuto(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	}

	function formatRounded(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	}

	var formatTypes = {
	  "%": function(x, p) { return (x * 100).toFixed(p); },
	  "b": function(x) { return Math.round(x).toString(2); },
	  "c": function(x) { return x + ""; },
	  "d": function(x) { return Math.round(x).toString(10); },
	  "e": function(x, p) { return x.toExponential(p); },
	  "f": function(x, p) { return x.toFixed(p); },
	  "g": function(x, p) { return x.toPrecision(p); },
	  "o": function(x) { return Math.round(x).toString(8); },
	  "p": function(x, p) { return formatRounded(x * 100, p); },
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
	  "x": function(x) { return Math.round(x).toString(16); }
	};

	function identity$2(x) {
	  return x;
	}

	var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

	function formatLocale(locale) {
	  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$2,
	      currency = locale.currency,
	      decimal = locale.decimal,
	      numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$2,
	      percent = locale.percent || "%";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        trim = specifier.trim,
	        type = specifier.type;

	    // The "n" type is an alias for ",g".
	    if (type === "n") comma = true, type = "g";

	    // The "" type, and any invalid type, is an alias for ".12~g".
	    else if (!formatTypes[type]) precision == null && (precision = 12), trim = true, type = "g";

	    // If zero fill is specified, padding goes after sign and before digits.
	    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision == null ? 6
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Perform the initial formatting.
	        var valueNegative = value < 0;
	        value = formatType(Math.abs(value), precision);

	        // Trim insignificant zeros.
	        if (trim) value = formatTrim(value);

	        // If a negative value rounds to zero during formatting, treat as positive.
	        if (valueNegative && +value === 0) valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
	        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	}

	var locale;
	var format;
	var formatPrefix;

	defaultLocale({
	  decimal: ".",
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""]
	});

	function defaultLocale(definition) {
	  locale = formatLocale(definition);
	  format = locale.format;
	  formatPrefix = locale.formatPrefix;
	  return locale;
	}

	function precisionFixed(step) {
	  return Math.max(0, -exponent(Math.abs(step)));
	}

	function precisionPrefix(step, value) {
	  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
	}

	function precisionRound(step, max) {
	  step = Math.abs(step), max = Math.abs(max) - step;
	  return Math.max(0, exponent(max) - exponent(step)) + 1;
	}

	// Adds floating point numbers with twice the normal precision.
	// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
	// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
	// 305–363 (1997).
	// Code adapted from GeographicLib by Charles F. F. Karney,
	// http://geographiclib.sourceforge.net/

	function adder() {
	  return new Adder;
	}

	function Adder() {
	  this.reset();
	}

	Adder.prototype = {
	  constructor: Adder,
	  reset: function() {
	    this.s = // rounded value
	    this.t = 0; // exact error
	  },
	  add: function(y) {
	    add$1(temp, y, this.t);
	    add$1(this, temp.s, this.s);
	    if (this.s) this.t += temp.t;
	    else this.s = temp.t;
	  },
	  valueOf: function() {
	    return this.s;
	  }
	};

	var temp = new Adder;

	function add$1(adder, a, b) {
	  var x = adder.s = a + b,
	      bv = x - a,
	      av = x - bv;
	  adder.t = (a - av) + (b - bv);
	}

	var pi$3 = Math.PI;

	var areaRingSum = adder();

	var areaSum = adder();

	var deltaSum = adder();

	var sum = adder();

	var lengthSum = adder();

	var areaSum$1 = adder(),
	    areaRingSum$1 = adder();

	var lengthSum$1 = adder();

	function initRange(domain, range) {
	  switch (arguments.length) {
	    case 0: break;
	    case 1: this.range(domain); break;
	    default: this.range(range).domain(domain); break;
	  }
	  return this;
	}

	var array$1 = Array.prototype;

	var map$1 = array$1.map;
	var slice$1 = array$1.slice;

	function constant$2(x) {
	  return function() {
	    return x;
	  };
	}

	function number$2(x) {
	  return +x;
	}

	var unit = [0, 1];

	function identity$3(x) {
	  return x;
	}

	function normalize(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constant$2(isNaN(b) ? NaN : 0.5);
	}

	function clamper(domain) {
	  var a = domain[0], b = domain[domain.length - 1], t;
	  if (a > b) t = a, a = b, b = t;
	  return function(x) { return Math.max(a, Math.min(b, x)); };
	}

	// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
	function bimap(domain, range, interpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
	  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range, interpolate) {
	  var j = Math.min(domain.length, range.length) - 1,
	      d = new Array(j),
	      r = new Array(j),
	      i = -1;

	  // Reverse descending domains.
	  if (domain[j] < domain[0]) {
	    domain = domain.slice().reverse();
	    range = range.slice().reverse();
	  }

	  while (++i < j) {
	    d[i] = normalize(domain[i], domain[i + 1]);
	    r[i] = interpolate(range[i], range[i + 1]);
	  }

	  return function(x) {
	    var i = bisectRight(domain, x, 1, j) - 1;
	    return r[i](d[i](x));
	  };
	}

	function copy(source, target) {
	  return target
	      .domain(source.domain())
	      .range(source.range())
	      .interpolate(source.interpolate())
	      .clamp(source.clamp())
	      .unknown(source.unknown());
	}

	function transformer() {
	  var domain = unit,
	      range = unit,
	      interpolate = interpolateValue,
	      transform,
	      untransform,
	      unknown,
	      clamp = identity$3,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
	  }

	  scale.invert = function(y) {
	    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = map$1.call(_, number$2), clamp === identity$3 || (clamp = clamper(domain)), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = slice$1.call(_), rescale()) : range.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range = slice$1.call(_), interpolate = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = _ ? clamper(domain) : identity$3, scale) : clamp !== identity$3;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate = _, rescale()) : interpolate;
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  return function(t, u) {
	    transform = t, untransform = u;
	    return rescale();
	  };
	}

	function continuous(transform, untransform) {
	  return transformer()(transform, untransform);
	}

	function tickFormat(start, stop, count, specifier) {
	  var step = tickStep(start, stop, count),
	      precision;
	  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	  switch (specifier.type) {
	    case "s": {
	      var value = Math.max(Math.abs(start), Math.abs(stop));
	      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
	      return formatPrefix(specifier, value);
	    }
	    case "":
	    case "e":
	    case "g":
	    case "p":
	    case "r": {
	      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
	      break;
	    }
	    case "f":
	    case "%": {
	      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	      break;
	    }
	  }
	  return format(specifier);
	}

	function linearish(scale) {
	  var domain = scale.domain;

	  scale.ticks = function(count) {
	    var d = domain();
	    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	  };

	  scale.tickFormat = function(count, specifier) {
	    var d = domain();
	    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
	  };

	  scale.nice = function(count) {
	    if (count == null) count = 10;

	    var d = domain(),
	        i0 = 0,
	        i1 = d.length - 1,
	        start = d[i0],
	        stop = d[i1],
	        step;

	    if (stop < start) {
	      step = start, start = stop, stop = step;
	      step = i0, i0 = i1, i1 = step;
	    }

	    step = tickIncrement(start, stop, count);

	    if (step > 0) {
	      start = Math.floor(start / step) * step;
	      stop = Math.ceil(stop / step) * step;
	      step = tickIncrement(start, stop, count);
	    } else if (step < 0) {
	      start = Math.ceil(start * step) / step;
	      stop = Math.floor(stop * step) / step;
	      step = tickIncrement(start, stop, count);
	    }

	    if (step > 0) {
	      d[i0] = Math.floor(start / step) * step;
	      d[i1] = Math.ceil(stop / step) * step;
	      domain(d);
	    } else if (step < 0) {
	      d[i0] = Math.ceil(start * step) / step;
	      d[i1] = Math.floor(stop * step) / step;
	      domain(d);
	    }

	    return scale;
	  };

	  return scale;
	}

	function linear$2() {
	  var scale = continuous(identity$3, identity$3);

	  scale.copy = function() {
	    return copy(scale, linear$2());
	  };

	  initRange.apply(scale, arguments);

	  return linearish(scale);
	}

	var t0$1 = new Date,
	    t1$1 = new Date;

	function newInterval(floori, offseti, count, field) {

	  function interval(date) {
	    return floori(date = new Date(+date)), date;
	  }

	  interval.floor = interval;

	  interval.ceil = function(date) {
	    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
	  };

	  interval.round = function(date) {
	    var d0 = interval(date),
	        d1 = interval.ceil(date);
	    return date - d0 < d1 - date ? d0 : d1;
	  };

	  interval.offset = function(date, step) {
	    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
	  };

	  interval.range = function(start, stop, step) {
	    var range = [], previous;
	    start = interval.ceil(start);
	    step = step == null ? 1 : Math.floor(step);
	    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
	    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
	    while (previous < start && start < stop);
	    return range;
	  };

	  interval.filter = function(test) {
	    return newInterval(function(date) {
	      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
	    }, function(date, step) {
	      if (date >= date) {
	        if (step < 0) while (++step <= 0) {
	          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
	        } else while (--step >= 0) {
	          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
	        }
	      }
	    });
	  };

	  if (count) {
	    interval.count = function(start, end) {
	      t0$1.setTime(+start), t1$1.setTime(+end);
	      floori(t0$1), floori(t1$1);
	      return Math.floor(count(t0$1, t1$1));
	    };

	    interval.every = function(step) {
	      step = Math.floor(step);
	      return !isFinite(step) || !(step > 0) ? null
	          : !(step > 1) ? interval
	          : interval.filter(field
	              ? function(d) { return field(d) % step === 0; }
	              : function(d) { return interval.count(0, d) % step === 0; });
	    };
	  }

	  return interval;
	}

	var millisecond = newInterval(function() {
	  // noop
	}, function(date, step) {
	  date.setTime(+date + step);
	}, function(start, end) {
	  return end - start;
	});

	// An optimized implementation for this simple case.
	millisecond.every = function(k) {
	  k = Math.floor(k);
	  if (!isFinite(k) || !(k > 0)) return null;
	  if (!(k > 1)) return millisecond;
	  return newInterval(function(date) {
	    date.setTime(Math.floor(date / k) * k);
	  }, function(date, step) {
	    date.setTime(+date + step * k);
	  }, function(start, end) {
	    return (end - start) / k;
	  });
	};

	var durationSecond = 1e3;
	var durationMinute = 6e4;
	var durationHour = 36e5;
	var durationDay = 864e5;
	var durationWeek = 6048e5;

	var second = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds());
	}, function(date, step) {
	  date.setTime(+date + step * durationSecond);
	}, function(start, end) {
	  return (end - start) / durationSecond;
	}, function(date) {
	  return date.getUTCSeconds();
	});

	var minute = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getMinutes();
	});

	var hour = newInterval(function(date) {
	  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getHours();
	});

	var day = newInterval(function(date) {
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setDate(date.getDate() + step);
	}, function(start, end) {
	  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
	}, function(date) {
	  return date.getDate() - 1;
	});

	function weekday(i) {
	  return newInterval(function(date) {
	    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setDate(date.getDate() + step * 7);
	  }, function(start, end) {
	    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
	  });
	}

	var sunday = weekday(0);
	var monday = weekday(1);
	var tuesday = weekday(2);
	var wednesday = weekday(3);
	var thursday = weekday(4);
	var friday = weekday(5);
	var saturday = weekday(6);

	var month = newInterval(function(date) {
	  date.setDate(1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setMonth(date.getMonth() + step);
	}, function(start, end) {
	  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
	}, function(date) {
	  return date.getMonth();
	});

	var year = newInterval(function(date) {
	  date.setMonth(0, 1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setFullYear(date.getFullYear() + step);
	}, function(start, end) {
	  return end.getFullYear() - start.getFullYear();
	}, function(date) {
	  return date.getFullYear();
	});

	// An optimized implementation for this simple case.
	year.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
	    date.setMonth(0, 1);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setFullYear(date.getFullYear() + step * k);
	  });
	};

	var utcMinute = newInterval(function(date) {
	  date.setUTCSeconds(0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute);
	}, function(start, end) {
	  return (end - start) / durationMinute;
	}, function(date) {
	  return date.getUTCMinutes();
	});

	var utcHour = newInterval(function(date) {
	  date.setUTCMinutes(0, 0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour);
	}, function(start, end) {
	  return (end - start) / durationHour;
	}, function(date) {
	  return date.getUTCHours();
	});

	var utcDay = newInterval(function(date) {
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCDate(date.getUTCDate() + step);
	}, function(start, end) {
	  return (end - start) / durationDay;
	}, function(date) {
	  return date.getUTCDate() - 1;
	});

	function utcWeekday(i) {
	  return newInterval(function(date) {
	    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCDate(date.getUTCDate() + step * 7);
	  }, function(start, end) {
	    return (end - start) / durationWeek;
	  });
	}

	var utcSunday = utcWeekday(0);
	var utcMonday = utcWeekday(1);
	var utcTuesday = utcWeekday(2);
	var utcWednesday = utcWeekday(3);
	var utcThursday = utcWeekday(4);
	var utcFriday = utcWeekday(5);
	var utcSaturday = utcWeekday(6);

	var utcMonth = newInterval(function(date) {
	  date.setUTCDate(1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCMonth(date.getUTCMonth() + step);
	}, function(start, end) {
	  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
	}, function(date) {
	  return date.getUTCMonth();
	});

	var utcYear = newInterval(function(date) {
	  date.setUTCMonth(0, 1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCFullYear(date.getUTCFullYear() + step);
	}, function(start, end) {
	  return end.getUTCFullYear() - start.getUTCFullYear();
	}, function(date) {
	  return date.getUTCFullYear();
	});

	// An optimized implementation for this simple case.
	utcYear.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
	    date.setUTCMonth(0, 1);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCFullYear(date.getUTCFullYear() + step * k);
	  });
	};

	function localDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
	    date.setFullYear(d.y);
	    return date;
	  }
	  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
	}

	function utcDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
	    date.setUTCFullYear(d.y);
	    return date;
	  }
	  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
	}

	function newYear(y) {
	  return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
	}

	function formatLocale$1(locale) {
	  var locale_dateTime = locale.dateTime,
	      locale_date = locale.date,
	      locale_time = locale.time,
	      locale_periods = locale.periods,
	      locale_weekdays = locale.days,
	      locale_shortWeekdays = locale.shortDays,
	      locale_months = locale.months,
	      locale_shortMonths = locale.shortMonths;

	  var periodRe = formatRe(locale_periods),
	      periodLookup = formatLookup(locale_periods),
	      weekdayRe = formatRe(locale_weekdays),
	      weekdayLookup = formatLookup(locale_weekdays),
	      shortWeekdayRe = formatRe(locale_shortWeekdays),
	      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
	      monthRe = formatRe(locale_months),
	      monthLookup = formatLookup(locale_months),
	      shortMonthRe = formatRe(locale_shortMonths),
	      shortMonthLookup = formatLookup(locale_shortMonths);

	  var formats = {
	    "a": formatShortWeekday,
	    "A": formatWeekday,
	    "b": formatShortMonth,
	    "B": formatMonth,
	    "c": null,
	    "d": formatDayOfMonth,
	    "e": formatDayOfMonth,
	    "f": formatMicroseconds,
	    "H": formatHour24,
	    "I": formatHour12,
	    "j": formatDayOfYear,
	    "L": formatMilliseconds,
	    "m": formatMonthNumber,
	    "M": formatMinutes,
	    "p": formatPeriod,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatSeconds,
	    "u": formatWeekdayNumberMonday,
	    "U": formatWeekNumberSunday,
	    "V": formatWeekNumberISO,
	    "w": formatWeekdayNumberSunday,
	    "W": formatWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatYear$1,
	    "Y": formatFullYear,
	    "Z": formatZone,
	    "%": formatLiteralPercent
	  };

	  var utcFormats = {
	    "a": formatUTCShortWeekday,
	    "A": formatUTCWeekday,
	    "b": formatUTCShortMonth,
	    "B": formatUTCMonth,
	    "c": null,
	    "d": formatUTCDayOfMonth,
	    "e": formatUTCDayOfMonth,
	    "f": formatUTCMicroseconds,
	    "H": formatUTCHour24,
	    "I": formatUTCHour12,
	    "j": formatUTCDayOfYear,
	    "L": formatUTCMilliseconds,
	    "m": formatUTCMonthNumber,
	    "M": formatUTCMinutes,
	    "p": formatUTCPeriod,
	    "Q": formatUnixTimestamp,
	    "s": formatUnixTimestampSeconds,
	    "S": formatUTCSeconds,
	    "u": formatUTCWeekdayNumberMonday,
	    "U": formatUTCWeekNumberSunday,
	    "V": formatUTCWeekNumberISO,
	    "w": formatUTCWeekdayNumberSunday,
	    "W": formatUTCWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatUTCYear,
	    "Y": formatUTCFullYear,
	    "Z": formatUTCZone,
	    "%": formatLiteralPercent
	  };

	  var parses = {
	    "a": parseShortWeekday,
	    "A": parseWeekday,
	    "b": parseShortMonth,
	    "B": parseMonth,
	    "c": parseLocaleDateTime,
	    "d": parseDayOfMonth,
	    "e": parseDayOfMonth,
	    "f": parseMicroseconds,
	    "H": parseHour24,
	    "I": parseHour24,
	    "j": parseDayOfYear,
	    "L": parseMilliseconds,
	    "m": parseMonthNumber,
	    "M": parseMinutes,
	    "p": parsePeriod,
	    "Q": parseUnixTimestamp,
	    "s": parseUnixTimestampSeconds,
	    "S": parseSeconds,
	    "u": parseWeekdayNumberMonday,
	    "U": parseWeekNumberSunday,
	    "V": parseWeekNumberISO,
	    "w": parseWeekdayNumberSunday,
	    "W": parseWeekNumberMonday,
	    "x": parseLocaleDate,
	    "X": parseLocaleTime,
	    "y": parseYear,
	    "Y": parseFullYear,
	    "Z": parseZone,
	    "%": parseLiteralPercent
	  };

	  // These recursive directive definitions must be deferred.
	  formats.x = newFormat(locale_date, formats);
	  formats.X = newFormat(locale_time, formats);
	  formats.c = newFormat(locale_dateTime, formats);
	  utcFormats.x = newFormat(locale_date, utcFormats);
	  utcFormats.X = newFormat(locale_time, utcFormats);
	  utcFormats.c = newFormat(locale_dateTime, utcFormats);

	  function newFormat(specifier, formats) {
	    return function(date) {
	      var string = [],
	          i = -1,
	          j = 0,
	          n = specifier.length,
	          c,
	          pad,
	          format;

	      if (!(date instanceof Date)) date = new Date(+date);

	      while (++i < n) {
	        if (specifier.charCodeAt(i) === 37) {
	          string.push(specifier.slice(j, i));
	          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
	          else pad = c === "e" ? " " : "0";
	          if (format = formats[c]) c = format(date, pad);
	          string.push(c);
	          j = i + 1;
	        }
	      }

	      string.push(specifier.slice(j, i));
	      return string.join("");
	    };
	  }

	  function newParse(specifier, newDate) {
	    return function(string) {
	      var d = newYear(1900),
	          i = parseSpecifier(d, specifier, string += "", 0),
	          week, day$1;
	      if (i != string.length) return null;

	      // If a UNIX timestamp is specified, return it.
	      if ("Q" in d) return new Date(d.Q);

	      // The am-pm flag is 0 for AM, and 1 for PM.
	      if ("p" in d) d.H = d.H % 12 + d.p * 12;

	      // Convert day-of-week and week-of-year to day-of-year.
	      if ("V" in d) {
	        if (d.V < 1 || d.V > 53) return null;
	        if (!("w" in d)) d.w = 1;
	        if ("Z" in d) {
	          week = utcDate(newYear(d.y)), day$1 = week.getUTCDay();
	          week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
	          week = utcDay.offset(week, (d.V - 1) * 7);
	          d.y = week.getUTCFullYear();
	          d.m = week.getUTCMonth();
	          d.d = week.getUTCDate() + (d.w + 6) % 7;
	        } else {
	          week = newDate(newYear(d.y)), day$1 = week.getDay();
	          week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
	          week = day.offset(week, (d.V - 1) * 7);
	          d.y = week.getFullYear();
	          d.m = week.getMonth();
	          d.d = week.getDate() + (d.w + 6) % 7;
	        }
	      } else if ("W" in d || "U" in d) {
	        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
	        day$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
	        d.m = 0;
	        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
	      }

	      // If a time zone is specified, all fields are interpreted as UTC and then
	      // offset according to the specified time zone.
	      if ("Z" in d) {
	        d.H += d.Z / 100 | 0;
	        d.M += d.Z % 100;
	        return utcDate(d);
	      }

	      // Otherwise, all fields are in local time.
	      return newDate(d);
	    };
	  }

	  function parseSpecifier(d, specifier, string, j) {
	    var i = 0,
	        n = specifier.length,
	        m = string.length,
	        c,
	        parse;

	    while (i < n) {
	      if (j >= m) return -1;
	      c = specifier.charCodeAt(i++);
	      if (c === 37) {
	        c = specifier.charAt(i++);
	        parse = parses[c in pads ? specifier.charAt(i++) : c];
	        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
	      } else if (c != string.charCodeAt(j++)) {
	        return -1;
	      }
	    }

	    return j;
	  }

	  function parsePeriod(d, string, i) {
	    var n = periodRe.exec(string.slice(i));
	    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortWeekday(d, string, i) {
	    var n = shortWeekdayRe.exec(string.slice(i));
	    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseWeekday(d, string, i) {
	    var n = weekdayRe.exec(string.slice(i));
	    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortMonth(d, string, i) {
	    var n = shortMonthRe.exec(string.slice(i));
	    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseMonth(d, string, i) {
	    var n = monthRe.exec(string.slice(i));
	    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseLocaleDateTime(d, string, i) {
	    return parseSpecifier(d, locale_dateTime, string, i);
	  }

	  function parseLocaleDate(d, string, i) {
	    return parseSpecifier(d, locale_date, string, i);
	  }

	  function parseLocaleTime(d, string, i) {
	    return parseSpecifier(d, locale_time, string, i);
	  }

	  function formatShortWeekday(d) {
	    return locale_shortWeekdays[d.getDay()];
	  }

	  function formatWeekday(d) {
	    return locale_weekdays[d.getDay()];
	  }

	  function formatShortMonth(d) {
	    return locale_shortMonths[d.getMonth()];
	  }

	  function formatMonth(d) {
	    return locale_months[d.getMonth()];
	  }

	  function formatPeriod(d) {
	    return locale_periods[+(d.getHours() >= 12)];
	  }

	  function formatUTCShortWeekday(d) {
	    return locale_shortWeekdays[d.getUTCDay()];
	  }

	  function formatUTCWeekday(d) {
	    return locale_weekdays[d.getUTCDay()];
	  }

	  function formatUTCShortMonth(d) {
	    return locale_shortMonths[d.getUTCMonth()];
	  }

	  function formatUTCMonth(d) {
	    return locale_months[d.getUTCMonth()];
	  }

	  function formatUTCPeriod(d) {
	    return locale_periods[+(d.getUTCHours() >= 12)];
	  }

	  return {
	    format: function(specifier) {
	      var f = newFormat(specifier += "", formats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    parse: function(specifier) {
	      var p = newParse(specifier += "", localDate);
	      p.toString = function() { return specifier; };
	      return p;
	    },
	    utcFormat: function(specifier) {
	      var f = newFormat(specifier += "", utcFormats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    utcParse: function(specifier) {
	      var p = newParse(specifier, utcDate);
	      p.toString = function() { return specifier; };
	      return p;
	    }
	  };
	}

	var pads = {"-": "", "_": " ", "0": "0"},
	    numberRe = /^\s*\d+/, // note: ignores next directive
	    percentRe = /^%/,
	    requoteRe = /[\\^$*+?|[\]().{}]/g;

	function pad$1(value, fill, width) {
	  var sign = value < 0 ? "-" : "",
	      string = (sign ? -value : value) + "",
	      length = string.length;
	  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	}

	function requote(s) {
	  return s.replace(requoteRe, "\\$&");
	}

	function formatRe(names) {
	  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
	}

	function formatLookup(names) {
	  var map = {}, i = -1, n = names.length;
	  while (++i < n) map[names[i].toLowerCase()] = i;
	  return map;
	}

	function parseWeekdayNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.w = +n[0], i + n[0].length) : -1;
	}

	function parseWeekdayNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.u = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.U = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberISO(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.V = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.W = +n[0], i + n[0].length) : -1;
	}

	function parseFullYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 4));
	  return n ? (d.y = +n[0], i + n[0].length) : -1;
	}

	function parseYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
	}

	function parseZone(d, string, i) {
	  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
	  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
	}

	function parseMonthNumber(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
	}

	function parseDayOfMonth(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.d = +n[0], i + n[0].length) : -1;
	}

	function parseDayOfYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
	}

	function parseHour24(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.H = +n[0], i + n[0].length) : -1;
	}

	function parseMinutes(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.M = +n[0], i + n[0].length) : -1;
	}

	function parseSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.S = +n[0], i + n[0].length) : -1;
	}

	function parseMilliseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.L = +n[0], i + n[0].length) : -1;
	}

	function parseMicroseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 6));
	  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
	}

	function parseLiteralPercent(d, string, i) {
	  var n = percentRe.exec(string.slice(i, i + 1));
	  return n ? i + n[0].length : -1;
	}

	function parseUnixTimestamp(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.Q = +n[0], i + n[0].length) : -1;
	}

	function parseUnixTimestampSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
	}

	function formatDayOfMonth(d, p) {
	  return pad$1(d.getDate(), p, 2);
	}

	function formatHour24(d, p) {
	  return pad$1(d.getHours(), p, 2);
	}

	function formatHour12(d, p) {
	  return pad$1(d.getHours() % 12 || 12, p, 2);
	}

	function formatDayOfYear(d, p) {
	  return pad$1(1 + day.count(year(d), d), p, 3);
	}

	function formatMilliseconds(d, p) {
	  return pad$1(d.getMilliseconds(), p, 3);
	}

	function formatMicroseconds(d, p) {
	  return formatMilliseconds(d, p) + "000";
	}

	function formatMonthNumber(d, p) {
	  return pad$1(d.getMonth() + 1, p, 2);
	}

	function formatMinutes(d, p) {
	  return pad$1(d.getMinutes(), p, 2);
	}

	function formatSeconds(d, p) {
	  return pad$1(d.getSeconds(), p, 2);
	}

	function formatWeekdayNumberMonday(d) {
	  var day = d.getDay();
	  return day === 0 ? 7 : day;
	}

	function formatWeekNumberSunday(d, p) {
	  return pad$1(sunday.count(year(d), d), p, 2);
	}

	function formatWeekNumberISO(d, p) {
	  var day = d.getDay();
	  d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
	  return pad$1(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
	}

	function formatWeekdayNumberSunday(d) {
	  return d.getDay();
	}

	function formatWeekNumberMonday(d, p) {
	  return pad$1(monday.count(year(d), d), p, 2);
	}

	function formatYear$1(d, p) {
	  return pad$1(d.getFullYear() % 100, p, 2);
	}

	function formatFullYear(d, p) {
	  return pad$1(d.getFullYear() % 10000, p, 4);
	}

	function formatZone(d) {
	  var z = d.getTimezoneOffset();
	  return (z > 0 ? "-" : (z *= -1, "+"))
	      + pad$1(z / 60 | 0, "0", 2)
	      + pad$1(z % 60, "0", 2);
	}

	function formatUTCDayOfMonth(d, p) {
	  return pad$1(d.getUTCDate(), p, 2);
	}

	function formatUTCHour24(d, p) {
	  return pad$1(d.getUTCHours(), p, 2);
	}

	function formatUTCHour12(d, p) {
	  return pad$1(d.getUTCHours() % 12 || 12, p, 2);
	}

	function formatUTCDayOfYear(d, p) {
	  return pad$1(1 + utcDay.count(utcYear(d), d), p, 3);
	}

	function formatUTCMilliseconds(d, p) {
	  return pad$1(d.getUTCMilliseconds(), p, 3);
	}

	function formatUTCMicroseconds(d, p) {
	  return formatUTCMilliseconds(d, p) + "000";
	}

	function formatUTCMonthNumber(d, p) {
	  return pad$1(d.getUTCMonth() + 1, p, 2);
	}

	function formatUTCMinutes(d, p) {
	  return pad$1(d.getUTCMinutes(), p, 2);
	}

	function formatUTCSeconds(d, p) {
	  return pad$1(d.getUTCSeconds(), p, 2);
	}

	function formatUTCWeekdayNumberMonday(d) {
	  var dow = d.getUTCDay();
	  return dow === 0 ? 7 : dow;
	}

	function formatUTCWeekNumberSunday(d, p) {
	  return pad$1(utcSunday.count(utcYear(d), d), p, 2);
	}

	function formatUTCWeekNumberISO(d, p) {
	  var day = d.getUTCDay();
	  d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
	  return pad$1(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
	}

	function formatUTCWeekdayNumberSunday(d) {
	  return d.getUTCDay();
	}

	function formatUTCWeekNumberMonday(d, p) {
	  return pad$1(utcMonday.count(utcYear(d), d), p, 2);
	}

	function formatUTCYear(d, p) {
	  return pad$1(d.getUTCFullYear() % 100, p, 2);
	}

	function formatUTCFullYear(d, p) {
	  return pad$1(d.getUTCFullYear() % 10000, p, 4);
	}

	function formatUTCZone() {
	  return "+0000";
	}

	function formatLiteralPercent() {
	  return "%";
	}

	function formatUnixTimestamp(d) {
	  return +d;
	}

	function formatUnixTimestampSeconds(d) {
	  return Math.floor(+d / 1000);
	}

	var locale$1;
	var timeFormat;
	var timeParse;
	var utcFormat;
	var utcParse;

	defaultLocale$1({
	  dateTime: "%x, %X",
	  date: "%-m/%-d/%Y",
	  time: "%-I:%M:%S %p",
	  periods: ["AM", "PM"],
	  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	});

	function defaultLocale$1(definition) {
	  locale$1 = formatLocale$1(definition);
	  timeFormat = locale$1.format;
	  timeParse = locale$1.parse;
	  utcFormat = locale$1.utcFormat;
	  utcParse = locale$1.utcParse;
	  return locale$1;
	}

	var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

	function formatIsoNative(date) {
	  return date.toISOString();
	}

	var formatIso = Date.prototype.toISOString
	    ? formatIsoNative
	    : utcFormat(isoSpecifier);

	function parseIsoNative(string) {
	  var date = new Date(string);
	  return isNaN(date) ? null : date;
	}

	var parseIso = +new Date("2000-01-01T00:00:00.000Z")
	    ? parseIsoNative
	    : utcParse(isoSpecifier);

	function colors(specifier) {
	  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
	  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
	  return colors;
	}

	colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

	colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

	colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

	colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

	colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

	colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

	colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

	colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

	colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

	function ramp(scheme) {
	  return rgbBasis(scheme[scheme.length - 1]);
	}

	var scheme = new Array(3).concat(
	  "d8b365f5f5f55ab4ac",
	  "a6611adfc27d80cdc1018571",
	  "a6611adfc27df5f5f580cdc1018571",
	  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
	  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
	  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
	  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
	  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
	  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
	).map(colors);

	ramp(scheme);

	var scheme$1 = new Array(3).concat(
	  "af8dc3f7f7f77fbf7b",
	  "7b3294c2a5cfa6dba0008837",
	  "7b3294c2a5cff7f7f7a6dba0008837",
	  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
	  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
	  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
	  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
	  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
	  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
	).map(colors);

	ramp(scheme$1);

	var scheme$2 = new Array(3).concat(
	  "e9a3c9f7f7f7a1d76a",
	  "d01c8bf1b6dab8e1864dac26",
	  "d01c8bf1b6daf7f7f7b8e1864dac26",
	  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
	  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
	  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
	  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
	  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
	  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
	).map(colors);

	ramp(scheme$2);

	var scheme$3 = new Array(3).concat(
	  "998ec3f7f7f7f1a340",
	  "5e3c99b2abd2fdb863e66101",
	  "5e3c99b2abd2f7f7f7fdb863e66101",
	  "542788998ec3d8daebfee0b6f1a340b35806",
	  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
	  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
	  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
	  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
	  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
	).map(colors);

	ramp(scheme$3);

	var scheme$4 = new Array(3).concat(
	  "ef8a62f7f7f767a9cf",
	  "ca0020f4a58292c5de0571b0",
	  "ca0020f4a582f7f7f792c5de0571b0",
	  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
	  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
	  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
	  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
	  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
	  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
	).map(colors);

	ramp(scheme$4);

	var scheme$5 = new Array(3).concat(
	  "ef8a62ffffff999999",
	  "ca0020f4a582bababa404040",
	  "ca0020f4a582ffffffbababa404040",
	  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
	  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
	  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
	  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
	  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
	  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
	).map(colors);

	ramp(scheme$5);

	var scheme$6 = new Array(3).concat(
	  "fc8d59ffffbf91bfdb",
	  "d7191cfdae61abd9e92c7bb6",
	  "d7191cfdae61ffffbfabd9e92c7bb6",
	  "d73027fc8d59fee090e0f3f891bfdb4575b4",
	  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
	  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
	  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
	  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
	  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
	).map(colors);

	ramp(scheme$6);

	var scheme$7 = new Array(3).concat(
	  "fc8d59ffffbf91cf60",
	  "d7191cfdae61a6d96a1a9641",
	  "d7191cfdae61ffffbfa6d96a1a9641",
	  "d73027fc8d59fee08bd9ef8b91cf601a9850",
	  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
	  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
	  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
	  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
	  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
	).map(colors);

	ramp(scheme$7);

	var scheme$8 = new Array(3).concat(
	  "fc8d59ffffbf99d594",
	  "d7191cfdae61abdda42b83ba",
	  "d7191cfdae61ffffbfabdda42b83ba",
	  "d53e4ffc8d59fee08be6f59899d5943288bd",
	  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
	  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
	  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
	  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
	  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
	).map(colors);

	ramp(scheme$8);

	var scheme$9 = new Array(3).concat(
	  "e5f5f999d8c92ca25f",
	  "edf8fbb2e2e266c2a4238b45",
	  "edf8fbb2e2e266c2a42ca25f006d2c",
	  "edf8fbccece699d8c966c2a42ca25f006d2c",
	  "edf8fbccece699d8c966c2a441ae76238b45005824",
	  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
	  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
	).map(colors);

	ramp(scheme$9);

	var scheme$a = new Array(3).concat(
	  "e0ecf49ebcda8856a7",
	  "edf8fbb3cde38c96c688419d",
	  "edf8fbb3cde38c96c68856a7810f7c",
	  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
	  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
	  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
	  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
	).map(colors);

	ramp(scheme$a);

	var scheme$b = new Array(3).concat(
	  "e0f3dba8ddb543a2ca",
	  "f0f9e8bae4bc7bccc42b8cbe",
	  "f0f9e8bae4bc7bccc443a2ca0868ac",
	  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
	  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
	  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
	  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
	).map(colors);

	ramp(scheme$b);

	var scheme$c = new Array(3).concat(
	  "fee8c8fdbb84e34a33",
	  "fef0d9fdcc8afc8d59d7301f",
	  "fef0d9fdcc8afc8d59e34a33b30000",
	  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
	  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
	  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
	  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
	).map(colors);

	ramp(scheme$c);

	var scheme$d = new Array(3).concat(
	  "ece2f0a6bddb1c9099",
	  "f6eff7bdc9e167a9cf02818a",
	  "f6eff7bdc9e167a9cf1c9099016c59",
	  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
	  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
	  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
	  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
	).map(colors);

	ramp(scheme$d);

	var scheme$e = new Array(3).concat(
	  "ece7f2a6bddb2b8cbe",
	  "f1eef6bdc9e174a9cf0570b0",
	  "f1eef6bdc9e174a9cf2b8cbe045a8d",
	  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
	  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
	  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
	  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
	).map(colors);

	ramp(scheme$e);

	var scheme$f = new Array(3).concat(
	  "e7e1efc994c7dd1c77",
	  "f1eef6d7b5d8df65b0ce1256",
	  "f1eef6d7b5d8df65b0dd1c77980043",
	  "f1eef6d4b9dac994c7df65b0dd1c77980043",
	  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
	  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
	  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
	).map(colors);

	ramp(scheme$f);

	var scheme$g = new Array(3).concat(
	  "fde0ddfa9fb5c51b8a",
	  "feebe2fbb4b9f768a1ae017e",
	  "feebe2fbb4b9f768a1c51b8a7a0177",
	  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
	  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
	  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
	  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
	).map(colors);

	ramp(scheme$g);

	var scheme$h = new Array(3).concat(
	  "edf8b17fcdbb2c7fb8",
	  "ffffcca1dab441b6c4225ea8",
	  "ffffcca1dab441b6c42c7fb8253494",
	  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
	  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
	  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
	  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
	).map(colors);

	ramp(scheme$h);

	var scheme$i = new Array(3).concat(
	  "f7fcb9addd8e31a354",
	  "ffffccc2e69978c679238443",
	  "ffffccc2e69978c67931a354006837",
	  "ffffccd9f0a3addd8e78c67931a354006837",
	  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
	  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
	  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
	).map(colors);

	ramp(scheme$i);

	var scheme$j = new Array(3).concat(
	  "fff7bcfec44fd95f0e",
	  "ffffd4fed98efe9929cc4c02",
	  "ffffd4fed98efe9929d95f0e993404",
	  "ffffd4fee391fec44ffe9929d95f0e993404",
	  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
	  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
	  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
	).map(colors);

	ramp(scheme$j);

	var scheme$k = new Array(3).concat(
	  "ffeda0feb24cf03b20",
	  "ffffb2fecc5cfd8d3ce31a1c",
	  "ffffb2fecc5cfd8d3cf03b20bd0026",
	  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
	  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
	  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
	  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
	).map(colors);

	ramp(scheme$k);

	var scheme$l = new Array(3).concat(
	  "deebf79ecae13182bd",
	  "eff3ffbdd7e76baed62171b5",
	  "eff3ffbdd7e76baed63182bd08519c",
	  "eff3ffc6dbef9ecae16baed63182bd08519c",
	  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
	  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
	  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
	).map(colors);

	ramp(scheme$l);

	var scheme$m = new Array(3).concat(
	  "e5f5e0a1d99b31a354",
	  "edf8e9bae4b374c476238b45",
	  "edf8e9bae4b374c47631a354006d2c",
	  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
	  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
	  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
	  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
	).map(colors);

	ramp(scheme$m);

	var scheme$n = new Array(3).concat(
	  "f0f0f0bdbdbd636363",
	  "f7f7f7cccccc969696525252",
	  "f7f7f7cccccc969696636363252525",
	  "f7f7f7d9d9d9bdbdbd969696636363252525",
	  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
	  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
	  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
	).map(colors);

	ramp(scheme$n);

	var scheme$o = new Array(3).concat(
	  "efedf5bcbddc756bb1",
	  "f2f0f7cbc9e29e9ac86a51a3",
	  "f2f0f7cbc9e29e9ac8756bb154278f",
	  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
	  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
	  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
	  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
	).map(colors);

	ramp(scheme$o);

	var scheme$p = new Array(3).concat(
	  "fee0d2fc9272de2d26",
	  "fee5d9fcae91fb6a4acb181d",
	  "fee5d9fcae91fb6a4ade2d26a50f15",
	  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
	  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
	  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
	  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
	).map(colors);

	ramp(scheme$p);

	var scheme$q = new Array(3).concat(
	  "fee6cefdae6be6550d",
	  "feeddefdbe85fd8d3cd94701",
	  "feeddefdbe85fd8d3ce6550da63603",
	  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
	  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
	  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
	  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
	).map(colors);

	ramp(scheme$q);

	cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

	var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

	var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

	var c = cubehelix();

	var c$1 = rgb(),
	    pi_1_3 = Math.PI / 3,
	    pi_2_3 = Math.PI * 2 / 3;

	function ramp$1(range) {
	  var n = range.length;
	  return function(t) {
	    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
	  };
	}

	ramp$1(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

	var magma = ramp$1(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

	var inferno = ramp$1(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

	var plasma = ramp$1(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

	function constant$3(x) {
	  return function constant() {
	    return x;
	  };
	}

	var pi$4 = Math.PI;

	function Linear(context) {
	  this._context = context;
	}

	Linear.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: this._context.lineTo(x, y); break;
	    }
	  }
	};

	function curveLinear(context) {
	  return new Linear(context);
	}

	function x(p) {
	  return p[0];
	}

	function y(p) {
	  return p[1];
	}

	function line() {
	  var x$1 = x,
	      y$1 = y,
	      defined = constant$3(true),
	      context = null,
	      curve = curveLinear,
	      output = null;

	  function line(data) {
	    var i,
	        n = data.length,
	        d,
	        defined0 = false,
	        buffer;

	    if (context == null) output = curve(buffer = path());

	    for (i = 0; i <= n; ++i) {
	      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
	        if (defined0 = !defined0) output.lineStart();
	        else output.lineEnd();
	      }
	      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
	    }

	    if (buffer) return output = null, buffer + "" || null;
	  }

	  line.x = function(_) {
	    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$3(+_), line) : x$1;
	  };

	  line.y = function(_) {
	    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$3(+_), line) : y$1;
	  };

	  line.defined = function(_) {
	    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$3(!!_), line) : defined;
	  };

	  line.curve = function(_) {
	    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
	  };

	  line.context = function(_) {
	    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
	  };

	  return line;
	}

	function sign(x) {
	  return x < 0 ? -1 : 1;
	}

	// Calculate the slopes of the tangents (Hermite-type interpolation) based on
	// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
	// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
	// NOV(II), P. 443, 1990.
	function slope3(that, x2, y2) {
	  var h0 = that._x1 - that._x0,
	      h1 = x2 - that._x1,
	      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
	      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
	      p = (s0 * h1 + s1 * h0) / (h0 + h1);
	  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
	}

	// Calculate a one-sided slope.
	function slope2(that, t) {
	  var h = that._x1 - that._x0;
	  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
	}

	// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
	// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
	// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
	function point$1(that, t0, t1) {
	  var x0 = that._x0,
	      y0 = that._y0,
	      x1 = that._x1,
	      y1 = that._y1,
	      dx = (x1 - x0) / 3;
	  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
	}

	function MonotoneX(context) {
	  this._context = context;
	}

	MonotoneX.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 =
	    this._t0 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x1, this._y1); break;
	      case 3: point$1(this, this._t0, slope2(this, this._t0)); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    var t1 = NaN;

	    x = +x, y = +y;
	    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; point$1(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
	      default: point$1(this, this._t0, t1 = slope3(this, x, y)); break;
	    }

	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	    this._t0 = t1;
	  }
	};

	function MonotoneY(context) {
	  this._context = new ReflectContext(context);
	}

	(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
	  MonotoneX.prototype.point.call(this, y, x);
	};

	function ReflectContext(context) {
	  this._context = context;
	}

	ReflectContext.prototype = {
	  moveTo: function(x, y) { this._context.moveTo(y, x); },
	  closePath: function() { this._context.closePath(); },
	  lineTo: function(x, y) { this._context.lineTo(y, x); },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
	};

	function Step(context, t) {
	  this._context = context;
	  this._t = t;
	}

	Step.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = this._y = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: {
	        if (this._t <= 0) {
	          this._context.lineTo(this._x, y);
	          this._context.lineTo(x, y);
	        } else {
	          var x1 = this._x * (1 - this._t) + x * this._t;
	          this._context.lineTo(x1, this._y);
	          this._context.lineTo(x1, y);
	        }
	        break;
	      }
	    }
	    this._x = x, this._y = y;
	  }
	};

	function stepBefore(context) {
	  return new Step(context, 0);
	}

	var Type = {
	  DISCRETE: Symbol("DISCRETE"),
	  BOOLEAN: Symbol("BOOLEAN"),
	  INTEGER: Symbol("INTEGER"),
	  FLOAT: Symbol("FLOAT"),
	  PROBABILITIES: Symbol("PROBABILITIES")
	};
	/**
	 * The Tree class
	 */

	var Tree =
	/*#__PURE__*/
	function () {
	  /**
	   * The constructor takes an object for the root node. The tree structure is
	   * defined as nested node objects.
	   *
	   * @constructor
	   * @param {object} rootNode - The root node of the tree as an object.
	   */
	  function Tree() {
	    var _this = this;

	    var rootNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Tree);

	    this.heightsKnown = false;
	    this.lengthsKnown = true;
	    this.root = makeNode.call(this, objectSpread({}, rootNode, {
	      length: 0
	    })); // This converts all the json objects to Node instances

	    setUpNodes.call(this, this.root);
	    this._origin = 0;
	    this.annotations = {};
	    this._nodeList = toConsumableArray(this.preorder());

	    this._nodeList.forEach(function (node) {
	      if (node.label && node.label.startsWith("#")) {
	        // an id string has been specified in the newick label.
	        node.id = node.label.substring(1);
	      }

	      if (node.annotations) {
	        _this.addAnnotations(node.annotations);
	      }
	    });

	    this._nodeMap = new Map(this.nodeList.map(function (node) {
	      return [node.id, node];
	    }));
	    this._tipMap = new Map(this.externalNodes.map(function (tip) {
	      return [tip.name, tip];
	    }));
	    this.nodesUpdated = false;
	    this.offset = 0; // a callback function that is called whenever the tree is changed

	    this.treeUpdateCallback = function () {};
	  }

	  createClass(Tree, [{
	    key: "getSibling",

	    /**
	     * Returns the sibling of a node (i.e., the first other child of the parent)
	     *
	     * @param node
	     * @returns {object}
	     */
	    value: function getSibling(node) {
	      if (!node.parent) {
	        return null;
	      }

	      return node.parent.children.find(function (child) {
	        return child !== node;
	      });
	    }
	    /**
	     * Returns a node from its id stored.
	     *
	     * @param id
	     * @returns {object}
	     */

	  }, {
	    key: "getNode",
	    value: function getNode(id) {
	      return this.nodeMap.get(id);
	    }
	    /**
	     * Returns an external node (tip) from its name.
	     *
	     * @param name
	     * @returns {object}
	     */

	  }, {
	    key: "getExternalNode",
	    value: function getExternalNode(name) {
	      return this.tipMap.get(name);
	    }
	    /**
	     * If heights are not currently known then calculate heights for all nodes
	     * then return the height of the specified node.
	     * @param node
	     * @returns {number}
	     */

	  }, {
	    key: "getHeight",
	    value: function getHeight(node) {
	      return node.height;
	    }
	  }, {
	    key: "preorder",

	    /**
	     * A generator function that returns the nodes in a pre-order traversal.
	     *
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function preorder() {
	      var startNode,
	          filter,
	          traverse,
	          _args2 = arguments;
	      return regenerator.wrap(function preorder$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              startNode = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : this.root;
	              filter = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : function () {
	                return true;
	              };
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node, filter) {
	                var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, child;

	                return regenerator.wrap(function traverse$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        if (!filter(node)) {
	                          _context.next = 29;
	                          break;
	                        }

	                        _context.next = 3;
	                        return node;

	                      case 3:
	                        if (!node.children) {
	                          _context.next = 29;
	                          break;
	                        }

	                        _iteratorNormalCompletion = true;
	                        _didIteratorError = false;
	                        _iteratorError = undefined;
	                        _context.prev = 7;
	                        _iterator = node.children[Symbol.iterator]();

	                      case 9:
	                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	                          _context.next = 15;
	                          break;
	                        }

	                        child = _step.value;
	                        return _context.delegateYield(traverse(child, filter), "t0", 12);

	                      case 12:
	                        _iteratorNormalCompletion = true;
	                        _context.next = 9;
	                        break;

	                      case 15:
	                        _context.next = 21;
	                        break;

	                      case 17:
	                        _context.prev = 17;
	                        _context.t1 = _context["catch"](7);
	                        _didIteratorError = true;
	                        _iteratorError = _context.t1;

	                      case 21:
	                        _context.prev = 21;
	                        _context.prev = 22;

	                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	                          _iterator["return"]();
	                        }

	                      case 24:
	                        _context.prev = 24;

	                        if (!_didIteratorError) {
	                          _context.next = 27;
	                          break;
	                        }

	                        throw _iteratorError;

	                      case 27:
	                        return _context.finish(24);

	                      case 28:
	                        return _context.finish(21);

	                      case 29:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, traverse, null, [[7, 17, 21, 29], [22,, 24, 28]]);
	              });
	              return _context2.delegateYield(traverse(startNode, filter), "t0", 4);

	            case 4:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, preorder, this);
	    })
	    /**
	     * A generator function that returns the nodes in a post-order traversal
	     *
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */

	  }, {
	    key: "postorder",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function postorder() {
	      var startNode,
	          filter,
	          traverse,
	          _args4 = arguments;
	      return regenerator.wrap(function postorder$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              startNode = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : this.root;
	              filter = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : function () {
	                return true;
	              };
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node, filter) {
	                var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, child;

	                return regenerator.wrap(function traverse$(_context3) {
	                  while (1) {
	                    switch (_context3.prev = _context3.next) {
	                      case 0:
	                        if (!filter(node)) {
	                          _context3.next = 29;
	                          break;
	                        }

	                        if (!node.children) {
	                          _context3.next = 27;
	                          break;
	                        }

	                        _iteratorNormalCompletion2 = true;
	                        _didIteratorError2 = false;
	                        _iteratorError2 = undefined;
	                        _context3.prev = 5;
	                        _iterator2 = node.children[Symbol.iterator]();

	                      case 7:
	                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
	                          _context3.next = 13;
	                          break;
	                        }

	                        child = _step2.value;
	                        return _context3.delegateYield(traverse(child, filter), "t0", 10);

	                      case 10:
	                        _iteratorNormalCompletion2 = true;
	                        _context3.next = 7;
	                        break;

	                      case 13:
	                        _context3.next = 19;
	                        break;

	                      case 15:
	                        _context3.prev = 15;
	                        _context3.t1 = _context3["catch"](5);
	                        _didIteratorError2 = true;
	                        _iteratorError2 = _context3.t1;

	                      case 19:
	                        _context3.prev = 19;
	                        _context3.prev = 20;

	                        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
	                          _iterator2["return"]();
	                        }

	                      case 22:
	                        _context3.prev = 22;

	                        if (!_didIteratorError2) {
	                          _context3.next = 25;
	                          break;
	                        }

	                        throw _iteratorError2;

	                      case 25:
	                        return _context3.finish(22);

	                      case 26:
	                        return _context3.finish(19);

	                      case 27:
	                        _context3.next = 29;
	                        return node;

	                      case 29:
	                      case "end":
	                        return _context3.stop();
	                    }
	                  }
	                }, traverse, null, [[5, 15, 19, 27], [20,, 22, 26]]);
	              });
	              return _context4.delegateYield(traverse(startNode, filter), "t0", 4);

	            case 4:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, postorder, this);
	    })
	    /**
	     * A generator function that returns the nodes in a path to the root
	     *
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */

	  }, {
	    key: "toNewick",

	    /**
	     * An instance method to return a Newick format string for the Tree. Can be called without a parameter to
	     * start at the root node. Providing another node will generate a subtree. Labels and branch lengths are
	     * included if available.
	     *
	     * @param {object} node - The node of the tree to be written (defaults as the rootNode).
	     * @returns {string}
	     */
	    value: function toNewick() {
	      var _this2 = this;

	      var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rootNode;
	      return (node.children ? "(".concat(node.children.map(function (child) {
	        return _this2.toNewick(child);
	      }).join(","), ")").concat(node.label ? node.label : "") : node.name) + (node.length ? ":".concat(node.length) : "");
	    }
	  }, {
	    key: "reroot",

	    /**
	     * Re-roots the tree at the midway point on the branch above the given node.
	     *
	     * @param {object} node - The node to be rooted on.
	     * @param proportion - proportion along the branch to place the root (default 0.5)
	     */
	    value: function reroot(node) {
	      var _this3 = this;

	      var proportion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

	      if (node === this.rootNode) {
	        // the node is the root - nothing to do
	        return;
	      }

	      var rootLength = this.rootNode.children[0].length + this.rootNode.children[1].length;

	      if (node.parent !== this.rootNode) {
	        (function () {
	          // the node is not a child of the existing root so the root is actually changing
	          var node0 = node;
	          var parent = node.parent;
	          var lineage = []; // was the node the first child in the parent's children?

	          var nodeAtTop = parent.children[0] === node;
	          var rootChild1 = node;
	          var rootChild2 = parent;
	          var oldLength = parent.length;

	          while (parent.parent) {
	            // remove the node that will becoming the parent from the children
	            parent.children = parent.children.filter(function (child) {
	              return child !== node0;
	            });

	            if (parent.parent === _this3.rootNode) {
	              var sibling = _this3.getSibling(parent);

	              parent.children.push(sibling);
	              sibling._length = rootLength;
	            } else {
	              // swap the parent and parent's parent's length around
	              var _ref = [oldLength, parent.parent.length];
	              parent.parent.length = _ref[0];
	              oldLength = _ref[1];
	              // add the new child
	              parent.children.push(parent.parent);
	            }

	            lineage = [parent].concat(toConsumableArray(lineage));
	            node0 = parent;
	            parent = parent.parent;
	          } // Reuse the root node as root...
	          // Set the order of the children to be the same as for the original parent of the node.
	          // This makes for a more visually consistent rerooting graphically.


	          _this3.rootNode.children = nodeAtTop ? [rootChild1, rootChild2] : [rootChild2, rootChild1]; // connect all the children to their parents

	          _this3.internalNodes.forEach(function (node) {
	            node.children.forEach(function (child) {
	              child.parent = node;
	            });
	          });

	          var l = rootChild1.length * proportion;
	          rootChild2._length = l;
	          rootChild1._length = rootChild1.length - l;
	        })();
	      } else {
	        // the root is staying the same, just the position of the root changing
	        var l = node.length * (1.0 - proportion);
	        node._length = l;
	        this.getSibling(node)._length = rootLength - l;
	      }

	      this.heightsKnown = false;
	      this.treeUpdateCallback();
	    }
	  }, {
	    key: "rotate",

	    /**
	     * Reverses the order of the children of the given node. If 'recursive=true' then it will
	     * descend down the subtree reversing all the sub nodes.
	     *
	     * @param node
	     * @param recursive
	     */
	    value: function rotate(node) {
	      var recursive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	      if (node.children) {
	        if (recursive) {
	          var _iteratorNormalCompletion3 = true;
	          var _didIteratorError3 = false;
	          var _iteratorError3 = undefined;

	          try {
	            for (var _iterator3 = node.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	              var child = _step3.value;
	              this.rotate(child, recursive);
	            }
	          } catch (err) {
	            _didIteratorError3 = true;
	            _iteratorError3 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
	                _iterator3["return"]();
	              }
	            } finally {
	              if (_didIteratorError3) {
	                throw _iteratorError3;
	              }
	            }
	          }
	        }

	        node.children.reverse();
	      }

	      this.treeUpdateCallback();
	    }
	  }, {
	    key: "orderByNodeDensity",

	    /**
	     * Sorts the child branches of each node in order of increasing or decreasing number
	     * of tips. This operates recursively from the node given.
	     *
	     * @param node - the node to start sorting from
	     * @param {boolean} increasing - sorting in increasing node order or decreasing?
	     * @returns {number} - the number of tips below this node
	     */
	    value: function orderByNodeDensity() {
	      var increasing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.rootNode;
	      var factor = increasing ? 1 : -1;
	      orderNodes.call(this, node, function (nodeA, countA, nodeB, countB) {
	        return (countA - countB) * factor;
	      });
	      this.treeUpdateCallback();
	    }
	    /**
	     * Sorts the child branches of each node in order given by the function. This operates
	     * recursively from the node given.
	     *
	     * @param node - the node to start sorting from
	     * @param {function} ordering - provides a pairwise sorting order.
	     *  Function signature: (nodeA, childCountNodeA, nodeB, childCountNodeB)
	     * @returns {number} - the number of tips below this node
	     */

	  }, {
	    key: "order",
	    value: function order(ordering) {
	      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.rootNode;
	      orderNodes.call(this, node, ordering);
	      this.treeUpdateCallback();
	    }
	  }, {
	    key: "lastCommonAncestor",
	    value: function lastCommonAncestor(node1, node2) {
	      var path1 = toConsumableArray(Tree.pathToRoot(node1));

	      var path2 = toConsumableArray(Tree.pathToRoot(node2));

	      var sharedAncestors = path1.filter(function (n1) {
	        return path2.map(function (n2) {
	          return n2.id;
	        }).indexOf(n1.id) > -1;
	      });
	      var lastSharedAncestor = sharedAncestors.reduce(function (acc, curr) {
	        return acc = acc.level > curr.level ? acc : curr;
	      });
	      return lastSharedAncestor;
	    }
	  }, {
	    key: "pathLength",
	    value: function pathLength(node1, node2) {
	      var sum = 0;
	      var mrca = this.lastCommonAncestor(node1, node2);

	      for (var _i = 0, _arr = [node1, node2]; _i < _arr.length; _i++) {
	        var node = _arr[_i];

	        while (node != mrca) {
	          sum += node.length;
	          node = node.parent;
	        }
	      }

	      return sum;
	    }
	    /**
	     * Returns a new tree instance with  only the nodes provided and their path to the root. After this traversal, unspecified
	     * degree two nodes will be remove. The subtree will consist of the root and then the last common ancestor.
	     * The nodes of the new tree will be copies of the those in the original, but they will share
	     * ids, annotations, and names.
	     * @param chosenNodes
	     * @return {Tree}
	     */

	  }, {
	    key: "subTree",
	    value: function subTree(chosenNodes) {
	      var _this4 = this;

	      var sharedNodes = toConsumableArray(chosenNodes.map(function (node) {
	        return toConsumableArray(Tree.pathToRoot(node));
	      })) // get all the paths to the root
	      .reduce(function (acc, curr) {
	        return [].concat(toConsumableArray(acc), toConsumableArray(curr));
	      }, []) // unpack the paths
	      .filter(function (node, i, all) {
	        return all.filter(function (x) {
	          return x === node;
	        }).length > 1;
	      }) // filter to nodes that appear in more than one path
	      .reduce(function (acc, curr) {
	        // reduce to the unique set.
	        if (!acc.includes(curr)) {
	          acc.push(curr);
	        }

	        return acc;
	      }, []);

	      var newNodesObjects = [].concat(toConsumableArray(sharedNodes), toConsumableArray(chosenNodes.filter(function (n) {
	        return !sharedNodes.includes(n);
	      }))).map(function (node) {
	        var newNodeObject = {
	          id: node.id,
	          annotations: node.annotations
	        };

	        if (node.name) {
	          newNodeObject.name = node.name;
	        }

	        return newNodeObject;
	      });
	      var newNodeMap = new Map(newNodesObjects.map(function (n) {
	        return [n.id, n];
	      })); // set children set lengths

	      newNodesObjects.forEach(function (node) {
	        var currentNode = _this4.nodeMap.get(node.id);

	        var length = 0;

	        while (currentNode.parent && !newNodeMap.has(currentNode.parent.id)) {
	          length += currentNode.length;
	          currentNode = currentNode.parent;
	        }

	        length += currentNode.length;
	        var parent = currentNode.parent ? newNodeMap.get(currentNode.parent.id) : null;
	        node.parent = parent;
	        node.length = length;

	        if (parent) {
	          parent.children = parent.children ? parent.children.concat(node) : [node];
	        }
	      }); // intermediate nodes with show up as

	      var subtree = new Tree(newNodeMap.get(this.root.id)); // now remove degree 2 nodes that were not specified;

	      toConsumableArray(subtree.postorder()).forEach(function (node) {
	        if (node.children) {
	          if (node.children.length === 1) {
	            if (!chosenNodes.map(function (n) {
	              return n.id;
	            }).includes(node.id)) {
	              subtree.removeNode(node);
	            }
	          }
	        }
	      });

	      return subtree;
	    }
	    /**
	     * Gives the distance from the root to a given tip (external node).
	     * @param tip - the external node
	     * @returns {number}
	     */

	  }, {
	    key: "rootToTipLength",
	    value: function rootToTipLength(tip) {
	      var length = 0.0;
	      var _iteratorNormalCompletion4 = true;
	      var _didIteratorError4 = false;
	      var _iteratorError4 = undefined;

	      try {
	        for (var _iterator4 = Tree.pathToRoot(tip)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	          var node = _step4.value;

	          if (node.length) {
	            length += node.length;
	          }
	        }
	      } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
	            _iterator4["return"]();
	          }
	        } finally {
	          if (_didIteratorError4) {
	            throw _iteratorError4;
	          }
	        }
	      }

	      return length;
	    }
	    /**
	     * Returns an array of root-to-tip distances for each tip in the tree.
	     * @returns {*}
	     */

	  }, {
	    key: "rootToTipLengths",
	    value: function rootToTipLengths() {
	      var _this5 = this;

	      return this.externalNodes.map(function (tip) {
	        return _this5.rootToTipLength(tip);
	      });
	    }
	    /**
	     * Splits each branch in multiple segments inserting a new degree 2 nodes. If splitLocations is
	     * null then it splits each in two at the mid-point
	     * @param splits
	     */

	  }, {
	    key: "splitBranches",
	    value: function splitBranches() {
	      var _this6 = this;

	      var splits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      // split each branch into sections, with a node of
	      // degree two in the middle. This allows annotation
	      // of part of a branch.
	      toConsumableArray(this.preorder()).filter(function (node) {
	        return node.parent;
	      }).forEach(function (node) {
	        if (splits !== null) {
	          if (splits[node.id]) {
	            var splitNode = node;
	            splits[node.id].forEach(function (_ref2) {
	              var _ref3 = slicedToArray(_ref2, 2),
	                  time = _ref3[0],
	                  id = _ref3[1];

	              splitNode = _this6.splitBranch(splitNode, time);
	              splitNode.id = id;
	            });
	          }
	        } else {
	          // if no splitLocations are given then split it in the middle.
	          _this6.splitBranch(node, 0.5);
	        }
	      });

	      this.treeUpdateCallback();
	    }
	    /**
	     * Splits a branch in two inserting a new degree 2 node. The splitLocation should be less than
	     * the orginal branch length.
	     * @param node
	     * @param splitLocation - proportion of branch to split at.
	     */

	  }, {
	    key: "splitBranch",
	    value: function splitBranch(node) {
	      var splitLocation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
	      var oldLength = node.length;
	      var splitNode = makeNode.call(this, {
	        parent: node.parent,
	        children: [node],
	        length: oldLength * splitLocation,
	        annotations: {
	          insertedNode: true
	        }
	      });

	      if (node.parent) {
	        node.parent.children[node.parent.children.indexOf(node)] = splitNode;
	      } else {
	        // node is the root so make splitNode the root
	        this.root = splitNode;
	      }

	      node.parent = splitNode;
	      node._length = oldLength - splitNode.length;
	      this.nodesUpdated = true;
	      return splitNode;
	    }
	    /**
	     * Deletes a node from the tree. if the node had children the children are linked to the
	     * node's parent. This could result in a multifurcating tree.
	     * The root node can not be deleted.
	     * @param node
	     */

	  }, {
	    key: "removeNode",
	    value: function removeNode(node) {
	      if (node === this.root) {
	        return;
	      } // remove the node from it's parent's children


	      node.parent._children = node.parent._children.filter(function (n) {
	        return n !== node;
	      }); //update child lengths

	      if (node._children) {
	        node._children.forEach(function (child) {
	          child._length += node.length;
	          child.parent = node.parent; // This also updates parent's children array;
	        });
	      } else {
	        console.log("removing parent");
	        this.removeNode(node.parent); // if it's a tip then remove it's parent which is now degree two;
	      }

	      this.nodesUpdated = true;
	    }
	    /**
	     * Set one or more annotations for the tips.
	     *
	     * See annotateNode for a description of the annotation structure.
	     *
	     * @param annotations a dictionary of annotations keyed by tip label
	     */

	  }, {
	    key: "annotateTips",
	    value: function annotateTips(annotations) {
	      for (var _i2 = 0, _Object$entries = Object.entries(annotations); _i2 < _Object$entries.length; _i2++) {
	        var _Object$entries$_i = slicedToArray(_Object$entries[_i2], 2),
	            key = _Object$entries$_i[0],
	            values = _Object$entries$_i[1];

	        var tip = this.getExternalNode(key);

	        if (!tip) {
	          throw new Error("tip with label ".concat(key, " not found in tree"));
	        }

	        this.annotateNode(tip, values);
	      }

	      this.treeUpdateCallback();
	    }
	    /**
	     * This is similar to annotateTips but the annotation objects are keyed by node
	     * keys (Symbols).
	     *
	     * @param annotations a dictionary of annotations keyed by node key
	     */

	  }, {
	    key: "annotateNodes",
	    value: function annotateNodes(annotations) {
	      for (var _i3 = 0, _Object$entries2 = Object.entries(annotations); _i3 < _Object$entries2.length; _i3++) {
	        var _Object$entries2$_i = slicedToArray(_Object$entries2[_i3], 2),
	            key = _Object$entries2$_i[0],
	            values = _Object$entries2$_i[1];

	        var node = this.getNode(key);

	        if (!node) {
	          throw new Error("tip with key ".concat(key, " not found in tree"));
	        }

	        this.annotateNode(node, values);
	      }

	      this.treeUpdateCallback();
	    }
	    /**
	     * Adds the given annotations to a particular node object.
	     *
	     * The annotations is an object with properties keyed by external node labels each
	     * of which is an object with key value pairs for the annotations. The
	     * key value pairs will be added to a property called 'annotations' in the node.
	     *
	     * Boolean or Numerical traits are given as a single value.
	     * Sets of values with probabilities should be given as an object.
	     * Discrete values should be given as an array (even if containing only one value)
	     * or an object with booleans to give the full set of possible trait values.
	     *
	     * For example:
	     *
	     * {
	     *     'tip_1': {
	     *         'trait_1' : true,
	     *         'trait_4' : 3.141592,
	     *         'trait_2' : [1, 2], // discrete trait
	     *         'trait_3' : ["London", "Paris", "New York"], // discrete trait
	     *         'trait_3' : {"London" : true, "Paris" : false, "New York": false], // discrete trait with full set of values
	     *         'trait_4' : {"London" : 0.75, "Paris" : 0.20, "New York": 0.05} // probability set
	     *     },
	     *     'tip_2': {...}
	     * }
	     *
	     * The annotation labels, type and possible values are also added to the tree in a property called 'annotations'.
	     *
	     * A reconstruction method such as annotateNodesFromTips can then be used to provide reconstructed values
	     * for internal nodes. Or annotateNodes can provide annotations for any node in the tree.
	     *
	     * @param node
	     * @param annotations a dictionary of annotations keyed by the annotation name.
	     */

	  }, {
	    key: "annotateNode",
	    value: function annotateNode(node, annotations) {
	      this.addAnnotations(annotations); // add the annotations to the existing annotations object for the node object

	      node.annotations = objectSpread({}, node.annotations === undefined ? {} : node.annotations, annotations);
	    }
	    /**
	     * Adds the annotation information to the tree. This stores the type and possible values
	     * for each annotation seen in the nodes of the tree.
	     *
	     * This methods also checks the values are correct and conform to previous annotations
	     * in type.
	     *
	     * @param annotations
	     */

	  }, {
	    key: "addAnnotations",
	    value: function addAnnotations(annotations) {
	      for (var _i4 = 0, _Object$entries3 = Object.entries(annotations); _i4 < _Object$entries3.length; _i4++) {
	        var _Object$entries3$_i = slicedToArray(_Object$entries3[_i4], 2),
	            key = _Object$entries3$_i[0],
	            addValues = _Object$entries3$_i[1];

	        var annotation = this.annotations[key];

	        if (!annotation) {
	          annotation = {};
	          this.annotations[key] = annotation;
	        }

	        if (Array.isArray(addValues)) {
	          // is a set of  values
	          var type = void 0;

	          if (addValues.map(function (v) {
	            return isNaN(v);
	          }).reduce(function (acc, curr) {
	            return acc && curr;
	          }, true)) {
	            var _annotation$values;

	            type = Type.DISCRETE;
	            annotation.type = type;

	            if (!annotation.values) {
	              annotation.values = new Set();
	            }

	            (_annotation$values = annotation.values).add.apply(_annotation$values, toConsumableArray(addValues));
	          } else if (addValues.map(function (v) {
	            return parseFloat(v);
	          }).reduce(function (acc, curr) {
	            return acc && Number.isInteger(curr);
	          }, true)) {
	            type = Type.INTEGER;
	          } else if (addValues.map(function (v) {
	            return parseFloat(v);
	          }).reduce(function (acc, curr) {
	            return acc && !Number.isInteger(curr);
	          }, true)) {
	            type = Type.FLOAT;
	          }

	          if (annotation.type && annotation.type !== type) {
	            if (type === Type.INTEGER && annotation.type === Type.FLOAT || type === Type.FLOAT && annotation.type === Type.INTEGER) {
	              // upgrade to float
	              type = Type.FLOAT;
	              annotation.type = Type.FLOAT;

	              if (annotation.values) {
	                delete annotation.values;
	              } else {
	                throw Error("existing values of the annotation, ".concat(key, ", in the tree is discrete."));
	              }
	            }
	          } // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]

	        } else if (Object.isExtensible(addValues)) {
	          // is a set of properties with values
	          var _type = null;
	          var sum = 0.0;
	          var keys = [];

	          for (var _i5 = 0, _Object$entries4 = Object.entries(addValues); _i5 < _Object$entries4.length; _i5++) {
	            var _Object$entries4$_i = slicedToArray(_Object$entries4[_i5], 2),
	                _key = _Object$entries4$_i[0],
	                value = _Object$entries4$_i[1];

	            if (keys.includes(_key)) {
	              throw Error("the states of annotation, ".concat(_key, ", should be unique"));
	            }

	            if (_typeof_1(value) === _typeof_1(1.0)) {
	              // This is a vector of probabilities of different states
	              _type = _type === undefined ? Type.PROBABILITIES : _type;

	              if (_type === Type.DISCRETE) {
	                throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	              }

	              sum += value;

	              if (sum > 1.01) {
	                throw Error("the values of annotation, ".concat(_key, ", should be probabilities of states and add to 1.0"));
	              }
	            } else if (_typeof_1(value) === _typeof_1(true)) {
	              _type = _type === undefined ? Type.DISCRETE : _type;

	              if (_type === Type.PROBABILITIES) {
	                throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	              }
	            } else {
	              throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	            }

	            keys.push(_key);
	          }

	          if (annotation.type && annotation.type !== _type) {
	            throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
	          }

	          annotation.type = _type;
	          annotation.values = annotation.values ? [].concat(toConsumableArray(annotation.values), [addValues]) : [addValues];
	        } else {
	          var _type2 = Type.DISCRETE;

	          if (_typeof_1(addValues) === _typeof_1(true)) {
	            _type2 = Type.BOOLEAN;
	          } else if (!isNaN(addValues)) {
	            _type2 = addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT;
	          }

	          if (annotation.type && annotation.type !== _type2) {
	            if (_type2 === Type.INTEGER && annotation.type === Type.FLOAT || _type2 === Type.FLOAT && annotation.type === Type.INTEGER) {
	              // upgrade to float
	              _type2 = Type.FLOAT;
	            } else {
	              throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
	            }
	          }

	          if (_type2 === Type.DISCRETE) {
	            if (!annotation.values) {
	              annotation.values = new Set();
	            }

	            annotation.values.add(addValues);
	          }

	          annotation.type = _type2;
	        } // overwrite the existing annotation property


	        this.annotations[key] = annotation;
	      }
	    }
	    /**
	     * Uses parsimony to label internal nodes to reconstruct the internal node states
	     * for the annotation 'name'.
	     *
	     * @param name
	     * @param acctrans Use acctrans reconstruction if true, deltrans otherwise
	     * @param node
	     */

	  }, {
	    key: "annotateNodesFromTips",
	    value: function annotateNodesFromTips(name) {
	      var acctran = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	      fitchParsimony(name, this.rootNode);
	      reconstructInternalStates(name, [], acctran, this.rootNode);
	      this.treeUpdateCallback();
	    }
	    /**
	     * A class method to create a Tree instance from a Newick format string (potentially with node
	     * labels and branch lengths). Taxon labels should be quoted (either " or ') if they contain whitespace
	     * or any of the tree definitition characters '(),:;' - the quotes (and any whitespace immediately within)
	     * will be removed.
	     * @param newickString - the Newick format tree as a string
	     * @param labelName
	     * @param datePrefix
	     * @returns {Tree} - an instance of the Tree class
	     */

	  }, {
	    key: "rootNode",

	    /**
	     * Gets the root node of the Tree
	     *
	     * @returns {Object|*}
	     */
	    get: function get() {
	      return this.root;
	    }
	  }, {
	    key: "nodes",

	    /**
	     * Gets an array containing all the node objects
	     *
	     * @returns {*}
	     */
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return toConsumableArray(this.preorder());
	    }
	  }, {
	    key: "nodeList",
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return this.nodes;
	    }
	    /**
	     * Gets an array containing all the external node objects
	     *
	     * @returns {*}
	     */

	  }, {
	    key: "externalNodes",
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return this.nodes.filter(function (node) {
	        return !node.children;
	      });
	    }
	  }, {
	    key: "internalNodes",

	    /**
	     * Gets an array containing all the internal node objects
	     *
	     * @returns {*}
	     */
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return this.nodes.filter(function (node) {
	        return node.children;
	      });
	    }
	  }, {
	    key: "nodeMap",
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return this._nodeMap;
	    }
	  }, {
	    key: "tipMap",
	    get: function get() {
	      if (this.nodesUpdated) {
	        setUpArraysAndMaps.call(this);
	      }

	      return this._tipMap;
	    }
	  }, {
	    key: "origin",
	    set: function set(value) {
	      this._origin = value;
	      this.heightsKnown = false;
	    },
	    get: function get() {
	      return this._origin;
	    }
	  }], [{
	    key: "pathToRoot",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function pathToRoot(node) {
	      return regenerator.wrap(function pathToRoot$(_context5) {
	        while (1) {
	          switch (_context5.prev = _context5.next) {
	            case 0:
	              if (!node) {
	                _context5.next = 6;
	                break;
	              }

	              _context5.next = 3;
	              return node;

	            case 3:
	              node = node.parent;
	              _context5.next = 0;
	              break;

	            case 6:
	            case "end":
	              return _context5.stop();
	          }
	        }
	      }, pathToRoot);
	    })
	  }, {
	    key: "parseNewick",
	    value: function parseNewick(newickString) {
	      var labelName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "label";
	      var datePrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
	      var tokens = newickString.split(/\s*('[^']+'|"[^"]+"|;|\(|\)|,|:|=|\[&|\]|\{|\})\s*/);
	      var level = 0;
	      var currentNode = null;
	      var nodeStack = [];
	      var labelNext = false;
	      var lengthNext = false;
	      var inAnnotation = false;
	      var annotationKeyNext = true;
	      var annotationKey;
	      var isAnnotationARange = false;
	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;

	      try {
	        for (var _iterator5 = tokens.filter(function (token) {
	          return token.length > 0;
	        })[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          var token = _step5.value;

	          // console.log(`Token ${i}: ${token}, level: ${level}`);
	          if (inAnnotation) {
	            if (token === "=") {
	              annotationKeyNext = false;
	            } else if (token === ",") {
	              if (!isAnnotationARange) {
	                annotationKeyNext = true;
	              }
	            } else if (token === "{") {
	              isAnnotationARange = true;
	              currentNode.annotations[annotationKey] = [];
	            } else if (token === "}") {
	              isAnnotationARange = false;
	            } else if (token === "]") {
	              // close BEAST annotation
	              inAnnotation = false;
	              annotationKeyNext = true;
	            } else {
	              // must be annotation
	              // remove any quoting and then trim whitespace
	              var annotationToken = token;

	              if (annotationToken.startsWith("\"") || annotationToken.startsWith("'")) {
	                annotationToken = annotationToken.substr(1);
	              }

	              if (annotationToken.endsWith("\"") || annotationToken.endsWith("'")) {
	                annotationToken = annotationToken.substr(0, annotationToken.length - 1);
	              }

	              if (annotationKeyNext) {
	                annotationKey = annotationToken.replace(".", "_");
	              } else {
	                if (isAnnotationARange) {
	                  currentNode.annotations[annotationKey].push(annotationToken);
	                } else {
	                  if (isNaN(annotationToken)) {
	                    currentNode.annotations[annotationKey] = annotationToken;
	                  } else {
	                    currentNode.annotations[annotationKey] = parseFloat(annotationToken);
	                  }
	                }
	              }
	            }
	          } else if (token === "(") {
	            // an internal node
	            if (labelNext) {
	              // if labelNext is set then the last bracket has just closed
	              // so there shouldn't be an open bracket.
	              throw new Error("expecting a comma");
	            }

	            var node = {
	              level: level,
	              parent: currentNode,
	              children: [],
	              annotations: {}
	            };
	            level += 1;

	            if (currentNode) {
	              nodeStack.push(currentNode);
	            }

	            currentNode = node;
	          } else if (token === ",") {
	            // another branch in an internal node
	            labelNext = false; // labels are optional

	            if (lengthNext) {
	              throw new Error("branch length missing");
	            }

	            var parent = nodeStack.pop();
	            parent.children.push(currentNode);
	            currentNode = parent;
	          } else if (token === ")") {
	            // finished an internal node
	            labelNext = false; // labels are optional

	            if (lengthNext) {
	              throw new Error("branch length missing");
	            } // the end of an internal node


	            var _parent = nodeStack.pop();

	            _parent.children.push(currentNode);

	            level -= 1;
	            currentNode = _parent;
	            labelNext = true;
	          } else if (token === ":") {
	            labelNext = false; // labels are optional

	            lengthNext = true;
	          } else if (token === ";") {
	            // end of the tree, check that we are back at level 0
	            if (level > 0) {
	              throw new Error("unexpected semi-colon in tree");
	            }

	            break;
	          } else if (token === "[&") {
	            inAnnotation = true;
	          } else {
	            // not any specific token so may be a label, a length, or an external node name
	            if (lengthNext) {
	              currentNode.length = parseFloat(token);
	              lengthNext = false;
	            } else if (labelNext) {
	              currentNode.label = token;

	              if (!currentNode.label.startsWith("#")) {
	                var value = parseFloat(currentNode.label);

	                if (isNaN(value)) {
	                  value = currentNode.label;
	                }

	                currentNode.annotations[labelName] = value;
	              } else {
	                currentNode.id = currentNode.label.substring(1);
	              }

	              labelNext = false;
	            } else {
	              // an external node
	              if (!currentNode.children) {
	                currentNode.children = [];
	              }

	              var name = token; // remove any quoting and then trim whitespace

	              if (name.startsWith("\"") || name.startsWith("'")) {
	                name = name.substr(1);
	              }

	              if (name.endsWith("\"") || name.endsWith("'")) {
	                name = name.substr(0, name.length - 1);
	              }

	              name = name.trim();
	              var date = undefined;

	              if (datePrefix) {
	                var parts = name.split(datePrefix);

	                if (parts.length === 0) {
	                  throw new Error("the tip, ".concat(name, ", doesn't have a date separated by the prefix, '").concat(datePrefix, "'"));
	                }

	                date = parseFloat(parts[parts.length - 1]);
	              }

	              var externalNode = {
	                name: name,
	                parent: currentNode,
	                annotations: {
	                  date: date
	                }
	              };

	              if (currentNode) {
	                nodeStack.push(currentNode);
	              }

	              currentNode = externalNode;
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
	            _iterator5["return"]();
	          }
	        } finally {
	          if (_didIteratorError5) {
	            throw _iteratorError5;
	          }
	        }
	      }

	      if (level > 0) {
	        throw new Error("the brackets in the newick file are not balanced");
	      }

	      return new Tree(currentNode);
	    }
	  }, {
	    key: "parseNexus",

	    /*
	      */
	    value: function parseNexus(nexus) {
	      var trees = [];
	      var nexusTokens = nexus.split(/\s*Begin|begin|end|End|BEGIN|END\s*/);
	      var firstToken = nexusTokens.shift().trim();

	      if (firstToken.toLowerCase() !== '#nexus') {
	        throw Error("File does not begin with #NEXUS is it a nexus file?");
	      }

	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;

	      try {
	        for (var _iterator6 = nexusTokens[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var section = _step6.value;
	          var workingSection = section.split(/\n/);
	          var sectionTitle = workingSection.shift();

	          if (sectionTitle.toLowerCase().trim() === "trees;") {
	            (function () {
	              var inTaxaMap = false;
	              var tipNameMap = new Map();
	              var _iteratorNormalCompletion7 = true;
	              var _didIteratorError7 = false;
	              var _iteratorError7 = undefined;

	              try {
	                for (var _iterator7 = workingSection[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	                  var token = _step7.value;

	                  if (token.trim().toLowerCase() === "translate") {
	                    inTaxaMap = true;
	                  } else {
	                    if (inTaxaMap) {
	                      if (token.trim() === ";") {
	                        inTaxaMap = false;
	                      } else {
	                        var taxaData = token.trim().replace(",", "").split(/\s*\s\s*/);
	                        tipNameMap.set(taxaData[0], taxaData[1]);
	                      }
	                    } else {
	                      if (tipNameMap.size > 0) {
	                        var treeString = token.substring(token.indexOf("("));
	                        var thisTree = Tree.parseNewick(treeString);
	                        thisTree.externalNodes.forEach(function (tip) {
	                          return tip.name = tipNameMap.get(tip.name);
	                        });
	                        trees.push(thisTree);
	                      }
	                    }
	                  }
	                }
	              } catch (err) {
	                _didIteratorError7 = true;
	                _iteratorError7 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
	                    _iterator7["return"]();
	                  }
	                } finally {
	                  if (_didIteratorError7) {
	                    throw _iteratorError7;
	                  }
	                }
	              }
	            })();
	          }
	        }
	      } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
	            _iterator6["return"]();
	          }
	        } finally {
	          if (_didIteratorError6) {
	            throw _iteratorError6;
	          }
	        }
	      }

	      return trees;
	    }
	  }]);

	  return Tree;
	}();
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * A private recursive function that rotates nodes to give an ordering provided
	 * by a function.
	 * @param node
	 * @param ordering function that takes (a,number of tips form a, b, number of tips from b) and sorts a and be by the output.
	 * @param callback an optional callback that is called each rotate
	 * @returns {number}
	 */

	function orderNodes(node, ordering) {
	  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	  var count = 0;

	  if (node.children) {
	    // count the number of descendents for each child
	    var counts = new Map();
	    var _iteratorNormalCompletion8 = true;
	    var _didIteratorError8 = false;
	    var _iteratorError8 = undefined;

	    try {
	      for (var _iterator8 = node.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	        var child = _step8.value;
	        var value = orderNodes(child, ordering, callback);
	        counts.set(child, value);
	        count += value;
	      } // sort the children using the provided function

	    } catch (err) {
	      _didIteratorError8 = true;
	      _iteratorError8 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
	          _iterator8["return"]();
	        }
	      } finally {
	        if (_didIteratorError8) {
	          throw _iteratorError8;
	        }
	      }
	    }

	    node.children.sort(function (a, b) {
	      return ordering(a, counts.get(a), b, counts.get(b));
	    });
	    if (callback) callback();
	  } else {
	    count = 1;
	  }

	  return count;
	}
	/**
	 * A private recursive function that calculates the height of each node (with the most
	 * diverged tip from the root having height given by origin).
	 * @param origin
	 */


	function calculateHeights() {
	  var _this7 = this;

	  var maxRTT = max(this.rootToTipLengths());
	  this.nodeList.forEach(function (node) {
	    return node._height = _this7.origin - _this7.offset - (maxRTT - _this7.rootToTipLength(node));
	  });
	  this.heightsKnown = true;
	  this.treeUpdateCallback();
	}
	/**
	 * A private recursive function that calculates the length of the branch below each node
	 */


	function calculateLengths() {
	  this.nodeList.forEach(function (node) {
	    return node.length = node.parent ? node.height - node.parent.height : 0;
	  });
	  this.lengthsKnown = true;
	  this.treeUpdateCallback();
	}
	/**
	 * A private recursive function that uses the Fitch algorithm to assign
	 * states to nodes using parsimony. An acctrans or deltrans algorithm can
	 * then be used to reconstruct internal node states.
	 * @param name
	 * @param node
	 * @returns {*}
	 */


	function fitchParsimony(name, node) {
	  if (!node.children) {
	    if (!node.annotations[name]) {
	      return []; // annotation not defined so return an empty set
	    }

	    return Array.isArray(node.annotations[name]) ? node.annotations[name] : [node.annotations[name]];
	  }

	  var I;
	  var U = [];
	  node.children.forEach(function (child) {
	    var childStates = fitchParsimony(name, child);
	    U = [].concat(toConsumableArray(U), toConsumableArray(childStates.filter(function (state) {
	      return !U.includes(state);
	    }))); // take the union

	    I = I === undefined ? childStates : childStates.filter(function (state) {
	      return I.includes(state);
	    }); // take the intersection
	  });
	  node.annotations = node.annotations === undefined ? {} : node.annotations; // set the node annotation to the intersection if not empty, the union otherwise

	  node.annotations[name] = toConsumableArray(I.length > 0 ? I : U);
	  return node.annotations[name];
	}

	function reconstructInternalStates(name, parentStates, acctran, node) {
	  var nodeStates = node.annotations[name];

	  if (!Array.isArray(nodeStates)) {
	    nodeStates = [nodeStates];
	  }

	  if (node.children) {
	    var stateCounts = {};
	    nodeStates.forEach(function (state) {
	      return stateCounts[state] = stateCounts[state] ? stateCounts[state] += 1 : 1;
	    });
	    parentStates.forEach(function (state) {
	      return stateCounts[state] = stateCounts[state] ? stateCounts[state] += 1 : 1;
	    });
	    node.children.forEach(function (child) {
	      reconstructInternalStates(name, nodeStates, acctran, child).forEach(function (state) {
	        return stateCounts[state] = stateCounts[state] ? stateCounts[state] += 1 : 1;
	      });
	    });
	    var _max = Object.entries(stateCounts).reduce(function (prev, current) {
	      return prev[1] > current[1] ? prev : current;
	    })[1];
	    nodeStates = Object.entries(stateCounts).filter(function (_ref4) {
	      var _ref5 = slicedToArray(_ref4, 2),
	          state = _ref5[0],
	          count = _ref5[1];

	      return count === _max;
	    }).map(function (_ref6) {
	      var _ref7 = slicedToArray(_ref6, 2),
	          state = _ref7[0],
	          count = _ref7[1];

	      return state;
	    });
	    node.annotations[name] = nodeStates.length === 1 ? nodeStates[0] : nodeStates;
	  }

	  return nodeStates;
	}

	function makeNode(nodeData) {
	  return new Node(objectSpread({}, nodeData, {
	    tree: this
	  }));
	}
	/**
	 * A private function that sets up the tree by traversing from the root Node and sets all heights and lenghts
	 * @param node
	 */


	function setUpNodes(node) {
	  if (node.children) {
	    var childrenNodes = [];
	    var _iteratorNormalCompletion10 = true;
	    var _didIteratorError10 = false;
	    var _iteratorError10 = undefined;

	    try {
	      for (var _iterator10 = node.children[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	        var child = _step10.value;
	        var childNode = makeNode.call(this, objectSpread({}, child, {
	          parent: node
	        }));
	        childrenNodes.push(childNode);
	        setUpNodes.call(this, childNode);
	      }
	    } catch (err) {
	      _didIteratorError10 = true;
	      _iteratorError10 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
	          _iterator10["return"]();
	        }
	      } finally {
	        if (_didIteratorError10) {
	          throw _iteratorError10;
	        }
	      }
	    }

	    node.children = childrenNodes;
	  }
	}

	function setUpArraysAndMaps() {
	  var _this8 = this;

	  this._nodeList = toConsumableArray(this.preorder());
	  this.nodesUpdated = false;

	  this._nodeList.forEach(function (node) {
	    if (node.label && node.label.startsWith("#")) {
	      // an id string has been specified in the newick label.
	      node.id = node.label.substring(1);
	    }

	    if (node.annotations) {
	      _this8.addAnnotations(node.annotations);
	    }
	  });

	  this._nodeMap = new Map(this.nodeList.map(function (node) {
	    return [node.id, node];
	  }));
	  this._tipMap = new Map(this.externalNodes.map(function (tip) {
	    return [tip.name, tip];
	  }));
	}

	var Node =
	/*#__PURE__*/
	function () {
	  createClass(Node, null, [{
	    key: "DEFAULT_NODE",
	    value: function DEFAULT_NODE() {
	      return {
	        height: undefined,
	        length: undefined,
	        name: null,
	        annotations: {},
	        parent: undefined,
	        children: null,
	        label: undefined,
	        level: undefined,
	        id: "node-".concat(uuid_1.v4())
	      };
	    }
	  }]);

	  function Node() {
	    var nodeData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Node);

	    var data = objectSpread({}, Node.DEFAULT_NODE(), nodeData);

	    this._id = data.id;
	    this._height = data.height;
	    this._length = data.length;
	    this._name = data.name;
	    this._annotations = data.annotations;
	    this._parent = data.parent;
	    this._children = data.children;
	    this._tree = data.tree;
	    this._label = data.label;
	    this._level = data.level;
	  }

	  createClass(Node, [{
	    key: "addChild",
	    value: function addChild(node) {
	      var newNode = new Node(node);
	      this.children = [].concat(toConsumableArray(this._children), [newNode]);

	      this._tree.addAnnotations(newNode.annotations);
	    }
	  }, {
	    key: "level",
	    get: function get() {
	      return this._level;
	    },
	    set: function set(value) {
	      this._level = value;
	    }
	  }, {
	    key: "name",
	    get: function get() {
	      return this._name;
	    },
	    set: function set(value) {
	      this._name = value;
	    }
	  }, {
	    key: "label",
	    get: function get() {
	      return this._label;
	    },
	    set: function set(value) {
	      this._label = value;
	    }
	  }, {
	    key: "height",
	    get: function get() {
	      if (!this._tree.heightsKnown) {
	        calculateHeights.call(this._tree);
	      }

	      return this._height;
	    },
	    set: function set(value) {
	      this._height = value;
	      this._tree.lengthsKnown = false;

	      this._tree.treeUpdateCallback();
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      if (!this._tree.lengthsKnown) {
	        calculateLengths.call(this._tree);
	      }

	      return this._length;
	    },
	    set: function set(value) {
	      this._length = value;
	      this._tree.heightsKnown = false;

	      this._tree.treeUpdateCallback();
	    }
	  }, {
	    key: "annotations",
	    get: function get() {
	      return this._annotations;
	    },
	    set: function set(value) {
	      this._annotations = value;
	    }
	  }, {
	    key: "children",
	    get: function get() {
	      return this._children;
	    },
	    set: function set(value) {
	      this._children = value;
	      var _iteratorNormalCompletion11 = true;
	      var _didIteratorError11 = false;
	      var _iteratorError11 = undefined;

	      try {
	        for (var _iterator11 = this._children[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	          var child = _step11.value;
	          child.parent = this;
	        }
	      } catch (err) {
	        _didIteratorError11 = true;
	        _iteratorError11 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
	            _iterator11["return"]();
	          }
	        } finally {
	          if (_didIteratorError11) {
	            throw _iteratorError11;
	          }
	        }
	      }

	      this._tree.nodesUpdated = true;
	    }
	  }, {
	    key: "parent",
	    get: function get() {
	      return this._parent;
	    },
	    set: function set(node) {
	      var _this9 = this;

	      this._parent = node;

	      if (this._parent.children.filter(function (c) {
	        return c === _this9;
	      }).length === 0) {
	        this._parent.children.push(this);
	      }
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._id;
	    },
	    set: function set(value) {
	      this._id = value;
	    }
	  }]);

	  return Node;
	}();

	/** @module layout */

	var VertexStyle = {
	  INCLUDED: Symbol("INCLUDED"),
	  // Only included nodes are sent to the figtree class
	  IGNORED: Symbol('IGNORED'),
	  // Ignored nodes are just that ignored in everyway
	  HIDDEN: Symbol("HIDDEN"),
	  // The only difference between hidden and included nodes is that hidden nodes are not sent to the figtree class
	  MASKED: Symbol("MASKED") // Masked nodes have an x and y coordinate but are then ignored. They don't count towards their parent's x and y

	  /**
	   * The Layout class
	   *
	   */

	};
	var Layout =
	/*#__PURE__*/
	function () {
	  createClass(Layout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        lengthFormat: format(".2f"),
	        horizontalScale: null,
	        // a scale that converts height to 0,1  domain. default is 0 = heighest tip
	        includedInVerticalRange: function includedInVerticalRange(node) {
	          return !node.children;
	        },
	        branchCurve: null,
	        branchScale: 1,
	        focusFactor: 1
	      };
	    }
	    /**
	     * The constructor.
	     */

	  }]);

	  function Layout(tree) {
	    var _this = this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, Layout);

	    this.tree = tree;
	    this.settings = objectSpread({}, Layout.DEFAULT_SETTINGS(), settings); // default ranges - these should be set in layout()

	    this._horizontalRange = [0.0, 1.0];
	    this._verticalRange = [0, this.tree.nodeList.filter(this.settings.includedInVerticalRange).length - 1];
	    this._horizontalTicks = [0, 0.5, 1];
	    this._edges = [];
	    this._edgeMap = new Map();
	    this._vertices = [];
	    this._nodeMap = new Map();
	    this._cartoonStore = [];
	    this._activeCartoons = [];
	    this.branchLabelAnnotationName = null;
	    this.internalNodeLabelAnnotationName = null;
	    this.externalNodeLabelAnnotationName = null;
	    this.layoutKnown = false; // called whenever the tree changes...

	    this.tree.treeUpdateCallback = function () {
	      _this.layoutKnown = false;

	      _this.update();
	    }; // create an empty callback function


	    this.updateCallback = function () {};
	  }
	  /**
	   * An abstract base class for a layout class. The aim is to describe the API of the class.
	   *
	   * @param vertices - objects with an x, y coordinates and a reference to the original node
	   * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
	   */


	  createClass(Layout, [{
	    key: "layout",
	    value: function layout() {
	      var _this2 = this;

	      this._horizontalScale = this.updateHorizontalScale();
	      makeVerticesFromNodes.call(this, this.getTreeNodes());
	      makeEdgesFromNodes.call(this, this.getTreeNodes()); // get the nodes

	      var currentY = this.setInitialY();
	      var currentX = this.setInitialX(); //CARTOONS set up
	      // filter so just showing the most ancestral;

	      var allCartoonDescendents = [];

	      this._cartoonStore.forEach(function (c) {
	        if (allCartoonDescendents.indexOf(c.node) === -1) {
	          allCartoonDescendents.push.apply(allCartoonDescendents, toConsumableArray(toConsumableArray(_this2.tree.postorder(c.node)).filter(function (n) {
	            return n !== c.node;
	          })));
	        }
	      });

	      this._activeCartoons = this._cartoonStore.filter(function (c) {
	        return allCartoonDescendents.indexOf(c.node) === -1;
	      });

	      this._activeCartoons.filter(function (c) {
	        return c.format === 'collapse';
	      }).forEach(function (c) {
	        markCollapsedNodes.call(_this2, c);
	      }); // update the node locations (vertices)


	      this._vertices.forEach(function (v) {
	        if (!(v.visibility === VertexStyle.IGNORED)) {
	          currentY = _this2.setYPosition(v, currentY);
	          currentX = _this2.setXPosition(v, currentX);
	          v.degree = v.node.children ? v.node.children.length + 1 : 1; // the number of edges (including stem)

	          v.id = v.node.id;
	          setVertexClasses.call(_this2, v);
	          setVertexLabels.call(_this2, v);
	        }
	      }); //Update edge locations


	      this._edges.forEach(function (e) {
	        setupEdge.call(_this2, e);
	      }); // update verticalRange so that we count tips that are in cartoons but not those that are ignored


	      this._verticalRange = [0, currentY];
	      this.layoutKnown = true;
	    }
	  }, {
	    key: "setInternalNodeLabels",

	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */
	    value: function setInternalNodeLabels(annotationName) {
	      this.internalNodeLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "setExternalNodeLabels",
	    value: function setExternalNodeLabels(annotationName) {
	      this.externalNodeLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "setBranchLabels",
	    value: function setBranchLabels(annotationName) {
	      this.branchLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Updates the tree when it has changed
	     */

	  }, {
	    key: "update",
	    value: function update() {
	      this.updateCallback();
	    }
	    /**
	     * A utility function for rotating a node
	     * @returns {rotate}
	     */

	  }, {
	    key: "rotate",
	    value: function rotate() {
	      var _this3 = this;

	      return function (vertex) {
	        _this3.tree.rotate(vertex.node);

	        _this3.update();
	      };
	    }
	    /**
	     * A utility function for ordering a subtree with increasing tip density
	     * @returns {orderIncreasing}
	     */

	  }, {
	    key: "orderIncreasing",
	    value: function orderIncreasing() {
	      var _this4 = this;

	      return function (vertex) {
	        _this4.tree.rotate(vertex.node);

	        _this4.update();
	      };
	    }
	    /**
	     * A utility function for ordering a subtree with decreasing tip density
	     * @returns {orderIncreasing}
	     */

	  }, {
	    key: "orderDecreasing",
	    value: function orderDecreasing() {
	      var _this5 = this;

	      return function (vertex) {
	        _this5.tree.rotate(vertex.node);

	        _this5.update();
	      };
	    }
	    /**
	     * A utility function for rerooting the tree
	     * @returns {reroot}
	     */

	  }, {
	    key: "reroot",
	    value: function reroot() {
	      var _this6 = this;

	      return function (edge, position) {
	        _this6.tree.reroot(edge.v1.node, position);

	        _this6.update();
	      };
	    }
	    /**
	     * A utility function to cartoon a clade into a triangle
	     * @param vertex
	     */

	  }, {
	    key: "cartoon",
	    value: function cartoon(node) {
	      if (node.children) {
	        if (this._cartoonStore.filter(function (c) {
	          return c.format === "cartoon";
	        }).find(function (c) {
	          return c.node === node;
	        })) {
	          this._cartoonStore = this._cartoonStore.filter(function (c) {
	            return !(c.format === "cartoon" && c.node === node);
	          });
	        } else {
	          this._cartoonStore.push({
	            node: node,
	            format: "cartoon"
	          });
	        }

	        this.layoutKnown = false;
	        this.update();
	      }
	    }
	    /**
	     * A utitlity function to collapse a clade into a single branch and tip.
	     * @param vertex
	     */

	  }, {
	    key: "collapse",
	    value: function collapse(node) {
	      if (node.children) {
	        if (this._cartoonStore.filter(function (c) {
	          return c.format === "collapse";
	        }).find(function (c) {
	          return c.node === node;
	        })) {
	          this._cartoonStore = this._cartoonStore.filter(function (c) {
	            return !(c.format === "collapse" && c.node === node);
	          });
	        } else {
	          this._cartoonStore.push({
	            node: node,
	            format: "collapse"
	          });
	        }

	        this.layoutKnown = false;
	        this.update();
	      }
	    }
	  }, {
	    key: "maskNode",
	    value: function maskNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle.MASKED;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "hideNode",
	    value: function hideNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle.HIDDEN;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "ignoreNode",
	    value: function ignoreNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle.IGNORED;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "includeNode",
	    value: function includeNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle.INCLUDED;
	      this.layoutKnown = false;
	    }
	    /**
	     * A utility function that will return a HTML string about the node and its
	     * annotations. Can be used with the addLabels() method.
	     *
	     * @param node
	     * @returns {string}
	     */

	  }, {
	    key: "updateHorizontalScale",
	    // layout functions should be overwritten in decedents

	    /**
	     * Sets the horizontal scale for the layout. This maps the tree to the layout range which is [0,1]
	     * @return {null|*}
	     */
	    value: function updateHorizontalScale() {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	    /**
	     * sets the initial Y value for the first node returned from the getTreeNodes().
	     * @return {number}
	     */

	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	    /**
	     * Set the y position of a vertex and return the Y position. This function is called on each node in the order returns from the getTreeNodes() method.
	     * The currentY represent the Y position of the previous node at each iteration. These y values will be mapped to a [0,1]
	     * range.
	     * @param vertex
	     * @param currentY
	     * @return {number}
	     */

	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	    /**
	     * sets the initial x value for the first node returned from the getTreeNodes().
	     * @return {number}
	     */

	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	    /**
	     * Set the x position of a vertex and return the X position. This function is called on each node in the order returns from the getTreeNodes() method.
	     * The currentX represent the x position of the previous node at each iteration. These x values will be mapped to a [0,1]
	     * range. In the 'normal' left to right tree this method would ignore the currentX and set the x based on the horizontal scale.
	     * @param vertex
	     * @param currentX
	     * @return {number}
	     */

	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	    /**
	     * A method which returns the nodes of the tree in the order inwhcih they will be assigned Y and X coordinates.
	     * @return {IterableIterator<*>[]}
	     */

	  }, {
	    key: "getTreeNodes",
	    value: function getTreeNodes() {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	  }, {
	    key: "branchPathGenerator",

	    /**
	     * Generates a line() function that takes an edge and it's index and returns a line for d3 path element. It is called
	     * by the figtree class as
	     * const branchPath = this.layout.branchPathGenerator(this.scales)
	     * newBranches.append("path")
	     .attr("class", "branch-path")
	     .attr("d", (e,i) => branchPath(e,i));
	     * @param scales
	     * @return {function(*, *)}
	     */
	    value: function branchPathGenerator(scales) {
	      throw new Error("Don't call this method from the parent layout class. It must be implemented in the child class");
	    }
	  }, {
	    key: "horizontalRange",
	    get: function get() {
	      return this._horizontalRange;
	    }
	  }, {
	    key: "verticalRange",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._verticalRange;
	    }
	  }, {
	    key: "horizontalAxisTicks",
	    get: function get() {
	      return this._horizontalTicks;
	    }
	  }, {
	    key: "branchCurve",
	    set: function set(curve) {
	      this.settings.branchCurve = curve;
	      this.update();
	    },
	    get: function get() {
	      return this.settings.branchCurve;
	    }
	  }, {
	    key: "branchScale",
	    set: function set(value) {
	      this.settings.branchScale = value;
	      this.update();
	    },
	    get: function get() {
	      return this.settings.branchScale;
	    }
	  }, {
	    key: "edges",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._edges.filter(function (e) {
	        return e.v1.visibility === VertexStyle.INCLUDED;
	      });
	    }
	  }, {
	    key: "vertices",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._vertices.filter(function (v) {
	        return v.visibility === VertexStyle.INCLUDED;
	      });
	    }
	  }, {
	    key: "cartoons",
	    get: function get() {
	      var _this7 = this;

	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      var cartoons = []; // Handle cartoons

	      this._activeCartoons.forEach(function (c) {
	        var cartoonNodeDecedents = toConsumableArray(_this7.tree.postorder(c.node)).filter(function (n) {
	          return n !== c.node;
	        });

	        var cartoonVertex = _this7._nodeMap.get(c.node);

	        var cartoonVertexDecedents = cartoonNodeDecedents.map(function (n) {
	          return _this7._nodeMap.get(n);
	        });
	        cartoonVertexDecedents.forEach(function (v) {
	          return v.visibility = VertexStyle.HIDDEN;
	        });
	        var newTopVertex = {
	          x: max(cartoonVertexDecedents, function (d) {
	            return d.x;
	          }),
	          y: max(cartoonVertexDecedents, function (d) {
	            return d.y;
	          }),
	          id: "".concat(cartoonVertex.id, "-top"),
	          node: cartoonVertex.node,
	          classes: cartoonVertex.classes
	        };

	        var newBottomVertex = objectSpread({}, newTopVertex, {
	          y: min(cartoonVertexDecedents, function (d) {
	            return d.y;
	          }),
	          id: "".concat(cartoonVertex.id, "-bottom")
	        }); // place in middle of tips.


	        cartoonVertex.y = mean([newTopVertex, newBottomVertex], function (d) {
	          return d.y;
	        });
	        var currentNode = cartoonVertex.node;

	        while (currentNode.parent) {
	          var parentVertex = _this7._nodeMap.get(currentNode.parent);

	          if (!_this7.settings.includedInVerticalRange(parentVertex.node)) {
	            parentVertex.y = mean(parentVertex.node.children, function (child) {
	              return _this7._nodeMap.get(child).y;
	            });
	          }

	          currentNode = parentVertex.node;
	        }

	        cartoons.push({
	          vertices: [cartoonVertex, newTopVertex, newBottomVertex],
	          classes: cartoonVertex.classes,
	          id: "".concat(cartoonVertex.id, "-cartoon"),
	          node: c.node
	        });
	      });

	      return cartoons;
	    }
	  }, {
	    key: "nodeMap",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._nodeMap;
	    }
	  }, {
	    key: "edgeMap",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._edgeMap;
	    }
	  }, {
	    key: "horizontalScale",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._horizontalScale;
	    }
	  }], [{
	    key: "nodeInfo",
	    value: function nodeInfo(node) {
	      var text = "".concat(node.name ? node.name : node.id);
	      Object.entries(node.annotations).forEach(function (_ref) {
	        var _ref2 = slicedToArray(_ref, 2),
	            key = _ref2[0],
	            value = _ref2[1];

	        text += "<p>".concat(key, ": ").concat(value, "</p>");
	      });
	      return text;
	    }
	  }]);

	  return Layout;
	}();
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	function makeVerticesFromNodes(nodes) {
	  var _this8 = this;

	  nodes.forEach(function (n, i) {
	    if (!_this8._nodeMap.has(n)) {
	      var vertex = {
	        node: n,
	        key: n.id,
	        focused: false,
	        visibility: VertexStyle.INCLUDED // key: Symbol(n.id).toString()

	      };

	      _this8._vertices.push(vertex);

	      _this8._nodeMap.set(n, vertex);
	    }
	  });
	}

	function setVertexClasses(v) {
	  var _this9 = this;

	  v.classes = [!v.node.children ? "external-node" : "internal-node", v.node.isSelected ? "selected" : "unselected"];

	  if (v.node.annotations) {
	    v.classes = [].concat(toConsumableArray(v.classes), toConsumableArray(Object.entries(v.node.annotations).filter(function (_ref3) {
	      var _ref4 = slicedToArray(_ref3, 1),
	          key = _ref4[0];

	      return _this9.tree.annotations[key] && (_this9.tree.annotations[key].type === Type.DISCRETE || _this9.tree.annotations[key].type === Type.BOOLEAN || _this9.tree.annotations[key].type === Type.INTEGER);
	    }).map(function (_ref5) {
	      var _ref6 = slicedToArray(_ref5, 2),
	          key = _ref6[0],
	          value = _ref6[1];

	      return "".concat(key, "-").concat(value);
	    })));
	  }
	}

	function setVertexLabels(v) {
	  // either the tip name or the internal node label
	  if (v.node.children) {
	    v.leftLabel = this.internalNodeLabelAnnotationName ? v.node.annotations[this.internalNodeLabelAnnotationName] : "";
	    v.rightLabel = ""; // should the left node label be above or below the node?

	    v.labelBelow = !v.node.parent || v.node.parent.children[0] !== v.node;
	  } else {
	    v.leftLabel = "";
	    v.rightLabel = this.externalNodeLabelAnnotationName ? v.node.annotations[this.externalNodeLabelAnnotationName] : v.node.name;
	  }
	}

	function makeEdgesFromNodes(nodes) {
	  var _this10 = this;

	  // create the edges (only done if the array is empty)
	  nodes.filter(function (n) {
	    return n.parent;
	  }) // exclude the root
	  .forEach(function (n, i) {
	    if (!_this10._edgeMap.has(_this10._nodeMap.get(n))) {
	      var edge = {
	        v0: _this10._nodeMap.get(n.parent),
	        v1: _this10._nodeMap.get(n),
	        key: n.id
	      };

	      _this10._edges.push(edge);

	      _this10._edgeMap.set(edge.v1, edge);
	    }
	  });
	}

	function setupEdge(e) {
	  setEdgeTermini.call(this, e);
	  setEdgeClasses.call(this, e);
	  setEdgeLabels.call(this, e);
	}

	function setEdgeTermini(e) {
	  e.v1 = this._nodeMap.get(e.v1.node);
	  e.v0 = this._nodeMap.get(e.v1.node.parent);
	  e.length = length;
	}

	function setEdgeClasses(e) {
	  var _this11 = this;

	  e.classes = [];

	  if (e.v1.node.annotations) {
	    e.classes = [].concat(toConsumableArray(e.classes), toConsumableArray(Object.entries(e.v1.node.annotations).filter(function (_ref7) {
	      var _ref8 = slicedToArray(_ref7, 1),
	          key = _ref8[0];

	      return _this11.tree.annotations[key] && (_this11.tree.annotations[key].type === Type.DISCRETE || _this11.tree.annotations[key].type === Type.BOOLEAN || _this11.tree.annotations[key].type === Type.INTEGER);
	    }).map(function (_ref9) {
	      var _ref10 = slicedToArray(_ref9, 2),
	          key = _ref10[0],
	          value = _ref10[1];

	      return "".concat(key, "-").concat(value);
	    })));
	  }
	}

	function setEdgeLabels(e) {
	  e.label = this.branchLabelAnnotationName ? this.branchLabelAnnotationName === 'length' ? this.settings.lengthFormat(length) : e.v1.node.annotations[this.branchLabelAnnotationName] : null;
	  e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
	}

	function markCollapsedNodes(c) {
	  var _this12 = this;

	  var cartoonNodeDecedents = toConsumableArray(this.tree.postorder(c.node)).filter(function (n) {
	    return n !== c.node;
	  });

	  var cartoonVertexDecedents = cartoonNodeDecedents.map(function (n) {
	    return _this12._nodeMap.get(n);
	  });

	  var mostDiverged = this._nodeMap.get(cartoonNodeDecedents.find(function (n) {
	    return n.height === max(cartoonNodeDecedents, function (d) {
	      return d.height;
	    });
	  }));

	  cartoonVertexDecedents.forEach(function (v) {
	    v.visibility = VertexStyle.HIDDEN;

	    if (v === mostDiverged) {
	      v.visibility = VertexStyle.IGNORED;
	    }
	  });
	} //TODO add focus implementation to layout method
	//TODO add minimum gap to layout method
	//TODO split MASKED, included ect into a visualisation flag and an included in y position flag

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	var assertThisInitialized = _assertThisInitialized;

	function _possibleConstructorReturn(self, call) {
	  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
	    return call;
	  }

	  return assertThisInitialized(self);
	}

	var possibleConstructorReturn = _possibleConstructorReturn;

	var getPrototypeOf = createCommonjsModule(function (module) {
	function _getPrototypeOf(o) {
	  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	module.exports = _getPrototypeOf;
	});

	var setPrototypeOf = createCommonjsModule(function (module) {
	function _setPrototypeOf(o, p) {
	  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	module.exports = _setPrototypeOf;
	});

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) setPrototypeOf(subClass, superClass);
	}

	var inherits = _inherits;

	/**
	 * The Layout class
	 *
	 */

	var RectangularLayout =
	/*#__PURE__*/
	function (_Layout) {
	  inherits(RectangularLayout, _Layout);

	  createClass(RectangularLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        branchCurve: stepBefore,
	        radius: 0
	      };
	    }
	    /**
	     * The constructor.
	     * @param tree
	     * @param settings
	     */

	  }]);

	  function RectangularLayout(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, RectangularLayout);

	    return possibleConstructorReturn(this, getPrototypeOf(RectangularLayout).call(this, tree, objectSpread({}, RectangularLayout.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(RectangularLayout, [{
	    key: "getTreeNodes",
	    value: function getTreeNodes() {
	      return toConsumableArray(this.tree.postorder());
	    }
	  }, {
	    key: "updateHorizontalScale",
	    value: function updateHorizontalScale() {
	      var newScale = this.settings.horizontalScale ? this.settings.horizontalScale : linear$2().domain([this.tree.rootNode.height * this.settings.branchScale, this.tree.origin]).range(this._horizontalRange);
	      return newScale;
	    }
	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      return -1;
	    }
	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      return 0;
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var _this = this;

	      // check if there are children that that are in the same group and set position to mean
	      // if do something else
	      var includedInVertical = this.settings.includedInVerticalRange(vertex.node);
	      var focusFactor = vertex.focused || this._previousVertexFocused ? this.settings.focusFactor : 1;

	      if (!includedInVertical) {
	        // make this better
	        var vertexChildren = vertex.node.children.map(function (child) {
	          return _this._nodeMap.get(child);
	        }).filter(function (child) {
	          return child.visibility === VertexStyle.INCLUDED || child.visibility === VertexStyle.HIDDEN;
	        });
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });
	      } else {
	        currentY += focusFactor * 1;
	        vertex.y = currentY;
	      }

	      this._previousVertexFocused = vertex.focused;
	      return currentY;
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      vertex.x = this._horizontalScale(vertex.node.height * this.settings.branchScale);
	      return 0;
	    }
	  }, {
	    key: "branchPathGenerator",
	    value: function branchPathGenerator(scales) {
	      var _this2 = this;

	      var branchPath = function branchPath(e, i) {
	        var branchLine = line().x(function (v) {
	          return v.x;
	        }).y(function (v) {
	          return v.y;
	        }).curve(_this2.settings.branchCurve);
	        var factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
	        var dontNeedCurv = e.v0.y - e.v1.y === 0 ? 0 : 1;
	        var output = _this2.settings.radius > 0 ? branchLine([{
	          x: 0,
	          y: scales.y(e.v0.y) - scales.y(e.v1.y)
	        }, {
	          x: 0,
	          y: dontNeedCurv * factor * _this2.settings.radius
	        }, {
	          x: 0 + dontNeedCurv * _this2.settings.radius,
	          y: 0
	        }, {
	          x: scales.x(e.v1.x) - scales.x(e.v0.x),
	          y: 0
	        }]) : branchLine([{
	          x: 0,
	          y: scales.y(e.v0.y) - scales.y(e.v1.y)
	        }, {
	          x: scales.x(e.v1.x) - scales.x(e.v0.x),
	          y: 0
	        }]);
	        return output;
	      };

	      return branchPath;
	    }
	  }]);

	  return RectangularLayout;
	}(Layout);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * The Layout class
	 *
	 */

	var RectangularLayout$1 =
	/*#__PURE__*/
	function (_Layout) {
	  inherits(RectangularLayout, _Layout);

	  createClass(RectangularLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        branchCurve: stepBefore,
	        radius: 0
	      };
	    }
	    /**
	     * The constructor.
	     * @param tree
	     * @param settings
	     */

	  }]);

	  function RectangularLayout(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, RectangularLayout);

	    return possibleConstructorReturn(this, getPrototypeOf(RectangularLayout).call(this, tree, objectSpread({}, RectangularLayout.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(RectangularLayout, [{
	    key: "getTreeNodes",
	    value: function getTreeNodes() {
	      return toConsumableArray(this.tree.postorder());
	    }
	  }, {
	    key: "updateHorizontalScale",
	    value: function updateHorizontalScale() {
	      var newScale = this.settings.horizontalScale ? this.settings.horizontalScale : linear$2().domain([this.tree.rootNode.height * this.settings.branchScale, this.tree.origin]).range(this._horizontalRange);
	      return newScale;
	    }
	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      return -1;
	    }
	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      return 0;
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var _this = this;

	      // check if there are children that that are in the same group and set position to mean
	      // if do something else
	      var includedInVertical = this.settings.includedInVerticalRange(vertex.node);
	      var focusFactor = vertex.focused || this._previousVertexFocused ? this.settings.focusFactor : 1;

	      if (!includedInVertical) {
	        // make this better
	        var vertexChildren = vertex.node.children.map(function (child) {
	          return _this._nodeMap.get(child);
	        }).filter(function (child) {
	          return child.visibility === VertexStyle.INCLUDED || child.visibility === VertexStyle.HIDDEN;
	        });
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });
	      } else {
	        currentY += focusFactor * 1;
	        vertex.y = currentY;
	      }

	      this._previousVertexFocused = vertex.focused;
	      return currentY;
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      vertex.x = this._horizontalScale(vertex.node.height * this.settings.branchScale);
	      return 0;
	    }
	  }, {
	    key: "branchPathGenerator",
	    value: function branchPathGenerator(scales) {
	      var _this2 = this;

	      var branchPath = function branchPath(e, i) {
	        var branchLine = line().x(function (v) {
	          return v.x;
	        }).y(function (v) {
	          return v.y;
	        }).curve(_this2.settings.branchCurve);
	        var factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
	        var dontNeedCurv = e.v0.y - e.v1.y === 0 ? 0 : 1;
	        var output = _this2.settings.radius > 0 ? branchLine([{
	          x: 0,
	          y: scales.y(e.v0.y) - scales.y(e.v1.y)
	        }, {
	          x: 0,
	          y: dontNeedCurv * factor * _this2.settings.radius
	        }, {
	          x: 0 + dontNeedCurv * _this2.settings.radius,
	          y: 0
	        }, {
	          x: scales.x(e.v1.x) - scales.x(e.v0.x),
	          y: 0
	        }]) : branchLine([{
	          x: 0,
	          y: scales.y(e.v0.y) - scales.y(e.v1.y)
	        }, {
	          x: scales.x(e.v1.x) - scales.x(e.v0.x),
	          y: 0
	        }]);
	        return output;
	      };

	      return branchPath;
	    }
	  }]);

	  return RectangularLayout;
	}(Layout);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * The TransmissionLayout class
	 * Only works for 'up' directions
	 *
	 */

	var TransmissionLayout =
	/*#__PURE__*/
	function (_RectangularLayout) {
	  inherits(TransmissionLayout, _RectangularLayout);

	  createClass(TransmissionLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        groupingAnnotation: "host",
	        direction: "up",
	        groupGap: 5
	      };
	    }
	  }]);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function TransmissionLayout(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, TransmissionLayout);

	    var groupingAnnotation = objectSpread({}, TransmissionLayout.DEFAULT_SETTINGS(), settings)['groupingAnnotation']; // defined here so we can use the groupingAnnotation key


	    var includedInVerticalRange = function includedInVerticalRange(node) {
	      return !node.children || node.children.length === 1 && node.annotations[groupingAnnotation] !== node.children[0].annotations[groupingAnnotation];
	    };

	    return possibleConstructorReturn(this, getPrototypeOf(TransmissionLayout).call(this, tree, objectSpread({}, TransmissionLayout.DEFAULT_SETTINGS(), {
	      includedInVerticalRange: includedInVerticalRange
	    }, settings)));
	  }

	  createClass(TransmissionLayout, [{
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var _this = this;

	      var focusFactor = vertex.focused || this._previousVertexFocused ? this.settings.focusFactor : 1;
	      var includedInVertical = this.settings.includedInVerticalRange(vertex.node);

	      if (!includedInVertical) {
	        var vertexChildren = vertex.node.children.map(function (child) {
	          return _this._nodeMap.get(child);
	        }).filter(function (child) {
	          return child.visibility === VertexStyle.INCLUDED || child.visibility === VertexStyle.HIDDEN;
	        });
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });
	      } else {
	        if (vertex.node.children && vertex.node.children.length === 1 && vertex.node.annotations[this.settings.groupingAnnotation] !== vertex.node.children[0].annotations[this.settings.groupingAnnotation]) {
	          currentY += focusFactor * this.settings.groupGap;
	        } else {
	          currentY += focusFactor * 1;
	        }

	        vertex.y = currentY;
	      }

	      this._previousVertexFocused = vertex.focused;
	      return currentY;
	    }
	    /**
	     * Set the direction to draw transmission (up or down).
	     * @param direction
	     */
	    // set direction(direction) {
	    //     this.update();
	    // }

	  }]);

	  return TransmissionLayout;
	}(RectangularLayout$1);

	/**
	 * The TransmissionLayout class
	 * Only works for 'up' directions
	 *
	 */

	var ExplodedLayout =
	/*#__PURE__*/
	function (_RectangularLayout) {
	  inherits(ExplodedLayout, _RectangularLayout);

	  createClass(ExplodedLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        groupingAnnotation: "host",
	        direction: "up",
	        interGroupGap: 10,
	        intraGroupGap: 5,
	        focusFactor: 1
	      };
	    }
	  }]);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function ExplodedLayout(tree) {
	    var _this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, ExplodedLayout);

	    var groupingAnnotation = objectSpread({}, ExplodedLayout.DEFAULT_SETTINGS(), settings)['groupingAnnotation']; // defined here so we can use the groupingAnnotation key


	    var includedInVerticalRange = function includedInVerticalRange(node) {
	      return !node.children || node.children.length === 1 && node.annotations[groupingAnnotation] !== node.children[0].annotations[groupingAnnotation];
	    };

	    _this = possibleConstructorReturn(this, getPrototypeOf(ExplodedLayout).call(this, tree, objectSpread({}, ExplodedLayout.DEFAULT_SETTINGS(), {
	      includedInVerticalRange: includedInVerticalRange
	    }, settings)));
	    _this.groupingAnnotation = groupingAnnotation;
	    return _this;
	  }

	  createClass(ExplodedLayout, [{
	    key: "getTreeNodes",
	    value: function getTreeNodes() {
	      var _this2 = this;

	      // order first by grouping annotation and then by postorder
	      var postOrderNodes = toConsumableArray(this.tree.postorder());

	      var groupHeights = new Map();
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        var _loop = function _loop() {
	          var group = _step.value;
	          var height = min(postOrderNodes.filter(function (n) {
	            return n.annotations[_this2.groupingAnnotation] === group;
	          }), function (d) {
	            return d.height;
	          });
	          groupHeights.set(group, height);
	        };

	        for (var _iterator = this.tree.annotations[this.groupingAnnotation].values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          _loop();
	        } // sort by location and then by post order order but we want all import/export banches to be last

	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	            _iterator["return"]();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      return toConsumableArray(this.tree.postorder()).sort(function (a, b) {
	        if (a.annotations[_this2.groupingAnnotation] === b.annotations[_this2.groupingAnnotation]) {
	          return postOrderNodes.indexOf(a) - postOrderNodes.indexOf(b);
	        } else {
	          return -1 * (groupHeights.get(a.annotations[_this2.groupingAnnotation]) - groupHeights.get(b.annotations[_this2.groupingAnnotation]));
	        }
	      });
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var _this3 = this;

	      // check if there are children that that are in the same group and set position to mean
	      // if do something else
	      if (currentY === this.setInitialY()) {
	        this._currentGroup = vertex.node.annotations[this.groupingAnnotation];
	      }

	      var focusFactor = vertex.focused || this._previousVertexFocused ? this.settings.focusFactor : 1;
	      var includedInVertical = this.settings.includedInVerticalRange(vertex.node);

	      if (!includedInVertical) {
	        vertex.y = mean(vertex.node.children, function (child) {
	          var childVertex = _this3._nodeMap.get(child);

	          if (childVertex.visibility === VertexStyle.INCLUDED || childVertex.visibility === VertexStyle.HIDDEN) {
	            return childVertex.y;
	          } else {
	            return null;
	          }
	        });

	        if (vertex.node.parent) {
	          if (vertex.node.annotations[this.groupingAnnotation] !== vertex.node.parent.annotations[this.groupingAnnotation]) {
	            this._newIntraGroupNext = true;
	          }
	        }
	      } else {
	        if (vertex.node.annotations[this.groupingAnnotation] !== this._currentGroup) {
	          currentY += focusFactor * this.settings.interGroupGap;
	          this._newIntraGroupNext = false;
	        } else if (this._newIntraGroupNext) {
	          currentY += focusFactor * this.settings.intraGroupGap;
	          this._newIntraGroupNext = false;
	        } else {
	          currentY += focusFactor * 1;
	        }

	        this._currentGroup = vertex.node.annotations[this.groupingAnnotation];
	        vertex.y = currentY;
	      }

	      this._previousVertexFocused = vertex.focused;
	      return currentY;
	    }
	    /**
	     * Set the direction to draw transmission (up or down).
	     * @param direction
	     */
	    // set direction(direction) {
	    //     this.update();
	    // }

	  }]);

	  return ExplodedLayout;
	}(RectangularLayout$1);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * The ArcLayout class
	 * note the function in the settings that placed the nodes on the xaxis a 0,1 range. The horizontal range is always 0->1. it is this funciton's job
	 * To map the nodes to that space. the default is the 
	 * node's index in the node list.
	 */

	var ArcLayout =
	/*#__PURE__*/
	function (_Layout) {
	  inherits(ArcLayout, _Layout);

	  createClass(ArcLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        lengthFormat: format(".2f"),
	        edgeWidth: 2,
	        xFunction: function xFunction(n, i, t) {
	          return i / t.length;
	        },
	        branchCurve: curveLinear,
	        curve: 'arc'
	      };
	    }
	    /**
	     * The constructor.
	     * @param graph
	     * @param settings
	     */

	  }]);

	  function ArcLayout(graph) {
	    var _this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, ArcLayout);

	    _this = possibleConstructorReturn(this, getPrototypeOf(ArcLayout).call(this));
	    _this.graph = graph;
	    _this.annotations = {}; // merge the default settings with the supplied settings

	    _this.settings = objectSpread({}, ArcLayout.DEFAULT_SETTINGS(), settings);
	    _this.branchLabelAnnotationName = null;
	    _this.internalNodeLabelAnnotationName = null;
	    _this.externalNodeLabelAnnotationName = null; // called whenever the tree changes...
	    // this.tree.treeUpdateCallback = () => {
	    //     this.update();
	    // };

	    return _this;
	  }
	  /**
	   * Lays out the tree in a standard rectangular format.
	   *
	   * This function is called by the FigTree class and is used to layout the nodes of the tree. It
	   * populates the vertices array with vertex objects that wrap the nodes and have coordinates and
	   * populates the edges array with edge objects that have two vertices.
	   *
	   * It encapsulates the tree object to keep it abstract
	   *
	   * @param vertices - objects with an x, y coordinates and a reference to the original node
	   * @param edges - objects with v1 (a vertex) and v0 (the parent vertex).
	   */


	  createClass(ArcLayout, [{
	    key: "layout",
	    value: function layout(vertices, edges) {
	      var _this2 = this;

	      this._horizontalRange = [0, 1];
	      this._verticalRange = [-this.graph.nodes.length, this.graph.nodes.length]; // get the nodes in pre-order (starting at first node)
	      // const nodes = [...this.graph.preorder(this.graph.nodes[0])];

	      var nodes = toConsumableArray(this.graph.nodes);

	      nodes.forEach(function (n) {
	        return _this2.addAnnotations(n);
	      });

	      if (vertices.length === 0) {
	        this.nodeMap = new Map(); // create the vertices (only done if the array is empty)

	        nodes.forEach(function (n, i) {
	          var vertex = {
	            node: n,
	            key: n.id // key: Symbol(n.id).toString()

	          };
	          vertices.push(vertex);

	          _this2.nodeMap.set(n, vertex);
	        });
	      } // update the node locations (vertices)
	      //


	      nodes.forEach(function (n, i) {
	        var v = _this2.nodeMap.get(n);

	        v.x = _this2.settings.xFunction(n, i);
	        v.y = 0;
	        v.degree = _this2.graph.getEdges(v.node).length; // the number of edges 
	        // console.log(v.x)

	        v.classes = [!_this2.graph.getOutgoingEdges(v.node).length > 0 ? "external-node" : "internal-node", v.node.isSelected ? "selected" : "unselected"]; // if (v.node.annotations) {

	        v.classes = [].concat(toConsumableArray(v.classes), toConsumableArray(_this2.getAnnotations(v.node))); // }

	        _this2.nodeMap.set(v.node, v);
	      });

	      if (edges.length === 0) {
	        this.edgeMap = new Map(); // create the edges (only done if the array is empty)

	        var dataEdges = this.graph.edges;
	        dataEdges.forEach(function (e, i) {
	          var edge = {
	            // The source and targets here are nodes in the graph;
	            v0: _this2.nodeMap.get(e.source),
	            v1: _this2.nodeMap.get(e.target),
	            key: e.id // key: Symbol(n.id).toString()

	          };
	          edges.push(edge);

	          _this2.edgeMap.set(edge, edge.v1);
	        });
	      } // update the edges


	      edges.forEach(function (e) {
	        e.v1 = _this2.edgeMap.get(e);
	        e.v0 = _this2.nodeMap.get(e.v0.node);
	        e.classes = []; // if (e.v1.node.annotations) {

	        e.classes = [].concat(toConsumableArray(e.classes), toConsumableArray(_this2.getAnnotations(e.v1.node))); // }

	        var length = e.v1.x - e.v0.x;
	        e.length = length;
	        e.label = _this2.branchLabelAnnotationName ? _this2.branchLabelAnnotationName === 'length' ? _this2.settings.lengthFormat(length) : e.v1.node.annotations[_this2.branchLabelAnnotationName] : null; // e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
	      });
	    }
	  }, {
	    key: "setInternalNodeLabels",

	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */
	    value: function setInternalNodeLabels(annotationName) {
	      this.internalNodeLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "setExternalNodeLabels",
	    value: function setExternalNodeLabels(annotationName) {
	      this.externalNodeLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Sets the annotation to use as the node labels.
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "setBranchLabels",
	    value: function setBranchLabels(annotationName) {
	      this.branchLabelAnnotationName = annotationName;
	      this.update();
	    }
	    /**
	     * Updates the tree when it has changed
	     */

	  }, {
	    key: "update",
	    value: function update() {
	      this.updateCallback();
	    }
	    /* This methods also checks the values are correct and conform to previous annotations
	    * in type.
	    *
	    * @param annotations
	    */

	  }, {
	    key: "addAnnotations",
	    value: function addAnnotations(datum) {
	      for (var _i = 0, _Object$entries = Object.entries(datum); _i < _Object$entries.length; _i++) {
	        var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
	            key = _Object$entries$_i[0],
	            addValues = _Object$entries$_i[1];

	        if (addValues instanceof Date || _typeof_1(addValues) === 'symbol') {
	          continue; // don't handel dates yet
	        }

	        var annotation = this.annotations[key];

	        if (!annotation) {
	          annotation = {};
	          this.annotations[key] = annotation;
	        }

	        if (typeof addValues === 'string' || addValues instanceof String) {
	          // fake it as an array
	          addValues = [addValues];
	        }

	        if (Array.isArray(addValues)) {
	          // is a set of discrete values or 
	          var type = Type.DISCRETE;

	          if (annotation.type && annotation.type !== type) {
	            throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
	          }

	          annotation.type = type;
	          annotation.values = annotation.values ? [].concat(toConsumableArray(annotation.values), toConsumableArray(addValues)) : toConsumableArray(addValues);
	        } else if (Object.isExtensible(addValues)) {
	          // is a set of properties with values               
	          var _type = null;
	          var sum = 0.0;
	          var keys = [];

	          for (var _i2 = 0, _Object$entries2 = Object.entries(addValues); _i2 < _Object$entries2.length; _i2++) {
	            var _Object$entries2$_i = slicedToArray(_Object$entries2[_i2], 2),
	                _key = _Object$entries2$_i[0],
	                value = _Object$entries2$_i[1];

	            if (keys.includes(_key)) {
	              throw Error("the states of annotation, ".concat(_key, ", should be unique"));
	            }

	            if (_typeof_1(value) === _typeof_1(1.0)) {
	              // This is a vector of probabilities of different states
	              _type = _type === undefined ? Type.PROBABILITIES : _type;

	              if (_type === Type.DISCRETE) {
	                throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	              }

	              sum += value;

	              if (sum > 1.0) {
	                throw Error("the values of annotation, ".concat(_key, ", should be probabilities of states and add to 1.0"));
	              }
	            } else if (_typeof_1(value) === _typeof_1(true)) {
	              _type = _type === undefined ? Type.DISCRETE : _type;

	              if (_type === Type.PROBABILITIES) {
	                throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	              }
	            } else {
	              throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
	            }

	            keys.append(_key);
	          }

	          if (annotation.type && annotation.type !== _type) {
	            throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
	          }

	          annotation.type = _type;
	          annotation.values = annotation.values ? [].concat(toConsumableArray(annotation.values), toConsumableArray(addValues)) : toConsumableArray(addValues);
	        } else {
	          var _type2 = Type.DISCRETE;

	          if (_typeof_1(addValues) === _typeof_1(true)) {
	            _type2 = Type.BOOLEAN;
	          } else if (Number(addValues)) {
	            _type2 = addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT;
	          }

	          if (annotation.type && annotation.type !== _type2) {
	            if (_type2 === Type.INTEGER && annotation.type === Type.FLOAT || _type2 === Type.FLOAT && annotation.type === Type.INTEGER) {
	              // upgrade to float
	              _type2 = Type.FLOAT;
	            } else {
	              throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
	            }
	          }

	          if (_type2 === Type.DISCRETE) {
	            if (!annotation.values) {
	              annotation.values = new Set();
	            }

	            annotation.values.add(addValues);
	          }

	          annotation.type = _type2;
	        } // overwrite the existing annotation property


	        this.annotations[key] = annotation;
	      }
	    }
	  }, {
	    key: "getAnnotations",
	    value: function getAnnotations(datum) {
	      var _this3 = this;

	      var annotationClasses = toConsumableArray(Object.entries(datum).filter(function (_ref) {
	        var _ref2 = slicedToArray(_ref, 1),
	            key = _ref2[0];

	        if (!_this3.annotations[key]) {
	          return false;
	        }

	        return _this3.annotations[key].type === Type.DISCRETE || _this3.annotations[key].type === Type.BOOLEAN || _this3.annotations[key].type === Type.INTEGER;
	      }).map(function (_ref3) {
	        var _ref4 = slicedToArray(_ref3, 2),
	            key = _ref4[0],
	            value = _ref4[1];

	        return "".concat(key, "-").concat(value);
	      }));

	      return annotationClasses;
	    } // Takes in scales and returns a function that will draw the branch paths given each edge and index as input.
	    // branches have been translated so 0,0 is the top left hand corner of the group - 

	  }, {
	    key: "branchPathGenerator",
	    value: function branchPathGenerator(scales) {
	      var _this4 = this;

	      var branchPath = function branchPath(e, i) {
	        var points;

	        if (_this4.settings.curve === "bezier") {
	          var sign = i % 2 === 0 ? 1 : -1;
	          var startingP = {
	            x: 0,
	            y: scales.y(e.v0.y) - scales.y(e.v1.y)
	          }; // which is 0 in the defualt setting

	          var endingP = {
	            x: scales.x(e.v1.x) - scales.x(e.v0.x),
	            y: 0
	          };
	          var correctingFactor = Math.abs(startingP.x - endingP.x) / (scales.x.range()[1] - scales.x.range()[0]); // so the longer the arc the heigher it goes

	          var controlPoint = {
	            "x": startingP.x,
	            "y": sign * scales.y(scales.y.domain()[1]) * correctingFactor
	          };
	          var controlPoint1 = {
	            "x": startingP.x,
	            //+endingP.x)/3,
	            "y": sign * scales.y(scales.y.domain()[1]) * correctingFactor
	          };
	          var controlPoint2 = {
	            "x": endingP.x,
	            //+endingP.x)/3,
	            "y": sign * scales.y(scales.y.domain()[1]) * correctingFactor
	          };
	          points = cubicBezier(startingP, controlPoint1, controlPoint2, endingP); // points = quadraticBezier(startingP,controlPoint,endingP)
	        } else {
	          var r = (scales.x(e.v1.x) - scales.x(e.v0.x)) / 2;
	          var a = r; // center x position

	          var _sign = i % 2 === 0 ? 1 : -1;

	          var x = range(0, scales.x(e.v1.x) - scales.x(e.v0.x), 1); //step every pixel

	          var y = x.map(function (x) {
	            return circleY(x, r, a, _sign);
	          });
	          points = x.map(function (x, i) {
	            return {
	              x: x,
	              y: y[i]
	            };
	          });
	        }

	        var branchLine = line().x(function (v) {
	          return v.x;
	        }).y(function (v) {
	          return v.y;
	        }).curve(_this4.branchCurve);
	        return branchLine(points);
	      };

	      return branchPath;
	    }
	  }, {
	    key: "branchCurve",
	    set: function set(curve) {
	      this.settings.branchCurve = curve;
	      this.update();
	    },
	    get: function get() {
	      return this.settings.branchCurve;
	    }
	  }]);

	  return ArcLayout;
	}(Layout);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	function circleY(x, r, a, sign) {
	  return sign * Math.sqrt(Math.pow(r, 2) - Math.pow(x - a, 2));
	}
	/**
	 * Cubic Bezier curves
	 * @param {*} p0 -starting point
	 * @param {*} p1 - ending point
	 * @param {*} q0 control points
	 * @param {*} q1 - control point 2
	 */


	function cubicBezier(p0, p1, p2, p3) {
	  var points = [];

	  for (var t = 0; t <= 1; t += 0.01) {
	    var x = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
	    var y = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;
	    points.push({
	      "x": x,
	      "y": y
	    });
	  }

	  return points;
	}

	var Bauble =
	/*#__PURE__*/
	function () {
	  createClass(Bauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        vertexFilter: function vertexFilter() {
	          return true;
	        }
	      };
	    }
	    /**
	     * The constructor.
	     */

	  }]);

	  function Bauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Bauble);

	    this.settings = objectSpread({}, Bauble.DEFAULT_SETTINGS(), settings);
	  }

	  createClass(Bauble, [{
	    key: "createShapes",
	    value: function createShapes(selection) {
	      throw new Error("don't call the base class methods");
	    }
	  }, {
	    key: "updateShapes",
	    value: function updateShapes(selection) {
	      throw new Error("don't call the base class methods");
	    }
	  }, {
	    key: "vertexFilter",
	    get: function get() {
	      return this.settings.vertexFilter;
	    }
	  }]);

	  return Bauble;
	}();
	var CircleBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(CircleBauble, _Bauble);

	  createClass(CircleBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        radius: 6
	      };
	    }
	    /**
	     * The constructor.
	     */

	  }]);

	  function CircleBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, CircleBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(CircleBauble).call(this, objectSpread({}, CircleBauble.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(CircleBauble, [{
	    key: "createShapes",
	    value: function createShapes(selection) {
	      return selection.append("circle");
	    }
	  }, {
	    key: "updateShapes",
	    value: function updateShapes(selection) {
	      var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	      return selection.attr("cx", 0).attr("cy", 0).attr("r", this.settings.radius + border);
	    }
	  }]);

	  return CircleBauble;
	}(Bauble);
	var RectangularBauble =
	/*#__PURE__*/
	function (_Bauble2) {
	  inherits(RectangularBauble, _Bauble2);

	  createClass(RectangularBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        height: 16,
	        width: 6,
	        radius: 2
	      };
	    }
	    /**
	     * The constructor.
	     */

	  }]);

	  function RectangularBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, RectangularBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(RectangularBauble).call(this, objectSpread({}, RectangularBauble.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(RectangularBauble, [{
	    key: "createShapes",
	    value: function createShapes(selection) {
	      return selection.append("rect");
	    }
	  }, {
	    key: "updateShapes",
	    value: function updateShapes(selection) {
	      var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	      var w = this.settings.width + border;
	      var h = this.settings.height + border;
	      return selection.attr("x", -w / 2).attr("width", w).attr("y", -h / 2).attr("height", h).attr("rx", this.settings.radius).attr("ry", this.settings.radius);
	    }
	  }]);

	  return RectangularBauble;
	}(Bauble);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/** @module figtree */
	// const d3 = require("d3");

	/**
	 * The FigTree class
	 *
	 * A class that takes a tree and draws it into the the given SVG root element. Has a range of methods
	 * for adding interactivity to the tree (e.g., mouse-over labels, rotating nodes and rerooting on branches).
	 * The tree is updated with animated transitions.
	 */

	var FigTree =
	/*#__PURE__*/
	function () {
	  createClass(FigTree, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        xAxisTitle: "Height",
	        // nodeRadius: 6,
	        hoverBorder: 2,
	        backgroundBorder: 0,
	        baubles: [],
	        transitionDuration: 500,
	        transitionEase: linear$1,
	        tickFormat: format(".2f"),
	        ticks: 5
	      };
	    }
	  }, {
	    key: "DEFAULT_STYLES",
	    value: function DEFAULT_STYLES() {
	      return {
	        "nodes": {},
	        "nodeBackgrounds": {},
	        "branches": {
	          "fill": function fill(d) {
	            return "none";
	          },
	          "stroke-width": function strokeWidth(d) {
	            return "2";
	          },
	          "stroke": function stroke(d) {
	            return "black";
	          }
	        },
	        "cartoons": {
	          "fill": function fill(d) {
	            return "none";
	          },
	          "stroke-width": function strokeWidth(d) {
	            return "2";
	          },
	          "stroke": function stroke(d) {
	            return "black";
	          }
	        }
	      };
	    }
	    /**
	     * The constructor.
	     * @param svg
	     * @param layout - an instance of class Layout
	     * @param margins
	     * @param settings
	     */

	  }]);

	  function FigTree(svg, layout, margins) {
	    var settings = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	    classCallCheck(this, FigTree);

	    this.layout = layout;
	    this.margins = margins; // merge the default settings with the supplied settings

	    var styles = FigTree.DEFAULT_STYLES(); //update style maps

	    if (settings.styles) {
	      for (var _i = 0, _Object$keys = Object.keys(styles); _i < _Object$keys.length; _i++) {
	        var key = _Object$keys[_i];

	        if (settings.styles[key]) {
	          styles[key] = objectSpread({}, styles[key], settings.styles[key]);
	        }
	      }
	    }

	    this.settings = objectSpread({}, FigTree.DEFAULT_SETTINGS(), settings, {
	      styles: styles
	    });
	    this.callbacks = {
	      nodes: [],
	      branches: [],
	      cartoons: []
	    };
	    this._annotations = [];
	    this.svg = svg;
	  }

	  createClass(FigTree, [{
	    key: "draw",
	    value: function draw() {
	      var _this = this;

	      // get the size of the svg we are drawing on
	      var width, height;

	      if (Object.keys(this.settings).indexOf("width") > -1) {
	        width = this.settings.width;
	      } else {
	        width = this.svg.getBoundingClientRect().width;
	      }

	      if (Object.keys(this.settings).indexOf("height") > -1) {
	        height = this.settings.height;
	      } else {
	        height = this.svg.getBoundingClientRect().height;
	      } //remove the tree if it is there already


	      select(this.svg).select("g").remove(); // add a group which will contain the new tree

	      select(this.svg).append("g").attr("transform", "translate(".concat(this.margins.left, ",").concat(this.margins.top, ")")); //to selecting every time

	      this.svgSelection = select(this.svg).select("g");
	      this.svgSelection.append("g").attr("class", "annotation-layer");
	      this.svgSelection.append("g").attr("class", "axes-layer");
	      this.svgSelection.append("g").attr("class", "cartoon-layer");
	      this.svgSelection.append("g").attr("class", "branches-layer");

	      if (this.settings.backgroundBorder > 0) {
	        this.svgSelection.append("g").attr("class", "nodes-background-layer");
	      }

	      this.svgSelection.append("g").attr("class", "nodes-layer"); // create the scales

	      var xScale = linear$2().domain(this.layout.horizontalRange).range([this.margins.left, width - this.margins.right]);
	      var yScale = linear$2().domain(this.layout.verticalRange).range([this.margins.top + 20, height - this.margins.bottom - 20]);
	      this.scales = {
	        x: xScale,
	        y: yScale,
	        width: width,
	        height: height
	      };
	      addAxis.call(this, this.margins); // Called whenever the layout changes...

	      this.layout.updateCallback = function () {
	        _this.update();
	      };

	      this.update();
	    }
	    /**
	     * Updates the tree when it has changed
	     */

	  }, {
	    key: "update",
	    value: function update() {
	      var width, height;

	      if (Object.keys(this.settings).indexOf("width") > -1) {
	        width = this.settings.width;
	      } else {
	        width = this.svg.getBoundingClientRect().width;
	      }

	      if (Object.keys(this.settings).indexOf("height") > -1) {
	        height = this.settings.height;
	      } else {
	        height = this.svg.getBoundingClientRect().height;
	      } // update the scales' domains


	      this.scales.x.domain(this.layout.horizontalRange).range([this.margins.left, width - this.margins.right]);
	      this.scales.y.domain(this.layout.verticalRange).range([this.margins.top + 20, height - this.margins.bottom - 20]);
	      this.scales.width = width;
	      this.scales.height = height;
	      updateAxis.call(this);
	      updateAnnoations.call(this);
	      updateCartoons.call(this);
	      updateBranches.call(this);

	      if (this.settings.backgroundBorder > 0) {
	        updateNodeBackgrounds.call(this);
	      }

	      updateNodes.call(this);
	    }
	    /**
	     * set mouseover highlighting of branches
	     */

	  }, {
	    key: "hilightBranches",
	    value: function hilightBranches() {
	      var _this2 = this;

	      this.callbacks.branches.push(function () {
	        // need to use 'function' here so that 'this' refers to the SVG
	        // element being hovered over.
	        var selected = _this2.svgSelection.selectAll(".branch").select(".branch-path");

	        selected.on("mouseover", function (d, i) {
	          select(this).classed("hovered", true);
	        });
	        selected.on("mouseout", function (d, i) {
	          select(this).classed("hovered", false);
	        });
	      });
	      this.update();
	    }
	    /**
	     * Set mouseover highlighting of internal nodes
	     */

	  }, {
	    key: "hilightInternalNodes",
	    value: function hilightInternalNodes() {
	      this.hilightNodes(".internal-node");
	    }
	    /**
	     * Set mouseover highlighting of internal nodes
	     */

	  }, {
	    key: "hilightExternalNodes",
	    value: function hilightExternalNodes() {
	      this.hilightNodes(".external-node");
	    }
	    /**
	     * Set mouseover highlighting of nodes
	     */

	  }, {
	    key: "hilightNodes",
	    value: function hilightNodes(selection) {
	      var _this3 = this;

	      this.callbacks.nodes.push(function () {
	        // need to use 'function' here so that 'this' refers to the SVG
	        // element being hovered over.
	        var self = _this3;

	        var selected = _this3.svgSelection.selectAll(selection);

	        selected.on("mouseover", function (d, i) {
	          var node = select(this).select(".node-shape");
	          self.settings.baubles.forEach(function (bauble) {
	            // if (bauble.vertexFilter(node)) {
	            bauble.updateShapes(node, self.settings.hoverBorder); // }
	          });
	          node.classed("hovered", true);
	        });
	        selected.on("mouseout", function (d, i) {
	          var node = select(this).select(".node-shape");
	          self.settings.baubles.forEach(function (bauble) {
	            // if (bauble.vertexFilter(node)) {
	            bauble.updateShapes(node, 0); // }
	          });
	          node.classed("hovered", false);
	        });
	      });
	      this.update();
	    }
	    /**
	     * Registers action function to be called when an edge is clicked on. The function is passed
	     * edge object that was clicked on and the position of the click as a proportion of the edge length.
	     *
	     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
	     *
	     * @param action
	     * @param selection
	     */

	  }, {
	    key: "onClickBranch",
	    value: function onClickBranch(action) {
	      var _this4 = this;

	      var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      this.callbacks.branches.push(function () {
	        // We need to use the "function" keyword here (rather than an arrow) so that "this"
	        // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
	        // to store a reference to the object in "self".
	        var self = _this4;

	        var selected = _this4.svgSelection.selectAll("".concat(selection ? selection : ".branch"));

	        selected.on("click", function (edge) {
	          var x1 = self.scales.x(edge.v1.x);
	          var x2 = self.scales.x(edge.v0.x);
	          var mx = mouse(this)[0];
	          var proportion = Math.max(0.0, Math.min(1.0, (mx - x2) / (x1 - x2)));
	          action(edge, proportion);
	          self.update();
	        });
	      });
	      this.update();
	    }
	    /**
	     * Registers action function to be called when an internal node is clicked on. The function should
	     * take the tree and the node that was clicked on.
	     *
	     * A static method - Tree.rotate() is available for rotating the node order at the clicked node.
	     *
	     * @param action
	     */

	  }, {
	    key: "onClickInternalNode",
	    value: function onClickInternalNode(action) {
	      this.onClickNode(action, ".internal-node");
	    }
	    /**
	     * Registers action function to be called when an external node is clicked on. The function should
	     * take the tree and the node that was clicked on.
	     *
	     * @param action
	     */

	  }, {
	    key: "onClickExternalNode",
	    value: function onClickExternalNode(action) {
	      this.onClickNode(action, ".external-node");
	    }
	    /**
	     * Registers action function to be called when a vertex is clicked on. The function is passed
	     * the vertex object.
	     *
	     * Optionally a selection string can be provided - i.e., to select a particular node by its id.
	     *
	     * @param action
	     * @param selection
	     */

	  }, {
	    key: "onClickNode",
	    value: function onClickNode(action) {
	      var _this5 = this;

	      var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var self = this;
	      this.callbacks.nodes.push(function () {
	        var selected = _this5.svgSelection.selectAll("".concat(selection ? selection : ".node")).select(".node-shape");

	        selected.on("click", function (vertex) {
	          action(vertex);
	          self.update();
	        });
	      });
	      this.update();
	    }
	    /**
	     * General Nodehover callback
	     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
	     * @param {*} selection defualts to ".node" will select this selection's child ".node-shape"
	     */

	  }, {
	    key: "onHoverNode",
	    value: function onHoverNode(action) {
	      var _this6 = this;

	      var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      this.callbacks.nodes.push(function () {
	        var selected = _this6.svgSelection.selectAll("".concat(selection ? selection : ".node")).select(".node-shape");

	        selected.on("mouseover", function (vertex) {
	          action.enter(vertex);

	          _this6.update();
	        });
	        selected.on("mouseout", function (vertex) {
	          action.exit(vertex);

	          _this6.update();
	        });
	      });
	    }
	    /**
	     * General branch hover callback
	     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
	     * @param {*} selection defualts to .branch
	     */

	  }, {
	    key: "onHoverBranch",
	    value: function onHoverBranch(action) {
	      var _this7 = this;

	      var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      this.callbacks.branches.push(function () {
	        var self = _this7;

	        var selected = _this7.svgSelection.selectAll("".concat(selection ? selection : ".branch"));

	        selected.on("mouseover", function (d, i) {
	          action.enter(d);
	          self.update();
	        });
	        selected.on("mouseout", function (d, i) {
	          action.exit(d);
	          self.update();
	        });
	      });
	      this.update();
	    }
	    /**
	     * Registers some text to appear in a popup box when the mouse hovers over the selection.
	     *
	     * @param selection
	     * @param text
	     */

	  }, {
	    key: "addToolTip",
	    value: function addToolTip(selection, text) {
	      this.svgSelection.selectAll(selection).on("mouseover", function (selected) {
	        var tooltip = document.getElementById("tooltip");

	        if (_typeof_1(text) === _typeof_1("")) {
	          tooltip.innerHTML = text;
	        } else {
	          tooltip.innerHTML = text(selected.node);
	        }

	        tooltip.style.display = "block";
	        tooltip.style.left = event.pageX + 10 + "px";
	        tooltip.style.top = event.pageY + 10 + "px";
	      });
	      this.svgSelection.selectAll(selection).on("mouseout", function () {
	        var tooltip = document.getElementById("tooltip");
	        tooltip.style.display = "none";
	      });
	    }
	  }, {
	    key: "addAnnotation",
	    value: function addAnnotation(annotation) {
	      this._annotations.push(annotation);

	      this.update();
	    }
	  }, {
	    key: "treeLayout",
	    set: function set(layout) {
	      this.layout = layout;
	      this.update();
	    }
	  }]);

	  return FigTree;
	}();
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * Adds or updates nodes
	 */

	function updateNodes() {
	  var _this8 = this;

	  var nodesLayer = select(this.svg).select(".nodes-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var nodes = nodesLayer.selectAll(".node").data(this.layout.vertices, function (v) {
	    return "n_".concat(v.key);
	  }); // ENTER
	  // Create new elements as needed.

	  var newNodes = nodes.enter().append("g").attr("id", function (v) {
	    return v.id;
	  }).attr("class", function (v) {
	    return ["node"].concat(toConsumableArray(v.classes)).join(" ");
	  }).attr("transform", function (v) {
	    return "translate(".concat(_this8.scales.x(v.x), ", ").concat(_this8.scales.y(v.y), ")");
	  }); // add the specific node shapes or 'baubles'

	  this.settings.baubles.forEach(function (bauble) {
	    var d = bauble.createShapes(newNodes.filter(bauble.vertexFilter)).attr("class", "node-shape");
	    bauble.updateShapes(d);
	  });
	  newNodes.append("text").attr("class", "node-label name").attr("text-anchor", "start").attr("alignment-baseline", "middle").attr("dx", "12").attr("dy", "0").text(function (d) {
	    return d.rightLabel;
	  });
	  newNodes.append("text").attr("class", "node-label support").attr("text-anchor", "end").attr("dx", "-6").attr("dy", function (d) {
	    return d.labelBelow ? -8 : +8;
	  }).attr("alignment-baseline", function (d) {
	    return d.labelBelow ? "bottom" : "hanging";
	  }).text(function (d) {
	    return d.leftLabel;
	  }); // update the existing elements

	  nodes.transition().duration(this.settings.transitionDuration).ease(this.settings.transitionEase).attr("class", function (v) {
	    return ["node"].concat(toConsumableArray(v.classes)).join(" ");
	  }).attr("transform", function (v) {
	    return "translate(".concat(_this8.scales.x(v.x), ", ").concat(_this8.scales.y(v.y), ")");
	  }); // update all the baubles

	  this.settings.baubles.forEach(function (bauble) {
	    var d = nodes.select(".node-shape").filter(bauble.vertexFilter).transition().duration(_this8.settings.transitionDuration).ease(_this8.settings.transitionEase);
	    bauble.updateShapes(d);
	  });
	  nodes.select("text .node-label .name").transition().duration(this.settings.transitionDuration).ease(this.settings.transitionEase).attr("class", "node-label name").attr("text-anchor", "start").attr("alignment-baseline", "middle").attr("dx", "12").attr("dy", "0").text(function (d) {
	    return d.rightLabel;
	  });
	  nodes.select("text .node-label .support").transition().duration(this.settings.transitionDuration).ease(this.settings.transitionEase).attr("alignment-baseline", function (d) {
	    return d.labelBelow ? "bottom" : "hanging";
	  }).attr("class", "node-label support").attr("text-anchor", "end").attr("dx", "-6").attr("dy", function (d) {
	    return d.labelBelow ? -8 : +8;
	  }).text(function (d) {
	    return d.leftLabel;
	  }); // EXIT
	  // Remove old elements as needed.

	  nodes.exit().remove();
	  updateNodeStyles.call(this); // add callbacks

	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = this.callbacks.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var callback = _step.value;
	      callback();
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	        _iterator["return"]();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	}

	function updateNodeBackgrounds() {
	  var _this9 = this;

	  var nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var nodes = nodesBackgroundLayer.selectAll(".node-background").data(this.layout.vertices, function (v) {
	    return "nb_".concat(v.key);
	  }); // ENTER
	  // Create new elements as needed.

	  var newNodes = nodes.enter(); // add the specific node shapes or 'baubles'

	  this.settings.baubles.forEach(function (bauble) {
	    var d = bauble.createShapes(newNodes.filter(bauble.vertexFilter)).attr("class", "node-background").attr("transform", function (v) {
	      return "translate(".concat(_this9.scales.x(v.x), ", ").concat(_this9.scales.y(v.y), ")");
	    });
	    bauble.updateShapes(d, _this9.settings.backgroundBorder);
	  }); // update all the existing elements

	  this.settings.baubles.forEach(function (bauble) {
	    var d = nodes.filter(bauble.vertexFilter).transition().duration(_this9.settings.transitionDuration).ease(_this9.settings.transitionEase).attr("transform", function (v) {
	      return "translate(".concat(_this9.scales.x(v.x), ", ").concat(_this9.scales.y(v.y), ")");
	    });
	    bauble.updateShapes(d, _this9.settings.backgroundBorder);
	  }); // EXIT
	  // Remove old elements as needed.

	  nodes.exit().remove();
	  updateNodeBackgroundStyles.call(this);
	}
	/**
	 * Adds or updates branch lines
	 */


	function updateBranches() {
	  var _this10 = this;

	  var branchesLayer = this.svgSelection.select(".branches-layer"); // a function to create a line path
	  // const branchPath = d3.line()
	  //     .x((v) => v.x)
	  //     .y((v) => v.y)
	  //     .curve(this.layout.branchCurve);

	  var branchPath = this.layout.branchPathGenerator(this.scales); // DATA JOIN
	  // Join new data with old elements, if any.

	  var branches = branchesLayer.selectAll("g .branch").data(this.layout.edges, function (e) {
	    return "b_".concat(e.key);
	  }); // ENTER
	  // Create new elements as needed.

	  var newBranches = branches.enter().append("g").attr("id", function (e) {
	    return e.id;
	  }).attr("class", function (e) {
	    return ["branch"].concat(toConsumableArray(e.classes)).join(" ");
	  }).attr("transform", function (e) {
	    return "translate(".concat(_this10.scales.x(e.v0.x), ", ").concat(_this10.scales.y(e.v1.y), ")");
	  });
	  newBranches.append("path").attr("class", "branch-path").attr("d", function (e, i) {
	    return branchPath(e, i);
	  });
	  newBranches.append("text").attr("class", "branch-label length").attr("dx", function (e) {
	    return (_this10.scales.x(e.v1.x) - _this10.scales.x(e.v0.x)) / 2;
	  }).attr("dy", function (e) {
	    return e.labelBelow ? +6 : -6;
	  }).attr("alignment-baseline", function (e) {
	    return e.labelBelow ? "hanging" : "bottom";
	  }).attr("text-anchor", "middle").text(function (e) {
	    return e.label;
	  }); // update the existing elements

	  branches.transition().duration(this.settings.transitionDuration).ease(this.settings.transitionEase).attr("class", function (e) {
	    return ["branch"].concat(toConsumableArray(e.classes)).join(" ");
	  }).attr("transform", function (e) {
	    return "translate(".concat(_this10.scales.x(e.v0.x), ", ").concat(_this10.scales.y(e.v1.y), ")");
	  }).select("path").attr("d", function (e, i) {
	    return branchPath(e, i);
	  }).select("text .branch-label .length").attr("class", "branch-label length").attr("dx", function (e) {
	    return (_this10.scales.x(e.v1.x) - _this10.scales.x(e.v0.x)) / 2;
	  }).attr("dy", function (e) {
	    return e.labelBelow ? +6 : -6;
	  }).attr("alignment-baseline", function (e) {
	    return e.labelBelow ? "hanging" : "bottom";
	  }).attr("text-anchor", "middle").text(function (e) {
	    return e.label;
	  }); // EXIT
	  // Remove old elements as needed.

	  branches.exit().remove();
	  updateBranchStyles.call(this); // add callbacks

	  var _iteratorNormalCompletion2 = true;
	  var _didIteratorError2 = false;
	  var _iteratorError2 = undefined;

	  try {
	    for (var _iterator2 = this.callbacks.branches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	      var callback = _step2.value;
	      callback();
	    }
	  } catch (err) {
	    _didIteratorError2 = true;
	    _iteratorError2 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
	        _iterator2["return"]();
	      }
	    } finally {
	      if (_didIteratorError2) {
	        throw _iteratorError2;
	      }
	    }
	  }
	}

	function updateCartoons() {
	  var _this11 = this;

	  var cartoonLayer = this.svgSelection.select(".cartoon-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var cartoons = cartoonLayer.selectAll("g .cartoon").data(this.layout.cartoons, function (c) {
	    return "c_".concat(c.id);
	  }); // ENTER
	  // Create new elements as needed.

	  var newCartoons = cartoons.enter().append("g").attr("id", function (c) {
	    return "cartoon-".concat(c.id);
	  }).attr("class", function (c) {
	    return ["cartoon"].concat(toConsumableArray(c.classes)).join(" ");
	  }).attr("transform", function (c) {
	    return "translate(".concat(_this11.scales.x(c.vertices[0].x), ", ").concat(_this11.scales.y(c.vertices[0].y), ")");
	  });
	  newCartoons.append("path").attr("class", "cartoon-path").attr("d", function (e, i) {
	    return pointToPoint.call(_this11, e.vertices);
	  }); // update the existing elements

	  cartoons.transition().duration(this.settings.transitionDuration).ease(this.settings.transitionEase).attr("class", function (c) {
	    return ["cartoon"].concat(toConsumableArray(c.classes)).join(" ");
	  }).attr("transform", function (c) {
	    return "translate(".concat(_this11.scales.x(c.vertices[0].x), ", ").concat(_this11.scales.y(c.vertices[0].y), ")");
	  }).select("path").attr("d", function (c) {
	    return pointToPoint.call(_this11, c.vertices);
	  }); // EXIT
	  // Remove old elements as needed.

	  cartoons.exit().remove();
	  updateCartoonStyles.call(this); // add callbacks

	  var _iteratorNormalCompletion3 = true;
	  var _didIteratorError3 = false;
	  var _iteratorError3 = undefined;

	  try {
	    for (var _iterator3 = this.callbacks.cartoons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	      var callback = _step3.value;
	      callback();
	    }
	  } catch (err) {
	    _didIteratorError3 = true;
	    _iteratorError3 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
	        _iterator3["return"]();
	      }
	    } finally {
	      if (_didIteratorError3) {
	        throw _iteratorError3;
	      }
	    }
	  }
	}
	/**
	 * Add axis
	 */


	function addAxis() {
	  var xAxis = axisBottom(linear$2().domain(this.layout.horizontalScale.domain()).range(this.scales.x.range())).ticks(this.settings.ticks).tickFormat(this.settings.tickFormat);
	  var xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
	  var axesLayer = this.svgSelection.select(".axes-layer");
	  axesLayer.append("g").attr("id", "x-axis").attr("class", "axis").attr("transform", "translate(0, ".concat(this.scales.height - this.margins.bottom + 5, ")")).call(xAxis);
	  axesLayer.append("g").attr("id", "x-axis-label").attr("class", "axis-label").attr("transform", "translate(".concat(this.margins.left, ", ").concat(this.scales.height - this.margins.bottom, ")")).append("text").attr("transform", "translate(".concat(xAxisWidth / 2, ", 35)")).attr("alignment-baseline", "hanging").style("text-anchor", "middle").text(this.settings.xAxisTitle);
	}

	function updateAxis() {
	  var xAxis = axisBottom(linear$2().domain(this.layout.horizontalScale.domain()).range(this.scales.x.range())).ticks(this.settings.ticks).tickFormat(this.settings.tickFormat);
	  var xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
	  var axesLayer = this.svgSelection.select(".axes-layer");
	  axesLayer.select("#x-axis").call(xAxis);
	}

	function updateNodeStyles() {
	  var _this12 = this;

	  var nodesLayer = select(this.svg).select(".nodes-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var nodes = nodesLayer.selectAll(".node .node-shape");
	  var nodeStyles = this.settings.styles.nodes;

	  var _loop = function _loop() {
	    var key = _Object$keys2[_i2];
	    nodes // .transition()
	    // .duration(this.settings.transitionDuration)
	    .attr(key, function (d) {
	      return nodeStyles[key].call(_this12, d.node);
	    });
	  };

	  for (var _i2 = 0, _Object$keys2 = Object.keys(nodeStyles); _i2 < _Object$keys2.length; _i2++) {
	    _loop();
	  }
	}

	function updateNodeBackgroundStyles() {
	  var _this13 = this;

	  var nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var nodes = nodesBackgroundLayer.selectAll(".node-background");
	  var nodeBackgroundsStyles = this.settings.styles.nodeBackgrounds;

	  var _loop2 = function _loop2() {
	    var key = _Object$keys3[_i3];
	    nodes // .transition()
	    // .duration(this.settings.transitionDuration)
	    .attr(key, function (d) {
	      return nodeBackgroundsStyles[key].call(_this13, d.node);
	    });
	  };

	  for (var _i3 = 0, _Object$keys3 = Object.keys(nodeBackgroundsStyles); _i3 < _Object$keys3.length; _i3++) {
	    _loop2();
	  }
	}

	function updateBranchStyles() {
	  var _this14 = this;

	  var branchesLayer = this.svgSelection.select(".branches-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var branches = branchesLayer.selectAll("g .branch .branch-path");
	  var branchStyles = this.settings.styles["branches"];

	  var _loop3 = function _loop3() {
	    var key = _Object$keys4[_i4];
	    branches // .transition()
	    // .duration(this.settings.transitionDuration)
	    .attr(key, function (d) {
	      return branchStyles[key].call(_this14, d.v1.node);
	    });
	  };

	  for (var _i4 = 0, _Object$keys4 = Object.keys(branchStyles); _i4 < _Object$keys4.length; _i4++) {
	    _loop3();
	  }
	}

	function updateCartoonStyles() {
	  var _this15 = this;

	  var cartoonLayer = this.svgSelection.select(".cartoon-layer"); // DATA JOIN
	  // Join new data with old elements, if any.

	  var cartoons = cartoonLayer.selectAll(".cartoon path");
	  var CartoonStyles = this.settings.styles.cartoons;

	  var _loop4 = function _loop4() {
	    var key = _Object$keys5[_i5];
	    cartoons // .transition()
	    // .duration(this.settings.transitionDuration)
	    .attr(key, function (c) {
	      return CartoonStyles[key].call(_this15, c.vertices[0].node);
	    }); // attributes are set by the "root" node
	  };

	  for (var _i5 = 0, _Object$keys5 = Object.keys(CartoonStyles); _i5 < _Object$keys5.length; _i5++) {
	    _loop4();
	  }
	}

	function pointToPoint(points) {
	  var path = [];
	  var origin = points[0];
	  var pathPoints = points.reverse();
	  var currentPoint = origin;
	  var _iteratorNormalCompletion4 = true;
	  var _didIteratorError4 = false;
	  var _iteratorError4 = undefined;

	  try {
	    for (var _iterator4 = pathPoints[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	      var point = _step4.value;
	      var xdiff = this.scales.x(point.x) - this.scales.x(currentPoint.x);
	      var ydiff = this.scales.y(point.y) - this.scales.y(currentPoint.y);
	      path.push("".concat(xdiff, " ").concat(ydiff));
	      currentPoint = point;
	    }
	  } catch (err) {
	    _didIteratorError4 = true;
	    _iteratorError4 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
	        _iterator4["return"]();
	      }
	    } finally {
	      if (_didIteratorError4) {
	        throw _iteratorError4;
	      }
	    }
	  }

	  return "M 0 0 l ".concat(path.join(" l "), " z");
	}

	function updateAnnoations() {
	  var _iteratorNormalCompletion5 = true;
	  var _didIteratorError5 = false;
	  var _iteratorError5 = undefined;

	  try {
	    for (var _iterator5 = this._annotations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	      var annotation = _step5.value;
	      annotation.call(this);
	    }
	  } catch (err) {
	    _didIteratorError5 = true;
	    _iteratorError5 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
	        _iterator5["return"]();
	      }
	    } finally {
	      if (_didIteratorError5) {
	        throw _iteratorError5;
	      }
	    }
	  }
	} //TODO add interactive callbacks to instance so that when nodes are made again they can access those functions
	//TODO transtion on incoming and outgoing objects so they match the movement in the diagram;

	var Graph =
	/*#__PURE__*/
	function () {
	  function Graph() {
	    var _this = this;

	    var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	    var edges = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
	      acyclicSelector: function acyclicSelector(e) {
	        return true;
	      }
	    };

	    classCallCheck(this, Graph);

	    this.nodeList = [];
	    this.nodeMap = new Map();
	    this.outGoingEdgeMap = new Map();
	    this.incomingEdgeMap = new Map();
	    this.edgeList = [];
	    this.edgeMap = new Map();
	    this.acyclicSelector = settings.acyclicSelector;
	    nodes.forEach(function (node) {
	      return _this.addNode(node);
	    });
	    edges.forEach(function (edge) {
	      var metaData = edge.metaData ? edge.metaData : {};

	      _this.drawEdge(edge.source, edge.target, metaData);
	    }); // This is used in identifying terminal tips  
	  }

	  createClass(Graph, [{
	    key: "addNode",

	    /**
	     * Adds a node to the graph.
	     * @param {*} node 
	     */
	    value: function addNode(node) {
	      if (!node.id) {
	        throw new Error("All node's must contain an 'id' key ".concat(node));
	      }

	      this.nodeList.push(node);

	      if (this.nodeMap.has(node.id)) {
	        throw new Error("All node's must have unique id values ".concat(node.id, " seen twice"));
	      }

	      this.nodeMap.set(node.id, node);
	      this.outGoingEdgeMap.set(node, []);
	      this.incomingEdgeMap.set(node, []);
	    }
	    /**
	     * return a node given the key
	     * @param {*} id the node id value 
	     */

	  }, {
	    key: "getNode",
	    value: function getNode(id) {
	      return this.nodeMap.get(id);
	    }
	    /**
	     * Get the edges entering a node
	     * @param {*} node 
	     * @returns {array} array of edges that end with the node
	     */

	  }, {
	    key: "getIncomingEdges",
	    value: function getIncomingEdges(node) {
	      return this.incomingEdgeMap.get(node);
	    }
	    /**
	     * Get the edges leaving a node
	     * @param {*} node 
	     * @returns {array} array of edges that begin with the node
	     */

	  }, {
	    key: "getOutgoingEdges",
	    value: function getOutgoingEdges(node) {
	      return this.outGoingEdgeMap.get(node);
	    }
	    /**
	     * Get all the edges leaving and entering a node
	     * @param {*} node
	     * @returns {array} array of edges that touch node
	     */

	  }, {
	    key: "getEdges",
	    value: function getEdges(node) {
	      return this.getOutgoingEdges(node).concat(this.getIncomingEdges(node));
	    }
	  }, {
	    key: "getNodeInfo",
	    value: function getNodeInfo(node) {} // const formatDate=d3.timeFormat("%Y-%m-%d")
	    // let outString = `${node.id} </br>`
	    // // for(const key of Object.keys(node)){
	    // //     if(node[key]){
	    // //         if(key!=="id"&& key!=="metaData"&&key!=="key"){
	    // //             if(key.toLowerCase().indexOf("date")>-1){
	    // //                 outString = `${outString}${key}: ${node[key].toISOString().substring(0, 10)}</br>`;
	    // //                 }else{
	    // //                 outString = `${outString}${key}: ${node[key]}</br>`;
	    // //                 }            
	    // //             }
	    // //     }
	    // // }
	    // for(const key of Object.keys(node.metaData)){
	    //     if(key.toLowerCase().indexOf("date")>-1){
	    //     outString = `${outString}${key}: ${node.metaData[key].toISOString().substring(0, 10)}</br>`;
	    //     }else{
	    //     outString = `${outString}${key}: ${node.metaData[key]}</br>`;
	    //     }
	    // }
	    // return outString;

	    /**
	     * removes the node and incoming/outgoing edges
	     * @param {object} node 
	     */

	  }, {
	    key: "removeNode",
	    value: function removeNode(node) {
	      var _this2 = this;

	      //remove edges
	      var edges = this.getEdges(node);
	      edges.forEach(function (edge) {
	        return _this2.removeEdge(edge);
	      });
	      var id = node.id;
	      this.nodeList = this.nodeList.filter(function (node) {
	        return node.id !== id;
	      });
	      this.nodeMap["delete"](id);
	      this.incomingEdgeMap["delete"](node);
	      this.outGoingEdgeMap["delete"](node);
	    }
	    /**
	    * @returns {*} 
	    */

	  }, {
	    key: "getEdge",

	    /**
	     * returns the edge
	     * @param {Symbol()} id - symbol key of the edge
	     * @returns {*} edge
	     */
	    value: function getEdge(id) {
	      return this.edgeMap.get(id);
	    }
	  }, {
	    key: "getEdgeInfo",
	    value: function getEdgeInfo(edge) {} // // const formatDate=d3.timeFormat("%Y-%m-%d")
	    // let outString = `Source:${edge.source.id} </br> Target: ${edge.target.id}</br>`;
	    // for(const key of Object.keys(edge.metaData)){
	    //     if(key.toLowerCase().indexOf("date")>-1){
	    //     outString = `${outString}${key}: ${edge.metaData[key].toISOString().substring(0, 10)}</br>`;
	    //     }else{
	    //     outString = `${outString}${key}: ${edge.metaData[key]}</br>`;
	    //     }
	    // }
	    // return outString;

	    /**
	    * Adds an edge between the provide source and target nodes. It the nodes are not part of the graph they are added.
	    * @param {String} sourceNode Id
	    * @param {String} targetNode Id
	    */

	  }, {
	    key: "drawEdge",
	    value: function drawEdge(sourceNodeId, targetNodeId) {
	      var metaData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      if (!this.nodeMap.has(sourceNodeId)) {
	        throw new Error("".concat(sourceNodeId, " not found in graph"));
	      }

	      if (!this.nodeMap.has(targetNodeId)) {
	        throw new Error("".concat(targetNodeId, " not found in graph"));
	      }

	      var index = this.edgeList.length;
	      var edge = {
	        source: this.getNode(sourceNodeId),
	        target: this.getNode(targetNodeId),
	        id: "edge_".concat(index),
	        metaData: metaData
	      };
	      this.addEdge(edge);
	    }
	    /**
	     * Adds an premade edge which between the provide source and target nodes. It the nodes are not part of the graph they are added.
	     * @param {*} {source:node, targe:node} 
	     */

	  }, {
	    key: "addEdge",
	    value: function addEdge(edge) {
	      this.edgeList.push(edge);
	      this.edgeMap.set(edge.id, edge);
	      this.outGoingEdgeMap.get(edge.source).push(edge);
	      this.incomingEdgeMap.get(edge.target).push(edge);
	    }
	    /**
	     * removes an edge from the graph
	     * @param {*} edge 
	     */

	  }, {
	    key: "removeEdge",
	    value: function removeEdge(edge) {
	      var id = edge.id;
	      this.edgeList = this.edgeList.filter(function (edge) {
	        return edge.id !== id;
	      }); // update edgemaps

	      this.edgeMap["delete"](id); // new outgoing

	      var newOutgoing = this.getOutgoingEdges(edge.source).filter(function (e) {
	        return e !== edge;
	      });
	      this.outGoingEdgeMap.set(edge.source, newOutgoing);
	      var newIncoming = this.getIncomingEdges(edge.target).filter(function (e) {
	        return e !== edge;
	      });
	      this.incomingEdgeMap.set(edge.target, newIncoming);
	    }
	    /**
	     * Inserts a node into an edge. This replaced the edge with two new edges which pass through the node.
	     * @param {*} node 
	     * @param {*} edge 
	     */

	  }, {
	    key: "insertNode",
	    value: function insertNode(node, edge) {
	      if (!this.nodeMap.has(node.id)) {
	        this.addNode(node);
	      }

	      this.drawEdge(edge.source.id, node.id);
	      this.drawEdge(node.id, edge.target.id);
	      this.removeEdge(edge);
	    }
	    /**
	     * A function to return a sub graph given an arrary of nodes.
	     * @param {array} nodes - An array of nodes
	     * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
	     * @returns {*} A graph object including the provided nodes and edges linking the node. If there is no path between all nodes the 
	     * object will be empty 
	     */

	  }, {
	    key: "getSubGraph",
	    value: function getSubGraph(nodes) {
	    } // check there is a path between all nodes
	    // const preorder= [...this.preorder(nodes[0])];
	    // if(nodes.some(n=>preorder.indexOf(n)===-1)){ 
	    //     // If there is at least 1 node not hit in the traversal
	    //     return new Graph();
	    // }
	    // const edges = nodes.map(n=>[...this.getOutgoingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.target)>-1),
	    //                             ...this.getIncomingEdges(n).filter(e=>options.filterEdges(e)).filter(e=>nodes.indexOf(e.source)>-1)]);
	    // const uniqueEdges = [...new Set(edges)];
	    // const subGraph = new Graph();
	    // return new Graph();
	    // nodes,uniqueEdges)

	    /**
	    * A function returning 
	    * @param {*} nodes - An array of nodes
	    * @param {*} options - an optional object with filterEdges:function() that filters the edges used in the traversal
	    * @returns {*} 
	    * Not yet implimented. Should each path be a sub-graph?
	    */

	  }, {
	    key: "getPaths",
	    value: function getPaths(node1, node2) {
	      // check there is a path between all nodes
	      throw new Error("Not yet implimented");
	    } // -----------  Methods rejigged from figtree.js tree object -----------------------------

	    /**
	     * Reverses the order of the children of the given node. If 'recursive=true' then it will
	     * descend down the subtree reversing all the sub nodes.
	     *
	     * @param node
	     * @param recursive
	     */
	    // add options with edgeFilter callback

	  }, {
	    key: "rotate",
	    value: function rotate(node) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
	        recursive: false
	      };

	      var nodesToVisit = toConsumableArray(this.preorder(node));

	      var outGoingEdges = this.getOutgoingEdges(node);

	      if (options.recursive) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = nodesToVisit[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var n = _step.value;
	            //Needs to avoid circulare loops 
	            var nOutGoingEdges = this.getOutgoingEdges(n);
	            nOutGoingEdges.reverse();
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	              _iterator["return"]();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	      } else {
	        outGoingEdges.reverse();
	      }
	    }
	  }, {
	    key: "order",

	    /**
	     * Sorts the child branches of each node in order of increasing or decreasing number
	     * of tips. This operates recursively from the node given.
	     *
	     * @param node - the node to start sorting from
	     * @param {boolean} increasing - sorting in increasing node order or decreasing?
	     * @returns {number} - the number of tips below this node
	     */
	    value: function order(node, increasing) {} // // orderNodes.call(this, node, increasing, this.treeUpdateCallback);
	    // orderNodes.call(this, node,increasing);
	    // // this.treeUpdateCallback();

	    /**
	     * A generator function that returns the nodes in a pre-order traversal. Starting at 
	     * node. An optional options objects can be used to select which edges are used in the traversal
	     * @param {*} node 
	     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */

	  }, {
	    key: "preorder",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function preorder(node) {
	      var self, traverse;
	      return regenerator.wrap(function preorder$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              // We have to mark nodes as visited since it is possible to cycle back
	              this.edgeList.forEach(function (e) {
	                return e.visited = false;
	              });
	              this.nodeList.forEach(function (n) {
	                return n.visited = false;
	              });
	              self = this;
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node) {
	                var edges, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, edge, nextNode;

	                return regenerator.wrap(function traverse$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        _context.next = 2;
	                        return node;

	                      case 2:
	                        edges = self.getEdges(node).filter(function (e) {
	                          return self.acyclicSelector(e);
	                        }); // don't need all this if using acyclic edges

	                        if (!(edges.length > 0)) {
	                          _context.next = 37;
	                          break;
	                        }

	                        _iteratorNormalCompletion2 = true;
	                        _didIteratorError2 = false;
	                        _iteratorError2 = undefined;
	                        _context.prev = 7;
	                        _iterator2 = edges[Symbol.iterator]();

	                      case 9:
	                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
	                          _context.next = 23;
	                          break;
	                        }

	                        edge = _step2.value;

	                        if (edge.visited) {
	                          _context.next = 20;
	                          break;
	                        }

	                        nextNode = void 0;

	                        if (node === edge.source) {
	                          nextNode = edge.target;
	                        } else {
	                          nextNode = edge.source;
	                        }

	                        if (nextNode.visited) {
	                          _context.next = 19;
	                          break;
	                        }

	                        edge.visited = true;
	                        return _context.delegateYield(traverse(nextNode), "t0", 17);

	                      case 17:
	                        _context.next = 20;
	                        break;

	                      case 19:
	                        edge.visited = true; // technically a back edge

	                      case 20:
	                        _iteratorNormalCompletion2 = true;
	                        _context.next = 9;
	                        break;

	                      case 23:
	                        _context.next = 29;
	                        break;

	                      case 25:
	                        _context.prev = 25;
	                        _context.t1 = _context["catch"](7);
	                        _didIteratorError2 = true;
	                        _iteratorError2 = _context.t1;

	                      case 29:
	                        _context.prev = 29;
	                        _context.prev = 30;

	                        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
	                          _iterator2["return"]();
	                        }

	                      case 32:
	                        _context.prev = 32;

	                        if (!_didIteratorError2) {
	                          _context.next = 35;
	                          break;
	                        }

	                        throw _iteratorError2;

	                      case 35:
	                        return _context.finish(32);

	                      case 36:
	                        return _context.finish(29);

	                      case 37:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, traverse, null, [[7, 25, 29, 37], [30,, 32, 36]]);
	              });
	              return _context2.delegateYield(traverse(node), "t0", 5);

	            case 5:
	              this.edgeList.forEach(function (e) {
	                return delete e["visited"];
	              });
	              this.nodeList.forEach(function (n) {
	                return delete n["visited"];
	              });

	            case 7:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, preorder, this);
	    })
	    /**
	     * A generator function that returns the nodes in a post-order traversal. Starting at 
	     * node. An optional options objects can be used to select which edges are used in the traversal
	     * @param {*} node 
	     * @param {object} options - an optional object with filterEdges:function() that filters the edges used in the traversal
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */

	  }, {
	    key: "postorder",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function postorder(node) {
	      var self, traverse;
	      return regenerator.wrap(function postorder$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              // We have to mark nodes as visited since it is possible to cycle back
	              this.edgeList.forEach(function (e) {
	                return e.visited = false;
	              });
	              this.nodeList.forEach(function (n) {
	                return n.visited = false;
	              });
	              self = this;
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node) {
	                var edges, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, edge, nextNode;

	                return regenerator.wrap(function traverse$(_context3) {
	                  while (1) {
	                    switch (_context3.prev = _context3.next) {
	                      case 0:
	                        edges = self.getEdges(node).filter(function (e) {
	                          return self.acyclicSelector(e);
	                        }); // don't need all this if using acyclic edges

	                        if (!(edges.length > 0)) {
	                          _context3.next = 35;
	                          break;
	                        }

	                        _iteratorNormalCompletion3 = true;
	                        _didIteratorError3 = false;
	                        _iteratorError3 = undefined;
	                        _context3.prev = 5;
	                        _iterator3 = edges[Symbol.iterator]();

	                      case 7:
	                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
	                          _context3.next = 21;
	                          break;
	                        }

	                        edge = _step3.value;

	                        if (edge.visited) {
	                          _context3.next = 18;
	                          break;
	                        }

	                        nextNode = void 0;

	                        if (node === edge.source) {
	                          nextNode = edge.target;
	                        } else {
	                          nextNode = edge.source;
	                        }

	                        if (nextNode.visited) {
	                          _context3.next = 17;
	                          break;
	                        }

	                        edge.visited = true;
	                        return _context3.delegateYield(traverse(nextNode), "t0", 15);

	                      case 15:
	                        _context3.next = 18;
	                        break;

	                      case 17:
	                        edge.visited = true; // technically a back edge

	                      case 18:
	                        _iteratorNormalCompletion3 = true;
	                        _context3.next = 7;
	                        break;

	                      case 21:
	                        _context3.next = 27;
	                        break;

	                      case 23:
	                        _context3.prev = 23;
	                        _context3.t1 = _context3["catch"](5);
	                        _didIteratorError3 = true;
	                        _iteratorError3 = _context3.t1;

	                      case 27:
	                        _context3.prev = 27;
	                        _context3.prev = 28;

	                        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
	                          _iterator3["return"]();
	                        }

	                      case 30:
	                        _context3.prev = 30;

	                        if (!_didIteratorError3) {
	                          _context3.next = 33;
	                          break;
	                        }

	                        throw _iteratorError3;

	                      case 33:
	                        return _context3.finish(30);

	                      case 34:
	                        return _context3.finish(27);

	                      case 35:
	                        _context3.next = 37;
	                        return node;

	                      case 37:
	                      case "end":
	                        return _context3.stop();
	                    }
	                  }
	                }, traverse, null, [[5, 23, 27, 35], [28,, 30, 34]]);
	              });
	              return _context4.delegateYield(traverse(node), "t0", 5);

	            case 5:
	              this.edgeList.forEach(function (e) {
	                return delete e["visited"];
	              });
	              this.nodeList.forEach(function (n) {
	                return delete n["visited"];
	              });

	            case 7:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, postorder, this);
	    })
	  }, {
	    key: "nodes",

	    /**
	     * @returns {*}
	     */
	    get: function get() {
	      return this.nodeList;
	    }
	    /**
	     * @returns {*}
	     */

	  }, {
	    key: "externalNodes",
	    get: function get() {
	      var _this3 = this;

	      return this.nodeList.filter(function (d) {
	        return _this3.getOutgoingEdges().length === 0;
	      });
	    }
	  }, {
	    key: "edges",
	    get: function get() {
	      return this.edgeList;
	    }
	  }], [{
	    key: "fromPhylogeny",

	    /**
	     * A static function to make a graph out of a tree
	     * @param {*} tree 
	     * @returns {Graph}
	     */
	    value: function fromPhylogeny(tree) {
	      var nodes = tree.externalNodes; // links inferred from the transmission layout
	      // will also need a call back somewhere to update the links
	    }
	  }]);

	  return Graph;
	}();

	/**
	 * The RootToTipPlot class
	 */

	var RootToTipPlot =
	/*#__PURE__*/
	function () {
	  createClass(RootToTipPlot, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        xAxisTickArguments: [5, "d"],
	        xAxisTitle: "Time",
	        yAxisTickArguments: [5, "f"],
	        yAxisTitle: "Divergence",
	        nodeRadius: 6,
	        hoverNodeRadius: 8,
	        backgroundBorder: 1,
	        slopeFormat: ",.2f",
	        r2Format: ",.2f"
	      };
	    }
	    /**
	     * The constructor.
	     * @param svg
	     * @param tree
	     * @param margins
	     * @param settings
	     */

	  }]);

	  function RootToTipPlot(svg, tree, margins) {
	    var _this = this;

	    var settings = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	    classCallCheck(this, RootToTipPlot);

	    this.svg = svg;
	    this.tree = tree; // merge the default settings with the supplied settings

	    this.settings = objectSpread({}, RootToTipPlot.DEFAULT_SETTINGS(), settings);
	    this.points = tree.externalNodes.map(function (tip) {
	      return {
	        name: tip.name,
	        node: tip,
	        x: tip.annotations.date,
	        y: tree.rootToTipLength(tip)
	      };
	    });
	    this.tipNodes = {};
	    tree.externalNodes.forEach(function (tip) {
	      return _this.tipNodes[tip.name] = tip;
	    }); // call the private methods to create the components of the diagram

	    createElements.call(this, svg, margins);
	  }
	  /**
	   * returns slope, intercept and r-square of the line
	   * @param data
	   * @returns {{slope: number, xIntercept: number, yIntercept: number, rSquare: number, y: (function(*): number)}}
	   */


	  createClass(RootToTipPlot, [{
	    key: "leastSquares",
	    value: function leastSquares(data) {
	      var xBar = data.reduce(function (a, b) {
	        return a + b.x;
	      }, 0.0) / data.length;
	      var yBar = data.reduce(function (a, b) {
	        return a + b.y;
	      }, 0.0) / data.length;
	      var ssXX = data.map(function (d) {
	        return Math.pow(d.x - xBar, 2);
	      }).reduce(function (a, b) {
	        return a + b;
	      }, 0.0);
	      var ssYY = data.map(function (d) {
	        return Math.pow(d.y - yBar, 2);
	      }).reduce(function (a, b) {
	        return a + b;
	      }, 0.0);
	      var ssXY = data.map(function (d) {
	        return (d.x - xBar) * (d.y - yBar);
	      }).reduce(function (a, b) {
	        return a + b;
	      }, 0.0);
	      var slope = ssXY / ssXX;
	      var yIntercept = yBar - xBar * slope;
	      var xIntercept = -(yIntercept / slope);
	      var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
	      return {
	        slope: slope,
	        xIntercept: xIntercept,
	        yIntercept: yIntercept,
	        rSquare: rSquare,
	        y: function y(x) {
	          return x * slope + yIntercept;
	        }
	      };
	    }
	    /**
	     * Updates the plot when the data has changed
	     */

	  }, {
	    key: "update",
	    value: function update() {
	      var _this2 = this;

	      this.points.forEach(function (point) {
	        point.y = _this2.tree.rootToTipLength(point.node);
	      });
	      var x1 = min(this.points, function (d) {
	        return d.x;
	      });
	      var x2 = max(this.points, function (d) {
	        return d.x;
	      });
	      var y1 = 0.0;
	      var y2 = max(this.points, function (d) {
	        return d.y;
	      }); // least squares regression

	      var selectedPoints = this.points.filter(function (point) {
	        return !point.node.isSelected;
	      });
	      var regression = this.leastSquares(selectedPoints);

	      if (selectedPoints.length > 1 && regression.slope > 0.0) {
	        x1 = regression.xIntercept;
	        y2 = max([regression.y(x2), y2]);
	      } // update the scales for the plot


	      this.scales.x.domain([x1, x2]).nice();
	      this.scales.y.domain([y1, y2]).nice();
	      var xAxis = axisBottom(this.scales.x).tickArguments(this.settings.xAxisTickArguments);
	      var yAxis = axisLeft(this.scales.y).tickArguments(this.settings.yAxisTickArguments);
	      this.svgSelection.select("#x-axis").transition().duration(500).call(xAxis);
	      this.svgSelection.select("#y-axis").transition().duration(500).call(yAxis); // update trend line

	      var line = this.svgSelection.select("#regression");

	      if (selectedPoints.length > 1) {
	        line.transition().duration(500).attr("x1", this.scales.x(x1)).attr("y1", this.scales.y(regression.y(x1))).attr("x2", this.scales.x(x2)).attr("y2", this.scales.y(regression.y(x2)));
	        this.svgSelection.select("#statistics-slope").text("Slope: ".concat(format(this.settings.slopeFormat)(regression.slope)));
	        this.svgSelection.select("#statistics-r2").text("R^2: ".concat(format(this.settings.r2Format)(regression.rSquare)));
	      } else {
	        line.transition().duration(500).attr("x1", this.scales.x(0)).attr("y1", this.scales.y(regression.y(0))).attr("x2", this.scales.x(0)).attr("y2", this.scales.y(regression.y(0)));
	        this.svgSelection.select("#statistics-slope").text("Slope: n/a");
	        this.svgSelection.select("#statistics-r2").text("R^2: n/a");
	      }

	      if (this.settings.backgroundBorder > 0) {
	        //update node background
	        this.svgSelection.selectAll(".node-background").transition().duration(500).attr("transform", function (d) {
	          return "translate(".concat(_this2.scales.x(d.x), ", ").concat(_this2.scales.y(d.y), ")");
	        });
	      } //update nodes


	      this.svgSelection.selectAll(".node").transition().duration(500).attr("transform", function (d) {
	        return "translate(".concat(_this2.scales.x(d.x), ", ").concat(_this2.scales.y(d.y), ")");
	      });
	    }
	  }, {
	    key: "selectTips",
	    value: function selectTips(treeSVG, tips) {
	      var _this3 = this;

	      var self = this;
	      tips.forEach(function (tip) {
	        var node = _this3.tipNodes[tip];
	        var nodeShape1 = select(self.svg).select("#".concat(node.id)).select(".node-shape");
	        var nodeShape2 = select(treeSVG).select("#".concat(node.id)).select(".node-shape");
	        nodeShape1.attr("class", "node-shape selected");
	        nodeShape2.attr("class", "node-shape selected");
	        node.isSelected = true;
	      });
	      self.update();
	    }
	    /**
	     * Registers some text to appear in a popup box when the mouse hovers over the selection.
	     *
	     * @param selection
	     * @param text
	     */

	  }, {
	    key: "addToolTip",
	    value: function addToolTip(selection, text) {
	      this.svgSelection.selectAll(selection).on("mouseover", function (selectedNode) {
	        var tooltip = document.getElementById("tooltip");

	        if (_typeof_1(text) === _typeof_1("")) {
	          tooltip.innerHTML = text;
	        } else {
	          tooltip.innerHTML = text(selectedNode);
	        }

	        tooltip.style.display = "block";
	        tooltip.style.left = event.pageX + 10 + "px";
	        tooltip.style.top = event.pageY + 10 + "px";
	      });
	      this.svgSelection.selectAll(selection).on("mouseout", function () {
	        var tooltip = document.getElementById("tooltip");
	        tooltip.style.display = "none";
	      });
	    }
	  }, {
	    key: "linkWithTree",
	    value: function linkWithTree(treeSVG) {
	      var self = this;

	      var mouseover = function mouseover(d) {
	        select(self.svg).select("#".concat(d.node.id)).select(".node-shape").attr("r", self.settings.hoverNodeRadius);
	        select(treeSVG).select("#".concat(d.node.id)).select(".node-shape").attr("r", self.settings.hoverNodeRadius);
	      };

	      var mouseout = function mouseout(d) {
	        select(self.svg).select("#".concat(d.node.id)).select(".node-shape").attr("r", self.settings.nodeRadius);
	        select(treeSVG).select("#".concat(d.node.id)).select(".node-shape").attr("r", self.settings.nodeRadius);
	      };

	      var clicked = function clicked(d) {
	        // toggle isSelected
	        var tip = d;

	        if (d.node) {
	          tip = d.node;
	        }

	        tip.isSelected = !tip.isSelected;
	        var node1 = select(self.svg).select("#".concat(tip.id)).select(".node-shape");
	        var node2 = select(treeSVG).select("#".concat(tip.id)).select(".node-shape");

	        if (tip.isSelected) {
	          node1.attr("class", "node-shape selected");
	          node2.attr("class", "node-shape selected");
	        } else {
	          node1.attr("class", "node-shape unselected");
	          node2.attr("class", "node-shape unselected");
	        }

	        self.update();
	      };

	      var tips = select(this.svg).selectAll(".external-node").selectAll(".node-shape");
	      tips.on("mouseover", mouseover);
	      tips.on("mouseout", mouseout);
	      tips.on("click", clicked);
	      var points = select(treeSVG).selectAll(".node-shape");
	      points.on("mouseover", mouseover);
	      points.on("mouseout", mouseout);
	      points.on("click", clicked);
	    }
	    /**
	     * A utility function that will return a HTML string about the node and its
	     * annotations. Can be used with the addLabels() method.
	     *
	     * @param node
	     * @returns {string}
	     */

	  }], [{
	    key: "nodeInfo",
	    value: function nodeInfo(point) {
	      var node = point.node;
	      var text = "".concat(node.name ? node.name : node.id);
	      Object.entries(node.annotations).forEach(function (_ref) {
	        var _ref2 = slicedToArray(_ref, 2),
	            key = _ref2[0],
	            value = _ref2[1];

	        text += "<p>".concat(key, ": ").concat(value, "</p>");
	      });
	      return text;
	    }
	  }]);

	  return RootToTipPlot;
	}();
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	function createElements(svg, margins) {
	  var _this4 = this;

	  // get the size of the svg we are drawing on
	  var width = svg.getBoundingClientRect().width;
	  var height = svg.getBoundingClientRect().height;
	  select(svg).select("g").remove(); // add a group which will containt the new tree

	  select(svg).append("g"); //.attr("transform", `translate(${margins.left},${margins.top})`);
	  //to save on writing later

	  this.svgSelection = select(svg).select("g"); // least squares regression

	  var regression = this.leastSquares(this.points);
	  var x1 = regression.xIntercept;
	  var y1 = 0.0;
	  var x2 = max(this.points, function (d) {
	    return d.x;
	  });
	  var y2 = max([regression.y(x2), max(this.points, function (d) {
	    return d.y;
	  })]);
	  this.scales = {
	    x: linear$2().domain([x1, x2]).nice().range([margins.left, width - margins.right]),
	    y: linear$2().domain([y1, y2]).nice().range([height - margins.bottom, margins.top])
	  };
	  var xAxis = axisBottom(this.scales.x).tickArguments(this.settings.xAxisTickArguments);
	  var yAxis = axisLeft(this.scales.y).tickArguments(this.settings.yAxisTickArguments);
	  var xAxisWidth = width - margins.left - margins.right;
	  var yAxisHeight = height - margins.bottom - margins.top;
	  this.svgSelection.append("g").attr("id", "x-axis").attr("class", "axis").attr("transform", "translate(0, ".concat(height - margins.bottom + 5, ")")).call(xAxis);
	  this.svgSelection.append("g").attr("id", "x-axis-label").attr("class", "axis-label").attr("transform", "translate(".concat(margins.left, ", ").concat(height - margins.bottom, ")")).append("text").attr("transform", "translate(".concat(xAxisWidth / 2, ", 35)")).attr("alignment-baseline", "hanging").style("text-anchor", "middle").text(this.settings.xAxisTitle);
	  this.svgSelection.append("g").attr("id", "y-axis").attr("class", "axis").attr("transform", "translate(".concat(margins.left - 5, ",0)")).call(yAxis);
	  this.svgSelection.append("g").attr("id", "y-axis-label").attr("class", "axis-label").attr("transform", "translate(".concat(margins.left, ",").concat(margins.top, ")")).append("text").attr("transform", "rotate(-90)").attr("y", 0 - margins.left).attr("x", 0 - yAxisHeight / 2).attr("dy", "1em").style("text-anchor", "middle").text(this.settings.yAxisTitle);
	  this.svgSelection.append("line").attr("id", "regression").attr("class", "trend-line").attr("x1", this.scales.x(x1)).attr("y1", this.scales.y(y1)).attr("x2", this.scales.x(x1)).attr("y2", this.scales.y(y1));

	  if (this.settings.backgroundBorder > 0) {
	    this.svgSelection.append("g").selectAll("circle").data(this.points).enter().append("circle").attr("class", function (d) {
	      return ["node-background", !d.children ? "external-node" : "internal-node"].join(" ");
	    }).attr("transform", "translate(".concat(this.scales.x(x1), ", ").concat(this.scales.y(y1), ")")).attr("cx", 0).attr("cy", 0).attr("r", this.settings.nodeRadius + this.settings.backgroundBorder);
	  }

	  this.svgSelection.append("g").selectAll("circle").data(this.points).enter().append("g").attr("id", function (d) {
	    return d.node.id;
	  }).attr("class", function (d) {
	    var classes = ["node", "external-node", d.node.isSelected ? "selected" : "unselected"];

	    if (d.node.annotations) {
	      classes = [].concat(toConsumableArray(classes), toConsumableArray(Object.entries(d.node.annotations).filter(function (_ref3) {
	        var _ref4 = slicedToArray(_ref3, 1),
	            key = _ref4[0];

	        return _this4.tree.annotations[key].type === Type.DISCRETE || _this4.tree.annotations[key].type === Type.BOOLEAN || _this4.tree.annotations[key].type === Type.INTEGER;
	      }).map(function (_ref5) {
	        var _ref6 = slicedToArray(_ref5, 2),
	            key = _ref6[0],
	            value = _ref6[1];

	        return "".concat(key, "-").concat(value);
	      })));
	    }

	    return classes.join(" ");
	  }).attr("transform", "translate(".concat(this.scales.x(x1), ", ").concat(this.scales.y(y1), ")")) // .attr("transform", d => {
	  //     return `translate(${this.scales.x(d.x)}, ${this.scales.y(d.y)})`;
	  // })
	  .append("circle").attr("class", "node-shape").attr("cx", 0).attr("cy", 0).attr("r", this.settings.nodeRadius);
	  this.svgSelection.append("text").attr("id", "statistics-slope").attr("transform", "translate(".concat(margins.left + 20, ",").concat(margins.top, ")")).style("text-anchor", "left").attr("alignment-baseline", "hanging").attr("dy", "0").text("Slope: -");
	  this.svgSelection.append("text").attr("id", "statistics-r2").attr("transform", "translate(".concat(margins.left + 20, ",").concat(margins.top, ")")).style("text-anchor", "left").attr("alignment-baseline", "hanging").attr("dy", "1.5em").text("R^2: -");
	  this.update();

	  this.tree.treeUpdateCallback = function () {
	    return _this4.update();
	  };
	}

	exports.ArcLayout = ArcLayout;
	exports.Bauble = Bauble;
	exports.CircleBauble = CircleBauble;
	exports.ExplodedLayout = ExplodedLayout;
	exports.FigTree = FigTree;
	exports.Graph = Graph;
	exports.Layout = Layout;
	exports.RectangularBauble = RectangularBauble;
	exports.RectangularLayout = RectangularLayout;
	exports.RootToTipPlot = RootToTipPlot;
	exports.TransmissionLayout = TransmissionLayout;
	exports.Tree = Tree;
	exports.Type = Type;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=figtree.umd.js.map
