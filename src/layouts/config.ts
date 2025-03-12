import { LayoutModeEnum } from "@@/constants/app-key"
import { getLayoutsConfig } from "@@/utils/cache/local-storage"

/** 프로젝트 설정 타입 */
export interface LayoutsConfig {
  /** 설정 버튼 및 패널 표시 여부 */
  showSettings: boolean
  /** 레이아웃 모드 */
  layoutMode: LayoutModeEnum
  /** 태그 표시 여부 */
  showTagsView: boolean
  /** 로고 표시 여부 */
  showLogo: boolean
  /** 헤더 고정 여부 */
  fixedHeader: boolean
  /** 푸터 표시 여부 */
  showFooter: boolean
  /** 알림 표시 여부 */
  showNotify: boolean
  /** 테마 전환 버튼 표시 여부 */
  showThemeSwitch: boolean
  /** 전체 화면 버튼 표시 여부 */
  showScreenfull: boolean
  /** 검색 버튼 표시 여부 */
  showSearchMenu: boolean
  /** 태그 캐시 여부 */
  cacheTagsView: boolean
  /** 시스템 워터마크 활성화 */
  showWatermark: boolean
  /** 회색 모드 표시 여부 */
  showGreyMode: boolean
  /** 색약 모드 표시 여부 */
  showColorWeakness: boolean
}

/** 기본 설정 */
const DEFAULT_CONFIG: LayoutsConfig = {
  layoutMode: LayoutModeEnum.Left,
  showSettings: true,
  showTagsView: true,
  fixedHeader: true,
  showFooter: true,
  showLogo: true,
  showNotify: true,
  showThemeSwitch: true,
  showScreenfull: true,
  showSearchMenu: true,
  cacheTagsView: false,
  showWatermark: true,
  showGreyMode: false,
  showColorWeakness: false
}

/** 프로젝트 설정 */
export const layoutsConfig: LayoutsConfig = { ...DEFAULT_CONFIG, ...getLayoutsConfig() }
