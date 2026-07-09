import type { PageDomain, BaseEntity } from "../common";

/** 护理等级查询参数 */
export interface LevelQueryParams extends PageDomain {
  /** 等级名称 */
  name?: string;
  /** 护理计划ID */
  planId?: number;
  /** 状态（0：禁用，1：启用） */
  status?: number;
}

/** 护理等级信息 */
export interface NursingLevel extends BaseEntity {
  /** 编号 */
  id?: number;
  /** 等级名称 */
  name?: string;
  /** 关联护理计划ID */
  planId?: number;
  /** 护理计划名称 */
  planName?: string;
  /** 收费标准（元） */
  fee?: number;
  /** 等级描述 */
  description?: string;
  /** 状态（0：禁用，1：启用） */
  status?: number;
  /** 备注 */
  remark?: string;
}
