var wasm;

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}

let cachegetUint16Memory = null;
function getUint16Memory() {
    if (cachegetUint16Memory === null || cachegetUint16Memory.buffer !== wasm.memory.buffer) {
        cachegetUint16Memory = new Uint16Array(wasm.memory.buffer);
    }
    return cachegetUint16Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray16ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 2);
    getUint16Memory().set(arg, ptr / 2);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @returns {void}
*/
module.exports.level_one_dealloc = function() {
    return wasm.level_one_dealloc();
};

let cachegetFloat32Memory = null;
function getFloat32Memory() {
    if (cachegetFloat32Memory === null || cachegetFloat32Memory.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory;
}

function getArrayF32FromWasm(ptr, len) {
    return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len);
}

module.exports.__wbg_update_d3f99f35335ab232 = function(arg0, arg1) {
    let varg0 = getArrayF32FromWasm(arg0, arg1);

    varg0 = varg0.slice();
    wasm.__wbindgen_free(arg0, arg1 * 4);

    js_wasm_adapter.update(varg0);
};

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

module.exports.__wbg_from_91325cb817e5fc69 = function(arg0) {
    return addHeapObject(Array.from(getObject(arg0)));
};

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

module.exports.__wbg_map_a7c1bedefc1319f6 = function(arg0, arg1, arg2) {
    let cbarg1 = function(arg0, arg1, arg2) {
        let a = this.a;
        this.a = 0;
        try {
            return takeObject(this.f(a, this.b, addHeapObject(arg0), arg1, addHeapObject(arg2)));

        } finally {
            this.a = a;

        }

    };
    cbarg1.f = wasm.__wbg_function_table.get(106);
    cbarg1.a = arg1;
    cbarg1.b = arg2;
    try {
        return addHeapObject(getObject(arg0).map(cbarg1.bind(cbarg1)));
    } finally {
        cbarg1.a = cbarg1.b = 0;

    }
};

module.exports.__wbg_values_284c480aeed55b57 = function(arg0) {
    return addHeapObject(getObject(arg0).values());
};

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}

function handleError(exnptr, e) {
    const view = getUint32Memory();
    view[exnptr / 4] = 1;
    view[exnptr / 4 + 1] = addHeapObject(e);
}

module.exports.__wbg_next_8d88e53071a3d4ae = function(arg0, exnptr) {
    try {
        return addHeapObject(getObject(arg0).next());
    } catch (e) {
        handleError(exnptr, e);
    }
};

module.exports.__wbg_done_625f3990fee15274 = function(arg0) {
    return getObject(arg0).done;
};

module.exports.__wbg_value_eda34bbf86bdd168 = function(arg0) {
    return addHeapObject(getObject(arg0).value);
};

module.exports.__wbg_get_9fe15aed09afbe22 = function(arg0, arg1, exnptr) {
    try {
        return addHeapObject(Reflect.get(getObject(arg0), getObject(arg1)));
    } catch (e) {
        handleError(exnptr, e);
    }
};

const TextDecoder = require('util').TextDecoder;

let cachedTextDecoder = new TextDecoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

module.exports.__wbindgen_string_new = function(p, l) { return addHeapObject(getStringFromWasm(p, l)); };

module.exports.__wbindgen_number_new = function(i) { return addHeapObject(i); };

module.exports.__wbindgen_number_get = function(n, invalid) {
    let obj = getObject(n);
    if (typeof(obj) === 'number') return obj;
    getUint8Memory()[invalid] = 1;
    return 0;
};

let cachegetNodeBufferMemory = null;
function getNodeBufferMemory() {
    if (cachegetNodeBufferMemory === null || cachegetNodeBufferMemory.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory = Buffer.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory;
}

function passStringToWasm(arg) {

    const size = Buffer.byteLength(arg);
    const ptr = wasm.__wbindgen_malloc(size);
    getNodeBufferMemory().write(arg, ptr, size);
    WASM_VECTOR_LEN = size;
    return ptr;
}

module.exports.__wbindgen_string_get = function(i, len_ptr) {
    let obj = getObject(i);
    if (typeof(obj) !== 'string') return 0;
    const ptr = passStringToWasm(obj);
    getUint32Memory()[len_ptr / 4] = WASM_VECTOR_LEN;
    return ptr;
};

module.exports.__wbindgen_throw = function(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
};

function freeLevelOne(ptr) {

    wasm.__wbg_levelone_free(ptr);
}
/**
*/
class LevelOne {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeLevelOne(ptr);
    }

    /**
    * @param {any} encoder_keys
    * @param {any} init_config
    * @returns {}
    */
    constructor(encoder_keys, init_config) {
        try {
            this.ptr = wasm.levelone_new(addBorrowedObject(encoder_keys), addBorrowedObject(init_config));

        } finally {
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;

        }

    }
    /**
    * @param {number} dt
    * @returns {void}
    */
    get_update(dt) {
        return wasm.levelone_get_update(this.ptr, dt);
    }
    /**
    * @param {any} init_config
    * @returns {void}
    */
    reset(init_config) {
        try {
            return wasm.levelone_reset(this.ptr, addBorrowedObject(init_config));

        } finally {
            heap[stack_pointer++] = undefined;

        }

    }
    /**
    * @param {Uint16Array} input_def
    * @returns {void}
    */
    on_event(input_def) {
        const ptr0 = passArray16ToWasm(input_def);
        const len0 = WASM_VECTOR_LEN;
        try {
            return wasm.levelone_on_event(this.ptr, ptr0, len0);

        } finally {
            wasm.__wbindgen_free(ptr0, len0 * 2);

        }

    }
}
module.exports.LevelOne = LevelOne;

module.exports.__wbindgen_object_clone_ref = function(idx) {
    return addHeapObject(getObject(idx));
};

module.exports.__wbindgen_object_drop_ref = function(i) { dropObject(i); };

wasm = require('./battle_rust_bg');

