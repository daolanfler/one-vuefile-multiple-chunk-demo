<template>
  <el-dialog
    class="omega-dialog"
    v-model="isVisible"
    :append-to-body="false"
    :top="top"
    :close-on-click-modal="closeOnClickModal"
    :fullscreen="isFullscreen"
    @closed="onDialogClosed"
    v-bind="$attrs"
  >
    <template #header>
      <slot name="title">
        <span class="el-dialog__title">{{ title }}</span>
      </slot>
      <omega-icon
        @click="evFullScreenClick"
        class="omega-dialog-fullscreen-icon"
        :symbolId="fullscreenSymbolId"
        v-if="hasFullScreen"
      />
    </template>
    <slot />
    <template v-if="hasFooter" #footer>
      <slot name="footer" />
      <el-button @click="cancel">
        取 消
      </el-button>
      <el-button type="primary" @click="confirm">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "OmegaDialog",
  props: {
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    top: {
      type: String,
      default: "10vh"
    },
    fullscreen: {
      type: Boolean,
      default: false
    },

    // 扩展的配置
    // confirm 之前的验证
    // @return Promise {Boolean|Data} 确定 confirm 是否继续
    onBeforeConfirm: {
      type: Function,
      default: function () {
        return Promise.resolve(true);
      }
    },
    successMsg: {
      type: String,
      default: i18n("操作成功！")
    },
    hasFooter: {
      type: Boolean,
      default: true
    },
    hasFullScreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 对 visable 的使用仅仅是为了保存动画效果
      isVisible: true,
      isFullscreen: this.fullscreen
    };
  },
  computed: {
    fullscreenSymbolId() {
      return this.isFullscreen ? "close-fullscreen-lin" : "fullscreen-lin";
    }
  },
  methods: {
    evFullScreenClick() {
      this.isFullscreen = !this.isFullscreen;
    },
    cancel() {
      this.isVisible = false;
    },
    async confirm() {
      // onBeforeConfirm 有 http 请求，错误消息提示会由 base/modules/http 模块来消息处理
      // 成功消息会由 onBeforeConfirm 的返回值情况来显示
      let ret = await this.onBeforeConfirm();

      if (ret !== false) {
        this.isVisible = false;
        // 消息提示
        this.successMsg && this.$message.success(this.successMsg);

      }
    },
    onDialogClosed() {
    },
    // 使用 eventBus 不需要下面的
    // fire(...argv) {
    //   let cvm = this;
    //   do {
    //     cvm.$emit(...argv);
    //   } while (cvm && (cvm = cvm.$parent));
    // },
    i18n
  }
};
</script>

<style lang="scss">
.omega-dialog {
  :not(.is-fullscreen) .el-dialog__body {
    min-height: 300px;
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .is-fullscreen .el-dialog__body {
    height: calc(100% - 124px);
    overflow: auto;
    box-sizing: border-box;
  }
}
.omega-dialog-fullscreen-icon {
  position: absolute;
  top: 20px;
  right: 55px;
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  transition-duration: 0.2s;
  &:hover {
    color: #0066cc;
  }
  &:active {
    color: #5991c9;
  }
}
</style>
