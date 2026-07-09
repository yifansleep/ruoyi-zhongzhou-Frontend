import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, PlanQueryParams, NursingPlan, ProjectPlan } from '@/types'

// 查询护理计划列表
export function listPlan(query: PlanQueryParams): Promise<TableDataInfo<NursingPlan[]>> {
  return request({
    url: '/nursing/plan/list',
    method: 'get',
    params: query
  })
}

// 查询护理计划详细
export function getPlan(id: number): Promise<AjaxResult<NursingPlan>> {
  return request({
    url: '/nursing/plan/' + id,
    method: 'get'
  })
}

// 查询所有护理计划
export function listAllPlan(): Promise<AjaxResult<NursingPlan[]>> {
  return request({
    url: '/nursing/plan/all',
    method: 'get'
  })
}

// 新增护理计划
export function addPlan(data: NursingPlan): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan',
    method: 'post',
    data: data
  })
}

// 修改护理计划
export function updatePlan(data: NursingPlan): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan',
    method: 'put',
    data: data
  })
}

// 删除护理计划
export function delPlan(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan/' + id,
    method: 'delete'
  })
}

// 导出护理计划
export function exportPlan(query: PlanQueryParams): Promise<void> {
  return request({
    url: '/nursing/plan/export',
    method: 'post',
    responseType: 'blob',
    params: query
  })
}

// 查询计划项目关联列表
export function listPlanProject(planId: number): Promise<AjaxResult<ProjectPlan[]>> {
  return request({
    url: '/nursing/plan/project/list',
    method: 'get',
    params: { planId }
  })
}

// 新增计划项目关联
export function addPlanProject(data: ProjectPlan): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan/project',
    method: 'post',
    data: data
  })
}

// 修改计划项目关联
export function updatePlanProject(data: ProjectPlan): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan/project',
    method: 'put',
    data: data
  })
}

// 删除计划项目关联
export function delPlanProject(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/nursing/plan/project/' + id,
    method: 'delete'
  })
}
