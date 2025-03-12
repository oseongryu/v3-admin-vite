<script lang="ts" setup>
import type { RouteRecordNameGeneric, RouteRecordRaw } from "vue-router"

interface Props {
  data: RouteRecordRaw[]
  isPressUpOrDown: boolean
}

const props = defineProps<Props>()

/** 선택된 메뉴 */
const modelValue = defineModel<RouteRecordNameGeneric | undefined>({ required: true })

const instance = getCurrentInstance()

const scrollbarHeight = ref<number>(0)

/** 메뉴 스타일 */
function itemStyle(item: RouteRecordRaw) {
  const flag = item.name === modelValue.value
  return {
    background: flag ? "var(--el-color-primary)" : "",
    color: flag ? "#ffffff" : ""
  }
}

/** 이사 오다  */
function handleMouseenter(item: RouteRecordRaw) {
  // 상단 또는 하단 키 및 마우스 센터 이벤트가 동시에 적용되면 상단 및 하단 키가 우선하고 함수의 할당 논리가 실행되지 않아야합니다.
  if (props.isPressUpOrDown) return
  modelValue.value = item.name
}

/** 두루마리보기 영역 높이 */
function getScrollbarHeight() {
  // el-scrollbar max-height="40vh"
  scrollbarHeight.value = Number((window.innerHeight * 0.4).toFixed(1))
}

/** 첨자에 따라 상단까지의 거리를 계산하십시오 */
function getScrollTop(index: number) {
  const currentInstance = instance?.proxy?.$refs[`resultItemRef${index}`] as HTMLDivElement[]
  if (!currentInstance) return 0
  const currentRef = currentInstance[0]
  // 128 = 两个 result-item （56 + 56 = 112）高度与上下 margin（8 + 8 = 16）大小之和
  const scrollTop = currentRef.offsetTop + 128
  return scrollTop > scrollbarHeight.value ? scrollTop - scrollbarHeight.value : 0
}

// 구성 요소 마운트 전에 창 크기 변경 이벤트 리스너 추가
onBeforeMount(() => {
  window.addEventListener("resize", getScrollbarHeight)
})

// 在组件挂载时立即计算滚动可视区高度
onMounted(() => {
  getScrollbarHeight()
})

// 구성 요소 제거 전에 창 크기 변경 이벤트 리스너 제거 제거
onBeforeUnmount(() => {
  window.removeEventListener("resize", getScrollbarHeight)
})

defineExpose({ getScrollTop })
</script>

<template>
  <!-- 외부 div를 삭제할 수 없으며 부모 구성 요소 클릭 이벤트를받는 데 사용됩니다. -->
  <div>
    <div
      v-for="(item, index) in props.data"
      :key="index"
      :ref="`resultItemRef${index}`"
      class="result-item"
      :style="itemStyle(item)"
      @mouseenter="handleMouseenter(item)"
    >
      <SvgIcon v-if="item.meta?.svgIcon" :name="item.meta.svgIcon" class="svg-icon" />
      <component v-else-if="item.meta?.elIcon" :is="item.meta.elIcon" class="el-icon" />
      <span class="result-item-title">
        {{ item.meta?.title }}
      </span>
      <SvgIcon v-if="modelValue && modelValue === item.name" name="keyboard-enter" class="svg-icon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.result-item {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 15px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  .svg-icon {
    min-width: 1em;
    font-size: 18px;
  }
  .el-icon {
    width: 1em;
    font-size: 18px;
  }
  &-title {
    flex: 1;
    margin-left: 12px;
    @extend %ellipsis;
  }
}
</style>
