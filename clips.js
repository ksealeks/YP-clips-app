const sources = [
  "assets/optimized/french-man-ep1-54.mp4",
  "assets/optimized/french-man-ep2-51.mp4",
  "assets/optimized/french-man-ep2-52.mp4",
  "assets/optimized/french-man-ep4-50.mp4",
  "assets/optimized/french-man-ep4-51.mp4",
];

const stories = [
  ["The French Man · Episode 1", "Yango Play series · Clip 54", "#a00b48"],
  ["The French Man · Episode 2", "Yango Play series · Clip 51", "#7a1de2"],
  ["The French Man · Episode 2", "Yango Play series · Clip 52", "#146fb6"],
  ["The French Man · Episode 4", "Yango Play series · Clip 50", "#d45b0a"],
  ["The French Man · Episode 4", "Yango Play series · Clip 51", "#8b144d"],
];

window.YANGO_CLIPS = sources.map((src, index) => {
  const [title, meta, color] = stories[index];
  return { id: `french-man-${index + 1}`, title, meta, color, src };
});
