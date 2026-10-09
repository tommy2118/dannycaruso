// =============================================================================
// STIMULUS APPLICATION
// Danny Caruso
// =============================================================================

import { Application } from "@hotwired/stimulus";

const application = Application.start();
application.debug = false;
window.Stimulus = application;

import StageController from "./controllers/stage_controller.js";
application.register("stage", StageController);

import ChapterController from "./controllers/chapter_controller.js";
application.register("chapter", ChapterController);

export { application };
