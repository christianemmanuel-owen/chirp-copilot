/**
 * Minimal polyfill for Node.js async_hooks module.
 * Required because Next.js's middleware runtime uses AsyncLocalStorage
 * internally, and @cloudflare/next-on-pages rewrites the import to a
 * local path that doesn't exist in the bundled output.
 *
 * By providing this shim via a webpack alias, the polyfill gets inlined
 * into the middleware bundle, eliminating the broken external import.
 *
 * This is a synchronous polyfill — it works correctly for single-request
 * Edge runtime environments where there's no concurrent async context switching.
 */

class AsyncLocalStorage {
    constructor() {
        this._store = undefined;
    }

    run(store, callback, ...args) {
        const prev = this._store;
        this._store = store;
        try {
            return callback(...args);
        } finally {
            this._store = prev;
        }
    }

    exit(callback, ...args) {
        const prev = this._store;
        this._store = undefined;
        try {
            return callback(...args);
        } finally {
            this._store = prev;
        }
    }

    getStore() {
        return this._store;
    }

    enterWith(store) {
        this._store = store;
    }

    disable() {
        this._store = undefined;
    }

    static bind(fn) {
        return fn;
    }

    static snapshot() {
        return (fn, ...args) => fn(...args);
    }
}

class AsyncResource {
    constructor(type, opts) {
        this._type = type;
    }

    runInAsyncScope(fn, thisArg, ...args) {
        return fn.apply(thisArg, args);
    }

    emitDestroy() {
        return this;
    }

    asyncId() {
        return 1;
    }

    triggerAsyncId() {
        return 0;
    }

    bind(fn) {
        return fn;
    }

    static bind(fn) {
        return fn;
    }
}

function createHook() {
    return {
        enable() { return this; },
        disable() { return this; },
    };
}

function executionAsyncId() {
    return 1;
}

function triggerAsyncId() {
    return 0;
}

function executionAsyncResource() {
    return {};
}

export {
    AsyncLocalStorage,
    AsyncResource,
    createHook,
    executionAsyncId,
    triggerAsyncId,
    executionAsyncResource,
};

export default {
    AsyncLocalStorage,
    AsyncResource,
    createHook,
    executionAsyncId,
    triggerAsyncId,
    executionAsyncResource,
};
