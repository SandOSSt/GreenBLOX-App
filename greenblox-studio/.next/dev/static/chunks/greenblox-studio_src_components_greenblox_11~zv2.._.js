(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorBoundary",
    ()=>ErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
"use client";
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Component {
    state = {
        hasError: false,
        error: null
    };
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, info) {
        console.error("[GreenBlox Studio] Uncaught render error:", error, info);
    }
    handleReload = ()=>{
        window.location.reload();
    };
    render() {
        if (!this.state.hasError) return this.props.children;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid h-screen w-screen place-items-center bg-[#1a1c24] p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-md w-full text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-5xl font-black tracking-tight text-emerald-400 mb-4 select-none",
                        children: "GreenBLOX Studio"
                    }, void 0, false, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto mb-6 w-20 h-20 rounded-2xl bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-10 h-10 text-red-400",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            strokeWidth: 2,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                d: "M12 9v3m0 3h.01M3.27 17.44l7.46-12.89a1.5 1.5 0 012.54 0l7.46 12.89A1.5 1.5 0 0119.46 20H4.54a1.5 1.5 0 01-1.27-2.56z"
                            }, void 0, false, {
                                fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                                lineNumber: 53,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                            lineNumber: 46,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-black text-white mb-2",
                        children: "Something went wrong"
                    }, void 0, false, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/50 text-sm mb-1",
                        children: "An unexpected error occurred while rendering the editor."
                    }, void 0, false, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    this.state.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-red-400/70 text-xs font-mono mb-6 break-all max-h-24 overflow-auto",
                        children: this.state.error.message
                    }, void 0, false, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: this.handleReload,
                        className: "inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                strokeWidth: 2.5,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M4 4v5h5M20 20v-5h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        d: "M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15"
                                    }, void 0, false, {
                                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            "Reload Studio"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/greenblox-studio/src/components/greenblox/ClientErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClientErrorBoundary",
    ()=>ClientErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$components$2f$greenblox$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/components/greenblox/ErrorBoundary.tsx [app-client] (ecmascript)");
"use client";
;
;
function ClientErrorBoundary({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$components$2f$greenblox$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorBoundary"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/greenblox-studio/src/components/greenblox/ClientErrorBoundary.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = ClientErrorBoundary;
var _c;
__turbopack_context__.k.register(_c, "ClientErrorBoundary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=greenblox-studio_src_components_greenblox_11~zv2.._.js.map