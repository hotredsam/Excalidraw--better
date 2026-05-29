import * as path from 'path';
import * as fs from 'fs-extra';
import { extractSlidesFromScene } from '@excalibur/shared';
import { writeJsonAtomic } from './fs-utils';
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
export function buildDeck(scene) {
    return { slides: extractSlidesFromScene(scene) };
}
export async function getDeck(workspacePath, fileRel, scene) {
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
export async function setSlideNotes(workspacePath, fileRel, slideId, notes) {
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
    await writeJsonAtomic(nf, all);
}
/** Compute an export viewport (with padding) for a single slide. */
export function slideViewport(slide, padding = 20) {
    return {
        x: slide.x - padding,
        y: slide.y - padding,
        width: slide.width + padding * 2,
        height: slide.height + padding * 2,
    };
}
