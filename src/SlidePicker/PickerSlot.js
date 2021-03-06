import swipe from '../internal/directives/swipe';
import translateUtil from '../utils/translate';
import { transitionEnd } from '../utils/dom';

export default {
  name: 'mu-slide-picker-slot',
  directives: {
    swipe
  },
  props: {
    divider: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: ''
    },
    values: {
      type: Array,
      default () {
        return [];
      }
    },
    itemHeight: {
      type: Number,
      default: 36
    },
    value: {},
    textAlign: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: ''
    },
    visibleItemCount: {
      type: Number,
      default: 5
    }
  },
  data () {
    return {
      animate: false,
      startTop: 0,
      velocityTranslate: 0,
      prevTranslate: 0,
      moving: false
    };
  },
  computed: {
    contentHeight () {
      return this.itemHeight * this.visibleItemCount;
    },
    valueIndex () {
      const {
        value,
        getValueByItem
      } = this;

      return this.values.findIndex(item => getValueByItem(item) === value);
    },
    dragRange () {
      const values = this.values;
      const visibleItemCount = this.visibleItemCount;
      return [-this.itemHeight * (values.length - Math.ceil(visibleItemCount / 2)), this.itemHeight * Math.floor(visibleItemCount / 2)];
    }
  },
  watch: {
    values (newVal) {
      if (this.valueIndex === -1) {
        const item = (newVal || [])[0];

        this.updateValue(item);
      }
    },
    value () {
      this.doOnValueChange();
    }
  },
  mounted () {
    if (!this.divider) {
      this.doOnValueChange();
    }
  },
  methods: {
    value2Translate () {
      let { valueIndex } = this;
      const offset = Math.floor(this.visibleItemCount / 2);

      if (valueIndex === -1) {
        valueIndex = 0;
        this.updateValue(this.values[0]);
      }
      return (valueIndex - offset) * -this.itemHeight;
    },
    translate2Value (translate) {
      translate = Math.round(translate / this.itemHeight) * this.itemHeight;
      const index = -(translate - Math.floor(this.visibleItemCount / 2) * this.itemHeight) / this.itemHeight;
      return this.values[index];
    },
    doOnValueChange () {
      const wrapper = this.$refs.wrapper;
      translateUtil.translateElement(wrapper, null, this.value2Translate());
    },
    doOnValuesChange () {
      const el = this.$el;
      const items = el.querySelectorAll('.mu-slide-picker-item');
      Array.prototype.forEach.call(items, (item, index) => {
        translateUtil.translateElement(item, null, this.itemHeight * index);
      });
    },
    handleStart () {
      this.startTop = translateUtil.getElementTranslate(this.$refs.wrapper).top;
    },
    handleMove (pos, drag, event) {
      this.moving = true;
      const el = this.$refs.wrapper;
      const translate = this.startTop + pos.y;
      translateUtil.translateElement(el, 0, translate);
      this.velocityTranslate = translate - this.prevTranslate || translate;
      this.prevTranslate = translate;
    },
    handleEnd (pos, drag, event) {
      const el = this.$refs.wrapper;
      const momentumRatio = 7;
      const currentTranslate = translateUtil.getElementTranslate(el).top;
      let momentumTranslate;
      if (pos.time < 300) {
        momentumTranslate = currentTranslate + this.velocityTranslate * momentumRatio;
      }
      const dragRange = this.dragRange;
      this.animate = true;
      transitionEnd(el, () => {
        this.moving = false;
        this.animate = false;
      });
      this.$nextTick(() => {
        let translate;
        if (momentumTranslate) {
          translate = Math.round(momentumTranslate / this.itemHeight) * this.itemHeight;
        } else {
          translate = Math.round(currentTranslate / this.itemHeight) * this.itemHeight;
        }
        translate = Math.max(Math.min(translate, dragRange[1]), dragRange[0]);
        translateUtil.translateElement(el, null, translate);

        const item = this.translate2Value(translate);

        this.updateValue(item);
      });
    },
    getValueByItem (item) {
      return typeof item === 'object'
        ? item.value
        : item;
    },
    updateValue (item) {
      const value = this.getValueByItem(item);

      if (value === this.value) return;
      this.$emit('update:value', value);
      this.$emit('change', item);
    }
  },
  render (h) {
    return h('div', {
      staticClass: 'mu-slide-picker-slot',
      class: {
        'mu-slide-picker-slot-divider': this.divider
      },
      style: {
        width: this.width
      },
      on: {
        touchmove: (e) => {
          e.preventDefault();
        }
      },
      directives: this.divider ? [] : [{
        name: 'swipe',
        value: {
          start: this.handleStart,
          move: this.handleMove,
          end: this.handleEnd
        }
      }]
    }, [
      this.divider
        ? h('div', {}, this.content)
        : h('div', {
          staticClass: 'mu-slide-picker-slot-wrapper',
          class: {
            animate: this.animate
          },
          style: {
            height: this.contentHeight + 'px'
          },
          ref: 'wrapper'
        }, this.values.map((item, index) => {
          return h('div', {
            staticClass: 'mu-slide-picker-item',
            style: {
              'text-align': this.textAlign
            },
            class: {
              selected: this.valueIndex === index
            },
            key: 'pick-slot-' + index,
            on: {
              click: () => {
                this.moving || this.updateValue(item);
              }
            }
          }, item.text || item);
        }))
    ]);
  }
};
