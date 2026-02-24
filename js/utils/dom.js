export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  if (props.className) node.className = props.className;
  if (props.text) node.textContent = props.text;
  if (props.id) node.id = props.id;
  if (props.data) {
    for (const [k, v] of Object.entries(props.data)) {
      node.dataset[k] = v;
    }
  }
  if (props.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) {
      node.setAttribute(k, v);
    }
  }
  for (const child of children) {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}
export function show(element) {
  element?.classList.add('visible');
}
export function hide(element) {
  element?.classList.remove('visible');
}
export function toggleClass(element, cls = 'hidden', force) {
  element?.classList.toggle(cls, force);
}
export function replaceChildren(parent, newChildren = []) {
  parent.replaceChildren(...newChildren);
}
export function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}
