(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.figtree = {}));
}(this, function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

	function number(x) {
	  return x === null ? NaN : +x;
	}

	function extent(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  return [min, max];
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

	function axisTop(scale) {
	  return axis(top, scale);
	}

	function axisRight(scale) {
	  return axis(right, scale);
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

	function ascending$2(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector$1(compare) {
	  if (compare.length === 1) compare = ascendingComparator$1(compare);
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

	function ascendingComparator$1(f) {
	  return function(d, x) {
	    return ascending$2(f(d), x);
	  };
	}

	var ascendingBisect$1 = bisector$1(ascending$2);

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

	function ascending$3(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector$2(compare) {
	  if (compare.length === 1) compare = ascendingComparator$2(compare);
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

	function ascendingComparator$2(f) {
	  return function(d, x) {
	    return ascending$3(f(d), x);
	  };
	}

	var ascendingBisect$2 = bisector$2(ascending$3);

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
	var tau$2 = pi$3 * 2;

	var abs = Math.abs;
	var sqrt = Math.sqrt;

	function noop$1() {}

	function streamGeometry(geometry, stream) {
	  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
	    streamGeometryType[geometry.type](geometry, stream);
	  }
	}

	var streamObjectType = {
	  Feature: function(object, stream) {
	    streamGeometry(object.geometry, stream);
	  },
	  FeatureCollection: function(object, stream) {
	    var features = object.features, i = -1, n = features.length;
	    while (++i < n) streamGeometry(features[i].geometry, stream);
	  }
	};

	var streamGeometryType = {
	  Sphere: function(object, stream) {
	    stream.sphere();
	  },
	  Point: function(object, stream) {
	    object = object.coordinates;
	    stream.point(object[0], object[1], object[2]);
	  },
	  MultiPoint: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
	  },
	  LineString: function(object, stream) {
	    streamLine(object.coordinates, stream, 0);
	  },
	  MultiLineString: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamLine(coordinates[i], stream, 0);
	  },
	  Polygon: function(object, stream) {
	    streamPolygon(object.coordinates, stream);
	  },
	  MultiPolygon: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamPolygon(coordinates[i], stream);
	  },
	  GeometryCollection: function(object, stream) {
	    var geometries = object.geometries, i = -1, n = geometries.length;
	    while (++i < n) streamGeometry(geometries[i], stream);
	  }
	};

	function streamLine(coordinates, stream, closed) {
	  var i = -1, n = coordinates.length - closed, coordinate;
	  stream.lineStart();
	  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
	  stream.lineEnd();
	}

	function streamPolygon(coordinates, stream) {
	  var i = -1, n = coordinates.length;
	  stream.polygonStart();
	  while (++i < n) streamLine(coordinates[i], stream, 1);
	  stream.polygonEnd();
	}

	function geoStream(object, stream) {
	  if (object && streamObjectType.hasOwnProperty(object.type)) {
	    streamObjectType[object.type](object, stream);
	  } else {
	    streamGeometry(object, stream);
	  }
	}

	var areaRingSum = adder();

	var areaSum = adder();

	var deltaSum = adder();

	var sum = adder();

	function ascending$4(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector$3(compare) {
	  if (compare.length === 1) compare = ascendingComparator$3(compare);
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

	function ascendingComparator$3(f) {
	  return function(d, x) {
	    return ascending$4(f(d), x);
	  };
	}

	var ascendingBisect$3 = bisector$3(ascending$4);

	var lengthSum = adder();

	function identity$3(x) {
	  return x;
	}

	var areaSum$1 = adder(),
	    areaRingSum$1 = adder(),
	    x00,
	    y00,
	    x0,
	    y0;

	var areaStream = {
	  point: noop$1,
	  lineStart: noop$1,
	  lineEnd: noop$1,
	  polygonStart: function() {
	    areaStream.lineStart = areaRingStart;
	    areaStream.lineEnd = areaRingEnd;
	  },
	  polygonEnd: function() {
	    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
	    areaSum$1.add(abs(areaRingSum$1));
	    areaRingSum$1.reset();
	  },
	  result: function() {
	    var area = areaSum$1 / 2;
	    areaSum$1.reset();
	    return area;
	  }
	};

	function areaRingStart() {
	  areaStream.point = areaPointFirst;
	}

	function areaPointFirst(x, y) {
	  areaStream.point = areaPoint;
	  x00 = x0 = x, y00 = y0 = y;
	}

	function areaPoint(x, y) {
	  areaRingSum$1.add(y0 * x - x0 * y);
	  x0 = x, y0 = y;
	}

	function areaRingEnd() {
	  areaPoint(x00, y00);
	}

	var x0$1 = Infinity,
	    y0$1 = x0$1,
	    x1 = -x0$1,
	    y1 = x1;

	var boundsStream = {
	  point: boundsPoint,
	  lineStart: noop$1,
	  lineEnd: noop$1,
	  polygonStart: noop$1,
	  polygonEnd: noop$1,
	  result: function() {
	    var bounds = [[x0$1, y0$1], [x1, y1]];
	    x1 = y1 = -(y0$1 = x0$1 = Infinity);
	    return bounds;
	  }
	};

	function boundsPoint(x, y) {
	  if (x < x0$1) x0$1 = x;
	  if (x > x1) x1 = x;
	  if (y < y0$1) y0$1 = y;
	  if (y > y1) y1 = y;
	}

	// TODO Enforce positive area for exterior, negative area for interior?

	var X0 = 0,
	    Y0 = 0,
	    Z0 = 0,
	    X1 = 0,
	    Y1 = 0,
	    Z1 = 0,
	    X2 = 0,
	    Y2 = 0,
	    Z2 = 0,
	    x00$1,
	    y00$1,
	    x0$2,
	    y0$2;

	var centroidStream = {
	  point: centroidPoint,
	  lineStart: centroidLineStart,
	  lineEnd: centroidLineEnd,
	  polygonStart: function() {
	    centroidStream.lineStart = centroidRingStart;
	    centroidStream.lineEnd = centroidRingEnd;
	  },
	  polygonEnd: function() {
	    centroidStream.point = centroidPoint;
	    centroidStream.lineStart = centroidLineStart;
	    centroidStream.lineEnd = centroidLineEnd;
	  },
	  result: function() {
	    var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
	        : Z1 ? [X1 / Z1, Y1 / Z1]
	        : Z0 ? [X0 / Z0, Y0 / Z0]
	        : [NaN, NaN];
	    X0 = Y0 = Z0 =
	    X1 = Y1 = Z1 =
	    X2 = Y2 = Z2 = 0;
	    return centroid;
	  }
	};

	function centroidPoint(x, y) {
	  X0 += x;
	  Y0 += y;
	  ++Z0;
	}

	function centroidLineStart() {
	  centroidStream.point = centroidPointFirstLine;
	}

	function centroidPointFirstLine(x, y) {
	  centroidStream.point = centroidPointLine;
	  centroidPoint(x0$2 = x, y0$2 = y);
	}

	function centroidPointLine(x, y) {
	  var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
	  X1 += z * (x0$2 + x) / 2;
	  Y1 += z * (y0$2 + y) / 2;
	  Z1 += z;
	  centroidPoint(x0$2 = x, y0$2 = y);
	}

	function centroidLineEnd() {
	  centroidStream.point = centroidPoint;
	}

	function centroidRingStart() {
	  centroidStream.point = centroidPointFirstRing;
	}

	function centroidRingEnd() {
	  centroidPointRing(x00$1, y00$1);
	}

	function centroidPointFirstRing(x, y) {
	  centroidStream.point = centroidPointRing;
	  centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
	}

	function centroidPointRing(x, y) {
	  var dx = x - x0$2,
	      dy = y - y0$2,
	      z = sqrt(dx * dx + dy * dy);

	  X1 += z * (x0$2 + x) / 2;
	  Y1 += z * (y0$2 + y) / 2;
	  Z1 += z;

	  z = y0$2 * x - x0$2 * y;
	  X2 += z * (x0$2 + x);
	  Y2 += z * (y0$2 + y);
	  Z2 += z * 3;
	  centroidPoint(x0$2 = x, y0$2 = y);
	}

	function PathContext(context) {
	  this._context = context;
	}

	PathContext.prototype = {
	  _radius: 4.5,
	  pointRadius: function(_) {
	    return this._radius = _, this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._context.closePath();
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._context.moveTo(x, y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._context.lineTo(x, y);
	        break;
	      }
	      default: {
	        this._context.moveTo(x + this._radius, y);
	        this._context.arc(x, y, this._radius, 0, tau$2);
	        break;
	      }
	    }
	  },
	  result: noop$1
	};

	var lengthSum$1 = adder(),
	    lengthRing,
	    x00$2,
	    y00$2,
	    x0$3,
	    y0$3;

	var lengthStream = {
	  point: noop$1,
	  lineStart: function() {
	    lengthStream.point = lengthPointFirst;
	  },
	  lineEnd: function() {
	    if (lengthRing) lengthPoint(x00$2, y00$2);
	    lengthStream.point = noop$1;
	  },
	  polygonStart: function() {
	    lengthRing = true;
	  },
	  polygonEnd: function() {
	    lengthRing = null;
	  },
	  result: function() {
	    var length = +lengthSum$1;
	    lengthSum$1.reset();
	    return length;
	  }
	};

	function lengthPointFirst(x, y) {
	  lengthStream.point = lengthPoint;
	  x00$2 = x0$3 = x, y00$2 = y0$3 = y;
	}

	function lengthPoint(x, y) {
	  x0$3 -= x, y0$3 -= y;
	  lengthSum$1.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
	  x0$3 = x, y0$3 = y;
	}

	function PathString() {
	  this._string = [];
	}

	PathString.prototype = {
	  _radius: 4.5,
	  _circle: circle(4.5),
	  pointRadius: function(_) {
	    if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
	    return this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._string.push("Z");
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._string.push("M", x, ",", y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._string.push("L", x, ",", y);
	        break;
	      }
	      default: {
	        if (this._circle == null) this._circle = circle(this._radius);
	        this._string.push("M", x, ",", y, this._circle);
	        break;
	      }
	    }
	  },
	  result: function() {
	    if (this._string.length) {
	      var result = this._string.join("");
	      this._string = [];
	      return result;
	    } else {
	      return null;
	    }
	  }
	};

	function circle(radius) {
	  return "m0," + radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
	      + "z";
	}

	function geoPath(projection, context) {
	  var pointRadius = 4.5,
	      projectionStream,
	      contextStream;

	  function path(object) {
	    if (object) {
	      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	      geoStream(object, projectionStream(contextStream));
	    }
	    return contextStream.result();
	  }

	  path.area = function(object) {
	    geoStream(object, projectionStream(areaStream));
	    return areaStream.result();
	  };

	  path.measure = function(object) {
	    geoStream(object, projectionStream(lengthStream));
	    return lengthStream.result();
	  };

	  path.bounds = function(object) {
	    geoStream(object, projectionStream(boundsStream));
	    return boundsStream.result();
	  };

	  path.centroid = function(object) {
	    geoStream(object, projectionStream(centroidStream));
	    return centroidStream.result();
	  };

	  path.projection = function(_) {
	    return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$3) : (projection = _).stream, path) : projection;
	  };

	  path.context = function(_) {
	    if (!arguments.length) return context;
	    contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
	    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	    return path;
	  };

	  path.pointRadius = function(_) {
	    if (!arguments.length) return pointRadius;
	    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	    return path;
	  };

	  return path.projection(projection).context(context);
	}

	function ascending$5(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	function bisector$4(compare) {
	  if (compare.length === 1) compare = ascendingComparator$4(compare);
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

	function ascendingComparator$4(f) {
	  return function(d, x) {
	    return ascending$5(f(d), x);
	  };
	}

	var ascendingBisect$4 = bisector$4(ascending$5);
	var bisectRight = ascendingBisect$4.right;

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

	function identity$4(x) {
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
	      clamp = identity$4,
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
	    return arguments.length ? (domain = map$1.call(_, number$2), clamp === identity$4 || (clamp = clamper(domain)), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = slice$1.call(_), rescale()) : range.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range = slice$1.call(_), interpolate = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = _ ? clamper(domain) : identity$4, scale) : clamp !== identity$4;
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
	  var scale = continuous(identity$4, identity$4);

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

	var c$1 = cubehelix();

	var c$2 = rgb(),
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

	function noop$2() {}

	function point$1(that, x, y) {
	  that._context.bezierCurveTo(
	    (2 * that._x0 + that._x1) / 3,
	    (2 * that._y0 + that._y1) / 3,
	    (that._x0 + 2 * that._x1) / 3,
	    (that._y0 + 2 * that._y1) / 3,
	    (that._x0 + 4 * that._x1 + x) / 6,
	    (that._y0 + 4 * that._y1 + y) / 6
	  );
	}

	function BasisClosed(context) {
	  this._context = context;
	}

	BasisClosed.prototype = {
	  areaStart: noop$2,
	  areaEnd: noop$2,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x2, this._y2);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
	        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x2, this._y2);
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
	      case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
	      case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
	      default: point$1(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	function curveBasisClosed(context) {
	  return new BasisClosed(context);
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
	function point$2(that, t0, t1) {
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
	      case 3: point$2(this, this._t0, slope2(this, this._t0)); break;
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
	      case 2: this._point = 3; point$2(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
	      default: point$2(this, this._t0, t1 = slope3(this, x, y)); break;
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

	function Natural(context) {
	  this._context = context;
	}

	Natural.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = [];
	    this._y = [];
	  },
	  lineEnd: function() {
	    var x = this._x,
	        y = this._y,
	        n = x.length;

	    if (n) {
	      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
	      if (n === 2) {
	        this._context.lineTo(x[1], y[1]);
	      } else {
	        var px = controlPoints(x),
	            py = controlPoints(y);
	        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
	          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
	        }
	      }
	    }

	    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	    this._x = this._y = null;
	  },
	  point: function(x, y) {
	    this._x.push(+x);
	    this._y.push(+y);
	  }
	};

	// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
	function controlPoints(x) {
	  var i,
	      n = x.length - 1,
	      m,
	      a = new Array(n),
	      b = new Array(n),
	      r = new Array(n);
	  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
	  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
	  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
	  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
	  a[n - 1] = r[n - 1] / b[n - 1];
	  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	  b[n - 1] = (x[n] + a[n - 1]) / 2;
	  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	  return [a, b];
	}

	function curveNatural(context) {
	  return new Natural(context);
	}

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

	function extent$1(values, valueof) {
	  let min;
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null) {
	        if (min === undefined) {
	          if (value >= value) min = max = value;
	        } else {
	          if (min > value) min = value;
	          if (max < value) max = value;
	        }
	      }
	    }
	  }
	  return [min, max];
	}

	function max$1(values, valueof) {
	  let max;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value;
	      }
	    }
	  }
	  return max;
	}

	function maxIndex(values, valueof) {
	  let max;
	  let maxIndex = -1;
	  let index = -1;
	  if (valueof === undefined) {
	    for (const value of values) {
	      ++index;
	      if (value != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value, maxIndex = index;
	      }
	    }
	  } else {
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (max < value || (max === undefined && value >= value))) {
	        max = value, maxIndex = index;
	      }
	    }
	  }
	  return maxIndex;
	}

	function min$1(values, valueof) {
	  let min;
	  if (valueof === undefined) {
	    for (const value of values) {
	      if (value != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  } else {
	    let index = -1;
	    for (let value of values) {
	      if ((value = valueof(value, ++index, values)) != null
	          && (min > value || (min === undefined && value >= value))) {
	        min = value;
	      }
	    }
	  }
	  return min;
	}

	function isObject(item) {
	  return item && _typeof_1(item) === 'object' && !Array.isArray(item);
	}
	function mergeDeep(target, source) {
	  var output = Object.assign({}, target);

	  if (isObject(target) && isObject(source)) {
	    Object.keys(source).forEach(function (key) {
	      if (isObject(source[key])) {
	        if (!(key in target)) Object.assign(output, defineProperty({}, key, source[key]));else output[key] = mergeDeep(target[key], source[key]);
	      } else {
	        Object.assign(output, defineProperty({}, key, source[key]));
	      }
	    });
	  }

	  return output;
	} //https://stackoverflow.com/questions/29400171/how-do-i-convert-a-decimal-year-value-into-a-date-in-javascript

	/**
	 * Helper function to determine if the provided year is a leap year
	 * @param year
	 * @return {boolean}
	 */

	function leapYear(year) {
	  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
	}
	/**
	 * A function that converts a date into a decimal.
	 * @param date
	 * @return {number}
	 */

	function dateToDecimal(date) {
	  var year = parseInt(timeFormat("%Y")(date));
	  var day = parseInt(timeFormat("%j")(date));
	  var totalNumberOfDays = leapYear(year) ? 366 : 365;
	  return year + day / totalNumberOfDays;
	} //https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript

	// const BitSet =BitSetModule.__moduleExports;
	// for unique node ids

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
	  createClass(Tree, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        lengthsKnown: true,
	        heightsKnown: false
	      };
	    }
	    /**
	     * The constructor takes an object for the root node. The tree structure is
	     * defined as nested node objects.
	     *
	     * @constructor
	     * @param {object} rootNode - The root node of the tree as an object.
	     */

	  }]);

	  function Tree() {
	    var _this = this;

	    var rootNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, Tree);

	    this.settings = objectSpread({}, Tree.DEFAULT_SETTINGS(), settings);
	    this.heightsKnown = this.settings.heightsKnown;
	    this.lengthsKnown = this.settings.lengthsKnown;
	    this.root = makeNode.call(this, objectSpread({}, rootNode, {
	      length: 0,
	      level: 0
	    })); // This converts all the json objects to Node instances

	    setUpNodes.call(this, this.root);
	    this.annotations = {};
	    this._nodeList = toConsumableArray(this.preorder());

	    this._nodeList.forEach(function (node) {
	      if (node.label && node.label.startsWith("#")) {
	        // an id string has been specified in the newick label.
	        node._id = node.label.substring(1);
	      }

	      var newAnnotations = {}; // if(node.label){
	      //     newAnnotations.label=node.label;
	      // }
	      // if(node.name){
	      //     newAnnotations.name=node.name
	      // }

	      node.annotations = node.annotations ? objectSpread({}, newAnnotations, node.annotations) : newAnnotations;

	      _this.addAnnotations(node.annotations);
	    });

	    this._nodeMap = new Map(this.nodeList.map(function (node) {
	      return [node.id, node];
	    }));
	    this._tipMap = new Map(this.externalNodes.map(function (tip) {
	      return [tip.name, tip];
	    }));
	    this.nodesUpdated = false; // a callback function that is called whenever the tree is changed

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
	    /**
	     * A generator function that returns the nodes in a pre-order traversal.
	     *
	     * @returns {IterableIterator<IterableIterator<*|*>>}
	     */

	  }, {
	    key: "preorder",
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
	            parent._children = parent.children.filter(function (child) {
	              return child !== node0;
	            });

	            if (parent.parent === _this3.rootNode) {
	              var sibling = _this3.getSibling(parent);

	              parent._children.push(sibling);

	              sibling._length = rootLength;
	            } else {
	              // swap the parent and parent's parent's length around
	              var _ref = [oldLength, parent.parent.length];
	              parent.parent._length = _ref[0];
	              oldLength = _ref[1];

	              // add the new child
	              parent._children.push(parent.parent);
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
	              child._parent = node;
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
	      return this;
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
	      return this;
	    }
	  }, {
	    key: "_order",
	    value: function _order(ordering) {
	      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.rootNode;
	      orderNodes.call(this, node, ordering);
	      return this;
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
	      var lastSharedAncestor = sharedAncestors[maxIndex(sharedAncestors, function (node) {
	        return node.level;
	      })];
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
	     * Returns a new tree instance with  only the nodes provided and the path to their MRCA. After this traversal, unspecified
	     * degree two nodes will be removed. The subtree will consist of the root and then the last common ancestor.
	     * The nodes of the new tree will be copies of the those in the original, but they will share
	     * ids, annotations, and names.
	     * @param chosenNodes
	     * @return {Tree}
	     */

	  }, {
	    key: "subTree",
	    value: function subTree(chosenNodes) {
	      var sharedNodes = toConsumableArray(chosenNodes.map(function (node) {
	        return toConsumableArray(Tree.pathToRoot(node));
	      })) // get all the paths to the root
	      .reduce(function (acc, curr) {
	        return [].concat(toConsumableArray(acc), toConsumableArray(curr));
	      }, []) // unpack the paths
	      .filter(function (node, i, all) {
	        return all.filter(function (x) {
	          return x === node;
	        }).length === chosenNodes.length;
	      }) // filter to nodes that appear in every path
	      .reduce(function (acc, curr) {
	        // reduce to the unique set.
	        if (!acc.includes(curr)) {
	          acc.push(curr);
	        }

	        return acc;
	      }, []);

	      var mrca = sharedNodes[maxIndex(sharedNodes, function (n) {
	        return n.level;
	      })]; // intermediate nodes with show up as

	      var subtree = new Tree(mrca.toJS());
	      subtree.externalNodes.forEach(function (node) {
	        if (!chosenNodes.map(function (n) {
	          return n.id;
	        }).includes(node.id)) {
	          subtree.removeNode(node);
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
	      var _this4 = this;

	      return this.externalNodes.map(function (tip) {
	        return _this4.rootToTipLength(tip);
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
	      var _this5 = this;

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

	              splitNode = _this5.splitBranch(splitNode, time);
	              splitNode._id = id;
	            });
	          }
	        } else {
	          // if no splitLocations are given then split it in the middle.
	          _this5.splitBranch(node, 0.5);
	        }
	      });

	      this.nodesUpdated = true;
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
	      this.heightsKnown = false;
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
	      } // else if(node.parent._children.length===1){
	      //     console.log("removing parent")
	      //     this.removeNode(node.parent); // if it's a tip then remove it's parent which is now degree two;
	      // }


	      this.nodesUpdated = true;
	      return this;
	    }
	    /**
	     * deletes a node and all it's descendents from the tree;
	     * @param node
	     * @return {*}
	     */

	  }, {
	    key: "removeClade",
	    value: function removeClade(node) {
	      if (node === this.root) {
	        return;
	      }

	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;

	      try {
	        for (var _iterator5 = this.postorder(node)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          var descendent = _step5.value;
	          this.removeNode(descendent);
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

	      this.nodesUpdated = true;
	      this.treeUpdateCallback();
	      return this;
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
	     * A class function that subscribes a to be called when the tree updates.
	     * @param func - function to be called when the tree updates
	     */

	  }, {
	    key: "subscribeCallback",
	    value: function subscribeCallback(func) {
	      var currentCallback = this.treeUpdateCallback;

	      this.treeUpdateCallback = function () {
	        currentCallback();
	        func();
	      };
	    }
	  }, {
	    key: "getClades",
	    value: function getClades() {
	      var tipNameMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	      return this.nodeList.filter(function (n) {
	        return n.parent;
	      }).map(function (node) {
	        return node.getClade(tipNameMap);
	      });
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
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      options = objectSpread({}, {
	        labelName: "label",
	        datePrefix: undefined,
	        dateFormat: "decimal",
	        tipNameMap: null
	      }, options);
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
	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;

	      try {
	        for (var _iterator6 = tokens.filter(function (token) {
	          return token.length > 0;
	        })[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var token = _step6.value;

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

	                currentNode.annotations[options.labelName] = value;
	              } else {
	                currentNode.id = currentNode.label.substring(1);
	              }

	              labelNext = false;
	            } else {
	              // an external node
	              if (!currentNode.children) {
	                currentNode.children = [];
	              }

	              var name = options.tipNameMap ? options.tipNameMap.get(token) : token; // remove any quoting and then trim whitespace

	              if (name.startsWith("\"") || name.startsWith("'")) {
	                name = name.substr(1);
	              }

	              if (name.endsWith("\"") || name.endsWith("'")) {
	                name = name.substr(0, name.length - 1);
	              }

	              name = name.trim();
	              var decimalDate = undefined;
	              var date = undefined;

	              if (options.datePrefix) {
	                var parts = name.split(options.datePrefix);

	                if (parts.length === 0) {
	                  throw new Error("the tip, ".concat(name, ", doesn't have a date separated by the prefix, '").concat(options.datePrefix, "'"));
	                }

	                var dateBit = parts[parts.length - 1];

	                if (options.dateFormat === "decimal") {
	                  decimalDate = parseFloat(parts[parts.length - 1]);
	                } else {
	                  date = timeParse(options.dateFormat)(dateBit);

	                  if (!date) {
	                    date = timeParse(options.dateFormat)("".concat(dateBit, "-15"));
	                  }

	                  if (!date) {
	                    date = timeParse(options.dateFormat)("".concat(dateBit, "-06-15"));
	                  }

	                  decimalDate = dateToDecimal(date);
	                }
	              }

	              var externalNode = {
	                name: name,
	                id: parseInt(token) ? parseInt(token) : token,
	                parent: currentNode,
	                annotations: {
	                  date: decimalDate
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
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var trees = []; // odd parts ensure we're not in a taxon label
	      //TODO make this parsing more robust

	      var nexusTokens = nexus.split(/\s*(?:^|[^\w\d])Begin(?:^|[^\w\d])|(?:^|[^\w\d])begin(?:^|[^\w\d])|(?:^|[^\w\d])end(?:^|[^\w\d])|(?:^|[^\w\d])End(?:^|[^\w\d])|(?:^|[^\w\d])BEGIN(?:^|[^\w\d])|(?:^|[^\w\d])END(?:^|[^\w\d])\s*/);
	      var firstToken = nexusTokens.shift().trim();

	      if (firstToken.toLowerCase() !== '#nexus') {
	        throw Error("File does not begin with #NEXUS is it a nexus file?");
	      }

	      var _iteratorNormalCompletion7 = true;
	      var _didIteratorError7 = false;
	      var _iteratorError7 = undefined;

	      try {
	        for (var _iterator7 = nexusTokens[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	          var section = _step7.value;
	          var workingSection = section.replace(/^\s+|\s+$/g, '').split(/\n/);
	          var sectionTitle = workingSection.shift();

	          if (sectionTitle.toLowerCase().trim() === "trees;") {
	            var inTaxaMap = false;
	            var tipNameMap = new Map();
	            var _iteratorNormalCompletion8 = true;
	            var _didIteratorError8 = false;
	            var _iteratorError8 = undefined;

	            try {
	              for (var _iterator8 = workingSection[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	                var token = _step8.value;

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
	                    var treeString = token.substring(token.indexOf("("));

	                    if (tipNameMap.size > 0) {
	                      var thisTree = Tree.parseNewick(treeString, objectSpread({}, options, {
	                        tipNameMap: tipNameMap
	                      }));
	                      trees.push(thisTree);
	                    } else {
	                      var _thisTree = Tree.parseNewick(treeString, objectSpread({}, options));

	                      trees.push(_thisTree);
	                    }
	                  }
	                }
	              }
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
	    var _iteratorNormalCompletion9 = true;
	    var _didIteratorError9 = false;
	    var _iteratorError9 = undefined;

	    try {
	      for (var _iterator9 = node.children[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	        var child = _step9.value;
	        var value = orderNodes(child, ordering, callback);
	        counts.set(child, value);
	        count += value;
	      } // sort the children using the provided function

	    } catch (err) {
	      _didIteratorError9 = true;
	      _iteratorError9 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
	          _iterator9["return"]();
	        }
	      } finally {
	        if (_didIteratorError9) {
	          throw _iteratorError9;
	        }
	      }
	    }

	    node.children.sort(function (a, b) {
	      return ordering(a, counts.get(a), b, counts.get(b), node);
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
	 */


	function calculateHeights() {
	  var _this6 = this;

	  var maxRTT = max(this.rootToTipLengths());
	  this.nodeList.forEach(function (node) {
	    return node._height = maxRTT - _this6.rootToTipLength(node);
	  });
	  this.heightsKnown = true; // this.treeUpdateCallback();
	}
	/**
	 * A private recursive function that calculates the length of the branch below each node
	 */


	function calculateLengths() {
	  this.nodeList.forEach(function (node) {
	    return node._length = node.parent ? node.parent.height - node.height : 0;
	  });
	  this.lengthsKnown = true; // this.treeUpdateCallback();
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
	    var _iteratorNormalCompletion11 = true;
	    var _didIteratorError11 = false;
	    var _iteratorError11 = undefined;

	    try {
	      for (var _iterator11 = node.children[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	        var child = _step11.value;
	        var childNode = makeNode.call(this, objectSpread({}, child, {
	          parent: node,
	          level: node.level + 1
	        }));
	        childrenNodes.push(childNode);
	        setUpNodes.call(this, childNode);
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

	    node.children = childrenNodes;
	  }
	}

	function setUpArraysAndMaps() {
	  var _this7 = this;

	  this._nodeList = toConsumableArray(this.preorder());
	  this.nodesUpdated = false;

	  this._nodeList.forEach(function (node) {
	    if (node.label && node.label.startsWith("#")) {
	      // an id string has been specified in the newick label.
	      node._id = node.label.substring(1);
	    }

	    if (node.annotations) {
	      _this7.addAnnotations(node.annotations);
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
	  }

	  createClass(Node, [{
	    key: "addChild",
	    value: function addChild(node) {
	      var newNode = new Node(objectSpread({}, node, {
	        tree: this._tree,
	        level: this._level + 1
	      }));
	      this.children = [].concat(toConsumableArray(this._children), [newNode]);
	      setUpNodes.call(this._tree, newNode);

	      this._tree.addAnnotations(newNode.annotations);

	      this._tree.nodesUpdated = true;
	    }
	  }, {
	    key: "getClade",
	    value: function getClade() {
	      var tipNameMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (tipNameMap == null && this.clade && this._tree.nodesUpdated === false) {
	        return this._clade;
	      }

	      var bits = [];

	      if (!this.children) {
	        var nodeNumericId = tipNameMap ? tipNameMap.get(this.name) : this.id;

	        if (nodeNumericId !== parseInt(nodeNumericId)) {
	          throw new Error("Getting clade requires tips have integer id's. If they do not please provide a map to integers keyed by the tips' names ");
	        }

	        bits = bits.concat(this.id);
	        this._clade = bits;
	      } else {
	        var _iteratorNormalCompletion12 = true;
	        var _didIteratorError12 = false;
	        var _iteratorError12 = undefined;

	        try {
	          for (var _iterator12 = this.children[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	            var child = _step12.value;
	            bits = bits.concat(child.getClade(tipNameMap));
	          }
	        } catch (err) {
	          _didIteratorError12 = true;
	          _iteratorError12 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
	              _iterator12["return"]();
	            }
	          } finally {
	            if (_didIteratorError12) {
	              throw _iteratorError12;
	            }
	          }
	        }

	        this._clade = bits;
	      }

	      return bits;
	    }
	  }, {
	    key: "toJS",
	    value: function toJS() {
	      return {
	        id: this.id,
	        name: this.name,
	        length: this.length,
	        height: this.height,
	        label: this.label,
	        level: this.level,
	        annotations: this.annotations,
	        children: this.children && this.children.length > 0 ? this.children.map(function (child) {
	          return child.toJS();
	        }) : null
	      };
	    }
	  }, {
	    key: "level",
	    get: function get() {
	      var level = 0;
	      var node = this;

	      while (node.parent) {
	        node = node.parent;
	        level += 1;
	      }

	      return level;
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
	      this._tree.nodesUpdated = true;
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
	      return objectSpread({}, this._annotations);
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
	      var _iteratorNormalCompletion13 = true;
	      var _didIteratorError13 = false;
	      var _iteratorError13 = undefined;

	      try {
	        for (var _iterator13 = this._children[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	          var child = _step13.value;
	          child.parent = this;
	        }
	      } catch (err) {
	        _didIteratorError13 = true;
	        _iteratorError13 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
	            _iterator13["return"]();
	          }
	        } finally {
	          if (_didIteratorError13) {
	            throw _iteratorError13;
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
	      var _this8 = this;

	      this._parent = node;

	      if (this._parent.children.filter(function (c) {
	        return c === _this8;
	      }).length === 0) {
	        this._parent.children.push(this);
	      }

	      this._tree.nodesUpdated = true;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._id;
	    },
	    set: function set(value) {
	      this._tree.nodesUpdated = true;
	      this._id = value;
	    }
	  }, {
	    key: "tree",
	    get: function get() {
	      return this._tree;
	    }
	  }]);

	  return Node;
	}();

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

	/** @module layout */

	var VertexStyle = {
	  INCLUDED: Symbol("INCLUDED"),
	  // Only included nodes are sent to the figtree class
	  IGNORED: Symbol('IGNORED'),
	  // Ignored nodes are just that ignored in everyway
	  HIDDEN: Symbol("HIDDEN"),
	  // The only difference between hidden and included nodes is that hidden nodes are not sent to the figtree class
	  MASKED: Symbol("MASKED") // Masked nodes have an x and y coordinate but are then ignored. They don't count towards their parent's x and y and are not visualized.

	  /**
	   * The interface for the layout class this defines the api
	   *
	   */

	};
	var layoutInterface =
	/*#__PURE__*/
	function () {
	  function layoutInterface() {
	    classCallCheck(this, layoutInterface);
	  }

	  createClass(layoutInterface, [{
	    key: "layout",

	    /**
	     * The constructor
	     * @param tree
	     * @param settings
	     */

	    /**
	     * The layout function is called to make the edges, vertrices, and cartoons that make up the graph and set or update
	     * their positions on a custom x and y scale. It also should update the _horizontialScale, the _veriticalRange so that
	     * these positions can be converted to a [0,1] scale to be consumed by the figtree class.
	     * 
	     */
	    value: function layout() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A getter to return the horizontal range spanned by the vertices in the graph
	     */

	  }, {
	    key: "update",

	    /**
	     * Updates the tree when it has changed
	     */
	    value: function update() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function for rotating a node
	     * @returns {*}
	     */

	  }, {
	    key: "rotate",
	    value: function rotate() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function for ordering a subtree with increasing tip density
	     * @returns {orderIncreasing}
	     */

	  }, {
	    key: "orderIncreasing",
	    value: function orderIncreasing() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function for ordering a subtree with decreasing tip density
	     * @returns {orderIncreasing}
	     */

	  }, {
	    key: "orderDecreasing",
	    value: function orderDecreasing() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function for rerooting the tree
	     * @returns {reroot}
	     */

	  }, {
	    key: "reroot",
	    value: function reroot() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function to mark a clade as a triangle cartoon
	     * @param vertex
	     */

	  }, {
	    key: "cartoon",
	    value: function cartoon(vertex) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utitlity function to collapse a clade into a single branch and tip.
	     * @param vertex
	     */

	  }, {
	    key: "collapse",
	    value: function collapse(vertex) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function to mask a node so that it's vertex will be assigned an x and y but these values will not be used
	     * to calculate the position of parent nodes.
	     * @param node
	     */

	  }, {
	    key: "maskNode",
	    value: function maskNode(node) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function to hide a node so that it is not sent to the figtree class for visualization.
	     * @param node
	     */

	  }, {
	    key: "hideNode",
	    value: function hideNode(node) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function to ignore a node so that it does not get an x or y coordinate and is not sent to figtree.js
	     * for visualization.
	     * @param node
	     */

	  }, {
	    key: "ignoreNode",
	    value: function ignoreNode(node) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A unitlity function to mark a node as included. This is the default.
	     * @param node
	     */

	  }, {
	    key: "includeNode",
	    value: function includeNode(node) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function that will return a HTML string about the node and its
	     * annotations. Can be used with the addLabels() method.
	     *
	     * @param node
	     * @returns {string}
	     */

	  }, {
	    key: "nodeInfo",
	    value: function nodeInfo(node) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A getter function that updates the layout if needed and then returns edges whose target node is "included"
	     * @return {T[]}
	     */

	  }, {
	    key: "setInitialY",

	    /**
	     * sets the initial Y value for the first node returned from the getTreeNodes().
	     * @return {number}
	     */
	    value: function setInitialY() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * Set the y position of a vertex and return the Y position. This function is called on each node in the order returns from the getTreeNodes() method.
	     * The currentY represent the Y position of the previous node at each iteration. These y values will be converted to pixels by the figtree instance.
	     * range.
	     * @param vertex
	     * @param currentY
	     * @return {number}
	     */

	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * sets the initial x value for the first node returned from the getTreeNodes().
	     * @return {number}
	     */

	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
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
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A private method which returns the nodes of the tree in the order in which they will be assigned Y and X coordinates.
	     * This function is passed to getTreeNodes() methods which filters out the ignoredNodes. This funciton should be overwritten
	     * but only called if the ignored nodes are needed.
	     * @return {Array[]}
	     */

	  }, {
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A helper function that returns an array of verticies corresponding to a vertex's node's children. This method is useful
	     * because it handles the logic determining whether or not a vertex is included, hidden, masked ect.
	     *
	     * @param vertex
	     * @return {*}
	     */

	  }, {
	    key: "getChildVertices",
	    value: function getChildVertices(vertex) {
	      var _this = this;

	      return vertex.node.children.map(function (child) {
	        return _this._nodeMap.get(child);
	      }).filter(function (child) {
	        return child.visibility === VertexStyle.INCLUDED || child.visibility === VertexStyle.HIDDEN;
	      });
	    }
	    /**
	     * A utility function that replaces the aspects of the settins provided here then calls update.
	     * @param newSettings
	     */

	  }, {
	    key: "updateSettings",
	    value: function updateSettings(newSettings) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A method that updates a layout's layout function. middlewares should take one parameter which will be this layout.
	     * They can then use this parameter to access the methods and state of the layout.
	     * @param middlewares - function to be called after the original layout function
	     * @return {layout}
	     */

	  }, {
	    key: "extendLayout",
	    value: function extendLayout() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A method that subscribes the function to be called when the layout updates.
	     * @param func - function to be called when the layout updates
	     */

	  }, {
	    key: "subscribeCallback",
	    value: function subscribeCallback(func) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	  }, {
	    key: "horizontalDomain",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A getter to return the vertical range spanned by the vertices in the graph
	     */

	  }, {
	    key: "verticalDomain",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A setter for setting the branchScale factor. Should trigger and update
	     * @param value
	     */

	  }, {
	    key: "branchScale",
	    set: function set(value) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A getter for the branchScaling factor
	     * @return {number}
	     */
	    ,
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * Sets the annotation to use as the node labels for internal nodes. It should trigger and update.
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "internalNodeLabelAnnotationName",
	    set: function set(annotationName) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * Getter for internal node annotation name
	     * @return {*}
	     */
	    ,
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * Sets the annotation to use as the node labels for external nodes.It should trigger and update
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "externalNodeLabelAnnotationName",
	    set: function set(annotationName) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * getter for external node label name.
	     * @return {*}
	     */
	    ,
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * Sets the annotation to use as the branch labels. It should trigger an update
	     *
	     * @param annotationName
	     */

	  }, {
	    key: "branchLabelAnnotationName",
	    set: function set(annotationName) {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    },
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
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
	    /**
	     * A getter function that updates the layout if needed and returns included vertices.
	     * @return {T[]}
	     */

	  }, {
	    key: "vertices",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A getter function that updates the layout if needed, determines the most ancestral cartoons, hides the appropriate vertices
	     * and then returns a array of  cartoon objects defined as {vertices[{x:,y}...{x:,y:}], classes:[string,...],id:string,node:NODE:starting node }
	     * @return {[]}
	     */

	  }, {
	    key: "cartoons",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function that updates the layout if needed then returns the nodeMap.
	     * @return {*|Map|Map|Map|Map<any, any>}
	     */

	  }, {
	    key: "nodeMap",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	    /**
	     * A utility function that updates the layout if needed then returns the edgeMap.
	     * @return {*|Map|Map|Map|Map<any, any>}
	     */

	  }, {
	    key: "edgeMap",
	    get: function get() {
	      throw new Error("Don't call this method from the parent layoutInterface class. It must be implemented in the child class");
	    }
	  }]);

	  return layoutInterface;
	}();

	/** @module layout */

	var VertexStyle$1 = {
	  INCLUDED: Symbol("INCLUDED"),
	  // Only included nodes are sent to the figtree class
	  HIDDEN: Symbol("HIDDEN"),
	  // The only difference between hidden and included nodes is that hidden nodes are not sent to the figtree class
	  MASKED: Symbol("MASKED"),
	  // Masked nodes have an x and y coordinate but are then ignored. They don't count towards their parent's x and y
	  IGNORED: Symbol("IGNORE")
	};
	var makeVerticesFromNodes = Symbol("makeVerticesFromNodes");
	var setVertexClassesFromNode = Symbol("setVertexClassesFromNode");
	var setVertexLabels = Symbol("setVertexLabels");
	var makeEdgesFromNodes = Symbol("makeEdgesFromNodes");
	var setupEdge = Symbol("setupEdge");
	var setEdgeTermini = Symbol("setEdgeTermini");
	var setEdgeClasses = Symbol("setEdgeClasses");
	var setEdgeLabels = Symbol("setEdgeLabels");
	var getMostAncestralCartoons = Symbol("getMostAncestralCartoons");
	/**
	 * The AbstractLayout class
	 *
	 */

	var AbstractLayout =
	/*#__PURE__*/
	function (_layoutInterface) {
	  inherits(AbstractLayout, _layoutInterface);

	  createClass(AbstractLayout, null, [{
	    key: "DEFAULT_SETTINGS",

	    /**
	     * The default layout settings
	     * @return {{lengthFormat: *, horizontalScale: null}}
	     * @constructor
	     */
	    value: function DEFAULT_SETTINGS() {
	      return {
	        lengthFormat: format(".2f"),
	        branchLabelAnnotationName: null,
	        internalNodeLabelAnnotationName: null,
	        externalNodeLabelAnnotationName: null
	      };
	    }
	    /**
	     * The constructor
	     * @param tree
	     * @param settings
	     */

	  }]);

	  function AbstractLayout(tree) {
	    var _this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, AbstractLayout);

	    _this = possibleConstructorReturn(this, getPrototypeOf(AbstractLayout).call(this));
	    _this.tree = tree;
	    _this.settings = objectSpread({}, AbstractLayout.DEFAULT_SETTINGS(), settings);
	    _this._edges = [];
	    _this._edgeMap = new Map();
	    _this._vertices = [];
	    _this._nodeMap = new Map();
	    _this._cartoonStore = [];
	    _this._ignoredNodes = [];
	    _this.layoutKnown = false; // called whenever the tree changes...

	    _this.tree.subscribeCallback(function () {
	      _this.layoutKnown = false;

	      _this.update();
	    }); // create an empty callback function


	    _this.updateCallback = function () {};

	    return _this;
	  }

	  createClass(AbstractLayout, [{
	    key: "layout",
	    value: function layout() {
	      var _this2 = this;

	      // this._horizontalScale = this.updateHorizontalScale();
	      var treeNodes = this._getTreeNodes();

	      this[makeVerticesFromNodes](treeNodes);
	      this[makeEdgesFromNodes](treeNodes); // get the nodes

	      var currentY = this.setInitialY();
	      var currentX = this.setInitialX(); // update the node locations (vertices)

	      treeNodes.forEach(function (n) {
	        var v = _this2._nodeMap.get(n);

	        currentY = _this2.setYPosition(v, currentY);
	        currentX = _this2.setXPosition(v, currentX);
	      }); //Update edge locations

	      this._edges.forEach(function (e) {
	        _this2[setupEdge](e);
	      });

	      this.layoutKnown = true;
	    }
	  }, {
	    key: "update",
	    value: function update() {
	      this.updateCallback();
	    }
	  }, {
	    key: "rotate",
	    value: function rotate() {
	      var _this3 = this;

	      return function (vertex) {
	        _this3.tree.rotate(vertex.node); // this.update();

	      };
	    }
	  }, {
	    key: "orderIncreasing",
	    value: function orderIncreasing() {
	      var _this4 = this;

	      return function (vertex) {
	        _this4.tree.rotate(vertex.node); // this.update();

	      };
	    }
	  }, {
	    key: "orderDecreasing",
	    value: function orderDecreasing() {
	      var _this5 = this;

	      return function (vertex) {
	        _this5.tree.rotate(vertex.node); // this.update();

	      };
	    }
	  }, {
	    key: "reroot",
	    value: function reroot() {
	      var _this6 = this;

	      this.layoutKnown = false;
	      return function (edge, position) {
	        _this6.tree.reroot(edge.v1.node, position); // this.update();

	      };
	    }
	  }, {
	    key: "cartoon",
	    value: function cartoon(vertex) {
	      var _this7 = this;

	      var node = vertex.node;

	      if (node.children) {
	        if (this._cartoonStore.filter(function (c) {
	          return c.format === "cartoon";
	        }).find(function (c) {
	          return c.node === node;
	        })) {
	          this._cartoonStore = this._cartoonStore.filter(function (c) {
	            return !(c.format === "cartoon" && c.node === node);
	          });

	          toConsumableArray(this.tree.postorder(node)).filter(function (n) {
	            return n !== node;
	          }).map(function (n) {
	            return _this7._nodeMap.get(n);
	          }).forEach(function (v) {
	            return v.visibility = v.visibility === VertexStyle$1.HIDDEN ? VertexStyle$1.INCLUDED : v.visibility;
	          });
	        } else {
	          this._cartoonStore.push({
	            node: node,
	            format: "cartoon"
	          });
	        } // hide children vertices


	        this._cartoonStore.forEach(function (c) {
	          toConsumableArray(_this7.tree.postorder(c.node)).filter(function (n) {
	            return n !== c.node;
	          }).forEach(function (n) {
	            return _this7.hideNode(n);
	          });
	        });

	        this.layoutKnown = false;
	        this.update();
	      }
	    }
	  }, {
	    key: "maskNode",
	    value: function maskNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle$1.MASKED;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "hideNode",
	    value: function hideNode(node) {
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle$1.HIDDEN;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "ignoreNode",
	    value: function ignoreNode(node) {
	      this._ignoredNodes.push(node);

	      this.layoutKnown = false;
	    }
	  }, {
	    key: "includeNode",
	    value: function includeNode(node) {
	      this._ignoredNodes = this._ignoredNodes.filter(function (n) {
	        return n !== node;
	      });
	      var vertex = this.nodeMap.get(node);
	      vertex.visibility = VertexStyle$1.INCLUDED;
	      this.layoutKnown = false;
	    }
	  }, {
	    key: "getChildVertices",
	    value: function getChildVertices(vertex) {
	      var _this8 = this;

	      // return vertex.node.children.map(child=>this._nodeMap.get(child)).filter(child=>child.visibility===VertexStyle.INCLUDED||child.visibility===VertexStyle.HIDDEN);
	      var children = vertex.node.children.filter(function (n) {
	        return !_this8._ignoredNodes.includes(n);
	      }).map(function (child) {
	        return _this8._nodeMap.get(child);
	      });

	      try {
	        return children.filter(function (child) {
	          return child.visibility !== VertexStyle$1.MASKED;
	        });
	      } catch (_unused) {
	        console.group("".concat(vertex.node.id));
	        console.log(vertex);
	        console.log(children);
	        console.groupEnd();
	      }
	    }
	  }, {
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
	  }, {
	    key: "updateSettings",
	    value: function updateSettings(settings) {
	      this.settings = mergeDeep(this.settings, settings);
	      this.update();
	    } // inspired by redux naive implementation https://redux.js.org/advanced/middleware

	  }, {
	    key: "extendLayout",
	    value: function extendLayout() {
	      var _this9 = this;

	      for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
	        middlewares[_key] = arguments[_key];
	      }

	      middlewares = middlewares.slice();
	      middlewares.reverse();
	      var layout = this.layout.bind(this);
	      middlewares.forEach(function (middleware) {
	        var wrappedMiddleware = function wrappedMiddleware(nextLayout) {
	          return function (context) {
	            return function () {
	              nextLayout(context);
	              middleware(context);
	            };
	          };
	        };

	        layout = wrappedMiddleware(layout)(_this9);
	      });
	      this.layout = layout;
	      this.layoutKnown = false;
	      return this;
	    }
	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      return -0.5;
	    }
	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      return 0;
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      vertex.x = vertex.node.height;
	      return 0;
	    }
	    /**
	     * A class function that subscribes a to be called when the tree updates.
	     * @param func - function to be called when the tree updates
	     */

	  }, {
	    key: "subscribeCallback",
	    value: function subscribeCallback(func) {
	      var currentCallback = this.updateCallback;

	      this.updateCallback = function () {
	        currentCallback();
	        func();
	      };
	    }
	    /*
	    *
	     */

	  }, {
	    key: makeVerticesFromNodes,
	    value: function value(nodes) {
	      var _this10 = this;

	      nodes.forEach(function (n, i) {
	        if (!_this10._nodeMap.has(n) && !_this10._ignoredNodes.includes(n)) {
	          var _vertex = {
	            node: n,
	            key: n.id,
	            visibility: VertexStyle$1.INCLUDED,
	            degree: n.children ? n.children.length + 1 : 1,
	            // the number of edges (including stem)
	            id: n.id
	          };

	          _this10._vertices.push(_vertex);

	          _this10._nodeMap.set(n, _vertex);
	        } //update classes as needed.


	        var vertex = _this10._nodeMap.get(n);

	        _this10[setVertexClassesFromNode](vertex);

	        _this10[setVertexLabels](vertex);
	      }); //remove vertices not in nodes

	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        var _loop = function _loop() {
	          var n = _step.value;

	          if (!nodes.includes(n)) {
	            _this10._vertices = _this10._vertices.filter(function (v) {
	              return v !== _this10._nodeMap.get(n);
	            });

	            _this10._nodeMap["delete"](n);
	          }
	        };

	        for (var _iterator = this._nodeMap.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          _loop();
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
	  }, {
	    key: setVertexClassesFromNode,
	    value: function value(v) {
	      var _this11 = this;

	      v.classes = [!v.node.children ? "external-node" : "internal-node", v.node.isSelected ? "selected" : "unselected"];

	      if (v.node.annotations) {
	        v.classes = [].concat(toConsumableArray(v.classes), toConsumableArray(Object.entries(v.node.annotations).filter(function (_ref3) {
	          var _ref4 = slicedToArray(_ref3, 1),
	              key = _ref4[0];

	          return _this11.tree.annotations[key] && (_this11.tree.annotations[key].type === Type.DISCRETE || _this11.tree.annotations[key].type === Type.BOOLEAN || _this11.tree.annotations[key].type === Type.INTEGER);
	        }).map(function (_ref5) {
	          var _ref6 = slicedToArray(_ref5, 2),
	              key = _ref6[0],
	              value = _ref6[1];

	          return "".concat(key, "-").concat(value);
	        })));
	      }
	    }
	  }, {
	    key: setVertexLabels,
	    value: function value(v) {
	      // either the tip name or the internal node label
	      if (v.node.children) {
	        v.leftLabel = this.settings.internalNodeLabelAnnotationName ? this.settings.internalNodeLabelAnnotationName === "label" ? v.node["label"] : this.settings.internalNodeLabelAnnotationName === "name" ? v.node["name"] : v.node.annotations[this.settings.internalNodeLabelAnnotationName] : "";
	        v.rightLabel = ""; // should the left node label be above or below the node?

	        v.labelBelow = !v.node.parent || v.node.parent.children[0] !== v.node;
	      } else {
	        v.leftLabel = "";
	        v.rightLabel = this.settings.externalNodeLabelAnnotationName ? this.settings.externalNodeLabelAnnotationName === "label" ? v.node["label"] : this.settings.externalNodeLabelAnnotationName === "name" ? v.node["name"] : v.node.annotations[this.settings.externalNodeLabelAnnotationName] : "";
	      }
	    }
	  }, {
	    key: makeEdgesFromNodes,
	    value: function value(nodes) {
	      var _this12 = this;

	      // create the edges (only done if the array is empty)
	      nodes.filter(function (n) {
	        return n.parent;
	      }) // exclude the root
	      .forEach(function (n, i) {
	        if (!_this12._edgeMap.has(_this12._nodeMap.get(n))) {
	          var edge = {
	            v0: _this12._nodeMap.get(n.parent),
	            v1: _this12._nodeMap.get(n),
	            key: n.id
	          };

	          _this12._edges.push(edge);

	          _this12._edgeMap.set(edge.v1, edge);
	        }
	      }); //remove edges not in nodes

	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        var _loop2 = function _loop2() {
	          var v1 = _step2.value;

	          if (!nodes.includes(v1.node)) {
	            _this12._edges = _this12._edges.filter(function (e) {
	              return e !== _this12._edgeMap.get(v1);
	            });

	            _this12._edgeMap["delete"](v1);
	          }
	        };

	        for (var _iterator2 = this._edgeMap.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          _loop2();
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
	  }, {
	    key: setupEdge,
	    value: function value(e) {
	      this[setEdgeTermini](e);
	      this[setEdgeClasses](e);
	      this[setEdgeLabels](e);
	    }
	  }, {
	    key: setEdgeTermini,
	    value: function value(e) {
	      e.v1 = this._nodeMap.get(e.v1.node);
	      e.v0 = this._nodeMap.get(e.v1.node.parent);
	      e.length = length;
	    }
	  }, {
	    key: setEdgeClasses,
	    value: function value(e) {
	      var _this13 = this;

	      e.classes = [];

	      if (e.v1.node.annotations) {
	        e.classes = [].concat(toConsumableArray(e.classes), toConsumableArray(Object.entries(e.v1.node.annotations).filter(function (_ref7) {
	          var _ref8 = slicedToArray(_ref7, 1),
	              key = _ref8[0];

	          return _this13.tree.annotations[key] && (_this13.tree.annotations[key].type === Type.DISCRETE || _this13.tree.annotations[key].type === Type.BOOLEAN || _this13.tree.annotations[key].type === Type.INTEGER);
	        }).map(function (_ref9) {
	          var _ref10 = slicedToArray(_ref9, 2),
	              key = _ref10[0],
	              value = _ref10[1];

	          return "".concat(key, "-").concat(value);
	        })));
	      }
	    }
	  }, {
	    key: setEdgeLabels,
	    value: function value(e) {
	      e.label = this.settings.branchLabelAnnotationName ? this.settings.branchLabelAnnotationName === 'length' ? this.settings.lengthFormat(length) : e.v1.node.annotations[this.settings.branchLabelAnnotationName] : null;
	      e.labelBelow = e.v1.node.parent.children[0] !== e.v1.node;
	    }
	  }, {
	    key: getMostAncestralCartoons,
	    value: function value(cartoons) {
	      var cartoonNodes = cartoons.map(function (c) {
	        return c.node;
	      });
	      var mostAncestralNode = cartoonNodes.filter(function (n) {
	        return !toConsumableArray(Tree.pathToRoot(n)).filter(function (m) {
	          return m !== n;
	        }).some(function (n) {
	          return cartoonNodes.includes(n);
	        });
	      });
	      return cartoons.filter(function (c) {
	        return mostAncestralNode.includes(c.node);
	      });
	    }
	  }, {
	    key: "horizontalDomain",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      var xPositions = [].concat(toConsumableArray(this._vertices.map(function (d) {
	        return d.x;
	      })), [min(this._vertices.map(function (d) {
	        return d.x;
	      }))]);
	      return [max(xPositions), min(xPositions)];
	    }
	  }, {
	    key: "verticalDomain",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return extent$1(this._vertices, function (d) {
	        return d.y;
	      });
	    }
	  }, {
	    key: "edges",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._edges.filter(function (e) {
	        return e.v1.visibility === VertexStyle$1.INCLUDED;
	      });
	    }
	  }, {
	    key: "vertices",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._vertices.filter(function (v) {
	        return v.visibility === VertexStyle$1.INCLUDED;
	      });
	    }
	  }, {
	    key: "cartoons",
	    get: function get() {
	      var _this14 = this;

	      if (!this.layoutKnown) {
	        this.layout();
	      } // Handle cartoons
	      // here we handle what's active and what isn't.


	      var cartoons = [];
	      var ancestralCartoons = this[getMostAncestralCartoons](this._cartoonStore);
	      ancestralCartoons.forEach(function (c) {
	        var cartoonNodeDecedents = toConsumableArray(_this14.tree.postorder(c.node)).filter(function (n) {
	          return n !== c.node;
	        });

	        var cartoonVertex = _this14._nodeMap.get(c.node);

	        var cartoonVertexDecedents = cartoonNodeDecedents.map(function (n) {
	          return _this14._nodeMap.get(n);
	        });
	        var newTopVertex = {
	          x: min(cartoonVertexDecedents, function (d) {
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
	          var parentVertex = _this14._nodeMap.get(currentNode.parent);

	          if (!parentVertex.node.children) {
	            parentVertex.y = mean(_this14.getChildVertices(parentVertex), function (child) {
	              return _this14._nodeMap.get(child).y;
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
	  }]);

	  return AbstractLayout;
	}(layoutInterface);
	/**
	 * This is a helper function that updates a vertices y position by a specified amount. The function is meant to open a gap
	 * in the tree around vertices that are moved. A side effect of the function is
	 * that vertices not listed are moved up (if they are above the selected vertices and the vertices are moved up) and
	 * down if they are below the selected vertices and the vertices are moved down. It is meant to be called with this
	 * referring to the layout. Remember that the top of plot has y position 0. So positive numbers move the vertices to
	 * positions lower on the screen.
	 * @param delta
	 * @param vertices
	 */


	function updateVerticesY(delta) {
	  for (var _len2 = arguments.length, vertices = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	    vertices[_key2 - 1] = arguments[_key2];
	  }

	  if (delta > 0) {
	    this._vertices.filter(function (v) {
	      return v.y > max(vertices, function (v) {
	        return v.y;
	      });
	    }).forEach(function (v) {
	      return v.y += 2 * delta;
	    });
	  } else if (delta < 0) {
	    this._vertices.filter(function (v) {
	      return v.y < min(vertices, function (v) {
	        return v.y;
	      });
	    }).forEach(function (v) {
	      return v.y += 2 * delta;
	    });
	  }

	  vertices.forEach(function (v) {
	    return v.y += delta;
	  });
	}

	/**
	 * The rectangular layout class
	 *
	 */

	var RectangularLayout =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(RectangularLayout, _AbstractLayout);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function RectangularLayout(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, RectangularLayout);

	    return possibleConstructorReturn(this, getPrototypeOf(RectangularLayout).call(this, tree, settings));
	  }

	  createClass(RectangularLayout, [{
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      return toConsumableArray(this.tree.postorder());
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var includedInVertical = !vertex.node.children;

	      if (!includedInVertical) {
	        var vertexChildren = this.getChildVertices(vertex);
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });
	      } else {
	        currentY += 1;
	        vertex.y = currentY;
	      }

	      return currentY;
	    }
	  }]);

	  return RectangularLayout;
	}(AbstractLayout);

	/**
	 * The TransmissionLayout class
	 * up orders the tree in increasing node density and puts transmission up
	 * down orders tree in decreasing node density and puts the transmissions down
	 *
	 */

	var TransmissionLayout =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(TransmissionLayout, _AbstractLayout);

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
	    var _this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, TransmissionLayout);

	    // Rotate the tree so that jumps are always on top/bottom depending on settings
	    // defined here so we can use the groupingAnnotation key
	    _this = possibleConstructorReturn(this, getPrototypeOf(TransmissionLayout).call(this, tree, objectSpread({}, TransmissionLayout.DEFAULT_SETTINGS(), settings)));

	    _this.extendLayout(transmissionMiddleWare);

	    return _this;
	  }

	  createClass(TransmissionLayout, [{
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var includedInVertical = !vertex.node.children;

	      if (!includedInVertical) {
	        var vertexChildren = this.getChildVertices(vertex);
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });
	      } else {
	        currentY += 1;
	        vertex.y = currentY;
	      }

	      return currentY;
	    }
	  }, {
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      // this.tree._order(orderTreeNodes.bind(this));
	      return toConsumableArray(this.tree.postorder());
	    }
	  }]);

	  return TransmissionLayout;
	}(AbstractLayout);

	function transmissionMiddleWare(context) {
	  // If direction is up start at bottom if direction is down start at top
	  var sorting = function sorting(a, b) {
	    return -1;
	  };

	  var gap = context.settings.groupGap;

	  if (context.settings.direction.toLowerCase() === "up") {
	    sorting = function sorting(a, b) {
	      return a.y - b.y;
	    };

	    gap *= -1;
	  } else if (context.settings.direction.toLowerCase() === "down") {
	    sorting = function sorting(a, b) {
	      return b.y - a.y;
	    };
	  }

	  context._vertices.sort(sorting).forEach(function (vertex) {
	    //We don't touch the root
	    if (vertex.node.parent) {
	      //Is there a state change
	      if (vertex.node.annotations[context.settings.groupingAnnotation] !== vertex.node.parent.annotations[context.settings.groupingAnnotation]) {
	        //Get descendent vertices
	        var vertices = toConsumableArray(context.tree.postorder(vertex.node)).map(function (n) {
	          return context._nodeMap.get(n);
	        });

	        updateVerticesY.call.apply(updateVerticesY, [context, gap].concat(toConsumableArray(vertices)));
	      }
	    }
	  });

	  context._verticalRange = extent(context._vertices, function (v) {
	    return v.y;
	  });
	}

	/**
	 * The TransmissionLayout class
	 * Only works for 'up' directions
	 *
	 */

	var ExplodedLayout =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(ExplodedLayout, _AbstractLayout);

	  createClass(ExplodedLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        groupingAnnotation: "host",
	        direction: "up",
	        interGroupGap: 10,
	        intraGroupGap: 5,
	        groupOrdering: function groupOrdering(a, b) {
	          return a < b ? -1 : 1;
	        }
	      };
	    }
	  }]);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function ExplodedLayout(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, ExplodedLayout);

	    return possibleConstructorReturn(this, getPrototypeOf(ExplodedLayout).call(this, tree, objectSpread({}, ExplodedLayout.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(ExplodedLayout, [{
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      var _this = this;

	      // order first by grouping annotation and then by postorder
	      var postOrderNodes = toConsumableArray(this.tree.postorder()); // sort by location and then by post order order but we want all import/export banches to be last


	      return toConsumableArray(this.tree.postorder()).sort(function (a, b) {
	        var aGroup = a.annotations[_this.settings.groupingAnnotation];
	        var bGroup = b.annotations[_this.settings.groupingAnnotation];

	        if (aGroup === bGroup) {
	          return postOrderNodes.indexOf(a) - postOrderNodes.indexOf(b);
	        } else {
	          return _this.settings.groupOrdering(aGroup, bGroup);
	        }
	      });
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      // check if there are children that that are in the same group and set position to mean
	      // if do something else
	      if (currentY === this.setInitialY()) {
	        this._currentGroup = vertex.node.annotations[this.settings.groupingAnnotation];
	      } // First if this isn't tip like


	      if (vertex.node.children && (vertex.node.children.length > 1 || vertex.node.annotations[this.settings.groupingAnnotation] !== vertex.node.parent.annotations[this.settings.groupingAnnotation])) {
	        var vertexChildren = this.getChildVertices(vertex);
	        vertex.y = mean(vertexChildren, function (child) {
	          return child.y;
	        });

	        if (vertex.node.parent) {
	          if (vertex.node.annotations[this.settings.groupingAnnotation] !== vertex.node.parent.annotations[this.settings.groupingAnnotation]) {
	            this._newIntraGroupNext = true;
	          }
	        }
	      } else {
	        //It's a tip or tip-like
	        if (vertex.node.annotations[this.settings.groupingAnnotation] !== this._currentGroup) {
	          //This the the first time in the new group
	          currentY += this.settings.interGroupGap; //Reset this flag

	          this._newIntraGroupNext = false;
	        } else if (this._newIntraGroupNext) {
	          //It's a tip in a new circulation
	          currentY += this.settings.intraGroupGap;
	          this._newIntraGroupNext = false;
	        } else {
	          //Just the same ciruclation
	          currentY += 1;
	        }

	        this._currentGroup = vertex.node.annotations[this.settings.groupingAnnotation];
	        vertex.y = currentY;
	      }

	      return currentY;
	    }
	  }]);

	  return ExplodedLayout;
	}(AbstractLayout);
	/*
	 * Private methods, called by the class using the <function>.call(this) function.
	 */

	/**
	 * The Bauble class
	 *
	 * This is a shape or decoration at the node of a tree or graph
	 */

	var Bauble =
	/*#__PURE__*/
	function () {
	  createClass(Bauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        vertexFilter: function vertexFilter() {
	          return true;
	        },
	        attrs: {},
	        styles: {},
	        transition: {
	          transitionDuration: 500,
	          transitionEase: linear$1
	        },
	        interactions: {}
	      };
	    }
	    /**
	     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
	     *
	     * @param {Object} settings
	     * @param {function} [settings.vertexFilter=()=>true] - a function that is passed each vertex. If it returns true then bauble applies to that vertex.
	     * @param {Object} [settings.attrs={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
	     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
	     */

	  }]);

	  function Bauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Bauble);

	    var options = mergeDeep(Bauble.DEFAULT_SETTINGS(), settings);
	    this.attrs = options.attrs;
	    this.interactions = options.interactions;
	  }
	  /**
	   * A function that appends the bauble to the selection, joins the data, assigns the attributes to the svg objects
	   * updates and remove unneeded objects.
	   * @param selection
	   * @param border
	   */


	  createClass(Bauble, [{
	    key: "update",
	    value: function update(selection) {
	      throw new Error("don't call the base class methods");
	    }
	  }, {
	    key: "attr",
	    value: function attr(string, value) {
	      this.attrs[string] = value;
	    }
	  }, {
	    key: "on",
	    value: function on(string, value) {
	      this.interactions[string] = value;
	    }
	  }]);

	  return Bauble;
	}();

	function attrsFunction(selection, map) {
	  return selection.each(function() {
	    var x = map.apply(this, arguments), s = select(this);
	    for (var name in x) s.attr(name, x[name]);
	  });
	}

	function attrsObject(selection, map) {
	  for (var name in map) selection.attr(name, map[name]);
	  return selection;
	}

	function selection_attrs(map) {
	  return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
	}

	function stylesFunction(selection, map, priority) {
	  return selection.each(function() {
	    var x = map.apply(this, arguments), s = select(this);
	    for (var name in x) s.style(name, x[name], priority);
	  });
	}

	function stylesObject(selection, map, priority) {
	  for (var name in map) selection.style(name, map[name], priority);
	  return selection;
	}

	function selection_styles(map, priority) {
	  return (typeof map === "function" ? stylesFunction : stylesObject)(this, map, priority == null ? "" : priority);
	}

	function propertiesFunction(selection, map) {
	  return selection.each(function() {
	    var x = map.apply(this, arguments), s = select(this);
	    for (var name in x) s.property(name, x[name]);
	  });
	}

	function propertiesObject(selection, map) {
	  for (var name in map) selection.property(name, map[name]);
	  return selection;
	}

	function selection_properties(map) {
	  return (typeof map === "function" ? propertiesFunction : propertiesObject)(this, map);
	}

	function attrsFunction$1(transition, map) {
	  return transition.each(function() {
	    var x = map.apply(this, arguments), t = select(this).transition(transition);
	    for (var name in x) t.attr(name, x[name]);
	  });
	}

	function attrsObject$1(transition, map) {
	  for (var name in map) transition.attr(name, map[name]);
	  return transition;
	}

	function transition_attrs(map) {
	  return (typeof map === "function" ? attrsFunction$1 : attrsObject$1)(this, map);
	}

	function stylesFunction$1(transition, map, priority) {
	  return transition.each(function() {
	    var x = map.apply(this, arguments), t = select(this).transition(transition);
	    for (var name in x) t.style(name, x[name], priority);
	  });
	}

	function stylesObject$1(transition, map, priority) {
	  for (var name in map) transition.style(name, map[name], priority);
	  return transition;
	}

	function transition_styles(map, priority) {
	  return (typeof map === "function" ? stylesFunction$1 : stylesObject$1)(this, map, priority == null ? "" : priority);
	}

	selection.prototype.attrs = selection_attrs;
	selection.prototype.styles = selection_styles;
	selection.prototype.properties = selection_properties;
	transition.prototype.attrs = transition_attrs;
	transition.prototype.styles = transition_styles;

	/** @module bauble */

	/**
	 * The CircleBauble class. Each vertex is assigned a circle in the svg.
	 */

	var CircleBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(CircleBauble, _Bauble);

	  createClass(CircleBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        attrs: {
	          r: 6
	        }
	      };
	    }
	    /**
	     * The constructor.
	     * @param [settings.radius=6] - the radius of the circle
	     */

	  }]);

	  function CircleBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, CircleBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(CircleBauble).call(this, mergeDeep(CircleBauble.DEFAULT_SETTINGS(), settings)));
	  }
	  /**
	   * A function that assigns cy,cx,and r attributes to a selection. (cx and cy are set to 0 each r is the settings radius
	   * plus the border.
	   * @param selection
	   * @param {number} [border=0] - the amount to change the radius of the circle.
	   */


	  createClass(CircleBauble, [{
	    key: "update",
	    value: function update() {
	      var _this = this;

	      var selection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (selection == null && !this.selection) {
	        return;
	      }

	      if (selection) {
	        this.selection = selection;
	      }

	      return this.selection.selectAll("circle").data(function (d) {
	        return [d];
	      }).join(function (enter) {
	        return enter.append("circle").attr("class", "node-shape").attr("cx", 0).attr("cy", 0).attrs(_this.attrs).each(function (d, i, n) {
	          var element = select(n[i]);

	          var _loop = function _loop() {
	            var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
	                key = _Object$entries$_i[0],
	                func = _Object$entries$_i[1];

	            element.on(key, function (d, i, n) {
	              return func(d, i, n);
	            });
	          };

	          for (var _i = 0, _Object$entries = Object.entries(_this.interactions); _i < _Object$entries.length; _i++) {
	            _loop();
	          }
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().attrs(_this.attrs);
	        });
	      });
	    }
	  }]);

	  return CircleBauble;
	}(Bauble);

	/** @module bauble */

	var Branch =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(Branch, _Bauble);

	  createClass(Branch, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        curve: stepBefore,
	        curveRadius: 0,
	        attrs: {
	          "fill": "none",
	          "stroke": "black"
	        }
	      };
	    }
	    /**
	     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
	     *
	     * @param {Object} settings
	     * @param {function} [settings.curve=d3.curveStepBefore] - a d3 curve used to draw the edge
	     * @param {number} [settings.curveRadius=0] - if the curve radius is >0 then two points will be placed this many pixels below and to the right of the step point. This can be used with difference curves to make smooth corners
	     * @param {function} [settings.edgeFilter=()=>true] - a function that is passed each edge. If it returns true then bauble applies to that vertex.
	     * @param {Object} [settings.attrs={"fill": d => "none", "stroke-width": d => "2", "stroke": d => "black"}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
	     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
	     */

	  }]);

	  function Branch(settings) {
	    var _this;

	    classCallCheck(this, Branch);

	    var options = mergeDeep(Branch.DEFAULT_SETTINGS(), settings);
	    _this = possibleConstructorReturn(this, getPrototypeOf(Branch).call(this, options));
	    _this.curve = options.curve;
	    _this.curveRadius = options.curveRadius;
	    return _this;
	  }

	  createClass(Branch, [{
	    key: "setup",
	    value: function setup() {
	      var scales = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      scales = mergeDeep({
	        x: null,
	        y: null,
	        xOffset: 0,
	        yOffset: 0
	      }, scales);
	      this.branchPath = this.branchPathGenerator({
	        scales: scales,
	        curve: this.curve,
	        curveRadius: this.curveRadius
	      });
	    }
	  }, {
	    key: "update",
	    value: function update(selection) {
	      var _this2 = this;

	      if (selection == null && !this.selection) {
	        return;
	      }

	      if (selection) {
	        this.selection = selection;
	      }

	      return selection.selectAll("path").data(function (d) {
	        return [d];
	      }).join(function (enter) {
	        return enter.append("path").attr("d", function (edge, i) {
	          return _this2.branchPath(edge, i);
	        }).attr("class", "branch-path").attrs(_this2.attrs).each(function (d, i, n) {
	          var element = select(n[i]);

	          var _loop = function _loop() {
	            var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
	                key = _Object$entries$_i[0],
	                func = _Object$entries$_i[1];

	            element.on(key, function (d, i, n) {
	              return func(d, i, n);
	            });
	          };

	          for (var _i = 0, _Object$entries = Object.entries(_this2.interactions); _i < _Object$entries.length; _i++) {
	            _loop();
	          }
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition("pathUpdating").attr("d", function (edge, i) {
	            return _this2.branchPath(edge, i);
	          }).attr("class", "branch-path").attrs(_this2.attrs);
	        });
	      });
	    }
	  }, {
	    key: "branchPathGenerator",
	    value: function branchPathGenerator(_ref) {
	      var _this3 = this;

	      var scales = _ref.scales;

	      var branchPath = function branchPath(e, i) {
	        var branchLine = line().x(function (v) {
	          return v.x;
	        }).y(function (v) {
	          return v.y;
	        }).curve(_this3.curve);
	        var factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
	        var dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
	        var output = _this3.curveRadius > 0 ? branchLine([{
	          x: 0,
	          y: scales.y(e.v0.y) - scales.y(e.v1.y)
	        }, {
	          x: 0,
	          y: dontNeedCurve * factor * _this3.curveRadius
	        }, {
	          x: 0 + dontNeedCurve * _this3.curveRadius,
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
	  }, {
	    key: "curve",
	    value: function curve() {
	      var _curve = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (_curve) {
	        this.curve = _curve;
	        return this;
	      } else {
	        return this.curve;
	      }
	    }
	  }, {
	    key: "curveRadius",
	    value: function curveRadius() {
	      var _curveRadius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (_curveRadius) {
	        this.curveRadius = _curveRadius;
	        return this;
	      } else {
	        return this.curveRadius;
	      }
	    }
	  }]);

	  return Branch;
	}(Bauble);
	/**
	 * Generates a line() function that takes an edge and it's index and returns a line for d3 path element. It is called
	 * by the figtree class as
	 * const branchPath = this.layout.branchPathGenerator(this.scales)
	 * newBranches.append("path")
	 .attr("class", "branch-path")
	 .attr("d", (e,i) => branchPath(e,i));
	 * @param scales
	 * @param branchCurve
	 * @return {function(*, *)}
	 */

	function branchPathGenerator(_ref2) {
	  var scales = _ref2.scales,
	      curveRadius = _ref2.curveRadius,
	      curve = _ref2.curve;

	  var branchPath = function branchPath(e, i) {
	    var branchLine = line().x(function (v) {
	      return v.x;
	    }).y(function (v) {
	      return v.y;
	    }).curve(curve);
	    var factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
	    var dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
	    var output = curveRadius > 0 ? branchLine([{
	      x: 0,
	      y: scales.y(e.v0.y) - scales.y(e.v1.y)
	    }, {
	      x: 0,
	      y: dontNeedCurve * factor * curveRadius
	    }, {
	      x: 0 + dontNeedCurve * curveRadius,
	      y: 0
	    }, {
	      x: scales.x(e.v1.x + scales.xOffset) - scales.x(e.v0.x + scales.xOffset),
	      y: 0
	    }]) : branchLine([{
	      x: 0,
	      y: scales.y(e.v0.y) - scales.y(e.v1.y)
	    }, {
	      x: scales.x(e.v1.x + scales.xOffset) - scales.x(e.v0.x + scales.xOffset),
	      y: 0
	    }]);
	    return output;
	  };

	  return branchPath;
	}

	/** @module bauble */

	var CartoonBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(CartoonBauble, _Bauble);

	  createClass(CartoonBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        curve: curveBasisClosed,
	        attrs: {
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
	        vertexFilter: null,
	        cartoonFilter: function cartoonFilter() {
	          return true;
	        }
	      };
	    }
	  }]);

	  function CartoonBauble(settings) {
	    classCallCheck(this, CartoonBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(CartoonBauble).call(this, mergeDeep(CartoonBauble.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(CartoonBauble, [{
	    key: "setup",
	    value: function setup() {
	      var scales = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      scales = mergeDeep({
	        x: null,
	        y: null,
	        xOffset: 0,
	        yOffset: 0
	      }, scales);
	      this.pathGenerator = pointToPointGen({
	        scales: scales
	      });
	    }
	  }, {
	    key: "update",
	    value: function update(selection) {
	      var _this = this;

	      return selection.selectAll("path").data(function (d) {
	        return [d];
	      }).join(function (enter) {
	        return enter.append("path").attr("d", function (c) {
	          return _this.pathGenerator(c.points);
	        }).attr("class", "cartoon-path").attrs(function (c) {
	          var attributes = _this.settings.attrs;
	          return Object.keys(attributes).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](c)));
	          }, {});
	        }).styles(function (c) {
	          var styles = _this.settings.styles;
	          return Object.keys(styles).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, styles[curr](c)));
	          }, {});
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().attr("d", _this.pathGenerator(c.points)).attrs(function (c) {
	            var attributes = _this.settings.attrs;
	            return Object.keys(attributes).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](c)));
	            }, {});
	          }).styles(function (c) {
	            var styles = _this.settings.styles;
	            return Object.keys(styles).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, styles[curr](c)));
	            }, {});
	          });
	        });
	      });
	    }
	  }, {
	    key: "cartoonFilter",
	    get: function get() {
	      return this.settings.cartoonFilter;
	    }
	  }]);

	  return CartoonBauble;
	}(Bauble);
	function pointToPointGen(_ref) {
	  var scales = _ref.scales;

	  var pointToPoint = function pointToPoint(points) {
	    var path = [];
	    var origin = points[0];
	    var pathPoints = points.reverse();
	    var currentPoint = origin;
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	      for (var _iterator = pathPoints[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        var point = _step.value;
	        var xdiff = scales.x(point.x + scales.xOffset) - scales.x(currentPoint.x + scales.xOffset);
	        var ydiff = scales.y(point.y) - scales.y(currentPoint.y);
	        path.push("".concat(xdiff, " ").concat(ydiff));
	        currentPoint = point;
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

	    return "M 0 0 l ".concat(path.join(" l "), " z");
	  };

	  return pointToPoint;
	}

	var GeoLayout =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(GeoLayout, _AbstractLayout);

	  createClass(GeoLayout, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        locationKey: "location"
	      };
	    }
	  }]);

	  function GeoLayout(tree, projection) {
	    var _this;

	    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    classCallCheck(this, GeoLayout);

	    _this = possibleConstructorReturn(this, getPrototypeOf(GeoLayout).call(this, tree, objectSpread({}, GeoLayout.DEFAULT_SETTINGS(), settings)));
	    _this.projection = projection;
	    return _this;
	  }

	  createClass(GeoLayout, [{
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      if (vertex.node.annotations[this.settings.locationKey]) {
	        vertex.y = this.projection(vertex.node.annotations[this.settings.locationKey])[1];
	      } else {
	        vertex.y = undefined;
	      }
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      if (vertex.node.annotations[this.settings.locationKey]) {
	        vertex.x = this.projection(vertex.node.annotations[this.settings.locationKey])[0];
	      } else {
	        vertex.x = undefined;
	      }
	    }
	  }, {
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      return this.tree.nodeList;
	    }
	  }]);

	  return GeoLayout;
	}(AbstractLayout);

	var p = {
	  addXAxis: Symbol("addXAxis"),
	  addYAxis: Symbol("addYAxis"),
	  updateXAxis: Symbol("updateXAxis"),
	  updateYAxis: Symbol("updateYAxis"),
	  updateAnnotations: Symbol("updateAnnotations"),
	  updateCartoons: Symbol("updateCartoons"),
	  updateBranches: Symbol("updateBranches"),
	  updateNodeBackgrounds: Symbol("updateNodeBackgrounds"),
	  updateNodes: Symbol("updateNodes"),
	  updateBranchStyles: Symbol("updateBranchStyles"),
	  updateNodeStyles: Symbol("updateNodeStyles"),
	  updateNodeBackgroundStyles: Symbol("updateNodeBackgroundStyles"),
	  updateCartoonStyles: Symbol("updateCartoonStyles"),
	  branchPathGenerator: Symbol("branchPathGenerator"),
	  pointToPoint: Symbol("pointToPoint"),
	  setUpScales: Symbol("setUpScales"),
	  svg: Symbol("SVG"),
	  tree: Symbol("tree"),
	  layout: Symbol("layout"),
	  vertices: Symbol("vertices"),
	  edges: Symbol("edges"),
	  baubleMap: Symbol("baubleMap"),
	  branchMap: Symbol("branchMap"),
	  updateVerticesAndEdges: Symbol("updateVerticesAndEdges"),
	  node: Symbol("node")
	};

	function getVertexClassesFromNode(node) {
	  var classes = [!node.children ? "external-node" : "internal-node"];
	  var tree = node.tree;

	  if (node.annotations) {
	    classes = [].concat(toConsumableArray(classes), toConsumableArray(Object.entries(node.annotations).filter(function (_ref) {
	      var _ref2 = slicedToArray(_ref, 1),
	          key = _ref2[0];

	      return tree.annotations[key] && (tree.annotations[key].type === Type.DISCRETE || tree.annotations[key].type === Type.BOOLEAN || tree.annotations[key].type === Type.INTEGER);
	    }).map(function (_ref3) {
	      var _ref4 = slicedToArray(_ref3, 2),
	          key = _ref4[0],
	          value = _ref4[1];

	      if (tree.annotations[key].type === Type.DISCRETE || tree.annotations[key].type === Type.INTEGER) {
	        return "".concat(key, "-").concat(value);
	      } else if (tree.annotations[key].type === Type.BOOLEAN && value) {
	        return "".concat(key);
	      }
	    })));
	  }

	  return classes;
	}

	function makeVertexFromNode(node) {
	  return defineProperty({
	    name: node.name,
	    length: node.length,
	    height: node.height,
	    label: node.label,
	    level: node.level,
	    annotations: node.annotations,
	    key: node.id,
	    degree: node.children ? node.children.length + 1 : 1,
	    // the number of edges (including stem)
	    leftLabel: !!node.children,
	    labelBelow: !!node.children && (!node.parent || node.parent.children[0] !== node),
	    classes: getVertexClassesFromNode(node)
	  }, p.node, node);
	}

	function rectangularVertices(tree) {
	  var currentY = 0;

	  var traverse =
	  /*#__PURE__*/
	  regenerator.mark(function traverse(node) {
	    var siblingPositions,
	        myChildrenPositions,
	        _iteratorNormalCompletion,
	        _didIteratorError,
	        _iteratorError,
	        _iterator,
	        _step,
	        child,
	        vertex,
	        _vertex,
	        _args = arguments;

	    return regenerator.wrap(function traverse$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            siblingPositions = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
	            myChildrenPositions = [];

	            if (!node.children) {
	              _context.next = 34;
	              break;
	            }

	            _iteratorNormalCompletion = true;
	            _didIteratorError = false;
	            _iteratorError = undefined;
	            _context.prev = 6;
	            _iterator = node.children[Symbol.iterator]();

	          case 8:
	            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	              _context.next = 14;
	              break;
	            }

	            child = _step.value;
	            return _context.delegateYield(traverse(child, myChildrenPositions), "t0", 11);

	          case 11:
	            _iteratorNormalCompletion = true;
	            _context.next = 8;
	            break;

	          case 14:
	            _context.next = 20;
	            break;

	          case 16:
	            _context.prev = 16;
	            _context.t1 = _context["catch"](6);
	            _didIteratorError = true;
	            _iteratorError = _context.t1;

	          case 20:
	            _context.prev = 20;
	            _context.prev = 21;

	            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	              _iterator["return"]();
	            }

	          case 23:
	            _context.prev = 23;

	            if (!_didIteratorError) {
	              _context.next = 26;
	              break;
	            }

	            throw _iteratorError;

	          case 26:
	            return _context.finish(23);

	          case 27:
	            return _context.finish(20);

	          case 28:
	            siblingPositions.push(mean(myChildrenPositions));
	            vertex = objectSpread({}, makeVertexFromNode(node), {
	              y: mean(myChildrenPositions),
	              x: node.height
	            });
	            _context.next = 32;
	            return vertex;

	          case 32:
	            _context.next = 39;
	            break;

	          case 34:
	            currentY += 1;
	            siblingPositions.push(currentY);
	            _vertex = objectSpread({}, makeVertexFromNode(node), {
	              y: currentY,
	              x: node.height
	            });
	            _context.next = 39;
	            return _vertex;

	          case 39:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, traverse, null, [[6, 16, 20, 28], [21,, 23, 27]]);
	  });

	  return toConsumableArray(traverse(tree.rootNode));
	}
	function makeEdges(vertices) {
	  var nodeMap = new Map(vertices.map(function (v) {
	    return [v[p.node], v];
	  }));
	  return vertices.filter(function (v) {
	    return v[p.node].parent;
	  }).map(function (v) {
	    return {
	      v0: nodeMap.get(v[p.node].parent),
	      v1: v,
	      key: v.id,
	      classes: v.classes,
	      labelBelow: v[p.node].parent.children[0] !== v[p.node]
	    };
	  });
	}

	var layoutFactory = function layoutFactory(makeVertices) {
	  return function (tree) {
	    var vertices = makeVertices(tree);
	    var edges = makeEdges(vertices);
	    return {
	      vertices: vertices,
	      edges: edges
	    };
	  };
	};

	var rectangularLayout = layoutFactory(rectangularVertices);

	/** @module figtree */

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
	        xScale: {
	          axes: [],
	          gap: 10,
	          scale: linear$2,
	          revisions: {
	            origin: null,
	            reverseAxis: false,
	            branchScale: 1,
	            offset: 0,
	            hedge: 0
	          }
	        },
	        yScale: {
	          axes: [],
	          gap: 10,
	          scale: linear$2,
	          revisions: {
	            origin: null,
	            reverseAxis: false,
	            offset: 0,
	            hedge: 0
	          }
	        },
	        vertices: {
	          hoverBorder: 2,
	          backgroundBaubles: [],
	          baubles: [new CircleBauble()]
	        },
	        edges: {
	          baubles: [new Branch()]
	        },
	        cartoons: {
	          baubles: [new CartoonBauble()]
	        },
	        transition: {
	          transitionDuration: 500,
	          transitionEase: linear$1
	        }
	      };
	    }
	    /**
	     * The constructor.
	     * @param {svg} svg -  the html svg that will hold the figure
	     * @param {Object} layout - an instance of class AbstractLayout
	     * @param {Object} margins -  the space within the svg along the border that will not be used to draw the tree. Axis will be placed in this space
	     * @param {number} margins.top - the distance from the top
	     * @param {number} margins.bottom - the distance from the bottom
	     * @param {number} margins.left - the distance from the left
	     * @param {number} margins.right - the distance from the right
	     * @param {Object} [settings={}] - Settings for the figure. Settings provided in part will not affect defaults not explicitly mentioned
	     * @param {Object} settings.xScale - Settings specific for the x scale of the figure
	     * @param {Object[]} [settings.xScale.axes=[]] - An array of axis that will use the xScale
	     * @param {number} [settings.xScale.gap=10] - The number of pixels between the axis line and the bottom of the svg drawing space
	     * @param {function} [settings.xScale.scale=d3.scaleLinear] - A d3 scale for the x dimension
	     * @param {Object} settings.xScale.revisions - Any updates or revisions to be made to the x scale set by the layout
	     * @param {number} [settings.xScale.revisions.origin=null] - An optional value for specifying the right most edge of the plot.
	     * @param {boolean} [settings.xScale.revisions.reverseAxis=false] - Should the x axis decrease from right to left? (default false => number increase from height 0 as we move right to left)
	     * @param {number} [settings.xScale.revisions.branchScale=1] - Factor to scale the branchlengths by
	     * @param {number} [settings.xScale.revisions.offset=0] - Space to add between the origin and right-most vertex
	     * @param {number} [settings.xScale.revisions.hedge = 0] - Space to add between the left edge of the plot and the left most vertex.
	     * @param {Object} settings.yScale - Settings specific for the y scale of the figure
	     * @param {Object[]} [settings.yScale.axes=[]] - An array of axis that will use the yScale
	     * @param {number} [settings.yScale.gap=10] - The number of pixels between the axis line and the left of the svg drawing space
	     * @param {function} [settings.yScale.scale=d3.scaleLinear] - A d3 scale for the y dimension
	     * @param {Object} settings.vertices - Options specific to the vertices that map to the nodes of the tree
	     * @param {number} [settings.vertices.hoverBorder=2] - the number of pixels by which the radius of the vertices will increase by if the highlightNodes option is used and the vertex is hovered
	     * @param {Object[]} [settings.vertices.baubles=[new CircleBauble()]] - An array of baubles for the nodes, each bauble can have it's own settings
	     * @param {Object[]} [settings.vertices.backgroundBaubles=[]] - An array of baubles that will go behind the main bauble of the nodes, each bauble can have it's own settings
	     * @param {Object}    settings.edges - Options specific to the edges that map to the branches of the tree
	     * @param {Object[]}  [settings.edges.baubles=[new Branch()]] - An array of baubles that form the branches of the tree, each bauble can have it's own settings
	     * @param {Object}    settings.cartoons - Options specific to the cartoons on the tree (triangle clades ect.)
	     * @param {Object[]}  [settings.edges.baubles=[new CartoonBauble()]] - An array of baubles that form the cartoons on the firgure, each bauble can have it's own settings     cartoons:{
	     * @param {Object} settings.transition - Options controlling the how the figure changes upon interaction
	     * @param {number} [settings.transition.transitionDuration=500] - the number of milliseconds to take when transitioning
	     * @param {function} [settings.transitionEase=d3.easeLinear] - the d3 ease function used to interpolate during transitioning
	     *
	     */

	  }]);

	  function FigTree() {
	    var svg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	    var layout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : rectangularLayout;
	    var margins = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
	      top: 10,
	      bottom: 60,
	      left: 30,
	      right: 60
	    };
	    var settings = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	    classCallCheck(this, FigTree);

	    this[p.layout] = layout;
	    this.margins = margins;
	    this.settings = mergeDeep(FigTree.DEFAULT_SETTINGS(), settings);
	    this.callbacks = {
	      nodes: [],
	      branches: [],
	      cartoons: []
	    };
	    this._annotations = [];
	    this[p.svg] = svg;
	    this.drawn = false;
	    this.svgId = "g-".concat(uuid_1.v4());
	    this.svgSelection = null;
	    this[p.vertices] = new DataCollection([], this);
	    this[p.edges] = new DataCollection([], this);
	    return this;
	  }
	  /**
	   * An instance method that makes place the svg object in the page. Without calling this method the figure will not be drawn
	   * @return {FigTree}
	   */


	  createClass(FigTree, [{
	    key: "draw",
	    value: function draw() {
	      this[p.updateVerticesAndEdges]();
	      this[p.setUpScales](); //remove the tree if it is there already
	      // this.relativeMargins = {
	      //     left: this.originalMargins.left / this.scales.width,
	      //     right: this.originalMargins.right / this.scales.width,
	      //     top: this.originalMargins.top / this.scales.height,
	      //     bottom: this.originalMargins.bottom / this.scales.height
	      // };

	      select(this[p.svg]).select("#".concat(this.svgId)).remove(); // add a group which will contain the new tree

	      select(this[p.svg]).append("g").attr("id", this.svgId).attr("transform", "translate(".concat(this.margins.left, ",").concat(this.margins.top, ")")); //to selecting every time

	      this.svgSelection = select(this[p.svg]).select("#".concat(this.svgId));
	      this.svgSelection.append("g").attr("class", "annotation-layer");
	      this.svgSelection.append("g").attr("class", "axes-layer");
	      this.svgSelection.append("g").attr("class", "cartoon-layer");
	      this.svgSelection.append("g").attr("class", "branches-layer");

	      if (this.settings.vertices.backgroundBorder !== null) {
	        this.svgSelection.append("g").attr("class", "nodes-background-layer");
	      }

	      this.svgSelection.append("g").attr("class", "nodes-layer"); // create the scales

	      if (this.settings.xScale.axes.length > 0) {
	        this[p.addXAxis]();
	      }

	      if (this.settings.yScale.axes.length > 0) {
	        this[p.addYAxis]();
	      }

	      this.drawn = true;
	      this.update();
	      return this;
	    }
	    /**
	     * Updates the figure when the tree has changed
	     */

	  }, {
	    key: "update",
	    value: function update() {
	      if (!this.drawn) {
	        return;
	      }

	      this[p.updateVerticesAndEdges]();
	      this[p.setUpScales]();
	      select("#".concat(this.svgId)).attr("transform", "translate(".concat(this.margins.left, ",").concat(this.margins.top, ")")); // this[p.updateAnnotations]();
	      // this[p.updateCartoons]();

	      this[p.updateBranches](); //
	      // if(this.settings.xScale.axes.length>0){
	      //     this[p.updateXAxis]();
	      // }
	      // if(this.settings.yScale.axes.length>0){
	      //     this[p.updateYAxis]();
	      // }
	      //
	      // if (this.settings.vertices.backgroundBaubles.length>0) {
	      //     this[p.updateNodeBackgrounds]();
	      // }

	      this[p.updateNodes]();
	      return this;
	    }
	    /**
	     * set mouseover highlighting of branches
	     * This changes the branch path class to hovered. It is expected that css will handel any visual changes needed.
	     * This function is a helper function that calls onHoverBranch with an appropriate action function.
	     */

	  }, {
	    key: "hilightBranches",
	    value: function hilightBranches() {
	      var action = {
	        enter: function enter(d, i, n) {
	          var branch = select(n[i]); // self.settings.edges.baubles.forEach((bauble) => {
	          //     if (bauble.edgeFilter(branch)) {
	          //         bauble.update(branch);
	          //     }
	          // });

	          select(n[i]).classed("hovered", true);
	        },
	        exit: function exit(d, i, n) {
	          var branch = select(n[i]); // self.settings.edges.baubles.forEach((bauble) => {
	          //     if (bauble.edgeFilter(branch)) {
	          //         bauble.update(branch);
	          //     }
	          // });

	          select(n[i]).classed("hovered", false);
	        }
	      };
	      this.onHoverBranch({
	        action: action,
	        update: false
	      });
	      return this;
	    }
	    /**
	     * A helper function that sets mouseover highlighting of internal nodes. This helper function calls hilightNodes with
	     * and ".internal-node" selection.
	     */

	  }, {
	    key: "hilightInternalNodes",
	    value: function hilightInternalNodes() {
	      this.hilightNodes(".internal-node");
	      return this;
	    }
	    /**
	     * A helper function that sets mouseover highlighting of external nodes. This helper function calls hilightNodes with
	     * and ".external-node" selection.
	     */

	  }, {
	    key: "hilightExternalNodes",
	    value: function hilightExternalNodes() {
	      this.hilightNodes(".external-node");
	      return this;
	    }
	    /**
	     * Set mouseover highlighting of nodes. Node shapes are classed as hovered and bauble sizes are updated according to
	     * the hoverborder in the settings.
	     * @param {string} selection - the d3 style string that will be pased to the select method
	     */

	  }, {
	    key: "hilightNodes",
	    value: function hilightNodes(selection) {
	      var self = this;
	      var action = {
	        enter: function enter(d, i, n) {
	          var node = select(n[i]);
	          var vertex = d;
	          self.settings.vertices.baubles.forEach(function (bauble) {
	            if (bauble.vertexFilter(vertex)) {
	              bauble.update(node, self.settings.vertices.hoverBorder);
	            }
	          });
	          node.classed("hovered", true);
	        },
	        exit: function exit(d, i, n) {
	          var node = select(n[i]);
	          var vertex = d;
	          self.settings.vertices.baubles.forEach(function (bauble) {
	            if (bauble.vertexFilter(vertex)) {
	              bauble.update(node, 0);
	            }
	          });
	          node.classed("hovered", false);
	        }
	      };
	      this.onHoverNode({
	        action: action,
	        selection: selection,
	        update: false
	      });
	      return this;
	    }
	    /**
	     * Registers action function to be called when an edge is clicked on. The function is passed
	     * edge object that was clicked on and the position of the click as a proportion of the edge length.
	     *
	     * Optionally a selection string can be provided - i.e., to select a particular branch by its id.
	     *
	     * @param {Object} action
	     * @param selection
	     */

	  }, {
	    key: "onClickBranch",
	    value: function onClickBranch(_ref) {
	      var _this = this;

	      var action = _ref.action,
	          selection = _ref.selection,
	          update = _ref.update,
	          proportionMethod = _ref.proportionMethod;
	      selection = selection ? selection : ".branch";
	      update = update ? update : false;
	      proportionMethod = proportionMethod ? proportionMethod : "manhattan";
	      this.callbacks.branches.push(function () {
	        // We need to use the "function" keyword here (rather than an arrow) so that "this"
	        // points to the actual SVG element (so we can use d3.mouse(this)). We therefore need
	        // to store a reference to the object in "self".
	        var self = _this;

	        var selected = _this.svgSelection.selectAll("".concat(selection));

	        selected.on("click", function (edge) {
	          var proportion;
	          var x1 = self.scales.x(edge.v1.x + self.settings.xScale.revisions.offset);
	          var x2 = self.scales.x(edge.v0.x + self.settings.xScale.revisions.offset);
	          var mx = mouse(document.getElementById(self.svgId))[0];

	          if (proportionMethod.toLowerCase() === "manhattan") {
	            proportion = Math.abs((mx - x2) / (x1 - x2));
	          } else if (proportionMethod.toLocaleString() === "euclidean") {
	            var y1 = self.scales.y(edge.v1.y + self.settings.yScale.revisions.offset);
	            var y2 = self.scales.y(edge.v0.y + self.settings.yScale.revisions.offset);
	            var my = mouse(document.getElementById(self.svgId))[1];
	            proportion = Math.sqrt(Math.pow(my - y2, 2) + Math.pow(mx - x2, 2)) / Math.sqrt(Math.pow(y1 - y2, 2) + Math.pow(x1 - x2, 2));
	          } else {
	            throw new Error("proportion method ".concat(proportionMethod, " unknown."));
	          }

	          action(edge, proportion);

	          if (update) {
	            self.update();
	          }
	        });
	      });
	      this.update();
	      return this;
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
	      var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      this.onClickNode({
	        action: action,
	        selection: ".internal-node",
	        update: update
	      });
	      return this;
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
	      var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      this.onClickNode({
	        action: action,
	        selection: ".external-node",
	        update: update
	      });
	      return this;
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
	    value: function onClickNode(_ref2) {
	      var _this2 = this;

	      var action = _ref2.action,
	          selection = _ref2.selection,
	          update = _ref2.update;
	      selection = selection ? selection : ".node"; // selection = `${selection} .node-shape`;

	      this.callbacks.nodes.push(function () {
	        _this2.onClick({
	          action: action,
	          selection: selection,
	          update: true
	        });
	      });
	      this.update();
	      return this;
	    }
	    /**
	     * General Nodehover callback
	     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
	     * @param {*} selection defualts to ".node" will select this selection's child ".node-shape"
	     */

	  }, {
	    key: "onHoverNode",
	    value: function onHoverNode(_ref3) {
	      var _this3 = this;

	      var action = _ref3.action,
	          selection = _ref3.selection,
	          update = _ref3.update;
	      selection = selection ? selection : ".node";
	      update = update ? update : false; // selection = `${selection} .node-shape`;

	      this.callbacks.nodes.push(function () {
	        _this3.onHover({
	          action: action,
	          selection: selection,
	          update: update
	        });
	      });
	      this.update();
	      return this;
	    }
	    /**
	     * General branch hover callback
	     * @param {*} action and object with an enter and exit function which fire when the mouse enters and exits object
	     * @param {*} selection defualts to .branch
	     */

	  }, {
	    key: "onHoverBranch",
	    value: function onHoverBranch(_ref4) {
	      var _this4 = this;

	      var action = _ref4.action,
	          selection = _ref4.selection,
	          update = _ref4.update;
	      selection = selection ? ".branch ".concat(selection) : ".branch";
	      update = update ? update : false;
	      this.callbacks.branches.push(function () {
	        _this4.onHover({
	          action: action,
	          selection: selection,
	          update: update
	        });
	      }); // this update binds the callbacks to the html nodes

	      this.update();
	      return this;
	    }
	    /**
	     * Add a hover callback
	     * @param {*} action  - object which has 2 functions enter and exit each takes 3 arguments d,i,n d is data n[i] is `this`
	     * @param {*} selection  - what to select defaults to
	     */

	  }, {
	    key: "onHover",
	    value: function onHover(_ref5) {
	      var action = _ref5.action,
	          selection = _ref5.selection,
	          update = _ref5.update;
	      var self = this;
	      var selected = this.svgSelection.selectAll("".concat(selection));
	      selected.on("mouseover", function (d, i, n) {
	        action.enter(d, i, n);

	        if (update) {
	          self.update();
	        }
	      });
	      selected.on("mouseout", function (d, i, n) {
	        action.exit(d, i, n);

	        if (update) {
	          self.update();
	        }
	      });
	      return this;
	    }
	  }, {
	    key: "onClick",
	    value: function onClick(_ref6) {
	      var action = _ref6.action,
	          selection = _ref6.selection,
	          update = _ref6.update;
	      var self = this;
	      var selected = this.svgSelection.selectAll("".concat(selection));
	      selected.on("click", function (d, i, n) {
	        action(d, i, n);

	        if (update) {
	          self.update();
	        }
	      });
	      return this;
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
	      return this;
	    }
	  }, {
	    key: "addAnnotation",
	    value: function addAnnotation(annotation) {
	      this._annotations.push(annotation);

	      this.update();
	      return this;
	    }
	  }, {
	    key: "updateSettings",
	    value: function updateSettings(settings) {
	      this.settings = mergeDeep(this.settings, settings);
	      this.update();
	    }
	    /*
	    * private methods
	    */

	  }, {
	    key: p.updateVerticesAndEdges,
	    value: function value() {
	      var _this$p$layout = this[p.layout](this[p.tree]),
	          vertices = _this$p$layout.vertices,
	          edges = _this$p$layout.edges;

	      if (!this[p.vertices]) {
	        this[p.vertices] = new DataCollection(vertices, this);
	      } else {
	        this[p.vertices].updateData(vertices);
	      }

	      if (!this[p.edges]) {
	        this[p.edges] = new DataCollection(edges, this);
	      } else {
	        this[p.edges].updateData(edges);
	      }
	    }
	  }, {
	    key: p.setUpScales,
	    value: function value() {
	      var width, height;

	      if (Object.keys(this.settings).indexOf("width") > -1) {
	        width = this.settings.width;
	      } else {
	        width = this[p.svg].getBoundingClientRect().width;
	      }

	      if (Object.keys(this.settings).indexOf("height") > -1) {
	        height = this.settings.height;
	      } else {
	        height = this[p.svg].getBoundingClientRect().height;
	      } // create the scales


	      var xScale, yScale;
	      var projection = null;

	      if (this.layout instanceof GeoLayout) {
	        xScale = linear$2();
	        yScale = linear$2();
	        projection = this.layout.projection;
	      } else {
	        xScale = this.settings.xScale.scale().domain([max$1(this[p.vertices].data, function (d) {
	          return d.x;
	        }), min$1(this[p.vertices].data, function (d) {
	          return d.x;
	        })]).range([0, width - this.margins.right - this.margins.left]);
	        yScale = this.settings.yScale.scale().domain([min$1(this[p.vertices].data, function (d) {
	          return d.y;
	        }), max$1(this[p.vertices].data, function (d) {
	          return d.y;
	        })]).range([0, height - this.margins.bottom - this.margins.top]);
	      }

	      this.scales = {
	        x: xScale,
	        y: yScale,
	        width: width,
	        height: height,
	        projection: projection
	      };
	    }
	    /**
	     * Adds or updates nodes
	     */

	  }, {
	    key: p.updateNodes,
	    value: function value() {
	      var _this5 = this;

	      var nodesLayer = this.svgSelection.select(".nodes-layer");
	      var vertices = this[p.vertices].data;
	      var elementMap = this[p.vertices].elementMap; // DATA JOIN
	      nodesLayer.selectAll(".node").data(vertices, function (v) {
	        return "n_".concat(v.key);
	      }).join(function (enter) {
	        return enter.append("g").attr("id", function (v) {
	          return v.key;
	        }).attr("class", function (v) {
	          return ["node"].concat(toConsumableArray(v.classes)).join(" ");
	        }).attr("transform", function (v) {
	          return "translate(".concat(_this5.scales.x(v.x), ", ").concat(_this5.scales.y(v.y), ")");
	        }).each(function (v) {
	          if (elementMap.has(v.key)) {
	            var element = elementMap.get(v.key);
	            element.update(select(this));
	          }
	        }).append("text").attr("class", "node-label").attr("text-anchor", function (d) {
	          return d.leftLabel ? "end" : "start";
	        }).attr("alignment-baseline", function (d) {
	          return d.leftLabel ? d.labelBelow ? "bottom" : "hanging" : "middle";
	        }).attr("dx", function (d) {
	          return d.leftLabel ? "-6" : "12";
	        }).attr("dy", function (d) {
	          return d.leftLabel ? d.labelBelow ? "-8" : "8" : "0";
	        }).text(function (d) {
	          return d.textLabel;
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().duration(_this5.settings.transition.transitionDuration).ease(_this5.settings.transition.transitionEase).attr("class", function (v) {
	            return ["node"].concat(toConsumableArray(v.classes)).join(" ");
	          }).attr("transform", function (v) {
	            return "translate(".concat(_this5.scales.x(v.x), ", ").concat(_this5.scales.y(v.y), ")");
	          }).on("start", function (v) {
	            if (elementMap.has(v.key)) {
	              var element = elementMap.get(v.key);
	              element.update(select(this));
	            }
	          }).select("text .node-label").transition().duration(_this5.settings.transition.transitionDuration).ease(_this5.settings.transition.transitionEase).attr("text-anchor", function (d) {
	            return d.leftLabel ? "end" : "start";
	          }).attr("alignment-baseline", function (d) {
	            return d.leftLabel ? d.labelBelow ? "bottom" : "hanging" : "middle";
	          }).attr("dx", function (d) {
	            return d.leftLabel ? "-6" : "12";
	          }).attr("dy", function (d) {
	            return d.leftLabel ? d.labelBelow ? "-8" : "8" : "0";
	          }).text(function (d) {
	            return d.textLabel;
	          });
	        });
	      }); // add callbacks

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
	  }, {
	    key: p.updateNodeBackgrounds,
	    value: function value() {
	      var _this6 = this;

	      var nodesBackgroundLayer = this.svgSelection.select(".nodes-background-layer"); // DATA JOIN
	      // Join new data with old elements, if any.

	      var self = this;
	      nodesBackgroundLayer.selectAll(".node-background").data(this[p.vertices], function (v) {
	        return "nb_".concat(v.key);
	      }).join(function (enter) {
	        return enter.append("g").attr("id", function (v) {
	          return v.id;
	        }).attr("class", function (v) {
	          return ["node-background"].concat(toConsumableArray(v.classes)).join(" ");
	        }).attr("transform", function (v) {
	          return "translate(".concat(_this6.scales.x(v.x + _this6.settings.xScale.revisions.offset), ", ").concat(_this6.scales.y(v.y), ")");
	        }).each(function (v) {
	          var _iteratorNormalCompletion2 = true;
	          var _didIteratorError2 = false;
	          var _iteratorError2 = undefined;

	          try {
	            for (var _iterator2 = self.settings.vertices.backgroundBaubles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	              var bauble = _step2.value;

	              if (bauble.vertexFilter(v)) {
	                bauble.update(select(this));
	              }
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
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().duration(_this6.settings.transition.transitionDuration).ease(_this6.settings.transition.transitionEase).attr("class", function (v) {
	            return ["node-background"].concat(toConsumableArray(v.classes)).join(" ");
	          }).attr("transform", function (v) {
	            return "translate(".concat(_this6.scales.x(v.x + _this6.settings.xScale.revisions.offset), ", ").concat(_this6.scales.y(v.y), ")");
	          }).each(function (v) {
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	              for (var _iterator3 = self.settings.vertices.backgroundBaubles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                var bauble = _step3.value;

	                if (bauble.vertexFilter(v)) {
	                  bauble.update(select(this));
	                }
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
	          });
	        });
	      });
	      var _iteratorNormalCompletion4 = true;
	      var _didIteratorError4 = false;
	      var _iteratorError4 = undefined;

	      try {
	        for (var _iterator4 = this.callbacks.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	          var callback = _step4.value;
	          callback();
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
	    }
	    /**
	     * Adds or updates branch lines
	     */

	  }, {
	    key: p.updateBranches,
	    value: function value() {
	      var _this7 = this;

	      var branchesLayer = this.svgSelection.select(".branches-layer"); //set up scales for branches

	      var edges = this[p.edges].data;
	      var elementMap = this[p.edges].elementMap; // DATA JOIN
	      // Join new data with old elements, if any.

	      var self = this;
	      branchesLayer.selectAll(".branch").data(edges, function (e) {
	        return "b_".concat(e.key);
	      }).join(function (enter) {
	        return enter.append("g").attr("id", function (e) {
	          return e.key;
	        }).attr("class", function (e) {
	          return ["branch"].concat(toConsumableArray(e.classes)).join(" ");
	        }).attr("transform", function (e) {
	          return "translate(".concat(_this7.scales.x(e.v0.x), ", ").concat(_this7.scales.y(e.v1.y), ")");
	        }).each(function (e) {
	          if (elementMap.has(e.key)) {
	            var element = elementMap.get(e.key);
	            element.setup(self.scales);
	            element.update(select(this));
	          }
	        }).append("text").attr("class", "branch-label").attr("dx", function (e) {
	          return (_this7.scales.x(e.v1.x) - _this7.scales.x(e.v0.x)) / 2;
	        }).attr("dy", function (e) {
	          return e.labelBelow ? +6 : -6;
	        }).attr("alignment-baseline", function (e) {
	          return e.labelBelow ? "hanging" : "bottom";
	        }).attr("text-anchor", "middle").text(function (e) {
	          return e.label;
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().duration(_this7.settings.transition.transitionDuration).ease(_this7.settings.transition.transitionEase).attr("class", function (e) {
	            return ["branch"].concat(toConsumableArray(e.classes)).join(" ");
	          }).attr("transform", function (e) {
	            return "translate(".concat(_this7.scales.x(e.v0.x), ", ").concat(_this7.scales.y(e.v1.y), ")");
	          }).on("start", function (e) {
	            if (elementMap.has(e.key)) {
	              var element = elementMap.get(e.key);
	              element.update(select(this));
	            }
	          }) // .each(
	          .select("text .branch-label").attr("dx", function (e) {
	            return (_this7.scales.x(e.v1.x) - _this7.scales.x(e.v0.x)) / 2;
	          }).attr("dy", function (e) {
	            return e.labelBelow ? +6 : -6;
	          }).attr("alignment-baseline", function (e) {
	            return e.labelBelow ? "hanging" : "bottom";
	          }).attr("text-anchor", "middle").text(function (e) {
	            return e.label;
	          });
	        });
	      }); // add callbacks

	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;

	      try {
	        for (var _iterator5 = this.callbacks.branches[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          var callback = _step5.value;
	          callback();
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
	    }
	  }, {
	    key: p.updateCartoons,
	    value: function value() {
	      var _this8 = this;

	      var cartoonLayer = this.svgSelection.select(".cartoon-layer");
	      var self = this;
	      cartoonLayer.selectAll("g .cartoon").data(this.layout.cartoons, function (c) {
	        return "c_".concat(c.id);
	      }).join(function (enter) {
	        return enter.append("g").attr("id", function (c) {
	          return "cartoon-".concat(c.id);
	        }).attr("class", function (c) {
	          return ["cartoon"].concat(toConsumableArray(c.classes)).join(" ");
	        }).attr("transform", function (c) {
	          return "translate(".concat(_this8.scales.x(c.vertices[0].x + _this8.settings.xScale.revisions.offset), ", ").concat(_this8.scales.y(c.vertices[0].y + _this8.settings.xScale.revisions.offset), ")");
	        }).each(function (c) {
	          var _iteratorNormalCompletion6 = true;
	          var _didIteratorError6 = false;
	          var _iteratorError6 = undefined;

	          try {
	            for (var _iterator6 = self.settings.cartoons.baubles[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	              var bauble = _step6.value;

	              if (bauble.cartoonFilter(c)) {
	                bauble.update(select(this));
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
	        });
	      }, function (update) {
	        return update.transition().duration(_this8.settings.transition.transitionDuration).ease(_this8.settings.transition.transitionEase).attr("class", function (c) {
	          return ["cartoon"].concat(toConsumableArray(c.classes)).join(" ");
	        }).attr("transform", function (c) {
	          return "translate(".concat(_this8.scales.x(c.vertices[0].x + _this8.settings.xScale.revisions.offset), ", ").concat(_this8.scales.y(c.vertices[0].y + _this8.settings.xScale.revisions.offset), ")");
	        }).each(function (c) {
	          var _iteratorNormalCompletion7 = true;
	          var _didIteratorError7 = false;
	          var _iteratorError7 = undefined;

	          try {
	            for (var _iterator7 = self.settings.cartoons.baubles[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	              var bauble = _step7.value;

	              if (bauble.cartoonFilter(c)) {
	                bauble.update(select(this));
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
	        });
	      }); // add callbacks

	      var _iteratorNormalCompletion8 = true;
	      var _didIteratorError8 = false;
	      var _iteratorError8 = undefined;

	      try {
	        for (var _iterator8 = this.callbacks.cartoons[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	          var callback = _step8.value;
	          callback();
	        }
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
	    }
	    /**
	     * Add axis
	     */

	  }, {
	    key: p.addXAxis,
	    value: function value() {
	      var _this9 = this;

	      var xRevisions = this.settings.xScale.revisions;
	      var reverse = xRevisions.reverseAxis ? -1 : 1;
	      var domain = xRevisions.origin !== null ? [this.xScaleOrigin + xRevisions.hedge + reverse * xRevisions.branchScale * Math.abs(this.scales.x.domain()[0] - this.scales.x.domain()[1]), this.xScaleOrigin] : this.scales.x.domain();
	      var axisScale = this.settings.xScale.scale().domain(domain).range(this.scales.x.range());
	      var xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
	      var axesLayer = this.svgSelection.select(".axes-layer");
	      this.settings.xScale.axes.forEach(function (axis) {
	        if (_this9.layout instanceof GeoLayout) {
	          throw new Error("Can not add axis to geolayout");
	        }

	        axis.createAxis({
	          selection: axesLayer,
	          x: 0,
	          y: _this9.scales.height - _this9.margins.bottom - _this9.margins.top + _this9.settings.xScale.gap,
	          length: xAxisWidth,
	          scale: axisScale
	        });
	      });
	    }
	  }, {
	    key: p.addYAxis,
	    value: function value() {
	      var _this10 = this;

	      var yRevisions = this.settings.yScale.revisions;
	      var reverse = yRevisions.reverseAxis ? -1 : 1;
	      var domain = yRevisions.origin !== null ? [this.yScaleOrigin + reverse * yRevisions.branchScale * Math.abs(this.scales.y.domain()[0] - this.scales.y.domain()[1]), this.yScaleOrigin] : this.scales.y.domain();
	      var axisScale = this.settings.yScale.scale().domain(domain).range(this.scales.y.range());
	      var yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
	      var axesLayer = this.svgSelection.select(".axes-layer");
	      this.settings.yScale.axes.forEach(function (axis) {
	        if (_this10.layout instanceof GeoLayout) {
	          throw new Error("Can not add axis to geolayout");
	        }

	        axis.createAxis({
	          selection: axesLayer,
	          x: 0 - _this10.settings.yScale.gap,
	          y: 0,
	          length: yAxisHeight,
	          scale: axisScale
	        });
	      });
	    }
	  }, {
	    key: p.updateXAxis,
	    value: function value() {
	      var _this11 = this;

	      var xRevisions = this.settings.xScale.revisions;
	      var reverse = xRevisions.reverseAxis ? -1 : 1;
	      var domain = xRevisions.origin !== null ? [this.xScaleOrigin + xRevisions.hedge + reverse * xRevisions.branchScale * Math.abs(this.scales.x.domain()[0] - this.scales.x.domain()[1]), this.xScaleOrigin] : this.scales.x.domain();
	      var axisScale = this.settings.xScale.scale().domain(domain).range(this.scales.x.range());
	      var xAxisWidth = this.scales.width - this.margins.left - this.margins.right;
	      var axesLayer = this.svgSelection.select(".axes-layer");
	      this.settings.xScale.axes.forEach(function (axis) {
	        axis.updateAxis({
	          selection: axesLayer,
	          x: 0,
	          y: _this11.scales.height - _this11.margins.bottom - _this11.margins.top + _this11.settings.xScale.gap,
	          length: xAxisWidth,
	          scale: axisScale
	        });
	      });
	    }
	  }, {
	    key: p.updateYAxis,
	    value: function value() {
	      var _this12 = this;

	      var yRevisions = this.settings.yScale.revisions;
	      var reverse = yRevisions.reverseAxis ? -1 : 1;
	      var domain = yRevisions.origin !== null ? [this.yScaleOrigin + reverse * yRevisions.branchScale * Math.abs(this.scales.y.domain()[0] - this.scales.y.domain()[1]), this.yScaleOrigin] : this.scales.y.domain();
	      var axisScale = this.settings.yScale.scale().domain(domain).range(this.scales.y.range());
	      var yAxisHeight = this.scales.height - this.margins.top - this.margins.bottom;
	      var axesLayer = this.svgSelection.select(".axes-layer");
	      this.settings.yScale.axes.forEach(function (axis) {
	        axis.updateAxis({
	          selection: axesLayer,
	          x: 0 - _this12.settings.yScale.gap,
	          y: 0,
	          length: yAxisHeight,
	          scale: axisScale
	        });
	      });
	    }
	  }, {
	    key: p.pointToPoint,
	    value: function value(points) {
	      var path = [];
	      var origin = points[0];
	      var pathPoints = points.reverse();
	      var currentPoint = origin;
	      var _iteratorNormalCompletion9 = true;
	      var _didIteratorError9 = false;
	      var _iteratorError9 = undefined;

	      try {
	        for (var _iterator9 = pathPoints[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	          var point = _step9.value;
	          var xdiff = this.scales.x(point.x + this.settings.xScale.revisions.offset) - this.scales.x(currentPoint.x + this.settings.xScale.revisions.offset);
	          var ydiff = this.scales.y(point.y) - this.scales.y(currentPoint.y);
	          path.push("".concat(xdiff, " ").concat(ydiff));
	          currentPoint = point;
	        }
	      } catch (err) {
	        _didIteratorError9 = true;
	        _iteratorError9 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
	            _iterator9["return"]();
	          }
	        } finally {
	          if (_didIteratorError9) {
	            throw _iteratorError9;
	          }
	        }
	      }

	      return "M 0 0 l ".concat(path.join(" l "), " z");
	    }
	  }, {
	    key: p.updateAnnotations,
	    value: function value() {
	      var _iteratorNormalCompletion10 = true;
	      var _didIteratorError10 = false;
	      var _iteratorError10 = undefined;

	      try {
	        for (var _iterator10 = this._annotations[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	          var annotation = _step10.value;
	          annotation();
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
	    }
	    /**
	     * Generates a line() function that takes an edge and it's index and returns a line for d3 path element. It is called
	     * by the figtree class as
	     * const branchPath = this.layout.branchPathGenerator(this.scales)
	     * newBranches.append("path")
	     .attr("class", "branch-path")
	     .attr("d", (e,i) => branchPath(e,i));
	     * @param scales
	     * @param branchCurve
	     * @return {function(*, *)}
	     */

	  }, {
	    key: p.branchPathGenerator,
	    value: function value() {
	      var _this13 = this;

	      var branchPath = function branchPath(e, i) {
	        var branchLine = line().x(function (v) {
	          return v.x;
	        }).y(function (v) {
	          return v.y;
	        }).curve(_this13.settings.edges.curve);
	        var factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
	        var dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
	        var output = _this13.settings.edges.curveRadius > 0 ? branchLine([{
	          x: 0,
	          y: _this13.scales.y(e.v0.y) - _this13.scales.y(e.v1.y)
	        }, {
	          x: 0,
	          y: dontNeedCurve * factor * _this13.settings.edges.curveRadius
	        }, {
	          x: 0 + dontNeedCurve * _this13.settings.edges.curveRadius,
	          y: 0
	        }, {
	          x: _this13.scales.x(e.v1.x + _this13.settings.xScale.revisions.offset) - _this13.scales.x(e.v0.x + _this13.settings.xScale.revisions.offset),
	          y: 0
	        }]) : branchLine([{
	          x: 0,
	          y: _this13.scales.y(e.v0.y) - _this13.scales.y(e.v1.y)
	        }, {
	          x: _this13.scales.x(e.v1.x + _this13.settings.xScale.revisions.offset) - _this13.scales.x(e.v0.x + _this13.settings.xScale.revisions.offset),
	          y: 0
	        }]);
	        return output;
	      };

	      return branchPath;
	    } // setters and getters

	  }, {
	    key: "svg",
	    value: function svg() {
	      var _svg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (_svg === null) {
	        return this[p.svg];
	      } else {
	        this[p.svg] = _svg;
	        return this;
	      }
	    }
	  }, {
	    key: "tree",
	    value: function tree() {
	      var _this14 = this;

	      var _tree = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (_tree === null) {
	        return this[p.tree];
	      } else {
	        this[p.tree] = _tree;
	        this[p.tree].subscribeCallback(function () {
	          _this14.update();
	        });
	        return this;
	      }
	    }
	  }, {
	    key: "layout",
	    value: function layout() {
	      var _layout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (_layout === null) {
	        return this[p.layout];
	      } else {
	        this[p.layout] = _layout;
	        return this;
	      }
	    }
	  }, {
	    key: "nodes",
	    value: function nodes() {
	      if (!this[p.vertices]) {
	        this[p.updateVerticesAndEdges]();
	      }

	      return this[p.vertices];
	    }
	  }, {
	    key: "branches",
	    value: function branches() {
	      if (!this[p.edges]) {
	        this[p.updateVerticesAndEdges]();
	      }

	      return this[p.edges];
	    }
	  }, {
	    key: "treeLayout",
	    set: function set(layout) {
	      this.layout = layout;
	      this.update();
	    }
	  }, {
	    key: "xAxis",
	    get: function get() {}
	  }, {
	    key: "yAxis",
	    get: function get() {}
	  }]);

	  return FigTree;
	}(); //TODO refactor into nodes and branches that can act like
	// .nodes(circlebauble)
	// instead of .nodes().elements()
	// also but some case specific helper functions for each style.

	var DataCollection =
	/*#__PURE__*/
	function () {
	  function DataCollection(data, figure) {
	    classCallCheck(this, DataCollection);

	    this.figure = figure;
	    this.data = data;
	    this.elementMap = new Map();
	    this.attrs = {};
	    this.interactions = {};
	    this.elementMaker = null;
	    this.labelMaker = null;
	    return new Proxy(this, {
	      get: function get(target, prop) {
	        if (target[prop] === undefined) {
	          return figure[prop];
	        } else {
	          return target[prop];
	        }
	      }
	    });
	  }

	  createClass(DataCollection, [{
	    key: "updateData",
	    value: function updateData(data) {
	      this.data = data; //remake elements

	      this.elements(this.elementMaker); // update element styles

	      for (var _i = 0, _Object$entries = Object.entries(this.attrs); _i < _Object$entries.length; _i++) {
	        var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
	            key = _Object$entries$_i[0],
	            value = _Object$entries$_i[1];

	        this.attr(key, value);
	      }

	      for (var _i2 = 0, _Object$entries2 = Object.entries(this.interactions); _i2 < _Object$entries2.length; _i2++) {
	        var _Object$entries2$_i = slicedToArray(_Object$entries2[_i2], 2),
	            key = _Object$entries2$_i[0],
	            value = _Object$entries2$_i[1];

	        this.on(key, value);
	      }

	      this.label(this.labelMaker);
	    }
	  }, {
	    key: "elements",
	    value: function elements() {
	      var b = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      if (b) {
	        this.elementMaker = b;
	      }

	      if (this.elementMaker) {
	        if (!isFunction(this.elementMaker)) {
	          var _iteratorNormalCompletion11 = true;
	          var _didIteratorError11 = false;
	          var _iteratorError11 = undefined;

	          try {
	            for (var _iterator11 = this.data[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	              var d = _step11.value;
	              this.elementMap.set(d.key, new this.elementMaker());
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
	        } else if (this.elementMaker instanceof Function) {
	          var _iteratorNormalCompletion12 = true;
	          var _didIteratorError12 = false;
	          var _iteratorError12 = undefined;

	          try {
	            for (var _iterator12 = this.data[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	              var _d = _step12.value;
	              var element = this.elementMaker(_d.key);

	              if (element) {
	                this.elementMap.set(_d.key, new this.elementMaker(_d));
	              }
	            }
	          } catch (err) {
	            _didIteratorError12 = true;
	            _iteratorError12 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
	                _iterator12["return"]();
	              }
	            } finally {
	              if (_didIteratorError12) {
	                throw _iteratorError12;
	              }
	            }
	          }
	        }

	        return this;
	      }

	      return this.elementMap;
	    }
	  }, {
	    key: "attr",
	    value: function attr(string, f) {
	      this.attrs[string] = f;

	      if (f instanceof Function) {
	        var _iteratorNormalCompletion13 = true;
	        var _didIteratorError13 = false;
	        var _iteratorError13 = undefined;

	        try {
	          for (var _iterator13 = this.data[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	            var d = _step13.value;

	            if (f(d)) {
	              var element = this.elementMap.get(d.key);

	              if (element) {
	                element.attr(string, f(d));
	              }
	            }
	          }
	        } catch (err) {
	          _didIteratorError13 = true;
	          _iteratorError13 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
	              _iterator13["return"]();
	            }
	          } finally {
	            if (_didIteratorError13) {
	              throw _iteratorError13;
	            }
	          }
	        }
	      } else {
	        var _iteratorNormalCompletion14 = true;
	        var _didIteratorError14 = false;
	        var _iteratorError14 = undefined;

	        try {
	          for (var _iterator14 = this.data[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
	            var _d2 = _step14.value;

	            var _element = this.elementMap.get(_d2.key);

	            if (_element) {
	              _element.attr(string, f);
	            }
	          }
	        } catch (err) {
	          _didIteratorError14 = true;
	          _iteratorError14 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
	              _iterator14["return"]();
	            }
	          } finally {
	            if (_didIteratorError14) {
	              throw _iteratorError14;
	            }
	          }
	        }
	      }

	      return this;
	    }
	  }, {
	    key: "on",
	    value: function on(string, f) {
	      this.interactions[string] = f;
	      var _iteratorNormalCompletion15 = true;
	      var _didIteratorError15 = false;
	      var _iteratorError15 = undefined;

	      try {
	        for (var _iterator15 = this.data[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
	          var d = _step15.value;
	          var element = this.elementMap.get(d.key);

	          if (element) {
	            element.on(string, f(element));
	          }
	        }
	      } catch (err) {
	        _didIteratorError15 = true;
	        _iteratorError15 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
	            _iterator15["return"]();
	          }
	        } finally {
	          if (_didIteratorError15) {
	            throw _iteratorError15;
	          }
	        }
	      }

	      return this;
	    }
	  }, {
	    key: "label",
	    value: function label(l) {
	      if (l) {
	        this.labelMaker = l;
	      }

	      if (this.labelMaker) {
	        if (this.labelMaker instanceof Function) {
	          var _iteratorNormalCompletion16 = true;
	          var _didIteratorError16 = false;
	          var _iteratorError16 = undefined;

	          try {
	            for (var _iterator16 = this.data[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
	              var d = _step16.value;

	              if (this.labelMaker(d)) {
	                d.textLabel = this.labelMaker(d);
	              }
	            }
	          } catch (err) {
	            _didIteratorError16 = true;
	            _iteratorError16 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
	                _iterator16["return"]();
	              }
	            } finally {
	              if (_didIteratorError16) {
	                throw _iteratorError16;
	              }
	            }
	          }
	        } else {
	          var _iteratorNormalCompletion17 = true;
	          var _didIteratorError17 = false;
	          var _iteratorError17 = undefined;

	          try {
	            for (var _iterator17 = this.data[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
	              var _d3 = _step17.value;

	              if (_d3[this.labelMaker]) {
	                _d3.textLabel = _d3[this.labelMaker];
	              }
	            }
	          } catch (err) {
	            _didIteratorError17 = true;
	            _iteratorError17 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
	                _iterator17["return"]();
	              }
	            } finally {
	              if (_didIteratorError17) {
	                throw _iteratorError17;
	              }
	            }
	          }
	        }
	      }

	      return this;
	    }
	  }]);

	  return DataCollection;
	}(); //https://stackoverflow.com/questions/526559/testing-if-something-is-a-class-in-javascript


	function isFunction(funcOrClass) {
	  var propertyNames = Object.getOwnPropertyNames(funcOrClass);
	  return !propertyNames.includes('prototype') || propertyNames.includes('arguments');
	}

	/**
	 * The RootToTipPlot class
	 */

	var RootToTipPlot =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(RootToTipPlot, _AbstractLayout);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function RootToTipPlot(tree) {
	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, RootToTipPlot);

	    return possibleConstructorReturn(this, getPrototypeOf(RootToTipPlot).call(this, tree, objectSpread({
	      externalNodeLabelAnnotationName: null,
	      regressionFilter: function regressionFilter() {
	        return true;
	      }
	    }, settings)));
	  }

	  createClass(RootToTipPlot, [{
	    key: "layout",
	    value: function layout() {
	      var _this = this;

	      var treeNodes = this._getTreeNodes();

	      this[makeVerticesFromNodes](treeNodes); // console.log(this._vertices)
	      // update the node locations (vertices)

	      treeNodes.forEach(function (n) {
	        var v = _this._nodeMap.get(n);

	        _this.setYPosition(v, null);

	        _this.setXPosition(v, null);
	      });

	      var usedVertices = this._vertices.filter(this.settings.regressionFilter);

	      this.regression = this.leastSquares(usedVertices); //TODO rerooting doesn't update line?!!

	      var x1 = min(this._vertices, function (d) {
	        return d.x;
	      });
	      var x2 = max(this._vertices, function (d) {
	        return d.x;
	      });
	      var y1 = 0.0;
	      var y2 = max(usedVertices, function (d) {
	        return d.y;
	      });

	      if (usedVertices.filter(function (v) {
	        return v.visibility === VertexStyle$1.INCLUDED;
	      }).length > 1 && this.regression.slope > 0.0) {
	        x1 = this.regression.xIntercept;
	        y2 = this.regression.y(x2);
	      } else if (usedVertices.filter(function (v) {
	        return v.visibility === VertexStyle$1.INCLUDED;
	      }).length > 1 && this.regression.slope < 0.0) {
	        x2 = this.regression.xIntercept;
	        y1 = this.regression.y(x1);
	        y2 = 0;
	      }

	      var startPoint = {
	        key: "startPoint",
	        visibility: VertexStyle$1.HIDDEN,
	        x: x1,
	        y: y1
	      };
	      var endPoint = {
	        key: "endPoint",
	        visibility: VertexStyle$1.HIDDEN,
	        x: x2,
	        y: y2
	      };

	      this._vertices.push(startPoint);

	      this._nodeMap.set("startPoint", startPoint);

	      this._vertices.push(endPoint);

	      this._nodeMap.set("endPoint", endPoint);

	      this._edges = [{
	        v0: startPoint,
	        v1: endPoint,
	        key: "line",
	        classes: []
	      }];
	      this.layoutKnown = true;
	    }
	  }, {
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      return this.tree.externalNodes;
	    }
	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      return 0;
	    }
	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      return 0;
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      vertex.x = vertex.node.annotations.date;
	      return 0;
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      vertex.y = this.tree.rootToTipLength(vertex.node);
	      return vertex.y;
	    }
	  }, {
	    key: "leastSquares",

	    /**
	     * returns slope, intercept and r-square of the line
	     * @param data
	     * @returns {{slope: number, xIntercept: number, yIntercept: number, rSquare: number, y: (function(*): number)}}
	     */
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
	  }, {
	    key: "horizontalDomain",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      var xPositions = [].concat(toConsumableArray(this._vertices.map(function (d) {
	        return d.x;
	      })), [min(this._vertices.map(function (d) {
	        return d.x;
	      }))]);
	      return [min(xPositions), max(xPositions)];
	    }
	  }, {
	    key: "verticalDomain",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      var yPositions = [].concat(toConsumableArray(this._vertices.map(function (d) {
	        return d.y;
	      })), [min(this._vertices.map(function (d) {
	        return d.y;
	      }))]);
	      return [max(yPositions), min(yPositions)];
	    }
	  }, {
	    key: "edges",
	    get: function get() {
	      if (!this.layoutKnown) {
	        this.layout();
	      }

	      return this._edges;
	    }
	  }]);

	  return RootToTipPlot;
	}(AbstractLayout);

	/** @module bauble */

	var RectangularBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(RectangularBauble, _Bauble);

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
	     * @param [settings.height=16] - the height of the rectangle in pixels
	     * @param [settings.width=6] - the width of the rectangle in pixels
	     * @param [settings.radius=2] - the rx and ry of the rectangle. This rounds the corners
	      */

	  }]);

	  function RectangularBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, RectangularBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(RectangularBauble).call(this, mergeDeep(RectangularBauble.DEFAULT_SETTINGS(), settings)));
	  }
	  /**
	   * A function that assigns width,height,x,y,rx, and ry attributes to a rect selection.
	   * @param selection
	   * @param border
	   * @return {*|null|undefined}
	   */


	  createClass(RectangularBauble, [{
	    key: "update",
	    value: function update(selection) {
	      var _this = this;

	      var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	      var w = this.settings.width + border;
	      var h = this.settings.height + border;
	      return selection.selectAll("rect").data(function (d) {
	        return [d];
	      }).join(function (enter) {
	        return enter.append("rect").attr("x", -w / 2).attr("width", w).attr("y", -h / 2).attr("height", h).attr("rx", _this.settings.radius).attr("ry", _this.settings.radius).attr("class", "node-shape").attrs(function (vertex) {
	          var attributes = _this.settings.attrs;
	          return Object.keys(attributes).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](vertex)));
	          }, {});
	        }).styles(function (vertex) {
	          var styles = _this.settings.styles;
	          return Object.keys(styles).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, styles[curr](vertex)));
	          }, {});
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().attr("x", -w / 2).attr("width", w).attr("y", -h / 2).attr("height", h).attr("rx", _this.settings.radius).attr("ry", _this.settings.radius).attrs(function (vertex) {
	            var attributes = _this.settings.attrs;
	            return Object.keys(attributes).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](vertex)));
	            }, {});
	          }).styles(function (vertex) {
	            var styles = _this.settings.styles;
	            return Object.keys(styles).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, styles[curr](vertex)));
	            }, {});
	          });
	        });
	      });
	    }
	  }]);

	  return RectangularBauble;
	}(Bauble);

	var rough_umd = createCommonjsModule(function (module, exports) {
	!function(t,e){module.exports=e();}(commonjsGlobal,function(){const t="undefined"!=typeof self;class e{constructor(t,e){this.defaultOptions={maxRandomnessOffset:2,roughness:1,bowing:1,stroke:"#000",strokeWidth:1,curveTightness:0,curveStepCount:9,fillStyle:"hachure",fillWeight:-1,hachureAngle:-41,hachureGap:-1,dashOffset:-1,dashGap:-1,zigzagOffset:-1},this.config=t||{},this.surface=e,this.config.options&&(this.defaultOptions=this._options(this.config.options));}_options(t){return t?Object.assign({},this.defaultOptions,t):this.defaultOptions}_drawable(t,e,s){return {shape:t,sets:e||[],options:s||this.defaultOptions}}getCanvasSize(){const t=t=>t&&"object"==typeof t&&t.baseVal&&t.baseVal.value?t.baseVal.value:t||100;return this.surface?[t(this.surface.width),t(this.surface.height)]:[100,100]}computePolygonSize(t){if(t.length){let e=t[0][0],s=t[0][0],i=t[0][1],h=t[0][1];for(let n=1;n<t.length;n++)e=Math.min(e,t[n][0]),s=Math.max(s,t[n][0]),i=Math.min(i,t[n][1]),h=Math.max(h,t[n][1]);return [s-e,h-i]}return [0,0]}polygonPath(t){let e="";if(t.length){e=`M${t[0][0]},${t[0][1]}`;for(let s=1;s<t.length;s++)e=`${e} L${t[s][0]},${t[s][1]}`;}return e}computePathSize(e){let s=[0,0];if(t&&self.document)try{const t="http://www.w3.org/2000/svg",i=self.document.createElementNS(t,"svg");i.setAttribute("width","0"),i.setAttribute("height","0");const h=self.document.createElementNS(t,"path");h.setAttribute("d",e),i.appendChild(h),self.document.body.appendChild(i);const n=h.getBBox();n&&(s[0]=n.width||0,s[1]=n.height||0),self.document.body.removeChild(i);}catch(t){}const i=this.getCanvasSize();return s[0]*s[1]||(s=i),s}toPaths(t){const e=t.sets||[],s=t.options||this.defaultOptions,i=[];for(const t of e){let e=null;switch(t.type){case"path":e={d:this.opsToPath(t),stroke:s.stroke,strokeWidth:s.strokeWidth,fill:"none"};break;case"fillPath":e={d:this.opsToPath(t),stroke:"none",strokeWidth:0,fill:s.fill||"none"};break;case"fillSketch":e=this.fillSketch(t,s);break;case"path2Dfill":e={d:t.path||"",stroke:"none",strokeWidth:0,fill:s.fill||"none"};break;case"path2Dpattern":{const i=t.size,h={x:0,y:0,width:1,height:1,viewBox:`0 0 ${Math.round(i[0])} ${Math.round(i[1])}`,patternUnits:"objectBoundingBox",path:this.fillSketch(t,s)};e={d:t.path,stroke:"none",strokeWidth:0,pattern:h};break}}e&&i.push(e);}return i}fillSketch(t,e){let s=e.fillWeight;return s<0&&(s=e.strokeWidth/2),{d:this.opsToPath(t),stroke:e.fill||"none",strokeWidth:s,fill:"none"}}opsToPath(t){let e="";for(const s of t.ops){const t=s.data;switch(s.op){case"move":e+=`M${t[0]} ${t[1]} `;break;case"bcurveTo":e+=`C${t[0]} ${t[1]}, ${t[2]} ${t[3]}, ${t[4]} ${t[5]} `;break;case"qcurveTo":e+=`Q${t[0]} ${t[1]}, ${t[2]} ${t[3]} `;break;case"lineTo":e+=`L${t[0]} ${t[1]} `;}}return e.trim()}}function s(t,e){return t.type===e}const i={A:7,a:7,C:6,c:6,H:1,h:1,L:2,l:2,M:2,m:2,Q:4,q:4,S:4,s:4,T:4,t:2,V:1,v:1,Z:0,z:0};class h{constructor(t){this.COMMAND=0,this.NUMBER=1,this.EOD=2,this.segments=[],this.parseData(t),this.processPoints();}tokenize(t){const e=new Array;for(;""!==t;)if(t.match(/^([ \t\r\n,]+)/))t=t.substr(RegExp.$1.length);else if(t.match(/^([aAcChHlLmMqQsStTvVzZ])/))e[e.length]={type:this.COMMAND,text:RegExp.$1},t=t.substr(RegExp.$1.length);else{if(!t.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/))return console.error("Unrecognized segment command: "+t),[];e[e.length]={type:this.NUMBER,text:`${parseFloat(RegExp.$1)}`},t=t.substr(RegExp.$1.length);}return e[e.length]={type:this.EOD,text:""},e}parseData(t){const e=this.tokenize(t);let h=0,n=e[h],a="BOD";for(this.segments=new Array;!s(n,this.EOD);){let o;const r=new Array;if("BOD"===a){if("M"!==n.text&&"m"!==n.text)return void this.parseData("M0,0"+t);h++,o=i[n.text],a=n.text;}else s(n,this.NUMBER)?o=i[a]:(h++,o=i[n.text],a=n.text);if(h+o<e.length){for(let t=h;t<h+o;t++){const i=e[t];if(!s(i,this.NUMBER))return void console.error("Parameter type is not a number: "+a+","+i.text);r[r.length]=+i.text;}if("number"!=typeof i[a])return void console.error("Unsupported segment type: "+a);{const t={key:a,data:r};this.segments.push(t),n=e[h+=o],"M"===a&&(a="L"),"m"===a&&(a="l");}}else console.error("Path data ended before all parameters were found");}}get closed(){if(void 0===this._closed){this._closed=!1;for(const t of this.segments)"z"===t.key.toLowerCase()&&(this._closed=!0);}return this._closed}processPoints(){let t=null,e=[0,0];for(let s=0;s<this.segments.length;s++){const i=this.segments[s];switch(i.key){case"M":case"L":case"T":i.point=[i.data[0],i.data[1]];break;case"m":case"l":case"t":i.point=[i.data[0]+e[0],i.data[1]+e[1]];break;case"H":i.point=[i.data[0],e[1]];break;case"h":i.point=[i.data[0]+e[0],e[1]];break;case"V":i.point=[e[0],i.data[0]];break;case"v":i.point=[e[0],i.data[0]+e[1]];break;case"z":case"Z":t&&(i.point=[t[0],t[1]]);break;case"C":i.point=[i.data[4],i.data[5]];break;case"c":i.point=[i.data[4]+e[0],i.data[5]+e[1]];break;case"S":i.point=[i.data[2],i.data[3]];break;case"s":i.point=[i.data[2]+e[0],i.data[3]+e[1]];break;case"Q":i.point=[i.data[2],i.data[3]];break;case"q":i.point=[i.data[2]+e[0],i.data[3]+e[1]];break;case"A":i.point=[i.data[5],i.data[6]];break;case"a":i.point=[i.data[5]+e[0],i.data[6]+e[1]];}"m"!==i.key&&"M"!==i.key||(t=null),i.point&&(e=i.point,t||(t=i.point)),"z"!==i.key&&"Z"!==i.key||(t=null);}}}class n{constructor(t){this._position=[0,0],this._first=null,this.bezierReflectionPoint=null,this.quadReflectionPoint=null,this.parsed=new h(t);}get segments(){return this.parsed.segments}get closed(){return this.parsed.closed}get linearPoints(){if(!this._linearPoints){const t=[];let e=[];for(const s of this.parsed.segments){const i=s.key.toLowerCase();("m"!==i&&"z"!==i||(e.length&&(t.push(e),e=[]),"z"!==i))&&(s.point&&e.push(s.point));}e.length&&(t.push(e),e=[]),this._linearPoints=t;}return this._linearPoints}get first(){return this._first}set first(t){this._first=t;}setPosition(t,e){this._position=[t,e],this._first||(this._first=[t,e]);}get position(){return this._position}get x(){return this._position[0]}get y(){return this._position[1]}}class a{constructor(t,e,s,i,h,n){if(this._segIndex=0,this._numSegs=0,this._rx=0,this._ry=0,this._sinPhi=0,this._cosPhi=0,this._C=[0,0],this._theta=0,this._delta=0,this._T=0,this._from=t,t[0]===e[0]&&t[1]===e[1])return;const a=Math.PI/180;this._rx=Math.abs(s[0]),this._ry=Math.abs(s[1]),this._sinPhi=Math.sin(i*a),this._cosPhi=Math.cos(i*a);const o=this._cosPhi*(t[0]-e[0])/2+this._sinPhi*(t[1]-e[1])/2,r=-this._sinPhi*(t[0]-e[0])/2+this._cosPhi*(t[1]-e[1])/2;let l=0;const c=this._rx*this._rx*this._ry*this._ry-this._rx*this._rx*r*r-this._ry*this._ry*o*o;if(c<0){const t=Math.sqrt(1-c/(this._rx*this._rx*this._ry*this._ry));this._rx=this._rx*t,this._ry=this._ry*t,l=0;}else l=(h===n?-1:1)*Math.sqrt(c/(this._rx*this._rx*r*r+this._ry*this._ry*o*o));const p=l*this._rx*r/this._ry,u=-l*this._ry*o/this._rx;this._C=[0,0],this._C[0]=this._cosPhi*p-this._sinPhi*u+(t[0]+e[0])/2,this._C[1]=this._sinPhi*p+this._cosPhi*u+(t[1]+e[1])/2,this._theta=this.calculateVectorAngle(1,0,(o-p)/this._rx,(r-u)/this._ry);let f=this.calculateVectorAngle((o-p)/this._rx,(r-u)/this._ry,(-o-p)/this._rx,(-r-u)/this._ry);!n&&f>0?f-=2*Math.PI:n&&f<0&&(f+=2*Math.PI),this._numSegs=Math.ceil(Math.abs(f/(Math.PI/2))),this._delta=f/this._numSegs,this._T=8/3*Math.sin(this._delta/4)*Math.sin(this._delta/4)/Math.sin(this._delta/2);}getNextSegment(){if(this._segIndex===this._numSegs)return null;const t=Math.cos(this._theta),e=Math.sin(this._theta),s=this._theta+this._delta,i=Math.cos(s),h=Math.sin(s),n=[this._cosPhi*this._rx*i-this._sinPhi*this._ry*h+this._C[0],this._sinPhi*this._rx*i+this._cosPhi*this._ry*h+this._C[1]],a=[this._from[0]+this._T*(-this._cosPhi*this._rx*e-this._sinPhi*this._ry*t),this._from[1]+this._T*(-this._sinPhi*this._rx*e+this._cosPhi*this._ry*t)],o=[n[0]+this._T*(this._cosPhi*this._rx*h+this._sinPhi*this._ry*i),n[1]+this._T*(this._sinPhi*this._rx*h-this._cosPhi*this._ry*i)];return this._theta=s,this._from=[n[0],n[1]],this._segIndex++,{cp1:a,cp2:o,to:n}}calculateVectorAngle(t,e,s,i){const h=Math.atan2(e,t),n=Math.atan2(i,s);return n>=h?n-h:2*Math.PI-(h-n)}}class o{constructor(t,e){this.sets=t,this.closed=e;}fit(t){const e=[];for(const s of this.sets){const i=s.length;let h=Math.floor(t*i);if(h<5){if(i<=5)continue;h=5;}e.push(this.reduce(s,h));}let s="";for(const t of e){for(let e=0;e<t.length;e++){const i=t[e];s+=0===e?"M"+i[0]+","+i[1]:"L"+i[0]+","+i[1];}this.closed&&(s+="z ");}return s}distance(t,e){return Math.sqrt(Math.pow(t[0]-e[0],2)+Math.pow(t[1]-e[1],2))}reduce(t,e){if(t.length<=e)return t;const s=t.slice(0);for(;s.length>e;){let t=-1,e=-1;for(let i=1;i<s.length-1;i++){const h=this.distance(s[i-1],s[i]),n=this.distance(s[i],s[i+1]),a=this.distance(s[i-1],s[i+1]),o=(h+n+a)/2,r=Math.sqrt(o*(o-h)*(o-n)*(o-a));(t<0||r<t)&&(t=r,e=i);}if(!(e>0))break;s.splice(e,1);}return s}}class r{constructor(t,e){this.xi=Number.MAX_VALUE,this.yi=Number.MAX_VALUE,this.px1=t[0],this.py1=t[1],this.px2=e[0],this.py2=e[1],this.a=this.py2-this.py1,this.b=this.px1-this.px2,this.c=this.px2*this.py1-this.px1*this.py2,this._undefined=0===this.a&&0===this.b&&0===this.c;}isUndefined(){return this._undefined}intersects(t){if(this.isUndefined()||t.isUndefined())return !1;let e=Number.MAX_VALUE,s=Number.MAX_VALUE,i=0,h=0;const n=this.a,a=this.b,o=this.c;return Math.abs(a)>1e-5&&(e=-n/a,i=-o/a),Math.abs(t.b)>1e-5&&(s=-t.a/t.b,h=-t.c/t.b),e===Number.MAX_VALUE?s===Number.MAX_VALUE?-o/n==-t.c/t.a&&(this.py1>=Math.min(t.py1,t.py2)&&this.py1<=Math.max(t.py1,t.py2)?(this.xi=this.px1,this.yi=this.py1,!0):this.py2>=Math.min(t.py1,t.py2)&&this.py2<=Math.max(t.py1,t.py2)&&(this.xi=this.px2,this.yi=this.py2,!0)):(this.xi=this.px1,this.yi=s*this.xi+h,!((this.py1-this.yi)*(this.yi-this.py2)<-1e-5||(t.py1-this.yi)*(this.yi-t.py2)<-1e-5)&&(!(Math.abs(t.a)<1e-5)||!((t.px1-this.xi)*(this.xi-t.px2)<-1e-5))):s===Number.MAX_VALUE?(this.xi=t.px1,this.yi=e*this.xi+i,!((t.py1-this.yi)*(this.yi-t.py2)<-1e-5||(this.py1-this.yi)*(this.yi-this.py2)<-1e-5)&&(!(Math.abs(n)<1e-5)||!((this.px1-this.xi)*(this.xi-this.px2)<-1e-5))):e===s?i===h&&(this.px1>=Math.min(t.px1,t.px2)&&this.px1<=Math.max(t.py1,t.py2)?(this.xi=this.px1,this.yi=this.py1,!0):this.px2>=Math.min(t.px1,t.px2)&&this.px2<=Math.max(t.px1,t.px2)&&(this.xi=this.px2,this.yi=this.py2,!0)):(this.xi=(h-i)/(e-s),this.yi=e*this.xi+i,!((this.px1-this.xi)*(this.xi-this.px2)<-1e-5||(t.px1-this.xi)*(this.xi-t.px2)<-1e-5))}}function l(t,e){const s=t[1][1]-t[0][1],i=t[0][0]-t[1][0],h=s*t[0][0]+i*t[0][1],n=e[1][1]-e[0][1],a=e[0][0]-e[1][0],o=n*e[0][0]+a*e[0][1],r=s*a-n*i;return r?[Math.round((a*h-i*o)/r),Math.round((s*o-n*h)/r)]:null}class c{constructor(t,e,s,i,h,n,a,o){this.deltaX=0,this.hGap=0,this.top=t,this.bottom=e,this.left=s,this.right=i,this.gap=h,this.sinAngle=n,this.tanAngle=o,Math.abs(n)<1e-4?this.pos=s+h:Math.abs(n)>.9999?this.pos=t+h:(this.deltaX=(e-t)*Math.abs(o),this.pos=s-Math.abs(this.deltaX),this.hGap=Math.abs(h/a),this.sLeft=new r([s,e],[s,t]),this.sRight=new r([i,e],[i,t]));}nextLine(){if(Math.abs(this.sinAngle)<1e-4){if(this.pos<this.right){const t=[this.pos,this.top,this.pos,this.bottom];return this.pos+=this.gap,t}}else if(Math.abs(this.sinAngle)>.9999){if(this.pos<this.bottom){const t=[this.left,this.pos,this.right,this.pos];return this.pos+=this.gap,t}}else{let t=this.pos-this.deltaX/2,e=this.pos+this.deltaX/2,s=this.bottom,i=this.top;if(this.pos<this.right+this.deltaX){for(;t<this.left&&e<this.left||t>this.right&&e>this.right;)if(this.pos+=this.hGap,t=this.pos-this.deltaX/2,e=this.pos+this.deltaX/2,this.pos>this.right+this.deltaX)return null;const h=new r([t,s],[e,i]);this.sLeft&&h.intersects(this.sLeft)&&(t=h.xi,s=h.yi),this.sRight&&h.intersects(this.sRight)&&(e=h.xi,i=h.yi),this.tanAngle>0&&(t=this.right-(t-this.left),e=this.right-(e-this.left));const n=[t,s,e,i];return this.pos+=this.hGap,n}}return null}}function p(t){const e=t[0],s=t[1];return Math.sqrt(Math.pow(e[0]-s[0],2)+Math.pow(e[1]-s[1],2))}function u(t,e){const s=[],i=new r([t[0],t[1]],[t[2],t[3]]);for(let t=0;t<e.length;t++){const h=new r(e[t],e[(t+1)%e.length]);i.intersects(h)&&s.push([i.xi,i.yi]);}return s}function f(t,e,s,i,h,n,a){return [-s*n-i*h+s+n*t+h*e,a*(s*h-i*n)+i+-a*h*t+a*n*e]}function d(t,e){const s=[];if(t&&t.length){let i=t[0][0],h=t[0][0],n=t[0][1],a=t[0][1];for(let e=1;e<t.length;e++)i=Math.min(i,t[e][0]),h=Math.max(h,t[e][0]),n=Math.min(n,t[e][1]),a=Math.max(a,t[e][1]);const o=e.hachureAngle;let r=e.hachureGap;r<0&&(r=4*e.strokeWidth),r=Math.max(r,.1);const l=o%180*(Math.PI/180),p=Math.cos(l),f=Math.sin(l),d=Math.tan(l),g=new c(n-1,a+1,i-1,h+1,r,f,p,d);let y;for(;null!=(y=g.nextLine());){const e=u(y,t);for(let t=0;t<e.length;t++)if(t<e.length-1){const i=e[t],h=e[t+1];s.push([i,h]);}}}return s}function g(t,e,s,i,h,n){const a=[];let o=Math.abs(i/2),r=Math.abs(h/2);o+=t.randOffset(.05*o,n),r+=t.randOffset(.05*r,n);const l=n.hachureAngle;let c=n.hachureGap;c<=0&&(c=4*n.strokeWidth);let p=n.fillWeight;p<0&&(p=n.strokeWidth/2);const u=l%180*(Math.PI/180),d=Math.tan(u),g=r/o,y=Math.sqrt(g*d*g*d+1),M=g*d/y,x=1/y,_=c/(o*r/Math.sqrt(r*x*(r*x)+o*M*(o*M))/o);let m=Math.sqrt(o*o-(e-o+_)*(e-o+_));for(let t=e-o+_;t<e+o;t+=_){const i=f(t,s-(m=Math.sqrt(o*o-(e-t)*(e-t))),e,s,M,x,g),h=f(t,s+m,e,s,M,x,g);a.push([i,h]);}return a}class y{constructor(t){this.helper=t;}fillPolygon(t,e){return this._fillPolygon(t,e)}fillEllipse(t,e,s,i,h){return this._fillEllipse(t,e,s,i,h)}fillArc(t,e,s,i,h,n,a){return null}_fillPolygon(t,e,s=!1){const i=d(t,e);return {type:"fillSketch",ops:this.renderLines(i,e,s)}}_fillEllipse(t,e,s,i,h,n=!1){const a=g(this.helper,t,e,s,i,h);return {type:"fillSketch",ops:this.renderLines(a,h,n)}}renderLines(t,e,s){let i=[],h=null;for(const n of t)i=i.concat(this.helper.doubleLineOps(n[0][0],n[0][1],n[1][0],n[1][1],e)),s&&h&&(i=i.concat(this.helper.doubleLineOps(h[0],h[1],n[0][0],n[0][1],e))),h=n[1];return i}}class M extends y{fillPolygon(t,e){return this._fillPolygon(t,e,!0)}fillEllipse(t,e,s,i,h){return this._fillEllipse(t,e,s,i,h,!0)}}class x extends y{fillPolygon(t,e){const s=this._fillPolygon(t,e),i=Object.assign({},e,{hachureAngle:e.hachureAngle+90}),h=this._fillPolygon(t,i);return s.ops=s.ops.concat(h.ops),s}fillEllipse(t,e,s,i,h){const n=this._fillEllipse(t,e,s,i,h),a=Object.assign({},h,{hachureAngle:h.hachureAngle+90}),o=this._fillEllipse(t,e,s,i,a);return n.ops=n.ops.concat(o.ops),n}}class _{constructor(t){this.helper=t;}fillPolygon(t,e){const s=d(t,e=Object.assign({},e,{curveStepCount:4,hachureAngle:0}));return this.dotsOnLines(s,e)}fillEllipse(t,e,s,i,h){h=Object.assign({},h,{curveStepCount:4,hachureAngle:0});const n=g(this.helper,t,e,s,i,h);return this.dotsOnLines(n,h)}fillArc(t,e,s,i,h,n,a){return null}dotsOnLines(t,e){let s=[],i=e.hachureGap;i<0&&(i=4*e.strokeWidth),i=Math.max(i,.1);let h=e.fillWeight;h<0&&(h=e.strokeWidth/2);for(const n of t){const t=p(n)/i,a=Math.ceil(t)-1,o=Math.atan((n[1][1]-n[0][1])/(n[1][0]-n[0][0]));for(let t=0;t<a;t++){const a=i*(t+1),r=a*Math.sin(o),l=a*Math.cos(o),c=[n[0][0]-l,n[0][1]+r],p=this.helper.randOffsetWithRange(c[0]-i/4,c[0]+i/4,e),u=this.helper.randOffsetWithRange(c[1]-i/4,c[1]+i/4,e),f=this.helper.ellipse(p,u,h,h,e);s=s.concat(f.ops);}}return {type:"fillSketch",ops:s}}}class m{constructor(t){this.helper=t;}fillPolygon(t,e){const s=[Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER],i=[Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER];t.forEach(t=>{s[0]=Math.min(s[0],t[0]),s[1]=Math.max(s[1],t[0]),i[0]=Math.min(i[0],t[1]),i[1]=Math.max(i[1],t[1]);});const h=function(t){let e=0,s=0,i=0;for(let s=0;s<t.length;s++){const i=t[s],h=s===t.length-1?t[0]:t[s+1];e+=i[0]*h[1]-h[0]*i[1];}e/=2;for(let e=0;e<t.length;e++){const h=t[e],n=e===t.length-1?t[0]:t[e+1];s+=(h[0]+n[0])*(h[0]*n[1]-n[0]*h[1]),i+=(h[1]+n[1])*(h[0]*n[1]-n[0]*h[1]);}return [s/(6*e),i/(6*e)]}(t),n=Math.max(Math.sqrt(Math.pow(h[0]-s[0],2)+Math.pow(h[1]-i[0],2)),Math.sqrt(Math.pow(h[0]-s[1],2)+Math.pow(h[1]-i[1],2))),a=e.hachureGap>0?e.hachureGap:4*e.strokeWidth,o=[];if(t.length>2)for(let e=0;e<t.length;e++)e===t.length-1?o.push([t[e],t[0]]):o.push([t[e],t[e+1]]);let r=[];const c=Math.max(1,Math.PI*n/a);for(let t=0;t<c;t++){const e=t*Math.PI/c,a=[h,[h[0]+n*Math.cos(e),h[1]+n*Math.sin(e)]];o.forEach(t=>{const e=l(t,a);e&&e[0]>=s[0]&&e[0]<=s[1]&&e[1]>=i[0]&&e[1]<=i[1]&&r.push(e);});}r=this.removeDuplocatePoints(r);const p=this.createLinesFromCenter(h,r);return {type:"fillSketch",ops:this.drawLines(p,e)}}fillEllipse(t,e,s,i,h){return this.fillArcSegment(t,e,s,i,0,2*Math.PI,h)}fillArc(t,e,s,i,h,n,a){return this.fillArcSegment(t,e,s,i,h,n,a)}fillArcSegment(t,e,s,i,h,n,a){const o=[t,e],r=s/2,l=i/2,c=Math.max(s/2,i/2);let p=a.hachureGap;p<0&&(p=4*a.strokeWidth);const u=Math.max(1,Math.abs(n-h)*c/p);let f=[];for(let t=0;t<u;t++){const e=t*((n-h)/u)+h,s=c*Math.cos(e),i=c*Math.sin(e),a=Math.sqrt(r*r*i*i+l*l*s*s),p=r*l*s/a,d=r*l*i/a;f.push([o[0]+p,o[1]+d]);}f=this.removeDuplocatePoints(f);const d=this.createLinesFromCenter(o,f);return {type:"fillSketch",ops:this.drawLines(d,a)}}drawLines(t,e){let s=[];return t.forEach(t=>{const i=t[0],h=t[1];s=s.concat(this.helper.doubleLineOps(i[0],i[1],h[0],h[1],e));}),s}createLinesFromCenter(t,e){return e.map(e=>[t,e])}removeDuplocatePoints(t){const e=new Set;return t.filter(t=>{const s=t.join(",");return !e.has(s)&&(e.add(s),!0)})}}class b{constructor(t){this.helper=t;}fillPolygon(t,e){const s=d(t,e);return {type:"fillSketch",ops:this.dashedLine(s,e)}}fillEllipse(t,e,s,i,h){const n=g(this.helper,t,e,s,i,h);return {type:"fillSketch",ops:this.dashedLine(n,h)}}fillArc(t,e,s,i,h,n,a){return null}dashedLine(t,e){const s=e.dashOffset<0?e.hachureGap<0?4*e.strokeWidth:e.hachureGap:e.dashOffset,i=e.dashGap<0?e.hachureGap<0?4*e.strokeWidth:e.hachureGap:e.dashGap;let h=[];return t.forEach(t=>{const n=p(t),a=Math.floor(n/(s+i)),o=(n+i-a*(s+i))/2;let r=t[0],l=t[1];r[0]>l[0]&&(r=t[1],l=t[0]);const c=Math.atan((l[1]-r[1])/(l[0]-r[0]));for(let t=0;t<a;t++){const n=t*(s+i),a=n+s,l=[r[0]+n*Math.cos(c)+o*Math.cos(c),r[1]+n*Math.sin(c)+o*Math.sin(c)],p=[r[0]+a*Math.cos(c)+o*Math.cos(c),r[1]+a*Math.sin(c)+o*Math.sin(c)];h=h.concat(this.helper.doubleLineOps(l[0],l[1],p[0],p[1],e));}}),h}}class w{constructor(t){this.helper=t;}fillPolygon(t,e){const s=e.hachureGap<0?4*e.strokeWidth:e.hachureGap,i=e.zigzagOffset<0?s:e.zigzagOffset,h=d(t,e=Object.assign({},e,{hachureGap:s+i}));return {type:"fillSketch",ops:this.zigzagLines(h,i,e)}}fillEllipse(t,e,s,i,h){const n=h.hachureGap<0?4*h.strokeWidth:h.hachureGap,a=h.zigzagOffset<0?n:h.zigzagOffset;h=Object.assign({},h,{hachureGap:n+a});const o=g(this.helper,t,e,s,i,h);return {type:"fillSketch",ops:this.zigzagLines(o,a,h)}}fillArc(t,e,s,i,h,n,a){return null}zigzagLines(t,e,s){let i=[];return t.forEach(t=>{const h=p(t),n=Math.round(h/(2*e));let a=t[0],o=t[1];a[0]>o[0]&&(a=t[1],o=t[0]);const r=Math.atan((o[1]-a[1])/(o[0]-a[0]));for(let t=0;t<n;t++){const h=2*t*e,n=2*(t+1)*e,o=Math.sqrt(2*Math.pow(e,2)),l=[a[0]+h*Math.cos(r),a[1]+h*Math.sin(r)],c=[a[0]+n*Math.cos(r),a[1]+n*Math.sin(r)],p=[l[0]+o*Math.cos(r+Math.PI/4),l[1]+o*Math.sin(r+Math.PI/4)];i=(i=i.concat(this.helper.doubleLineOps(l[0],l[1],p[0],p[1],s))).concat(this.helper.doubleLineOps(p[0],p[1],c[0],c[1],s));}}),i}}const k={};function P(t,e){let s=t.fillStyle||"hachure";if(!k[s])switch(s){case"zigzag":k[s]||(k[s]=new M(e));break;case"cross-hatch":k[s]||(k[s]=new x(e));break;case"dots":k[s]||(k[s]=new _(e));break;case"starburst":k[s]||(k[s]=new m(e));break;case"dashed":k[s]||(k[s]=new b(e));break;case"zigzag-line":k[s]||(k[s]=new w(e));break;case"hachure":default:k[s="hachure"]||(k[s]=new y(e));}return k[s]}const v={randOffset:function(t,e){return W(t,e)},randOffsetWithRange:function(t,e,s){return N(t,e,s)},ellipse:T,doubleLineOps:function(t,e,s,i,h){return R(t,e,s,i,h)}};function S(t,e,s,i,h){return {type:"path",ops:R(t,e,s,i,h)}}function A(t,e,s){const i=(t||[]).length;if(i>2){let h=[];for(let e=0;e<i-1;e++)h=h.concat(R(t[e][0],t[e][1],t[e+1][0],t[e+1][1],s));return e&&(h=h.concat(R(t[i-1][0],t[i-1][1],t[0][0],t[0][1],s))),{type:"path",ops:h}}return 2===i?S(t[0][0],t[0][1],t[1][0],t[1][1],s):{type:"path",ops:[]}}function E(t,e,s,i,h){return function(t,e){return A(t,!0,e)}([[t,e],[t+s,e],[t+s,e+i],[t,e+i]],h)}function O(t,e){const s=D(t,1*(1+.2*e.roughness),e),i=D(t,1.5*(1+.22*e.roughness),e);return {type:"path",ops:s.concat(i)}}function T(t,e,s,i,h){const n=2*Math.PI/h.curveStepCount;let a=Math.abs(s/2),o=Math.abs(i/2);const r=$(n,t,e,a+=W(.05*a,h),o+=W(.05*o,h),1,n*N(.1,N(.4,1,h),h),h),l=$(n,t,e,a,o,1.5,0,h);return {type:"path",ops:r.concat(l)}}function C(t,e,s,i,h,n,a,o,r){const l=t,c=e;let p=Math.abs(s/2),u=Math.abs(i/2);p+=W(.01*p,r),u+=W(.01*u,r);let f=h,d=n;for(;f<0;)f+=2*Math.PI,d+=2*Math.PI;d-f>2*Math.PI&&(f=0,d=2*Math.PI);const g=2*Math.PI/r.curveStepCount,y=Math.min(g/2,(d-f)/2),M=G(y,l,c,p,u,f,d,1,r),x=G(y,l,c,p,u,f,d,1.5,r);let _=M.concat(x);return a&&(o?_=(_=_.concat(R(l,c,l+p*Math.cos(f),c+u*Math.sin(f),r))).concat(R(l,c,l+p*Math.cos(d),c+u*Math.sin(d),r)):(_.push({op:"lineTo",data:[l,c]}),_.push({op:"lineTo",data:[l+p*Math.cos(f),c+u*Math.sin(f)]}))),{type:"path",ops:_}}function z(t,e){const s=[];if(t.length){const i=e.maxRandomnessOffset||0,h=t.length;if(h>2){s.push({op:"move",data:[t[0][0]+W(i,e),t[0][1]+W(i,e)]});for(let n=1;n<h;n++)s.push({op:"lineTo",data:[t[n][0]+W(i,e),t[n][1]+W(i,e)]});}}return {type:"fillPath",ops:s}}function L(t,e){return P(e,v).fillPolygon(t,e)}function N(t,e,s){return s.roughness*(Math.random()*(e-t)+t)}function W(t,e){return N(-t,t,e)}function R(t,e,s,i,h){const n=I(t,e,s,i,h,!0,!1),a=I(t,e,s,i,h,!0,!0);return n.concat(a)}function I(t,e,s,i,h,n,a){const o=Math.pow(t-s,2)+Math.pow(e-i,2);let r=h.maxRandomnessOffset||0;r*r*100>o&&(r=Math.sqrt(o)/10);const l=r/2,c=.2+.2*Math.random();let p=h.bowing*h.maxRandomnessOffset*(i-e)/200,u=h.bowing*h.maxRandomnessOffset*(t-s)/200;p=W(p,h),u=W(u,h);const f=[],d=()=>W(l,h),g=()=>W(r,h);return n&&(a?f.push({op:"move",data:[t+d(),e+d()]}):f.push({op:"move",data:[t+W(r,h),e+W(r,h)]})),a?f.push({op:"bcurveTo",data:[p+t+(s-t)*c+d(),u+e+(i-e)*c+d(),p+t+2*(s-t)*c+d(),u+e+2*(i-e)*c+d(),s+d(),i+d()]}):f.push({op:"bcurveTo",data:[p+t+(s-t)*c+g(),u+e+(i-e)*c+g(),p+t+2*(s-t)*c+g(),u+e+2*(i-e)*c+g(),s+g(),i+g()]}),f}function D(t,e,s){const i=[];i.push([t[0][0]+W(e,s),t[0][1]+W(e,s)]),i.push([t[0][0]+W(e,s),t[0][1]+W(e,s)]);for(let h=1;h<t.length;h++)i.push([t[h][0]+W(e,s),t[h][1]+W(e,s)]),h===t.length-1&&i.push([t[h][0]+W(e,s),t[h][1]+W(e,s)]);return q(i,null,s)}function q(t,e,s){const i=t.length;let h=[];if(i>3){const n=[],a=1-s.curveTightness;h.push({op:"move",data:[t[1][0],t[1][1]]});for(let e=1;e+2<i;e++){const s=t[e];n[0]=[s[0],s[1]],n[1]=[s[0]+(a*t[e+1][0]-a*t[e-1][0])/6,s[1]+(a*t[e+1][1]-a*t[e-1][1])/6],n[2]=[t[e+1][0]+(a*t[e][0]-a*t[e+2][0])/6,t[e+1][1]+(a*t[e][1]-a*t[e+2][1])/6],n[3]=[t[e+1][0],t[e+1][1]],h.push({op:"bcurveTo",data:[n[1][0],n[1][1],n[2][0],n[2][1],n[3][0],n[3][1]]});}if(e&&2===e.length){const t=s.maxRandomnessOffset;h.push({op:"lineTo",data:[e[0]+W(t,s),e[1]+W(t,s)]});}}else 3===i?(h.push({op:"move",data:[t[1][0],t[1][1]]}),h.push({op:"bcurveTo",data:[t[1][0],t[1][1],t[2][0],t[2][1],t[2][0],t[2][1]]})):2===i&&(h=h.concat(R(t[0][0],t[0][1],t[1][0],t[1][1],s)));return h}function $(t,e,s,i,h,n,a,o){const r=W(.5,o)-Math.PI/2,l=[];l.push([W(n,o)+e+.9*i*Math.cos(r-t),W(n,o)+s+.9*h*Math.sin(r-t)]);for(let a=r;a<2*Math.PI+r-.01;a+=t)l.push([W(n,o)+e+i*Math.cos(a),W(n,o)+s+h*Math.sin(a)]);return l.push([W(n,o)+e+i*Math.cos(r+2*Math.PI+.5*a),W(n,o)+s+h*Math.sin(r+2*Math.PI+.5*a)]),l.push([W(n,o)+e+.98*i*Math.cos(r+a),W(n,o)+s+.98*h*Math.sin(r+a)]),l.push([W(n,o)+e+.9*i*Math.cos(r+.5*a),W(n,o)+s+.9*h*Math.sin(r+.5*a)]),q(l,null,o)}function G(t,e,s,i,h,n,a,o,r){const l=n+W(.1,r),c=[];c.push([W(o,r)+e+.9*i*Math.cos(l-t),W(o,r)+s+.9*h*Math.sin(l-t)]);for(let n=l;n<=a;n+=t)c.push([W(o,r)+e+i*Math.cos(n),W(o,r)+s+h*Math.sin(n)]);return c.push([e+i*Math.cos(a),s+h*Math.sin(a)]),c.push([e+i*Math.cos(a),s+h*Math.sin(a)]),q(c,null,r)}function B(t,e,s,i,h,n,a,o){const r=[],l=[o.maxRandomnessOffset||1,(o.maxRandomnessOffset||1)+.5];let c=[0,0];for(let p=0;p<2;p++)0===p?r.push({op:"move",data:[a.x,a.y]}):r.push({op:"move",data:[a.x+W(l[0],o),a.y+W(l[0],o)]}),c=[h+W(l[p],o),n+W(l[p],o)],r.push({op:"bcurveTo",data:[t+W(l[p],o),e+W(l[p],o),s+W(l[p],o),i+W(l[p],o),c[0],c[1]]});return a.setPosition(c[0],c[1]),r}function X(t,e,s,i){let h=[];switch(e.key){case"M":case"m":{const s="m"===e.key;if(e.data.length>=2){let n=+e.data[0],a=+e.data[1];s&&(n+=t.x,a+=t.y);const o=1*(i.maxRandomnessOffset||0);n+=W(o,i),a+=W(o,i),t.setPosition(n,a),h.push({op:"move",data:[n,a]});}break}case"L":case"l":{const s="l"===e.key;if(e.data.length>=2){let n=+e.data[0],a=+e.data[1];s&&(n+=t.x,a+=t.y),h=h.concat(R(t.x,t.y,n,a,i)),t.setPosition(n,a);}break}case"H":case"h":{const s="h"===e.key;if(e.data.length){let n=+e.data[0];s&&(n+=t.x),h=h.concat(R(t.x,t.y,n,t.y,i)),t.setPosition(n,t.y);}break}case"V":case"v":{const s="v"===e.key;if(e.data.length){let n=+e.data[0];s&&(n+=t.y),h=h.concat(R(t.x,t.y,t.x,n,i)),t.setPosition(t.x,n);}break}case"Z":case"z":t.first&&(h=h.concat(R(t.x,t.y,t.first[0],t.first[1],i)),t.setPosition(t.first[0],t.first[1]),t.first=null);break;case"C":case"c":{const s="c"===e.key;if(e.data.length>=6){let n=+e.data[0],a=+e.data[1],o=+e.data[2],r=+e.data[3],l=+e.data[4],c=+e.data[5];s&&(n+=t.x,o+=t.x,l+=t.x,a+=t.y,r+=t.y,c+=t.y);const p=B(n,a,o,r,l,c,t,i);h=h.concat(p),t.bezierReflectionPoint=[l+(l-o),c+(c-r)];}break}case"S":case"s":{const n="s"===e.key;if(e.data.length>=4){let a=+e.data[0],o=+e.data[1],r=+e.data[2],l=+e.data[3];n&&(a+=t.x,r+=t.x,o+=t.y,l+=t.y);let c=a,p=o;const u=s?s.key:"";let f=null;"c"!==u&&"C"!==u&&"s"!==u&&"S"!==u||(f=t.bezierReflectionPoint),f&&(c=f[0],p=f[1]);const d=B(c,p,a,o,r,l,t,i);h=h.concat(d),t.bezierReflectionPoint=[r+(r-a),l+(l-o)];}break}case"Q":case"q":{const s="q"===e.key;if(e.data.length>=4){let n=+e.data[0],a=+e.data[1],o=+e.data[2],r=+e.data[3];s&&(n+=t.x,o+=t.x,a+=t.y,r+=t.y);const l=1*(1+.2*i.roughness),c=1.5*(1+.22*i.roughness);h.push({op:"move",data:[t.x+W(l,i),t.y+W(l,i)]});let p=[o+W(l,i),r+W(l,i)];h.push({op:"qcurveTo",data:[n+W(l,i),a+W(l,i),p[0],p[1]]}),h.push({op:"move",data:[t.x+W(c,i),t.y+W(c,i)]}),p=[o+W(c,i),r+W(c,i)],h.push({op:"qcurveTo",data:[n+W(c,i),a+W(c,i),p[0],p[1]]}),t.setPosition(p[0],p[1]),t.quadReflectionPoint=[o+(o-n),r+(r-a)];}break}case"T":case"t":{const n="t"===e.key;if(e.data.length>=2){let a=+e.data[0],o=+e.data[1];n&&(a+=t.x,o+=t.y);let r=a,l=o;const c=s?s.key:"";let p=null;"q"!==c&&"Q"!==c&&"t"!==c&&"T"!==c||(p=t.quadReflectionPoint),p&&(r=p[0],l=p[1]);const u=1*(1+.2*i.roughness),f=1.5*(1+.22*i.roughness);h.push({op:"move",data:[t.x+W(u,i),t.y+W(u,i)]});let d=[a+W(u,i),o+W(u,i)];h.push({op:"qcurveTo",data:[r+W(u,i),l+W(u,i),d[0],d[1]]}),h.push({op:"move",data:[t.x+W(f,i),t.y+W(f,i)]}),d=[a+W(f,i),o+W(f,i)],h.push({op:"qcurveTo",data:[r+W(f,i),l+W(f,i),d[0],d[1]]}),t.setPosition(d[0],d[1]),t.quadReflectionPoint=[a+(a-r),o+(o-l)];}break}case"A":case"a":{const s="a"===e.key;if(e.data.length>=7){const n=+e.data[0],o=+e.data[1],r=+e.data[2],l=+e.data[3],c=+e.data[4];let p=+e.data[5],u=+e.data[6];if(s&&(p+=t.x,u+=t.y),p===t.x&&u===t.y)break;if(0===n||0===o)h=h.concat(R(t.x,t.y,p,u,i)),t.setPosition(p,u);else for(let e=0;e<1;e++){const e=new a([t.x,t.y],[p,u],[n,o],r,!!l,!!c);let s=e.getNextSegment();for(;s;){const n=B(s.cp1[0],s.cp1[1],s.cp2[0],s.cp2[1],s.to[0],s.to[1],t,i);h=h.concat(n),s=e.getNextSegment();}}}break}}return h}class U extends e{line(t,e,s,i,h){const n=this._options(h);return this._drawable("line",[S(t,e,s,i,n)],n)}rectangle(t,e,s,i,h){const n=this._options(h),a=[];if(n.fill){const h=[[t,e],[t+s,e],[t+s,e+i],[t,e+i]];"solid"===n.fillStyle?a.push(z(h,n)):a.push(L(h,n));}return a.push(E(t,e,s,i,n)),this._drawable("rectangle",a,n)}ellipse(t,e,s,i,h){const n=this._options(h),a=[];if(n.fill)if("solid"===n.fillStyle){const h=T(t,e,s,i,n);h.type="fillPath",a.push(h);}else a.push(function(t,e,s,i,h){return P(h,v).fillEllipse(t,e,s,i,h)}(t,e,s,i,n));return a.push(T(t,e,s,i,n)),this._drawable("ellipse",a,n)}circle(t,e,s,i){const h=this.ellipse(t,e,s,s,i);return h.shape="circle",h}linearPath(t,e){const s=this._options(e);return this._drawable("linearPath",[A(t,!1,s)],s)}arc(t,e,s,i,h,n,a=!1,o){const r=this._options(o),l=[];if(a&&r.fill)if("solid"===r.fillStyle){const a=C(t,e,s,i,h,n,!0,!1,r);a.type="fillPath",l.push(a);}else l.push(function(t,e,s,i,h,n,a){const o=P(a,v).fillArc(t,e,s,i,h,n,a);if(o)return o;const r=t,l=e;let c=Math.abs(s/2),p=Math.abs(i/2);c+=W(.01*c,a),p+=W(.01*p,a);let u=h,f=n;for(;u<0;)u+=2*Math.PI,f+=2*Math.PI;f-u>2*Math.PI&&(u=0,f=2*Math.PI);const d=(f-u)/a.curveStepCount,g=[];for(let t=u;t<=f;t+=d)g.push([r+c*Math.cos(t),l+p*Math.sin(t)]);return g.push([r+c*Math.cos(f),l+p*Math.sin(f)]),g.push([r,l]),L(g,a)}(t,e,s,i,h,n,r));return l.push(C(t,e,s,i,h,n,a,!0,r)),this._drawable("arc",l,r)}curve(t,e){const s=this._options(e);return this._drawable("curve",[O(t,s)],s)}polygon(t,e){const s=this._options(e),i=[];if(s.fill)if("solid"===s.fillStyle)i.push(z(t,s));else{const e=this.computePolygonSize(t),h=L([[0,0],[e[0],0],[e[0],e[1]],[0,e[1]]],s);h.type="path2Dpattern",h.size=e,h.path=this.polygonPath(t),i.push(h);}return i.push(A(t,!0,s)),this._drawable("polygon",i,s)}path(t,e){const s=this._options(e),i=[];if(!t)return this._drawable("path",i,s);if(s.fill)if("solid"===s.fillStyle){const e={type:"path2Dfill",path:t,ops:[]};i.push(e);}else{const e=this.computePathSize(t),h=L([[0,0],[e[0],0],[e[0],e[1]],[0,e[1]]],s);h.type="path2Dpattern",h.size=e,h.path=t,i.push(h);}return i.push(function(t,e){t=(t||"").replace(/\n/g," ").replace(/(-\s)/g,"-").replace("/(ss)/g"," ");let s=new n(t);if(e.simplification){const t=new o(s.linearPoints,s.closed).fit(e.simplification);s=new n(t);}let i=[];const h=s.segments||[];for(let t=0;t<h.length;t++){const n=X(s,h[t],t>0?h[t-1]:null,e);n&&n.length&&(i=i.concat(n));}return {type:"path",ops:i}}(t,s)),this._drawable("path",i,s)}}const V="undefined"!=typeof document;class j{constructor(t){this.canvas=t,this.ctx=this.canvas.getContext("2d");}draw(t){const e=t.sets||[],s=t.options||this.getDefaultOptions(),i=this.ctx;for(const t of e)switch(t.type){case"path":i.save(),i.strokeStyle=s.stroke,i.lineWidth=s.strokeWidth,this._drawToContext(i,t),i.restore();break;case"fillPath":i.save(),i.fillStyle=s.fill||"",this._drawToContext(i,t),i.restore();break;case"fillSketch":this.fillSketch(i,t,s);break;case"path2Dfill":{this.ctx.save(),this.ctx.fillStyle=s.fill||"";const e=new Path2D(t.path);this.ctx.fill(e),this.ctx.restore();break}case"path2Dpattern":{const e=this.canvas.ownerDocument||V&&document;if(e){const i=t.size,h=e.createElement("canvas"),n=h.getContext("2d"),a=this.computeBBox(t.path);a&&(a.width||a.height)?(h.width=this.canvas.width,h.height=this.canvas.height,n.translate(a.x||0,a.y||0)):(h.width=i[0],h.height=i[1]),this.fillSketch(n,t,s),this.ctx.save(),this.ctx.fillStyle=this.ctx.createPattern(h,"repeat");const o=new Path2D(t.path);this.ctx.fill(o),this.ctx.restore();}else console.error("Cannot render path2Dpattern. No defs/document defined.");break}}}computeBBox(t){if(V)try{const e="http://www.w3.org/2000/svg",s=document.createElementNS(e,"svg");s.setAttribute("width","0"),s.setAttribute("height","0");const i=self.document.createElementNS(e,"path");i.setAttribute("d",t),s.appendChild(i),document.body.appendChild(s);const h=i.getBBox();return document.body.removeChild(s),h}catch(t){}return null}fillSketch(t,e,s){let i=s.fillWeight;i<0&&(i=s.strokeWidth/2),t.save(),t.strokeStyle=s.fill||"",t.lineWidth=i,this._drawToContext(t,e),t.restore();}_drawToContext(t,e){t.beginPath();for(const s of e.ops){const e=s.data;switch(s.op){case"move":t.moveTo(e[0],e[1]);break;case"bcurveTo":t.bezierCurveTo(e[0],e[1],e[2],e[3],e[4],e[5]);break;case"qcurveTo":t.quadraticCurveTo(e[0],e[1],e[2],e[3]);break;case"lineTo":t.lineTo(e[0],e[1]);}}"fillPath"===e.type?t.fill():t.stroke();}}class F extends j{constructor(t,e){super(t),this.gen=new U(e||null,this.canvas);}get generator(){return this.gen}getDefaultOptions(){return this.gen.defaultOptions}line(t,e,s,i,h){const n=this.gen.line(t,e,s,i,h);return this.draw(n),n}rectangle(t,e,s,i,h){const n=this.gen.rectangle(t,e,s,i,h);return this.draw(n),n}ellipse(t,e,s,i,h){const n=this.gen.ellipse(t,e,s,i,h);return this.draw(n),n}circle(t,e,s,i){const h=this.gen.circle(t,e,s,i);return this.draw(h),h}linearPath(t,e){const s=this.gen.linearPath(t,e);return this.draw(s),s}polygon(t,e){const s=this.gen.polygon(t,e);return this.draw(s),s}arc(t,e,s,i,h,n,a=!1,o){const r=this.gen.arc(t,e,s,i,h,n,a,o);return this.draw(r),r}curve(t,e){const s=this.gen.curve(t,e);return this.draw(s),s}path(t,e){const s=this.gen.path(t,e);return this.draw(s),s}}const Q="undefined"!=typeof document;class Z{constructor(t){this.svg=t;}get defs(){const t=this.svg.ownerDocument||Q&&document;if(t&&!this._defs){const e=t.createElementNS("http://www.w3.org/2000/svg","defs");this.svg.firstChild?this.svg.insertBefore(e,this.svg.firstChild):this.svg.appendChild(e),this._defs=e;}return this._defs||null}draw(t){const e=t.sets||[],s=t.options||this.getDefaultOptions(),i=this.svg.ownerDocument||window.document,h=i.createElementNS("http://www.w3.org/2000/svg","g");for(const t of e){let e=null;switch(t.type){case"path":(e=i.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("d",this.opsToPath(t)),e.style.stroke=s.stroke,e.style.strokeWidth=s.strokeWidth+"",e.style.fill="none";break;case"fillPath":(e=i.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("d",this.opsToPath(t)),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=s.fill||null;break;case"fillSketch":e=this.fillSketch(i,t,s);break;case"path2Dfill":(e=i.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("d",t.path||""),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=s.fill||null;break;case"path2Dpattern":if(this.defs){const h=t.size,n=i.createElementNS("http://www.w3.org/2000/svg","pattern"),a=`rough-${Math.floor(Math.random()*(Number.MAX_SAFE_INTEGER||999999))}`;n.setAttribute("id",a),n.setAttribute("x","0"),n.setAttribute("y","0"),n.setAttribute("width","1"),n.setAttribute("height","1"),n.setAttribute("height","1"),n.setAttribute("viewBox",`0 0 ${Math.round(h[0])} ${Math.round(h[1])}`),n.setAttribute("patternUnits","objectBoundingBox");const o=this.fillSketch(i,t,s);n.appendChild(o),this.defs.appendChild(n),(e=i.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("d",t.path||""),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=`url(#${a})`;}else console.error("Cannot render path2Dpattern. No defs/document defined.");}e&&h.appendChild(e);}return h}fillSketch(t,e,s){let i=s.fillWeight;i<0&&(i=s.strokeWidth/2);const h=t.createElementNS("http://www.w3.org/2000/svg","path");return h.setAttribute("d",this.opsToPath(e)),h.style.stroke=s.fill||null,h.style.strokeWidth=i+"",h.style.fill="none",h}}class H extends Z{constructor(t,e){super(t),this.gen=new U(e||null,this.svg);}get generator(){return this.gen}getDefaultOptions(){return this.gen.defaultOptions}opsToPath(t){return this.gen.opsToPath(t)}line(t,e,s,i,h){const n=this.gen.line(t,e,s,i,h);return this.draw(n)}rectangle(t,e,s,i,h){const n=this.gen.rectangle(t,e,s,i,h);return this.draw(n)}ellipse(t,e,s,i,h){const n=this.gen.ellipse(t,e,s,i,h);return this.draw(n)}circle(t,e,s,i){const h=this.gen.circle(t,e,s,i);return this.draw(h)}linearPath(t,e){const s=this.gen.linearPath(t,e);return this.draw(s)}polygon(t,e){const s=this.gen.polygon(t,e);return this.draw(s)}arc(t,e,s,i,h,n,a=!1,o){const r=this.gen.arc(t,e,s,i,h,n,a,o);return this.draw(r)}curve(t,e){const s=this.gen.curve(t,e);return this.draw(s)}path(t,e){const s=this.gen.path(t,e);return this.draw(s)}}return {canvas:(t,e)=>new F(t,e),svg:(t,e)=>new H(t,e),generator:(t,e)=>new U(t,e)}});
	});

	/** @module bauble */

	/**
	 * The CircleBauble class. Each vertex is assigned a circle in the svg.
	 */

	var RoughCircleBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(RoughCircleBauble, _Bauble);

	  createClass(RoughCircleBauble, null, [{
	    key: "DEFAULT_SETTINGS",

	    /**
	     * The default settings for the circleBauble
	     * The default is 6;
	     * @return {{radius: number}}
	     * @constructor
	     */
	    value: function DEFAULT_SETTINGS() {
	      return {
	        radius: 6,
	        fill: "red",
	        attrs: {
	          roughFill: {
	            stroke: function stroke() {
	              return "black";
	            },
	            fill: function fill() {
	              return "none";
	            }
	          },
	          roughStroke: {
	            "stroke-width": function strokeWidth() {
	              return 0.5;
	            },
	            stroke: function stroke() {
	              return "black";
	            },
	            fill: function fill() {
	              return "none";
	            }
	          }
	        },
	        styles: {
	          roughFill: {},
	          roughStroke: {}
	        }
	      };
	    }
	    /**
	     * The constructor.
	     */

	  }]);

	  function RoughCircleBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, RoughCircleBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(RoughCircleBauble).call(this, mergeDeep(RoughCircleBauble.DEFAULT_SETTINGS(), settings)));
	  }
	  /**
	   * A function to append the circles to the svg.
	   * @param selection
	   * @return {Bundle|MagicString|*|void}
	   */


	  createClass(RoughCircleBauble, [{
	    key: "update",
	    value: function update(selection) {
	      var _this = this;

	      var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	      var newPaths = toConsumableArray(roughFactory.circle(0, 0, this.settings.radius + border, this.settings).childNodes).map(function (d) {
	        return d.getAttribute("d");
	      }).reverse(); // this puts the "stroke" before the fill so if there is no fill we just never hit it below


	      var pathNames = ["roughStroke", "roughFill"];
	      return selection.selectAll("path").data(function (d) {
	        return [d, d].slice(0, newPaths.length);
	      }).join(function (enter) {
	        return enter.append("path").attr("d", function (d, i) {
	          return newPaths[i];
	        }).attr("class", function (d, i) {
	          return "".concat(pathNames[i], " node-shape rough");
	        }).attrs(function (vertex, i) {
	          var attributes = _this.settings.attrs[pathNames[i]];
	          return Object.keys(attributes).reduce(function (acc, curr) {
	            return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](vertex)));
	          }, {});
	        }).styles(function (vertex, i, n) {
	          var styles = _this.settings.styles[pathNames[i]];
	          return Object.keys(styles).reduce(function (acc, curr) {
	            return objectSpread({}, acc, defineProperty({}, curr, styles[curr](vertex)));
	          }, {});
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().attr("d", function (d, i) {
	            return newPaths[i];
	          }).attrs(function (vertex, i) {
	            var attributes = _this.settings.attrs[pathNames[i]];
	            return Object.keys(attributes).reduce(function (acc, curr) {
	              return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](vertex)));
	            }, {});
	          }).styles(function (vertex, i) {
	            var styles = _this.settings.styles[pathNames[i]];
	            return Object.keys(styles).reduce(function (acc, curr) {
	              return objectSpread({}, acc, defineProperty({}, curr, styles[curr](vertex)));
	            }, {});
	          });
	        });
	      });
	    }
	  }]);

	  return RoughCircleBauble;
	}(Bauble);
	var roughFactory = rough_umd.svg(document.createElement("svg"));

	/** @module bauble */

	var RoughBranchBauble =
	/*#__PURE__*/
	function (_Bauble) {
	  inherits(RoughBranchBauble, _Bauble);

	  createClass(RoughBranchBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        curve: stepBefore,
	        curveRadius: 0,
	        attrs: {
	          // roughFill: {stroke: () => "none", fill: () => "none"},
	          "stroke-width": function strokeWidth() {
	            return 0.5;
	          },
	          stroke: function stroke() {
	            return "black";
	          },
	          fill: function fill() {
	            return "none";
	          }
	        },
	        styles: {},
	        vertexFilter: null,
	        edgeFilter: function edgeFilter() {
	          return true;
	        },
	        roughness: 20
	      };
	    }
	  }]);

	  function RoughBranchBauble(settings) {
	    classCallCheck(this, RoughBranchBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(RoughBranchBauble).call(this, mergeDeep(RoughBranchBauble.DEFAULT_SETTINGS(), settings)));
	  }

	  createClass(RoughBranchBauble, [{
	    key: "setup",
	    value: function setup() {
	      var _this = this;

	      var scales = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      scales = mergeDeep({
	        x: null,
	        y: null,
	        xOffset: 0,
	        yOffset: 0
	      }, scales);
	      var basicPathGenerator = branchPathGenerator({
	        scales: scales,
	        curve: this.settings.curve,
	        curveRadius: this.settings.curveRadius
	      });

	      this.branchPath = function (edge) {
	        var basicPath = basicPathGenerator(edge);
	        return toConsumableArray(roughFactory.path(basicPath, _this.settings).childNodes).map(function (d) {
	          return d.getAttribute("d");
	        })[0];
	      };
	    }
	  }, {
	    key: "update",
	    value: function update(selection) {
	      var _this2 = this;

	      return selection.selectAll("path").data(function (d) {
	        return [d];
	      }).join(function (enter) {
	        return enter.append("path").attr("d", function (edge) {
	          return _this2.branchPath(edge);
	        }).attr("class", "branch-path").attrs(function (edge) {
	          var attributes = _this2.settings.attrs;
	          return Object.keys(attributes).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](edge)));
	          }, {});
	        }).styles(function (edge) {
	          var styles = _this2.settings.styles;
	          return Object.keys(styles).reduce(function (acc, curr) {
	            // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	            return objectSpread({}, acc, defineProperty({}, curr, styles[curr](edge)));
	          }, {});
	        });
	      }, function (update) {
	        return update.call(function (update) {
	          return update.transition().attr("d", function (edge) {
	            return _this2.branchPath(edge);
	          }).attrs(function (edge) {
	            var attributes = _this2.settings.attrs;
	            return Object.keys(attributes).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, attributes[curr](edge)));
	            }, {});
	          }).styles(function (edge) {
	            var styles = _this2.settings.styles;
	            return Object.keys(styles).reduce(function (acc, curr) {
	              // const vertex = d3.select(n[i].parentNode).datum(); // the vertex data is assigned to the group
	              return objectSpread({}, acc, defineProperty({}, curr, styles[curr](edge)));
	            }, {});
	          });
	        });
	      });
	    }
	  }, {
	    key: "edgeFilter",
	    get: function get() {
	      return this.settings.edgeFilter;
	    }
	  }]);

	  return RoughBranchBauble;
	}(Bauble);

	/** @module layout */

	var EqualAngleLayout =
	/*#__PURE__*/
	function (_AbstractLayout) {
	  inherits(EqualAngleLayout, _AbstractLayout);

	  /**
	   * The constructor.
	   * @param tree
	   * @param settings
	   */
	  function EqualAngleLayout(tree) {
	    var _this;

	    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    classCallCheck(this, EqualAngleLayout);

	    _this = possibleConstructorReturn(this, getPrototypeOf(EqualAngleLayout).call(this, tree, objectSpread({
	      fixedOrder: true
	    }, settings))); // an ordering of the nodes so we can maintain the layout

	    if (_this.settings.fixedOrder) {
	      _this.tipRank = toConsumableArray(_this.traverseFromTip(_this.settings.startingNode ? _this.settings.startingNode : _this.tree.externalNodes[0])).filter(function (n) {
	        return !n.children;
	      });
	    }

	    return _this;
	  }

	  createClass(EqualAngleLayout, [{
	    key: "_getTreeNodes",
	    value: function _getTreeNodes() {
	      this.startingNode = this.settings.startingNode ? this.settings.startingNode : this.tree.externalNodes[0];
	      this.nodeOrder = toConsumableArray(this.traverseFromTip(this.startingNode));
	      return this.nodeOrder;
	    }
	  }, {
	    key: "setYPosition",
	    value: function setYPosition(vertex, currentY) {
	      var _this2 = this;

	      var node = vertex.node;

	      if (vertex.node === this.startingNode) {
	        vertex.y = 0;
	        vertex.angle = 0;
	        vertex.allocatedRadians = [0, 2 * Math.PI];
	      } else {
	        // set y off of allocated angle
	        var pseudoParent = this.getPseudoParent(node);
	        var pseudoLength = Math.abs(pseudoParent.height - node.height);
	        var deltaY = Math.sin(vertex.angle) * pseudoLength;
	        vertex.y = this._nodeMap.get(pseudoParent).y + deltaY;
	      } //setup angles for children


	      var pseudoChildren = this.getPseudoChildren(node);

	      if (pseudoChildren) {
	        // const subtrees = [...node.children, (node.parent&& node.parent)].filter(s=>s);
	        var totalTips = this.tree.externalNodes.length;
	        var totalRadians = vertex.allocatedRadians[0];
	        pseudoChildren.forEach(function (child) {
	          var tips = toConsumableArray(_this2.traverseFromTip(child, [node])).filter(function (n) {
	            return !n.children;
	          }).length;

	          var r = 2 * Math.PI * tips / totalTips;
	          var angle = totalRadians + r / 2;
	          var allocatedRadians = [totalRadians, totalRadians + r];
	          totalRadians += r; // if (s !== node.parent) {

	          var subtreeVertex = _this2._nodeMap.get(child);

	          subtreeVertex.angle = angle;
	          subtreeVertex.allocatedRadians = allocatedRadians; // }
	        });
	      }

	      return 0;
	    }
	  }, {
	    key: "setXPosition",
	    value: function setXPosition(vertex, currentX) {
	      var node = vertex.node;

	      if (vertex.node === this.startingNode) {
	        vertex.x = 0;
	      } else {
	        // set y off of allocated angle
	        var pseudoParent = this.getPseudoParent(node);
	        var pseudoLength = Math.abs(pseudoParent.height - node.height);
	        var deltaX = Math.cos(vertex.angle) * pseudoLength;
	        vertex.x = this._nodeMap.get(pseudoParent).x + deltaX;
	      }
	    }
	  }, {
	    key: "setInitialX",
	    value: function setInitialX() {
	      return 0;
	    }
	  }, {
	    key: "setInitialY",
	    value: function setInitialY() {
	      return 0;
	    }
	  }, {
	    key: "traverseFromTip",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function traverseFromTip(node) {
	      var visited,
	          self,
	          traverse,
	          _args2 = arguments;
	      return regenerator.wrap(function traverseFromTip$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              visited = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : [];
	              self = this;
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node) {
	                var relatives, pseudoChildren, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, child;

	                return regenerator.wrap(function traverse$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        visited.push(node);
	                        _context.next = 3;
	                        return node;

	                      case 3:
	                        relatives = [node.parent && node.parent].concat(node.children && node.children).filter(function (n) {
	                          return n;
	                        }); // to remove null

	                        pseudoChildren = relatives.filter(function (n) {
	                          return !visited.includes(n);
	                        });

	                        if (!pseudoChildren) {
	                          _context.next = 32;
	                          break;
	                        }

	                        if (self.tipRank) {
	                          pseudoChildren = pseudoChildren.sort(function (a, b) {
	                            var aRank = min(toConsumableArray(self.pseudoRerootPreorder(a, [node])).filter(function (n) {
	                              return !n.children;
	                            }).map(function (n) {
	                              return self.tipRank.indexOf(n);
	                            }));
	                            var bRank = min(toConsumableArray(self.pseudoRerootPreorder(b, [node])).filter(function (n) {
	                              return !n.children;
	                            }).map(function (n) {
	                              return self.tipRank.indexOf(n);
	                            }));
	                            return bRank - aRank;
	                          });
	                        }

	                        _iteratorNormalCompletion = true;
	                        _didIteratorError = false;
	                        _iteratorError = undefined;
	                        _context.prev = 10;
	                        _iterator = pseudoChildren[Symbol.iterator]();

	                      case 12:
	                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	                          _context.next = 18;
	                          break;
	                        }

	                        child = _step.value;
	                        return _context.delegateYield(traverse(child), "t0", 15);

	                      case 15:
	                        _iteratorNormalCompletion = true;
	                        _context.next = 12;
	                        break;

	                      case 18:
	                        _context.next = 24;
	                        break;

	                      case 20:
	                        _context.prev = 20;
	                        _context.t1 = _context["catch"](10);
	                        _didIteratorError = true;
	                        _iteratorError = _context.t1;

	                      case 24:
	                        _context.prev = 24;
	                        _context.prev = 25;

	                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
	                          _iterator["return"]();
	                        }

	                      case 27:
	                        _context.prev = 27;

	                        if (!_didIteratorError) {
	                          _context.next = 30;
	                          break;
	                        }

	                        throw _iteratorError;

	                      case 30:
	                        return _context.finish(27);

	                      case 31:
	                        return _context.finish(24);

	                      case 32:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, traverse, null, [[10, 20, 24, 32], [25,, 27, 31]]);
	              });
	              return _context2.delegateYield(traverse(node), "t0", 4);

	            case 4:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, traverseFromTip, this);
	    })
	  }, {
	    key: "pseudoRerootPreorder",
	    value:
	    /*#__PURE__*/
	    regenerator.mark(function pseudoRerootPreorder(node) {
	      var visited,
	          traverse,
	          _args4 = arguments;
	      return regenerator.wrap(function pseudoRerootPreorder$(_context4) {
	        while (1) {
	          switch (_context4.prev = _context4.next) {
	            case 0:
	              visited = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : [];
	              traverse =
	              /*#__PURE__*/
	              regenerator.mark(function traverse(node) {
	                var relatives, pseudoChildren, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, child;

	                return regenerator.wrap(function traverse$(_context3) {
	                  while (1) {
	                    switch (_context3.prev = _context3.next) {
	                      case 0:
	                        visited.push(node);
	                        _context3.next = 3;
	                        return node;

	                      case 3:
	                        relatives = [node.parent && node.parent].concat(node.children && node.children).filter(function (n) {
	                          return n;
	                        }); // to remove null

	                        pseudoChildren = relatives.filter(function (n) {
	                          return !visited.includes(n);
	                        });

	                        if (!pseudoChildren) {
	                          _context3.next = 31;
	                          break;
	                        }

	                        _iteratorNormalCompletion2 = true;
	                        _didIteratorError2 = false;
	                        _iteratorError2 = undefined;
	                        _context3.prev = 9;
	                        _iterator2 = pseudoChildren[Symbol.iterator]();

	                      case 11:
	                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
	                          _context3.next = 17;
	                          break;
	                        }

	                        child = _step2.value;
	                        return _context3.delegateYield(traverse(child), "t0", 14);

	                      case 14:
	                        _iteratorNormalCompletion2 = true;
	                        _context3.next = 11;
	                        break;

	                      case 17:
	                        _context3.next = 23;
	                        break;

	                      case 19:
	                        _context3.prev = 19;
	                        _context3.t1 = _context3["catch"](9);
	                        _didIteratorError2 = true;
	                        _iteratorError2 = _context3.t1;

	                      case 23:
	                        _context3.prev = 23;
	                        _context3.prev = 24;

	                        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
	                          _iterator2["return"]();
	                        }

	                      case 26:
	                        _context3.prev = 26;

	                        if (!_didIteratorError2) {
	                          _context3.next = 29;
	                          break;
	                        }

	                        throw _iteratorError2;

	                      case 29:
	                        return _context3.finish(26);

	                      case 30:
	                        return _context3.finish(23);

	                      case 31:
	                      case "end":
	                        return _context3.stop();
	                    }
	                  }
	                }, traverse, null, [[9, 19, 23, 31], [24,, 26, 30]]);
	              });
	              return _context4.delegateYield(traverse(node), "t0", 4);

	            case 4:
	            case "end":
	              return _context4.stop();
	          }
	        }
	      }, pseudoRerootPreorder, this);
	    })
	  }, {
	    key: "getPseudoParent",
	    value: function getPseudoParent(node) {
	      var relatives = [node.parent && node.parent].concat(node.children && node.children).filter(function (n) {
	        return n;
	      }); // to remove null
	      // the parent will come before the node in question in the preoder traversal

	      var pseudoParent = this.nodeOrder.slice(0, this.nodeOrder.indexOf(node)).find(function (n) {
	        return relatives.includes(n);
	      });
	      return pseudoParent;
	    }
	  }, {
	    key: "getPseudoChildren",
	    value: function getPseudoChildren(node) {
	      var relatives = [node.parent && node.parent].concat(node.children && node.children).filter(function (n) {
	        return n;
	      }); // to remove null
	      // the parent will come before the node in question in the preoder traversal

	      var pseudoChildren = this.nodeOrder.slice(this.nodeOrder.indexOf(node), this.nodeOrder.length).filter(function (n) {
	        return relatives.includes(n);
	      });
	      return pseudoChildren.length > 0 ? pseudoChildren : null;
	    }
	  }, {
	    key: "equalDaylight",
	    value: function equalDaylight(node) {
	      var _this3 = this;

	      // get the subtrees down each subtree
	      var relatives = [node.parent && node.parent].concat(node.children && node.children).filter(function (n) {
	        return n;
	      }); // to remove null

	      var nodeVertex = this._nodeMap.get(node);

	      var nodesOfInterest = relatives.map(function (relative) {
	        var tips = [].concat(toConsumableArray(_this3.traverseFromTip(relative)), [[node]]).filter(function (n) {
	          return !n.children;
	        }).sort(function (a, b) {
	          return getAngle(nodeVertex, _this3._nodeMap.get(a));
	        });
	        return {
	          rightMost: tips[0],
	          leftMost: tips[tips.length - 1]
	        };
	      }); // get Angles
	      // adjust subtree angles
	      // Rest the x,y in the layout.
	    }
	  }]);

	  return EqualAngleLayout;
	}(AbstractLayout);
	/**
	 * A function that gets the angle between vertices linked by the hypotenuse of a right triangle
	 * @param vertex1
	 * @param vertex2
	 * @return {number}
	 */

	function getAngle(vertex1, vertex2) {
	  return Math.tan((vertex1.y - vertex2.y) / (vertex1.x - vertex2.x));
	}

	/** @module bauble */

	/**
	 * The Axes class
	 *
	 * This class defines and draws an axis. It can be shared by multiple plots
	 * to allow the axes to be linked when zoomed or panned.
	 */

	var Axis =
	/*#__PURE__*/
	function () {
	  createClass(Axis, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        tickArguments: [5, "f"],
	        title: {
	          text: "",
	          xPadding: 0,
	          yPadding: 0,
	          rotation: 0
	        },
	        id: "a".concat(uuid_1.v4()),
	        location: "bottom"
	      };
	    }
	    /**
	     /**
	     * The constructor takes a setting object.
	     *
	     * @param {Object} settings
	     * @param {Array} [settings.tickArguments=[5,"f"] - Arguments passed to the d3 tickArgument function for the axis
	     * @param {Object} [settings.title={
	                    text:"",
	                    xPadding:0,
	                    yPadding:0,
	                    rotation:0
	            }] - options pertaining to the axis title
	     @param {string} settings.title.text - The axis title
	     @param {number} settings.title.xPadding -number of pixels to move the text in the x direction
	      @param {number} settings.title.yPadding -number of pixels to move the text in the y direction
	      @param {string} [settings.location="bottom"] - the direction of the ticks on the axis bottom,top,left,right
	      */

	  }]);

	  function Axis() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, Axis);

	    this.settings = mergeDeep(Axis.DEFAULT_SETTINGS(), settings);
	    this.d3Axis = getD3Axis(this.settings.location);
	  }

	  createClass(Axis, [{
	    key: "createAxis",
	    value: function createAxis(_ref) {
	      var selection = _ref.selection,
	          x = _ref.x,
	          y = _ref.y,
	          length = _ref.length,
	          scale = _ref.scale;
	      this.axis = this.d3Axis(scale).tickArguments(this.settings.tickArguments);
	      this.axisSelectiion = selection.append("g").attr("id", this.settings.id).attr("class", "axis").attr("transform", "translate(".concat(x, ", ").concat(y, ")")).call(this.axis);
	      var pos = {
	        x: 0,
	        y: 0
	      };

	      if (this.settings.location.toLowerCase() === "bottom" || this.settings.location.toLowerCase() === "top") {
	        pos.x = length / 2;
	      } else {
	        pos.y = length / 2;
	      }

	      this.axisTitleSelection = selection.append("g").attr("id", "".concat(this.settings.id, "-axis-label")).attr("class", "axis-label").attr("transform", "translate(".concat(x, ", ").concat(y, ")")).append("text").attr("transform", "translate(".concat(pos.x + this.settings.title.xPadding, ", ").concat(pos.y + this.settings.title.yPadding, ") rotate(").concat(this.settings.title.rotation, ")")).attr("alignment-baseline", "hanging").style("text-anchor", "middle").text(this.settings.title.text);
	      return selection;
	    }
	  }, {
	    key: "updateAxis",
	    value: function updateAxis(_ref2) {
	      var selection = _ref2.selection,
	          x = _ref2.x,
	          y = _ref2.y,
	          length = _ref2.length,
	          scale = _ref2.scale;
	      // update the scale's domain
	      this.axis = this.d3Axis(scale).tickArguments(this.settings.tickArguments);
	      selection.select("g#".concat(this.settings.id)).transition() // .duration()
	      .attr("transform", "translate(".concat(x, ", ").concat(y, ")")).call(this.axis);
	      var pos = {
	        x: 0,
	        y: 0
	      };

	      if (this.settings.location.toLowerCase() === "bottom" || this.settings.location.toLowerCase() === "top") {
	        pos.x = length / 2;
	      } else {
	        pos.y = length / 2;
	      }

	      selection.select("g#".concat(this.settings.id, "-axis-label")).transition() // .duration()
	      .attr("transform", "translate(".concat(x, ", ").concat(y, ")")).select("text").transition() // .duration()
	      .attr("transform", "translate(".concat(pos.x + this.settings.title.xPadding, ", ").concat(pos.y + this.settings.title.yPadding, ") rotate(").concat(this.settings.title.rotation, ")")).attr("alignment-baseline", "hanging").style("text-anchor", "middle").text(this.settings.title.text);
	    }
	  }]);

	  return Axis;
	}();

	function getD3Axis(location) {
	  switch (location.toLowerCase()) {
	    case "bottom":
	      return axisBottom;

	    case "left":
	      return axisLeft;

	    case "top":
	      return axisTop;

	    case "right":
	      return axisRight;

	    default:
	      throw new Error("Unknown location type ".concat(this.location));
	  }
	}

	var GreatCircleBranchBauble =
	/*#__PURE__*/
	function (_Branch) {
	  inherits(GreatCircleBranchBauble, _Branch);

	  createClass(GreatCircleBranchBauble, null, [{
	    key: "DEFAULT_SETTINGS",
	    value: function DEFAULT_SETTINGS() {
	      return {
	        curve: curveNatural,
	        attrs: {
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
	        vertexFilter: null,
	        edgeFilter: function edgeFilter() {
	          return true;
	        }
	      };
	    }
	    /**
	     * The constructor takes a setting object. The keys of the setting object are determined by the type of bauble.
	     *
	     * @param {Object} settings
	     * @param {function} [settings.curve=d3.curveNatural] - a d3 curve used to draw the edge
	     * @param {function} [settings.edgeFilter=()=>true] - a function that is passed each edge. If it returns true then bauble applies to that vertex.
	     * @param {Object} [settings.attrs={"fill": d => "none", "stroke-width": d => "2", "stroke": d => "black"}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These can be overwritten by css.
	     *  @param {Object} [settings.styles={}] - styling attributes. The keys should be the attribute string (stroke,fill ect) and entries are function that are called on each vertex. These overwrite css.
	     */

	  }]);

	  function GreatCircleBranchBauble() {
	    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    classCallCheck(this, GreatCircleBranchBauble);

	    return possibleConstructorReturn(this, getPrototypeOf(GreatCircleBranchBauble).call(this, mergeDeep(GreatCircleBranchBauble.DEFAULT_SETTINGS(), settings)));
	  } //TODO


	  createClass(GreatCircleBranchBauble, [{
	    key: "branchPathGenerator",
	    value: function branchPathGenerator(_ref) {
	      var scales = _ref.scales,
	          curveRadius = _ref.curveRadius,
	          curve = _ref.curve;

	      var _geoPath = geoPath(scales.projection);

	      var branchPath = function branchPath(e, i) {
	        // get og line
	        var geoLine = {
	          "type": "LineString",
	          "coordinates": [[e.v0.x, e.v0.y], [e.v1.x, e.v1.y]]
	        };
	        console.log(_geoPath(geoLine));
	        console.log(transformedLine(_geoPath(geoLine)));
	        return transformedLine(_geoPath(geoLine));
	      };

	      return branchPath;
	    }
	  }]);

	  return GreatCircleBranchBauble;
	}(Branch); //TODO fix this hack that only takes M and L

	var transformedLine = function transformedLine(string) {
	  var parsedString = string.split(/\s*('[^']+'|"[^"]+"|M|L|,)\s*/);
	  var currentValues = [0, 0];
	  var startingPoint = [];
	  var newString = [];
	  var currentPos = 0;
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = parsedString.filter(function (t) {
	      return t.length > 0;
	    })[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var token = _step.value;

	      if (token === "M" || token === "L" || token === ",") {
	        newString.push(token.toLowerCase());
	      } else {
	        var number = parseFloat(token);

	        if (currentValues[currentPos] === 0) {
	          newString.push(0);
	          startingPoint.push(number);
	          currentValues[currentPos] = number;
	          currentPos = Math.abs(currentPos - 1);
	        } else {
	          newString.push(number - currentValues[currentPos]);
	          currentValues[currentPos] = number;
	          currentPos = Math.abs(currentPos - 1);
	        }
	      }
	    } // now fix to handel how the branch is transformed

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

	  newString[3] = startingPoint[1] - currentValues[1];
	  return newString.join("");
	};

	exports.Axis = Axis;
	exports.Bauble = Bauble;
	exports.Branch = Branch;
	exports.CircleBauble = CircleBauble;
	exports.EqualAngleLayout = EqualAngleLayout;
	exports.ExplodedLayout = ExplodedLayout;
	exports.FigTree = FigTree;
	exports.GeoLayout = GeoLayout;
	exports.GreatCircleBranchBauble = GreatCircleBranchBauble;
	exports.RectangularBauble = RectangularBauble;
	exports.RectangularLayout = RectangularLayout;
	exports.RootToTipPlot = RootToTipPlot;
	exports.RoughBranchBauble = RoughBranchBauble;
	exports.RoughCircleBauble = RoughCircleBauble;
	exports.TransmissionLayout = TransmissionLayout;
	exports.Tree = Tree;
	exports.Type = Type;
	exports.rectangularLayout = rectangularLayout;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=figtree.umd.js.map
