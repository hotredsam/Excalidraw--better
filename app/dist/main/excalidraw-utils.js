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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExcalidrawFile = readExcalidrawFile;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const shared_1 = require("@excalibur/shared");
async function readExcalidrawFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.excalidraw' || extension === '.json') {
        const content = await fs.readFile(filePath, 'utf-8');
        return shared_1.ExcalidrawFileSchema.parse(JSON.parse(content));
    }
    if (extension === '.svg') {
        const content = await fs.readFile(filePath, 'utf-8');
        const match = content.match(/<!-- excalidraw-state: (.*?) -->/);
        if (match && match[1]) {
            try {
                return shared_1.ExcalidrawFileSchema.parse(JSON.parse(match[1]));
            }
            catch (err) {
                throw new Error('Failed to parse embedded Excalidraw data in SVG');
            }
        }
        throw new Error('No embedded Excalidraw data found in SVG');
    }
    if (extension === '.png') {
        throw new Error('PNG embedded scene extraction not supported yet. Use .excalidraw or .svg files.');
    }
    throw new Error(`Unsupported file type: ${extension}`);
}
