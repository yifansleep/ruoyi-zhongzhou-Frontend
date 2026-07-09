import type { PageDomain, BaseEntity } from "../common";

/** 护理计划查询参数 */
export interface PlanQueryParams extends PageDomain {
  /** 计划名称 */
  planName?: string;
  /** 状态（0：禁用，1：启用） */
  status?: number;
}

/** 护理计划信息 */
export interface NursingPlan extends BaseEntity {
  /** 编号 */
  id?: number;
  /** 计划名称 */
  planName?: string;
  /** 排序号 */
  sortNo?: number;
  /** 状态（0：禁用，1：启用） */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** 计划项目关联查询参数 */
export interface ProjectPlanQueryParams {
  /** 计划ID */
  planId?: number;
}

/** 计划项目关联信息 */
export interface ProjectPlan {
  /** 编号 */
  id?: number;
  /** 计划ID */
  planId?: number;
  /** 项目ID */
  projectId?: number;
  /** 项目名称 */
  projectName?: string;
  /** 计划执行时间 */
  executeTime?: string;
  /** 执行周期（0：天，1：周，2：月） */
  executeCycle?: number;
  /** 执行频次 */
  executeFrequency?: number;
  /** 备注 */
  remark?: string;
  createBy?: string;
  createTime?: string;
}
