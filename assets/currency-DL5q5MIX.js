import{k as o}from"./index-Dg0_ve_H.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=o("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]),n="INR",s={INR:"₹",USD:"$",EUR:"€",GBP:"£"};function i(r=n){const t=(r||n).toUpperCase();return s[t]||t}function f(r,t=n){if(r==null||r==="")return"";const e=typeof r=="string"?parseFloat(r):r;return isNaN(e)?"":`${i(t)}${e.toLocaleString("en-IN")}`}function u(r){if(r==null||r==="")return!1;const t=typeof r=="number"?r:parseFloat(String(r));return!isNaN(t)&&isFinite(t)&&t>0}export{l as A,n as D,f,u as i};
