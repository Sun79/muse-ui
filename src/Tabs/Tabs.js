import { isNotNull } from '../utils';
import resize from '../internal/directives/resize';
import color from '../internal/mixins/color';
import translateUtils from '../utils/translate';
import { transitionEnd } from '../utils/dom';

export default {
  name: 'mu-tabs',
  mixins: [color],
  provide () {
    return {
      tabClick: this.handleTabClick,
      getDefaultVal: this.getDefaultVal,
      addTab: this.addTab,
      removeTab: this.removeTab,
      setTabHighLineStyle: this.setTabHighLineStyle,
      getActiveValue: this.getActiveValue,
      getActiveColor: this.getActiveColor,
      getTabsInverse: this.getInverse
    };
  },
  props: {
    inverse: Boolean,
    indicatorColor: String,
    fullWidth: Boolean,
    center: Boolean,
    value: {}
  },
  data () {
    return {
      tabs: [],
      activeValue: isNotNull(this.value) ? this.value : 0
    };
  },
  created () {
    this.tabIndex = 0;
  },
  mounted () {
    this.setTabHighLineStyle(true);
  },
  updated () {
    this.setTabHighLineStyle();
  },
  methods: {
    handleTabClick (value, tab) {
      if (this.activeValue !== value) {
        this.activeValue = value;
        this.$emit('update:value', value);
        this.$emit('change', value);
      }
    },
    getActiveValue () {
      return this.activeValue;
    },
    getDefaultVal () {
      return this.tabIndex++;
    },
    getActiveColor () {
      return this.inverse ? {
        className: this.getNormalColorClass(this.color, true),
        color: this.getColor(this.color)
      } : { className: '', color: '' };
    },
    getInverse () {
      return this.inverse;
    },
    addTab (tab) {
      const index = this.$children.indexOf(tab);
      return index === -1 ? this.tabs.push(tab) : this.tabs.splice(index, 0, tab);
    },
    removeTab (tab) {
      const index = this.tabs.indexOf(tab);
      if (index === -1) return;
      this.tabs.splice(index, 1);
    },
    getActiveTab () {
      return this.tabs.filter((tab) => tab.active)[0];
    },
    setTabHighLineStyle (disabledTransition = false) {
      const activeTab = this.getActiveTab();
      if (!activeTab || !this.$refs.line || !activeTab.$el) return;
      const el = activeTab.$el;
      const lineEl = this.$refs.line;
      const rect = el.getBoundingClientRect();
      const tabsRect = this.$el.getBoundingClientRect();
      if (disabledTransition) lineEl.style.transition = 'none';
      lineEl.style.width = rect.width + 'px';
      translateUtils.translateElement(lineEl, rect.left - tabsRect.left, 0);
      if (disabledTransition) {
        // 不能使用微任务，微任务会在渲染之前执行，导致禁用transition失效
        setTimeout(() => {
          lineEl.style.transition = '';
        }, 0);
      }
    },
    handleWindowResize () {
      if (!this.tabs.length) return;
      const { $el: el } = this.tabs[0];
      // 防止重复添加transitionend事件监听器
      if (el.__hasTransitionEndListener__) return;
      el.__hasTransitionEndListener__ = true;
      // transition结束后再调整位置
      transitionEnd(el, () => {
        delete el.__hasTransitionEndListener__;
        this.setTabHighLineStyle();
      });
    }
  },
  watch: {
    value (val) {
      this.activeValue = val;
    },
    activeValue () {
      this.setTabHighLineStyle();
    }
  },
  directives: {
    resize
  },
  render (h) {
    return h('div', {
      staticClass: `mu-tabs ${!this.inverse ? this.getColorClass(false) : ''}`,
      class: {
        'mu-tabs-full-width': this.fullWidth,
        'mu-tabs-center': this.center,
        'mu-tabs-inverse': this.inverse
      },
      style: {
        'background-color': !this.inverse ? this.getColor(this.color) : ''
      },
      directives: [{
        name: 'resize',
        value: {
          value: this.handleWindowResize,
          quiet: true
        }
      }]
    }, [
      this.$slots.default,
      h('span', {
        staticClass: `mu-tab-link-highlight ${this.getNormalColorClass(this.indicatorColor, false, false)}`,
        style: {
          'background-color': this.getColor(this.indicatorColor)
        },
        ref: 'line'
      })
    ]);
  }
};
