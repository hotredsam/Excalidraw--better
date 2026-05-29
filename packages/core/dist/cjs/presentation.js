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
exports.buildDeck = buildDeck;
exports.getDeck = getDeck;
exports.setSlideNotes = setSlideNotes;
exports.slideViewport = slideViewport;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
/**
 * Presentation support: derive an ordered slide deck from a scene's frames and
 * persist per-slide presenter notes alongside the workspace (in
 * `<workspace>/.excalibur/slides/`). Notes are keyed by slide id so they survive
 * scene edits as long as frame ids are stable.
 */
function notesFile(workspacePath, fileRel) {
    const safe = fileRel.replace(/[\\/]/g, '__');
    return path.join(workspacePath, '.excalibur', 'slides', `${safe}.json`);
}
function buildDeck(scene) {
    return { slides: (0, shared_1.extractSlidesFromScene)(scene) };
}
async function getDeck(workspacePath, fileRel, scene) {
    const deck = buildDeck(scene);
    const nf = notesFile(workspacePath, fileRel);
    if (await fs.pathExists(nf)) {
        try {
            const notes = await fs.readJson(nf);
            deck.slides = deck.slides.map((s) => ({ ...s, notes: notes[s.id] ?? '' }));
        }
        catch {
            // ignore malformed notes
        }
    }
    return deck;
}
async function setSlideNotes(workspacePath, fileRel, slideId, notes) {
    const nf = notesFile(workspacePath, fileRel);
    let all = {};
    if (await fs.pathExists(nf)) {
        try {
            all = await fs.readJson(nf);
        }
        catch {
            all = {};
        }
    }
    if (notes.trim())
        all[slideId] = notes;
    else
        delete all[slideId];
    await (0, fs_utils_1.writeJsonAtomic)(nf, all);
}
/** Compute an export viewport (with padding) for a single slide. */
function slideViewport(slide, padding = 20) {
    return {
        x: slide.x - padding,
        y: slide.y - padding,
        width: slide.width + padding * 2,
        height: slide.height + padding * 2,
    };
}
