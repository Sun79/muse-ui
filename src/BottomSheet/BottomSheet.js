import popup from '../internal/mixins/popup';
import { BottomSheetTransition } from '../internal/transitions';

export default {
  name: 'mu-bottom-sheet',
  mixins: [popup],
  props: {
    lockScroll: {
      type: Boolean,
      default: true
    },
    inset: Boolean
  },
  render (h) {
    return h(BottomSheetTransition, [
      this.open ? h('div', {
        staticClass: 'mu-bottom-sheet',
        class: {
          'mu-bottom-sheet--inset': this.inset
        },
        style: {
          'z-index': this.zIndex
        }
      }, this.$slots.default) : undefined
    ]);
  }
};
