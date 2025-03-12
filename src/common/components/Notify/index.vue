<script lang="ts" setup>
import type { NotifyItem } from "./type"
import { Bell } from "@element-plus/icons-vue"
import { messageData, notifyData, todoData } from "./data"
import List from "./List.vue"

type TabName = "通知" | "消息" | "待办"

interface DataItem {
  name: TabName
  type: "primary" | "success" | "warning" | "danger" | "info"
  list: NotifyItem[]
}

/** 각도 마크의 현재 값 */
const badgeValue = computed(() => data.value.reduce((sum, item) => sum + item.list.length, 0))

/** 최대 각도 마커 */
const badgeMax = 99

/** 패널 너비 */
const popoverWidth = 350

/** 当前 Tab */
const activeName = ref<TabName>("通知")

/** 모든 데이터 */
const data = ref<DataItem[]>([
  // 알림 데이터
  {
    name: "通知",
    type: "primary",
    list: notifyData
  },
  // 메시지 데이터
  {
    name: "消息",
    type: "danger",
    list: messageData
  },
  // 할 일 데이터
  {
    name: "待办",
    type: "warning",
    list: todoData
  }
])

function handleHistory() {
  ElMessage.success(`跳转到${activeName.value}历史页面`)
}
</script>

<template>
  <div class="notify">
    <el-popover placement="bottom" :width="popoverWidth" trigger="click">
      <template #reference>
        <el-badge :value="badgeValue" :max="badgeMax" :hidden="badgeValue === 0">
          <el-tooltip effect="dark" content="消息通知" placement="bottom">
            <el-icon :size="20">
              <Bell />
            </el-icon>
          </el-tooltip>
        </el-badge>
      </template>
      <template #default>
        <el-tabs v-model="activeName" class="demo-tabs" stretch>
          <el-tab-pane v-for="(item, index) in data" :key="index" :name="item.name">
            <template #label>
              {{ item.name }}
              <el-badge :value="item.list.length" :max="badgeMax" :type="item.type" />
            </template>
            <el-scrollbar height="400px">
              <List :data="item.list" />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
        <div class="notify-history">
          <el-button link @click="handleHistory">
            查看{{ activeName }}历史
          </el-button>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.notify-history {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}
</style>
