"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// @excalibur/core — framework-agnostic engine: pure backend subsystems +
// the HostServices seam for platform-specific capabilities.
__exportStar(require("./host"), exports);
__exportStar(require("./ai-import"), exports);
__exportStar(require("./backup"), exports);
__exportStar(require("./bulk-ops"), exports);
__exportStar(require("./command-registry"), exports);
__exportStar(require("./excalidraw-utils"), exports);
__exportStar(require("./export-batch"), exports);
__exportStar(require("./export-utils"), exports);
__exportStar(require("./file-ops"), exports);
__exportStar(require("./fs-utils"), exports);
__exportStar(require("./git-helper"), exports);
__exportStar(require("./import-pack"), exports);
__exportStar(require("./libraries"), exports);
__exportStar(require("./markdown"), exports);
__exportStar(require("./path-utils"), exports);
__exportStar(require("./plugins"), exports);
__exportStar(require("./png-excalidraw"), exports);
__exportStar(require("./presentation"), exports);
__exportStar(require("./recents"), exports);
__exportStar(require("./review"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./settings"), exports);
__exportStar(require("./shortcuts"), exports);
__exportStar(require("./snippets"), exports);
__exportStar(require("./stats"), exports);
__exportStar(require("./style-presets"), exports);
__exportStar(require("./svg-import"), exports);
__exportStar(require("./templates"), exports);
__exportStar(require("./workspace-config"), exports);
__exportStar(require("./workspace"), exports);
