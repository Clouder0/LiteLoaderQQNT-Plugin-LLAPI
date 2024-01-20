/*
 * @Date: 2024-01-17 16:34:50
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2024-01-17 16:35:00
 */
const elements = new WeakMap();
window.__VUE_ELEMENTS__ = elements;

function watchComponentUnmount(component) {
    if (!component.bum) component.bum = [];
    component.bum.push(() => {
        const element = component.vnode.el;
        if (element) {
            const components = elements.get(element);
            if (components?.length == 1) elements.delete(element);
            else components?.splice(components.indexOf(component));
            if (element.__VUE__?.length == 1) element.__VUE__ = undefined;
            else element.__VUE__?.splice(element.__VUE__.indexOf(component));
        }
    });
}

function watchComponentMount(component) {
    let value;
    Object.defineProperty(component.vnode, "el", {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            if (value) recordComponent(component);
        },
    });
}

function recordComponent(component) {
    let element = component.vnode.el;
    while (!(element instanceof HTMLElement)) {
        element = element.parentElement;
    }

    // Expose component to element's __VUE__ property
    if (element.__VUE__) element.__VUE__.push(component);
    else element.__VUE__ = [component];

    // Add class to element
    element.classList.add("vue-component");

    // Map element to components
    const components = elements.get(element);
    if (components) components.push(component);
    else elements.set(element, [component]);

    watchComponentUnmount(component);
}

export function hookVue3() {
    window.Proxy = new Proxy(window.Proxy, {
        construct(target, [proxyTarget, proxyHandler]) {
            const component = proxyTarget?._;
            if (component?.uid >= 0) {
                const element = component.vnode.el;
                if (element) recordComponent(component);
                else watchComponentMount(component);
            }
            return new target(proxyTarget, proxyHandler);
        },
    });
}
