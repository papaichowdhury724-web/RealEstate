// Walkthrough constants (kept tiny so the public site bundle stays light)
export const WT_IMAGES = {
  exterior: "/images/wt-house.jpg",
  foyer: "/images/wt-foyer.jpg",
};

// Position of the front door inside the exterior photo, in % of the image.
// The two door halves are cut out of the SAME photo at this rectangle,
// so the house you see is the house whose doors open.
export const DOOR_DEFAULT = { x: 42.3, y: 35.7, w: 15.6, h: 46.4 };

export const DEFAULT_WT = {
  letterbox: true,
  dust: true,
  grain: true,
  flare: true,
  sway: true,
  sceneLength: 95, // scroll distance per scene, in % of screen height
};
