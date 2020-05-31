
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.19.1 */

    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (53:2) {#each suggestions as item}
    function create_each_block_3(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[15].name + "";
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[11](/*item*/ ctx[15], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "suggestion svelte-nypk46");
    			add_location(div, file, 53, 3, 1280);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			dispose = listen_dev(div, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*suggestions*/ 8 && t_value !== (t_value = /*item*/ ctx[15].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(53:2) {#each suggestions as item}",
    		ctx
    	});

    	return block;
    }

    // (73:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*theRecipe*/ ctx[5].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let t4;
    	let button;
    	let dispose;
    	let each_value_2 = /*theRecipe*/ ctx[5].missedIngredients;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			p.textContent = "Missed ingredients:";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			button = element("button");
    			button.textContent = "CLOSE";
    			attr_dev(h1, "class", "svelte-nypk46");
    			add_location(h1, file, 74, 2, 1782);
    			attr_dev(p, "class", "svelte-nypk46");
    			add_location(p, file, 75, 2, 1811);
    			attr_dev(button, "class", "svelte-nypk46");
    			add_location(button, file, 79, 2, 1924);
    			attr_dev(div, "class", "recipe2 svelte-nypk46");
    			add_location(div, file, 73, 2, 1758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t4);
    			append_dev(div, button);
    			dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[13], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theRecipe*/ 32 && t0_value !== (t0_value = /*theRecipe*/ ctx[5].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*theRecipe*/ 32) {
    				each_value_2 = /*theRecipe*/ ctx[5].missedIngredients;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(73:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:0) {#if !showRecipe}
    function create_if_block(ctx) {
    	let div;
    	let each_value_1 = /*recipes*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "recipes svelte-nypk46");
    			add_location(div, file, 63, 1, 1488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*show, recipes*/ 514) {
    				each_value_1 = /*recipes*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:0) {#if !showRecipe}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#each theRecipe.missedIngredients as missed}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*missed*/ ctx[21].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-nypk46");
    			add_location(li, file, 77, 3, 1889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theRecipe*/ 32 && t_value !== (t_value = /*missed*/ ctx[21].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(77:2) {#each theRecipe.missedIngredients as missed}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#each recipes as recipe}
    function create_each_block_1(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*recipe*/ ctx[18].title + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let button;
    	let t4;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[12](/*recipe*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			button = element("button");
    			button.textContent = "VIEW MISSED INGREDIENTS";
    			t4 = space();
    			attr_dev(h1, "class", "svelte-nypk46");
    			add_location(h1, file, 66, 4, 1566);
    			if (img.src !== (img_src_value = /*recipe*/ ctx[18].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*recipe*/ ctx[18].title);
    			attr_dev(img, "class", "svelte-nypk46");
    			add_location(img, file, 67, 4, 1594);
    			attr_dev(button, "class", "svelte-nypk46");
    			add_location(button, file, 68, 4, 1647);
    			attr_dev(div, "class", "recipe svelte-nypk46");
    			add_location(div, file, 65, 3, 1541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, img);
    			append_dev(div, t2);
    			append_dev(div, button);
    			append_dev(div, t4);
    			dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*recipes*/ 2 && t0_value !== (t0_value = /*recipe*/ ctx[18].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*recipes*/ 2 && img.src !== (img_src_value = /*recipe*/ ctx[18].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*recipes*/ 2 && img_alt_value !== (img_alt_value = /*recipe*/ ctx[18].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(65:2) {#each recipes as recipe}",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#each ingredients as item}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[15] + "";
    	let t0;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;
    	let t2;
    	let div_style_value;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[14](/*item*/ ctx[15], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			img = element("img");
    			t2 = space();
    			attr_dev(li, "class", "svelte-nypk46");
    			add_location(li, file, 87, 3, 2062);
    			if (img.src !== (img_src_value = "../img/cross.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "close-sign");
    			add_location(img, file, 91, 3, 2208);
    			attr_dev(div, "class", "remove svelte-nypk46");

    			attr_dev(div, "style", div_style_value = /*suggestions*/ ctx[3].includes(/*item*/ ctx[15])
    			? "height:2rem"
    			: "height: 1rem");

    			add_location(div, file, 88, 3, 2081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t2);
    			dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*ingredients*/ 1 && t0_value !== (t0_value = /*item*/ ctx[15] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*suggestions, ingredients*/ 9 && div_style_value !== (div_style_value = /*suggestions*/ ctx[3].includes(/*item*/ ctx[15])
    			? "height:2rem"
    			: "height: 1rem")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(87:2) {#each ingredients as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let input;
    	let t0;
    	let button;
    	let t2;
    	let div0;
    	let t3;
    	let main;
    	let img;
    	let img_src_value;
    	let t4;
    	let t5;
    	let div1;
    	let dispose;
    	let each_value_3 = /*suggestions*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (!/*showRecipe*/ ctx[4]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*ingredients*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "FIND RECIPE";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			main = element("main");
    			img = element("img");
    			t4 = space();
    			if_block.c();
    			t5 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "placeholder", "Search for ingredients...");
    			attr_dev(input, "class", "svelte-nypk46");
    			add_location(input, file, 48, 1, 1028);
    			attr_dev(button, "class", "svelte-nypk46");
    			add_location(button, file, 49, 1, 1167);
    			attr_dev(div0, "class", "suggestions svelte-nypk46");
    			add_location(div0, file, 51, 1, 1220);
    			attr_dev(header, "class", "svelte-nypk46");
    			add_location(header, file, 47, 0, 1018);
    			attr_dev(img, "class", "logo svelte-nypk46");
    			if (img.src !== (img_src_value = "../img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file, 60, 0, 1416);
    			attr_dev(div1, "class", "ingredients svelte-nypk46");
    			add_location(div1, file, 85, 1, 2003);
    			attr_dev(main, "class", "svelte-nypk46");
    			add_location(main, file, 58, 0, 1408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, input);
    			set_input_value(input, /*ingredient*/ ctx[2]);
    			append_dev(header, t0);
    			append_dev(header, button);
    			append_dev(header, t2);
    			append_dev(header, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t4);
    			if_block.m(main, null);
    			append_dev(main, t5);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			dispose = [
    				listen_dev(input, "input", /*getIngredients*/ ctx[8], false, false, false),
    				listen_dev(input, "focus", focus_handler, false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    				listen_dev(button, "click", /*getRecipes*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ingredient*/ 4 && input.value !== /*ingredient*/ ctx[2]) {
    				set_input_value(input, /*ingredient*/ ctx[2]);
    			}

    			if (dirty & /*ingredients, suggestions*/ 9) {
    				each_value_3 = /*suggestions*/ ctx[3];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t5);
    				}
    			}

    			if (dirty & /*suggestions, ingredients, add*/ 137) {
    				each_value = /*ingredients*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apikey = "44be8784988a4def8aada63319c511cb";
    const focus_handler = e => e.target.value = "";

    function instance($$self, $$props, $$invalidate) {
    	let ingredients = [];
    	let recipes = [];

    	const getRecipes = () => {
    		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=5`).then(res => res.json()).then(json => $$invalidate(1, recipes = json));
    		console.log(json);
    	};

    	const add = item => {
    		if (!ingredients.includes(item)) {
    			$$invalidate(0, ingredients = [...ingredients, item]);
    		} else {
    			$$invalidate(0, ingredients = ingredients.filter(element => element != item));
    		}
    	};

    	let ingredient = "";
    	let suggestions = [];

    	const getIngredients = () => {
    		if (ingredient.length > 1) {
    			fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apikey}&query=${ingredient}&number=5`).then(res => res.json()).then(json => {
    				console.log(json);
    				$$invalidate(3, suggestions = json);
    			});
    		}
    	};

    	let showRecipe = false;
    	let theRecipe;

    	const show = recipe => {
    		$$invalidate(4, showRecipe = true);
    		$$invalidate(5, theRecipe = recipe);
    	};

    	function input_input_handler() {
    		ingredient = this.value;
    		$$invalidate(2, ingredient);
    	}

    	const click_handler = item => $$invalidate(0, ingredients = [item.name, ...ingredients]);
    	const click_handler_1 = recipe => show(recipe);
    	const click_handler_2 = () => $$invalidate(4, showRecipe = false);
    	const click_handler_3 = item => add(item);

    	$$self.$capture_state = () => ({
    		apikey,
    		ingredients,
    		recipes,
    		getRecipes,
    		add,
    		ingredient,
    		suggestions,
    		getIngredients,
    		showRecipe,
    		theRecipe,
    		show,
    		console,
    		fetch,
    		json
    	});

    	$$self.$inject_state = $$props => {
    		if ("ingredients" in $$props) $$invalidate(0, ingredients = $$props.ingredients);
    		if ("recipes" in $$props) $$invalidate(1, recipes = $$props.recipes);
    		if ("ingredient" in $$props) $$invalidate(2, ingredient = $$props.ingredient);
    		if ("suggestions" in $$props) $$invalidate(3, suggestions = $$props.suggestions);
    		if ("showRecipe" in $$props) $$invalidate(4, showRecipe = $$props.showRecipe);
    		if ("theRecipe" in $$props) $$invalidate(5, theRecipe = $$props.theRecipe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ingredients*/ 1) {
    			 console.log(ingredients.toString());
    		}
    	};

    	return [
    		ingredients,
    		recipes,
    		ingredient,
    		suggestions,
    		showRecipe,
    		theRecipe,
    		getRecipes,
    		add,
    		getIngredients,
    		show,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    	
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
