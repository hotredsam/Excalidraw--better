module.exports = {
  onLoad: (ctx) => {
    console.log('[Hello World Plugin] Loaded!', ctx);
  },
  onUnload: () => {
    console.log('[Hello World Plugin] Unloaded!');
  }
};
