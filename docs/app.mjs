// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const detectSSR = ()=>{
    const isDeno = typeof Deno !== 'undefined';
    const hasWindow = typeof window !== 'undefined' ? true : false;
    return typeof _nano !== 'undefined' && _nano.isSSR || isDeno || !hasWindow;
};
const escapeHtml = (unsafe)=>{
    if (unsafe && typeof unsafe === 'string') return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    return unsafe;
};
class HTMLElementSSR {
    tagName;
    isSelfClosing = false;
    nodeType = null;
    _ssr;
    constructor(tag){
        this.tagName = tag;
        const selfClosing = [
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr'
        ];
        this.nodeType = 1;
        if (selfClosing.indexOf(tag) >= 0) {
            this._ssr = `<${tag} />`;
            this.isSelfClosing = true;
        } else {
            this._ssr = `<${tag}></${tag}>`;
        }
    }
    get outerHTML() {
        return this.toString();
    }
    get innerHTML() {
        return this.innerText;
    }
    set innerHTML(text) {
        this.innerText = text;
    }
    get innerText() {
        const reg = /(^<[^>]+>)(.+)?(<\/[a-z]+>$|\/>$)/gm;
        return reg.exec(this._ssr)?.[2] || '';
    }
    set innerText(text) {
        const reg = /(^<[^>]+>)(.+)?(<\/[a-z]+>$|\/>$)/gm;
        this._ssr = this._ssr.replace(reg, `$1${text}$3`);
    }
    getAttribute(_name) {
        return null;
    }
    get classList() {
        const element = this._ssr;
        const classesRegex = /^<\w+.+(\sclass=")([^"]+)"/gm;
        return {
            add: (name)=>{
                this.setAttribute('class', name);
            },
            entries: {
                get length () {
                    const classes = classesRegex.exec(element);
                    if (classes && classes[2]) return classes[2].split(' ').length;
                    return 0;
                }
            }
        };
    }
    toString() {
        return this._ssr;
    }
    setAttributeNS(_namespace, name, value) {
        this.setAttribute(name, value);
    }
    setAttribute(name, value) {
        if (this.isSelfClosing) this._ssr = this._ssr.replace(/(^<[a-z]+ )(.+)/gm, `$1${escapeHtml(name)}="${escapeHtml(value)}" $2`);
        else this._ssr = this._ssr.replace(/(^<[^>]+)(.+)/gm, `$1 ${escapeHtml(name)}="${escapeHtml(value)}"$2`);
    }
    append(child) {
        this.appendChild(child);
    }
    appendChild(child) {
        const index = this._ssr.lastIndexOf('</');
        this._ssr = this._ssr.substring(0, index) + child + this._ssr.substring(index);
    }
    get children() {
        const reg = /<([a-z]+)((?!<\/\1).)*<\/\1>/gms;
        const array = [];
        let match;
        while((match = reg.exec(this.innerHTML)) !== null){
            array.push(match[0].replace(/[\s]+/gm, ' '));
        }
        return array;
    }
    addEventListener(_type, _listener, _options) {}
}
class DocumentSSR {
    body;
    head;
    constructor(){
        this.body = this.createElement('body');
        this.head = this.createElement('head');
    }
    createElement(tag) {
        return new HTMLElementSSR(tag);
    }
    createElementNS(_URI, tag) {
        return this.createElement(tag);
    }
    createTextNode(text) {
        return escapeHtml(text);
    }
    querySelector(_query) {
        return undefined;
    }
}
const documentSSR = ()=>{
    return new DocumentSSR();
};
const isSSR = ()=>typeof _nano !== 'undefined' && _nano.isSSR === true
;
const tick = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
const removeAllChildNodes = (parent)=>{
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
};
const strToHash = (s)=>{
    let hash = 0;
    for(let i = 0; i < s.length; i++){
        const chr = s.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash).toString(32);
};
const appendChildren = (element, children, escape = true)=>{
    if (!Array.isArray(children)) {
        appendChildren(element, [
            children
        ], escape);
        return;
    }
    if (typeof children === 'object') children = Array.prototype.slice.call(children);
    children.forEach((child)=>{
        if (Array.isArray(child)) appendChildren(element, child, escape);
        else {
            const c = _render(child);
            if (typeof c !== 'undefined') {
                if (Array.isArray(c)) appendChildren(element, c, escape);
                else {
                    if (isSSR() && !escape) element.appendChild(c.nodeType == null ? c.toString() : c);
                    else element.appendChild(c.nodeType == null ? document.createTextNode(c.toString()) : c);
                }
            }
        }
    });
};
const SVG = (props)=>{
    const child = props.children[0];
    const attrs = child.attributes;
    if (isSSR()) return child;
    const svg = hNS('svg');
    for(let i = attrs.length - 1; i >= 0; i--){
        svg.setAttribute(attrs[i].name, attrs[i].value);
    }
    svg.innerHTML = child.innerHTML;
    return svg;
};
const render = (component, parent = null, removeChildNodes = true)=>{
    let el = _render(component);
    if (Array.isArray(el)) {
        el = el.map((e)=>_render(e)
        );
        if (el.length === 1) el = el[0];
    }
    if (parent) {
        if (removeChildNodes) removeAllChildNodes(parent);
        if (el && parent.id && parent.id === el.id && parent.parentElement) {
            parent.parentElement.replaceChild(el, parent);
        } else {
            if (Array.isArray(el)) el.forEach((e)=>{
                appendChildren(parent, _render(e));
            });
            else appendChildren(parent, _render(el));
        }
        return parent;
    } else {
        if (isSSR() && !Array.isArray(el)) return [
            el
        ];
        return el;
    }
};
const _render = (comp)=>{
    if (typeof comp === 'undefined') return [];
    if (comp == null) return [];
    if (comp === false) return [];
    if (typeof comp === 'string') return comp;
    if (typeof comp === 'number') return comp.toString();
    if (comp.tagName && comp.tagName.toLowerCase() === 'svg') return SVG({
        children: [
            comp
        ]
    });
    if (comp.tagName) return comp;
    if (comp && comp.component && comp.component.isClass) return renderClassComponent(comp);
    if (comp.isClass) return renderClassComponent({
        component: comp,
        props: {}
    });
    if (comp.component && typeof comp.component === 'function') return renderFunctionalComponent(comp);
    if (Array.isArray(comp)) return comp.map((c)=>_render(c)
    ).flat();
    if (typeof comp === 'function' && !comp.isClass) return _render(comp());
    if (comp.component && comp.component.tagName && typeof comp.component.tagName === 'string') return _render(comp.component);
    if (Array.isArray(comp.component)) return _render(comp.component);
    if (comp.component) return _render(comp.component);
    if (typeof comp === 'object') return [];
    console.warn('Something unexpected happened with:', comp);
};
const renderFunctionalComponent = (fncComp)=>{
    const { component , props  } = fncComp;
    return _render(component(props));
};
const renderClassComponent = (classComp)=>{
    const { component , props  } = classComp;
    const hash = strToHash(component.toString());
    component.prototype._getHash = ()=>hash
    ;
    const Component = new component(props);
    if (!isSSR()) Component.willMount();
    let el = Component.render();
    el = _render(el);
    Component.elements = el;
    if (props && props.ref) props.ref(Component);
    if (!isSSR()) tick(()=>{
        Component._didMount();
    });
    return el;
};
const hNS = (tag)=>document.createElementNS('http://www.w3.org/2000/svg', tag)
;
const h = (tagNameOrComponent, props, ...children)=>{
    if (isSSR() && typeof tagNameOrComponent === 'string' && tagNameOrComponent.includes('-') && _nano.customElements.has(tagNameOrComponent)) {
        const customElement = _nano.customElements.get(tagNameOrComponent);
        const component = _render({
            component: customElement,
            props: {
                ...props,
                children: children
            }
        });
        const match1 = component.toString().match(/^<(?<tag>[a-z]+)>(.*)<\/\k<tag>>$/);
        if (match1) {
            const element = new HTMLElementSSR(match1[1]);
            element.innerText = match1[2];
            function replacer(match, p1, _offset, _string) {
                return match.replace(p1, '');
            }
            element.innerText = element.innerText.replace(/<\w+[^>]*(\s(on\w*)="[^"]*")/gm, replacer);
            return element;
        } else {
            return 'COULD NOT RENDER WEB-COMPONENT';
        }
    }
    if (typeof tagNameOrComponent !== 'string') return {
        component: tagNameOrComponent,
        props: {
            ...props,
            children: children
        }
    };
    let ref;
    const element = tagNameOrComponent === 'svg' ? hNS('svg') : document.createElement(tagNameOrComponent);
    const isEvent = (el, p)=>{
        if (0 !== p.indexOf('on')) return false;
        if (el.ssr) return true;
        return typeof el[p] === 'object' || typeof el[p] === 'function';
    };
    for(const p11 in props){
        if (p11 === 'style' && typeof props[p11] === 'object') {
            const styles = Object.keys(props[p11]).map((k)=>`${k}:${props[p11][k]}`
            ).join(';').replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`
            );
            props[p11] = `${styles};`;
        }
        if (p11 === 'ref') ref = props[p11];
        else if (isEvent(element, p11.toLowerCase())) element.addEventListener(p11.toLowerCase().substring(2), (e)=>props[p11](e)
        );
        else if (p11 === 'dangerouslySetInnerHTML' && props[p11].__html) {
            if (!isSSR()) {
                const fragment = document.createElement('fragment');
                fragment.innerHTML = props[p11].__html;
                element.appendChild(fragment);
            } else {
                element.innerHTML = props[p11].__html;
            }
        } else if (p11 === 'innerHTML' && props[p11].__dangerousHtml) {
            if (!isSSR()) {
                const fragment = document.createElement('fragment');
                fragment.innerHTML = props[p11].__dangerousHtml;
                element.appendChild(fragment);
            } else {
                element.innerHTML = props[p11].__dangerousHtml;
            }
        } else if (/className/i.test(p11)) console.warn('You can use "class" instead of "className".');
        else if (typeof props[p11] !== 'undefined') element.setAttribute(p11, props[p11]);
    }
    const escape = ![
        'noscript',
        'script',
        'style'
    ].includes(tagNameOrComponent);
    appendChildren(element, children, escape);
    if (ref) ref(element);
    return element;
};
const _state = new Map();
const initGlobalVar = ()=>{
    const isSSR1 = detectSSR() === true ? true : undefined;
    const location = {
        pathname: '/'
    };
    const document = isSSR1 ? documentSSR() : window.document;
    globalThis._nano = {
        isSSR: isSSR1,
        location,
        document,
        customElements: new Map()
    };
};
initGlobalVar();
const Fragment = (props)=>{
    return props.children;
};
const MODE_SLASH = 0;
const MODE_TEXT = 1;
const MODE_WHITESPACE = 2;
const MODE_TAGNAME = 3;
const MODE_COMMENT = 4;
const MODE_PROP_SET = 5;
const MODE_PROP_APPEND = 6;
const CHILD_APPEND = 0;
const evaluate = (h1, built, fields, args)=>{
    let tmp;
    built[0] = 0;
    for(let i = 1; i < built.length; i++){
        const type = built[i++];
        const value = built[i] ? (built[0] |= type ? 1 : 2, fields[built[i++]]) : built[++i];
        if (type === 3) {
            args[0] = value;
        } else if (type === 4) {
            args[1] = Object.assign(args[1] || {}, value);
        } else if (type === 5) {
            (args[1] = args[1] || {})[built[++i]] = value;
        } else if (type === 6) {
            args[1][built[++i]] += `${value}`;
        } else if (type) {
            tmp = h1.apply(value, evaluate(h1, value, fields, [
                '',
                null
            ]));
            args.push(tmp);
            if (value[0]) {
                built[0] |= 2;
            } else {
                built[i - 2] = CHILD_APPEND;
                built[i] = tmp;
            }
        } else {
            args.push(value);
        }
    }
    return args;
};
const build = function(statics, ...rest) {
    let mode = 1;
    let buffer = '';
    let quote = '';
    let current = [
        0
    ];
    let __char;
    let propName;
    const commit = (field)=>{
        if (mode === 1 && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
            {
                current.push(0, field, buffer);
            }
        } else if (mode === 3 && (field || buffer)) {
            {
                current.push(3, field, buffer);
            }
            mode = MODE_WHITESPACE;
        } else if (mode === 2 && buffer === '...' && field) {
            {
                current.push(4, field, 0);
            }
        } else if (mode === 2 && buffer && !field) {
            {
                current.push(5, 0, true, buffer);
            }
        } else if (mode >= 5) {
            {
                if (buffer || !field && mode === 5) {
                    current.push(mode, 0, buffer, propName);
                    mode = MODE_PROP_APPEND;
                }
                if (field) {
                    current.push(mode, field, 0, propName);
                    mode = MODE_PROP_APPEND;
                }
            }
        }
        buffer = '';
    };
    for(let i = 0; i < statics.length; i++){
        if (i) {
            if (mode === 1) {
                commit();
            }
            commit(i);
        }
        for(let j = 0; j < statics[i].length; j++){
            __char = statics[i][j];
            if (mode === 1) {
                if (__char === '<') {
                    commit();
                    {
                        current = [
                            current
                        ];
                    }
                    mode = MODE_TAGNAME;
                } else {
                    buffer += __char;
                }
            } else if (mode === 4) {
                if (buffer === '--' && __char === '>') {
                    mode = MODE_TEXT;
                    buffer = '';
                } else {
                    buffer = __char + buffer[0];
                }
            } else if (quote) {
                if (__char === quote) {
                    quote = '';
                } else {
                    buffer += __char;
                }
            } else if (__char === '"' || __char === "'") {
                quote = __char;
            } else if (__char === '>') {
                commit();
                mode = MODE_TEXT;
            } else if (!mode) {} else if (__char === '=') {
                mode = MODE_PROP_SET;
                propName = buffer;
                buffer = '';
            } else if (__char === '/' && (mode < 5 || statics[i][j + 1] === '>')) {
                commit();
                if (mode === 3) {
                    current = current[0];
                }
                mode = current;
                {
                    (current = current[0]).push(2, 0, mode);
                }
                mode = MODE_SLASH;
            } else if (__char === ' ' || __char === '\t' || __char === '\n' || __char === '\r') {
                commit();
                mode = MODE_WHITESPACE;
            } else {
                buffer += __char;
            }
            if (mode === 3 && buffer === '!--') {
                mode = MODE_COMMENT;
                current = current[0];
            }
        }
    }
    commit();
    return current;
};
const CACHES = new Map();
const regular = function(statics) {
    let tmp = CACHES.get(this);
    if (!tmp) {
        tmp = new Map();
        CACHES.set(this, tmp);
    }
    tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, tmp = build(statics)), tmp), arguments, []);
    return tmp.length > 1 ? tmp : tmp[0];
};
const __default = false ? build : regular;
__default.bind(h);
const useState = (state1, id)=>{
    const s = {
        setState (state) {
            if (state !== null) _state.set(id, state);
        },
        get state () {
            return _state.get(id);
        }
    };
    if (!_state.has(id)) _state.set(id, state1);
    return [
        s.state,
        s.setState
    ];
};
const startAt = new Date();
function parse(str) {
    str.split("\n");
    return [
        {
            at: startAt,
            text: "Started"
        },
        {
            at: new Date(startAt.getTime() + 30000),
            text: "Ended"
        }
    ];
}
function Home() {
    const [text, setText] = useState("", 'text');
    const [timers, setTimers] = useState([], 'timer');
    const handleChange = (e)=>{
        const target = e.target;
        setText(target.value);
        setTimers(parse(target.value));
    };
    return h(Fragment, null, h("title", null, "Event Keeper"), h("div", {
        class: "input"
    }, h("textarea", {
        value: text,
        onChange: handleChange
    })), h("div", {
        class: "timer"
    }, h(TimerComponent, {
        timers: timers
    })));
}
function TimerComponent({ timers  }) {
    const [now, setNow] = useState(new Date(), 'now');
    setTimeout(()=>{
        setNow(new Date());
    }, 1000);
    let from;
    return h(Fragment, null, timers.map(({ at , text  })=>{
        const showNow = from && from < now && now < at ? h("p", {
            className: "now"
        }, now) : "";
        from = at;
        return h(Fragment, null, showNow, h("p", null, at, " ", text));
    }));
}
render(Home, document.getElementById('app'));

