
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
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

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Description.svelte generated by Svelte v3.19.1 */
    const file = "src/Description.svelte";
    const get_list_slot_changes = dirty => ({});
    const get_list_slot_context = ctx => ({});
    const get_x_slot_changes = dirty => ({});
    const get_x_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let button;
    	let div_transition;
    	let current;
    	let dispose;
    	const x_slot_template = /*$$slots*/ ctx[6].x;
    	const x_slot = create_slot(x_slot_template, ctx, /*$$scope*/ ctx[5], get_x_slot_context);
    	const list_slot_template = /*$$slots*/ ctx[6].list;
    	const list_slot = create_slot(list_slot_template, ctx, /*$$scope*/ ctx[5], get_list_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (x_slot) x_slot.c();
    			t0 = space();
    			if (list_slot) list_slot.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "CLOSE";
    			attr_dev(button, "class", "svelte-e21gmx");
    			add_location(button, file, 43, 4, 1250);
    			attr_dev(div, "class", "description svelte-e21gmx");
    			attr_dev(div, "role", "dialog");
    			attr_dev(div, "aria-modal", "true");
    			add_location(div, file, 40, 0, 1074);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (x_slot) {
    				x_slot.m(div, null);
    			}

    			append_dev(div, t0);

    			if (list_slot) {
    				list_slot.m(div, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, button);
    			/*div_binding*/ ctx[7](div);
    			current = true;

    			dispose = [
    				listen_dev(window, "keydown", /*handle_keydown*/ ctx[2], false, false, false),
    				listen_dev(button, "click", /*close*/ ctx[1], false, false, false),
    				listen_dev(div, "click", /*close*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (x_slot && x_slot.p && dirty & /*$$scope*/ 32) {
    				x_slot.p(get_slot_context(x_slot_template, ctx, /*$$scope*/ ctx[5], get_x_slot_context), get_slot_changes(x_slot_template, /*$$scope*/ ctx[5], dirty, get_x_slot_changes));
    			}

    			if (list_slot && list_slot.p && dirty & /*$$scope*/ 32) {
    				list_slot.p(get_slot_context(list_slot_template, ctx, /*$$scope*/ ctx[5], get_list_slot_context), get_slot_changes(list_slot_template, /*$$scope*/ ctx[5], dirty, get_list_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(x_slot, local);
    			transition_in(list_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(x_slot, local);
    			transition_out(list_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (x_slot) x_slot.d(detaching);
    			if (list_slot) list_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			if (detaching && div_transition) div_transition.end();
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

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let description;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			const nodes = description.querySelectorAll("*");
    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, description = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		fade,
    		dispatch,
    		close,
    		description,
    		handle_keydown,
    		previously_focused,
    		Array,
    		document
    	});

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		description,
    		close,
    		handle_keydown,
    		dispatch,
    		previously_focused,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.1 */
    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (59:2) {#each suggestions as item}
    function create_each_block_3(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[18].name + "";
    	let t;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[13](/*item*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "suggestion svelte-1bpnxaz");
    			add_location(div, file$1, 59, 3, 1475);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*suggestions*/ 16 && t_value !== (t_value = /*item*/ ctx[18].name + "")) set_data_dev(t, t_value);
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
    		source: "(59:2) {#each suggestions as item}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {#if showDescription}
    function create_if_block_1(ctx) {
    	let current;

    	const description = new Description({
    			props: {
    				$$slots: {
    					default: [create_default_slot],
    					list: [create_list_slot],
    					x: [create_x_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	description.$on("close", /*close_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(description.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(description, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const description_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				description_changes.$$scope = { dirty, ctx };
    			}

    			description.$set(description_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(description.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(description.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(description, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:1) {#if showDescription}",
    		ctx
    	});

    	return block;
    }

    // (70:3) <h2 slot="x">
    function create_x_slot(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "What's in your fridge?";
    			attr_dev(h2, "slot", "x");
    			attr_dev(h2, "class", "svelte-1bpnxaz");
    			add_location(h2, file$1, 69, 3, 1752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_x_slot.name,
    		type: "slot",
    		source: "(70:3) <h2 slot=\\\"x\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:3) <ol slot="list" class="descriptions">
    function create_list_slot(ctx) {
    	let ol;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li3;

    	const block = {
    		c: function create() {
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "Search for ingrediences based on what is in your fridge";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "Click at the wanted ingrediences and add them to your list";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Click the button \"FIND RECIPE\" to see reciepes based on your list of ingrediences";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "Click at the wanted recipe to find out what ingrediences you are missing";
    			add_location(li0, file$1, 71, 4, 1838);
    			add_location(li1, file$1, 72, 4, 1907);
    			add_location(li2, file$1, 73, 4, 1979);
    			add_location(li3, file$1, 74, 4, 2074);
    			attr_dev(ol, "slot", "list");
    			attr_dev(ol, "class", "descriptions");
    			add_location(ol, file$1, 70, 3, 1796);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);
    			append_dev(ol, li0);
    			append_dev(ol, t1);
    			append_dev(ol, li1);
    			append_dev(ol, t3);
    			append_dev(ol, li2);
    			append_dev(ol, t5);
    			append_dev(ol, li3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_list_slot.name,
    		type: "slot",
    		source: "(71:3) <ol slot=\\\"list\\\" class=\\\"descriptions\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:2) <Description on:close="{ () => showDescription = false }" >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(69:2) <Description on:close=\\\"{ () => showDescription = false }\\\" >",
    		ctx
    	});

    	return block;
    }

    // (90:1) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*theRecipe*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let t4;
    	let button;
    	let div_transition;
    	let current;
    	let dispose;
    	let each_value_2 = /*theRecipe*/ ctx[6].missedIngredients;
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
    			attr_dev(h1, "class", "svelte-1bpnxaz");
    			add_location(h1, file$1, 91, 3, 2547);
    			attr_dev(p, "class", "svelte-1bpnxaz");
    			add_location(p, file$1, 92, 3, 2577);
    			attr_dev(button, "class", "svelte-1bpnxaz");
    			add_location(button, file$1, 96, 3, 2694);
    			attr_dev(div, "class", "recipe2 svelte-1bpnxaz");
    			add_location(div, file$1, 90, 2, 2506);
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
    			current = true;
    			dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[16], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*theRecipe*/ 64) && t0_value !== (t0_value = /*theRecipe*/ ctx[6].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*theRecipe*/ 64) {
    				each_value_2 = /*theRecipe*/ ctx[6].missedIngredients;
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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(90:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (80:1) {#if !showRecipe}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*recipes*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "recipes svelte-1bpnxaz");
    			add_location(div, file$1, 80, 2, 2211);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*show, recipes*/ 1028) {
    				each_value_1 = /*recipes*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
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
    		source: "(80:1) {#if !showRecipe}",
    		ctx
    	});

    	return block;
    }

    // (94:3) {#each theRecipe.missedIngredients as missed}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*missed*/ ctx[24].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1bpnxaz");
    			add_location(li, file$1, 94, 4, 2657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theRecipe*/ 64 && t_value !== (t_value = /*missed*/ ctx[24].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(94:3) {#each theRecipe.missedIngredients as missed}",
    		ctx
    	});

    	return block;
    }

    // (82:3) {#each recipes as recipe}
    function create_each_block_1(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*recipe*/ ctx[21].title + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let button;
    	let t4;
    	let div_transition;
    	let current;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[15](/*recipe*/ ctx[21], ...args);
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
    			attr_dev(h1, "class", "svelte-1bpnxaz");
    			add_location(h1, file$1, 83, 5, 2308);
    			if (img.src !== (img_src_value = /*recipe*/ ctx[21].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*recipe*/ ctx[21].title);
    			attr_dev(img, "class", "svelte-1bpnxaz");
    			add_location(img, file$1, 84, 5, 2337);
    			attr_dev(button, "class", "svelte-1bpnxaz");
    			add_location(button, file$1, 85, 5, 2391);
    			attr_dev(div, "class", "recipe svelte-1bpnxaz");
    			add_location(div, file$1, 82, 4, 2266);
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
    			current = true;
    			dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*recipes*/ 4) && t0_value !== (t0_value = /*recipe*/ ctx[21].title + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*recipes*/ 4 && img.src !== (img_src_value = /*recipe*/ ctx[21].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*recipes*/ 4 && img_alt_value !== (img_alt_value = /*recipe*/ ctx[21].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:3) {#each recipes as recipe}",
    		ctx
    	});

    	return block;
    }

    // (102:2) {#each ingredients as item}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[18] + "";
    	let t0;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;
    	let t2;
    	let div_style_value;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[17](/*item*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			img = element("img");
    			t2 = space();
    			attr_dev(li, "class", "svelte-1bpnxaz");
    			add_location(li, file$1, 102, 3, 2831);
    			if (img.src !== (img_src_value = "../img/cross.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "close-sign");
    			add_location(img, file$1, 106, 3, 2977);
    			attr_dev(div, "class", "remove svelte-1bpnxaz");

    			attr_dev(div, "style", div_style_value = /*suggestions*/ ctx[4].includes(/*item*/ ctx[18])
    			? "height:2rem"
    			: "height: 1rem");

    			add_location(div, file$1, 103, 3, 2850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t2);
    			dispose = listen_dev(div, "click", click_handler_4, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*ingredients*/ 2 && t0_value !== (t0_value = /*item*/ ctx[18] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*suggestions, ingredients*/ 18 && div_style_value !== (div_style_value = /*suggestions*/ ctx[4].includes(/*item*/ ctx[18])
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
    		source: "(102:2) {#each ingredients as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let header;
    	let input;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let div0;
    	let t5;
    	let main;
    	let img;
    	let img_src_value;
    	let t6;
    	let t7;
    	let current_block_type_index;
    	let if_block1;
    	let t8;
    	let div1;
    	let current;
    	let dispose;
    	let each_value_3 = /*suggestions*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block0 = /*showDescription*/ ctx[0] && create_if_block_1(ctx);
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*showRecipe*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*ingredients*/ ctx[1];
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
    			button0 = element("button");
    			button0.textContent = "FIND RECIPE";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "?";
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			main = element("main");
    			img = element("img");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			if_block1.c();
    			t8 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "placeholder", "Search for ingredients...");
    			attr_dev(input, "class", "svelte-1bpnxaz");
    			add_location(input, file$1, 53, 1, 1150);
    			attr_dev(button0, "class", "svelte-1bpnxaz");
    			add_location(button0, file$1, 54, 1, 1289);
    			attr_dev(button1, "id", "desc");
    			attr_dev(button1, "class", "svelte-1bpnxaz");
    			add_location(button1, file$1, 55, 1, 1341);
    			attr_dev(div0, "class", "suggestions svelte-1bpnxaz");
    			add_location(div0, file$1, 57, 1, 1415);
    			attr_dev(header, "class", "svelte-1bpnxaz");
    			add_location(header, file$1, 52, 0, 1140);
    			attr_dev(img, "class", "logo svelte-1bpnxaz");
    			if (img.src !== (img_src_value = "../img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$1, 65, 1, 1611);
    			attr_dev(div1, "class", "ingredients svelte-1bpnxaz");
    			add_location(div1, file$1, 100, 1, 2772);
    			attr_dev(main, "class", "svelte-1bpnxaz");
    			add_location(main, file$1, 64, 0, 1603);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, input);
    			set_input_value(input, /*ingredient*/ ctx[3]);
    			append_dev(header, t0);
    			append_dev(header, button0);
    			append_dev(header, t2);
    			append_dev(header, button1);
    			append_dev(header, t4);
    			append_dev(header, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t6);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t7);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t8);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			dispose = [
    				listen_dev(input, "input", /*getIngredients*/ ctx[9], false, false, false),
    				listen_dev(input, "focus", focus_handler, false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    				listen_dev(button0, "click", /*getRecipes*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*click_handler*/ ctx[12], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ingredient*/ 8 && input.value !== /*ingredient*/ ctx[3]) {
    				set_input_value(input, /*ingredient*/ ctx[3]);
    			}

    			if (dirty & /*ingredients, suggestions*/ 18) {
    				each_value_3 = /*suggestions*/ ctx[4];
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

    			if (/*showDescription*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t7);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(main, t8);
    			}

    			if (dirty & /*suggestions, ingredients, add*/ 274) {
    				each_value = /*ingredients*/ ctx[1];
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apikey = "44be8784988a4def8aada63319c511cb";
    const focus_handler = e => e.target.value = "";

    function instance$1($$self, $$props, $$invalidate) {
    	let showDescription = true;
    	let ingredients = [];
    	let recipes = [];

    	const getRecipes = () => {
    		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=5`).then(res => res.json()).then(json => $$invalidate(2, recipes = json));
    		console.log(json);
    	};

    	const add = item => {
    		if (!ingredients.includes(item)) {
    			$$invalidate(1, ingredients = [...ingredients, item]);
    		} else {
    			$$invalidate(1, ingredients = ingredients.filter(element => element != item));
    		}
    	};

    	let ingredient = "";
    	let suggestions = [];

    	const getIngredients = () => {
    		if (ingredient.length > 1) {
    			fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apikey}&query=${ingredient}&number=5`).then(res => res.json()).then(json => {
    				console.log(json);
    				$$invalidate(4, suggestions = json);
    			});
    		}
    	};

    	let showRecipe = false;
    	let theRecipe;

    	const show = recipe => {
    		$$invalidate(5, showRecipe = true);
    		$$invalidate(6, theRecipe = recipe);
    	};

    	function input_input_handler() {
    		ingredient = this.value;
    		$$invalidate(3, ingredient);
    	}

    	const click_handler = () => $$invalidate(0, showDescription = true);
    	const click_handler_1 = item => $$invalidate(1, ingredients = [item.name, ...ingredients]);
    	const close_handler = () => $$invalidate(0, showDescription = false);
    	const click_handler_2 = recipe => show(recipe);
    	const click_handler_3 = () => $$invalidate(5, showRecipe = false);
    	const click_handler_4 = item => add(item);

    	$$self.$capture_state = () => ({
    		Description,
    		fade,
    		showDescription,
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
    		if ("showDescription" in $$props) $$invalidate(0, showDescription = $$props.showDescription);
    		if ("ingredients" in $$props) $$invalidate(1, ingredients = $$props.ingredients);
    		if ("recipes" in $$props) $$invalidate(2, recipes = $$props.recipes);
    		if ("ingredient" in $$props) $$invalidate(3, ingredient = $$props.ingredient);
    		if ("suggestions" in $$props) $$invalidate(4, suggestions = $$props.suggestions);
    		if ("showRecipe" in $$props) $$invalidate(5, showRecipe = $$props.showRecipe);
    		if ("theRecipe" in $$props) $$invalidate(6, theRecipe = $$props.theRecipe);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*ingredients*/ 2) {
    			 console.log(ingredients.toString());
    		}
    	};

    	return [
    		showDescription,
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
    		close_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    	
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
