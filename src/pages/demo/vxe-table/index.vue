<script lang="ts" setup>
import type { TableResponseData } from "@@/apis/tables/type"
import type { ElMessageBoxOptions } from "element-plus"
import type { VxeFormInstance, VxeFormProps, VxeGridInstance, VxeGridProps, VxeModalInstance, VxeModalProps } from "vxe-table"
import { deleteTableDataApi, getTableDataApi } from "@@/apis/tables"
import { RoleColumnSlots } from "./tsx/RoleColumnSlots"
import { StatusColumnSlots } from "./tsx/StatusColumnSlots"

defineOptions({
  // 현재 구성 요소의 이름을 지정하십시오
  name: "VxeTable"
})

// #region vxe-grid
interface RowMeta {
  id: number
  username: string
  roles: string
  phone: string
  email: string
  status: boolean
  createTime: string
  /** vxe-table 自动添加上去的属性 */
  _VXE_ID?: string
}
const xGridDom = ref<VxeGridInstance>()
const xGridOpt: VxeGridProps = reactive({
  loading: true,
  autoResize: true,
  /** Pagination 구성 항목 */
  pagerConfig: {
    align: "right"
  },
  /** 구성 항목 양식 */
  formConfig: {
    items: [
      {
        field: "username",
        itemRender: {
          name: "$input",
          props: {
            placeholder: "用户名",
            clearable: true
          }
        }
      },
      {
        field: "phone",
        itemRender: {
          name: "$input",
          props: {
            placeholder: "手机号",
            clearable: true
          }
        }
      },
      {
        itemRender: {
          name: "$buttons",
          children: [
            {
              props: {
                type: "submit",
                content: "查询",
                status: "primary"
              }
            },
            {
              props: {
                type: "reset",
                content: "重置"
              }
            }
          ]
        }
      }
    ]
  },
  /** 도구 모음 구성 */
  toolbarConfig: {
    refresh: true,
    custom: true,
    slots: {
      buttons: "toolbar-btns"
    }
  },
  /** 사용자 정의 열 구성 항목 */
  customConfig: {
    /** 열 선택 허용 여부 */
    checkMethod: ({ column }) => !["username"].includes(column.field)
  },
  /** 열 구성 */
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "username",
      title: "用户名"
    },
    {
      field: "roles",
      title: "角色",
      /** 유형이있는 열과 함께 사용 : "html"은 오류가 발생하므로 TSX를 사용하여 구현 */
      slots: RoleColumnSlots
    },
    {
      field: "phone",
      title: "手机号"
    },
    {
      field: "email",
      title: "邮箱"
    },
    {
      field: "status",
      title: "状态",
      slots: StatusColumnSlots
    },
    {
      field: "createTime",
      title: "创建时间"
    },
    {
      title: "操作",
      width: "150px",
      fixed: "right",
      showOverflow: false,
      slots: {
        default: "row-operate"
      }
    }
  ],
  /** 数据代理配置项（基于 Promise API） */
  proxyConfig: {
    /** 동적 일련 번호 프록시 활성화 */
    seq: true,
    /** 프록시 양식 */
    form: true,
    /** 자동로드 되든 기본값이 사실입니다 */
    autoLoad: true,
    props: {
      total: "total"
    },
    ajax: {
      query: ({ page, form }) => {
        xGridOpt.loading = true
        crudStore.clearTable()
        return new Promise((resolve) => {
          let total = 0
          let result: RowMeta[] = []
          // 데이터로드
          const callback = (res: TableResponseData) => {
            if (res?.data) {
              // 총 번호
              total = res.data.total
              // 나열 데이터
              result = res.data.list
            }
            xGridOpt.loading = false
            // 반환 값에는 형식 요구 사항이 있습니다. 자세한 내용은 공식 VXE-Table 문서를 참조하십시오.
            resolve({ total, result })
          }
          // 인터페이스에 필요한 매개 변수
          const params = {
            username: form.username || "",
            phone: form.phone || "",
            size: page.pageSize,
            currentPage: page.currentPage
          }
          // 인터페이스를 호출합니다
          getTableDataApi(params).then(callback).catch(callback)
        })
      }
    }
  }
})
// #endregion

// #region vxe-modal
const xModalDom = ref<VxeModalInstance>()
const xModalOpt: VxeModalProps = reactive({
  title: "",
  showClose: true,
  escClosable: true,
  maskClosable: true,
  beforeHideMethod: () => {
    xFormDom.value?.clearValidate()
    return Promise.resolve()
  }
})
// #endregion

// #region vxe-form
const xFormDom = ref<VxeFormInstance>()
const xFormOpt: VxeFormProps = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  /** 제목 콜론 표시 여부 */
  titleColon: false,
  /** 양식 데이터 */
  data: {
    username: "",
    password: ""
  },
  /** 항목 목록 */
  items: [
    {
      field: "username",
      title: "用户名",
      itemRender: {
        name: "$input",
        props: {
          placeholder: "请输入"
        }
      }
    },
    {
      field: "password",
      title: "密码",
      itemRender: {
        name: "$input",
        props: {
          placeholder: "请输入"
        }
      }
    },
    {
      align: "right",
      itemRender: {
        name: "$buttons",
        children: [
          {
            props: {
              content: "取消"
            },
            events: {
              click: () => xModalDom.value?.close()
            }
          },
          {
            props: {
              type: "submit",
              content: "确定",
              status: "primary"
            },
            events: {
              click: () => crudStore.onSubmitForm()
            }
          }
        ]
      }
    }
  ],
  /** 검증 규칙 */
  rules: {
    username: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入")
            case !itemValue.trim():
              return new Error("空格无效")
          }
        }
      }
    ],
    password: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入")
            case !itemValue.trim():
              return new Error("空格无效")
          }
        }
      }
    ]
  }
})
// #endregion

// #region 增删改查
const crudStore = reactive({
  /** 表单类型，true 表示修改，false 表示新增 */
  isUpdate: true,
  /**로드 테이블 데이터 */
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  /** 명확한 테이블 데이터 */
  clearTable: () => xGridDom.value?.reloadData([]),
  /** 팝업 창을 표시하려면 클릭하십시오 */
  onShowModal: (row?: RowMeta) => {
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = "修改用户"
      // 과제
      xFormOpt.data.username = row.username
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = "新增用户"
    }
    // 양식 항목을 비활성화합니다
    const props = xFormOpt.items?.[0]?.itemRender?.props
    props && (props.disabled = crudStore.isUpdate)
    xModalDom.value?.open()
    nextTick(() => {
      !crudStore.isUpdate && xFormDom.value?.reset()
      xFormDom.value?.clearValidate()
    })
  },
  /** OK 및 저장 */
  onSubmitForm: () => {
    if (xFormOpt.loading) return
    xFormDom.value?.validate((errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success("操作成功")
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      if (crudStore.isUpdate) {
        // 시뮬레이션 호출은 인터페이스 수정에 성공했습니다.
        setTimeout(() => callback(), 1000)
      } else {
        // 새 인터페이스의 시뮬레이션 호출이 성공했습니다.
        setTimeout(() => callback(), 1000)
      }
    })
  },
  /** 추가 후 마지막 페이지로 이동하면 */
  afterInsert: () => {
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager) {
      const currentTotal = pager.currentPage * pager.pageSize
      if (currentTotal === pager.total) {
        ++pager.currentPage
      }
    }
  },
  /** 삭제  */
  onDelete: (row: RowMeta) => {
    const tip = `确定 <strong style="color: var(--el-color-danger);"> 删除 </strong> 用户 <strong style="color: var(--el-color-primary);"> ${row.username} </strong> ？`
    const config: ElMessageBoxOptions = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: "取消",
      confirmButtonText: "确定",
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(tip, "提示", config).then(() => {
      deleteTableDataApi(row.id).then(() => {
        ElMessage.success("删除成功")
        crudStore.afterDelete()
        crudStore.commitQuery()
      })
    })
  },
  /** 삭제 후 이전 페이지로 돌아갑니다 */
  afterDelete: () => {
    const tableData: RowMeta[] = xGridDom.value!.getData()
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager && pager.currentPage > 1 && tableData.length === 1) {
      --pager.currentPage
    }
  },
  /** 더 많은 사용자 정의 방법 */
  moreFn: () => {}
})
// #endregion
</script>

<template>
  <div class="app-container">
    <el-alert
      title="数据来源"
      type="success"
      description="由 Apifox 提供在线 Mock，数据不具备真实性，仅供简单的 CRUD 操作演示。"
      show-icon
    />
    <!-- 테이블 -->
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <!-- 왼쪽의 버튼 목록 -->
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          새로운 사용자
        </vxe-button>
        <vxe-button status="danger" icon="vxe-icon-delete">
          배치 삭제
        </vxe-button>
      </template>
      <!--작동 -->
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">
          개정하다
        </el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">
          삭제
        </el-button>
      </template>
    </vxe-grid>
    <!-- 팝업 창 -->
    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <!-- 양식 -->
      <vxe-form ref="xFormDom" v-bind="xFormOpt" />
    </vxe-modal>
  </div>
</template>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}
</style>
