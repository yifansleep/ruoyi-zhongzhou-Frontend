<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划名称" prop="planName">
        <el-input
          v-model="queryParams.planName"
          placeholder="请输入计划名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['nursing:plan:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['nursing:plan:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['nursing:plan:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['nursing:plan:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="计划名称" align="center" prop="planName" show-overflow-tooltip />
      <el-table-column label="排序号" align="center" prop="sortNo" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewProject(scope.row)" v-hasPermi="['nursing:plan:list']">项目</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['nursing:plan:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['nursing:plan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改护理计划对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="form.sortNo" :min="0" controls-position="right" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计划项目关联对话框 -->
    <el-dialog title="计划项目关联" v-model="projectOpen" width="800px" append-to-body>
      <el-form :model="projectQueryParams" :inline="true">
        <el-form-item label="护理项目">
          <el-input v-model="projectSearchName" placeholder="请输入项目名称" clearable @keyup.enter="handleProjectSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleProjectSearch">搜索</el-button>
          <el-button type="primary" icon="Plus" @click="handleAddProject" v-hasPermi="['nursing:plan:add']">新增</el-button>
        </el-form-item>
      </el-form>
      
      <el-table v-loading="projectLoading" :data="projectList" max-height="300">
        <el-table-column label="项目名称" align="center" prop="projectName" show-overflow-tooltip />
        <el-table-column label="执行时间" align="center" prop="executeTime" width="120">
          <template #default="scope">
            {{ scope.row.executeTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="执行周期" align="center" prop="executeCycle" width="100">
          <template #default="scope">
            {{ getCycleText(scope.row.executeCycle) }}
          </template>
        </el-table-column>
        <el-table-column label="执行频次" align="center" prop="executeFrequency" width="80" />
        <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleEditProject(scope.row)" v-hasPermi="['nursing:plan:edit']">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDeleteProject(scope.row)" v-hasPermi="['nursing:plan:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加或修改计划项目关联对话框 -->
    <el-dialog :title="projectTitle" v-model="projectFormOpen" width="500px" append-to-body>
      <el-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-width="100px">
        <el-form-item label="护理项目" prop="projectId">
          <el-select v-model="projectForm.projectId" placeholder="请选择护理项目" filterable style="width: 100%">
            <el-option
              v-for="item in availableProjects"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间" prop="executeTime">
          <el-time-picker
            v-model="projectForm.executeTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="请选择执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="执行周期" prop="executeCycle">
          <el-select v-model="projectForm.executeCycle" placeholder="请选择执行周期">
            <el-option label="每天" :value="0" />
            <el-option label="每周" :value="1" />
            <el-option label="每月" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行频次" prop="executeFrequency">
          <el-input-number v-model="projectForm.executeFrequency" :min="1" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="projectForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitProjectForm">确 定</el-button>
          <el-button @click="cancelProjectForm">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="NursingPlan">
import type { NursingPlan, PlanQueryParams, ProjectPlan } from "@/types/api/nursing/plan"
import { listPlan, getPlan, delPlan, addPlan, updatePlan, exportPlan, listPlanProject, addPlanProject, updatePlanProject, delPlanProject } from "@/api/nursing/plan"
import { listProject } from "@/api/serve/project"
import type { NursingProject } from "@/types/api/serve/project"

const { proxy } = getCurrentInstance()

const planList = ref<NursingPlan[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

// 计划项目关联
const projectOpen = ref<boolean>(false)
const projectLoading = ref<boolean>(false)
const projectList = ref<ProjectPlan[]>([])
const projectQueryParams = ref({ planId: 0 })
const currentPlanId = ref<number>()
const projectSearchName = ref<string>('')
const availableProjects = ref<NursingProject[]>([])

// 计划项目表单
const projectFormOpen = ref<boolean>(false)
const projectTitle = ref<string>("")
const projectForm = ref<ProjectPlan>({
  id: undefined,
  planId: undefined,
  projectId: undefined,
  executeTime: '',
  executeCycle: 0,
  executeFrequency: 1,
  remark: ''
})

const data = reactive({
  form: {} as NursingPlan,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    planName: undefined,
    status: undefined,
  } as PlanQueryParams,
  rules: {
    planName: [{ required: true, message: "计划名称不能为空", trigger: "blur" }],
  }
})

const projectRules = {
  projectId: [{ required: true, message: "请选择护理项目", trigger: "change" }],
  executeCycle: [{ required: true, message: "请选择执行周期", trigger: "change" }],
  executeFrequency: [{ required: true, message: "请输入执行频次", trigger: "blur" }],
}

const { queryParams, form, rules } = toRefs(data)

/** 查询护理计划列表 */
function getList() {
  loading.value = true
  listPlan(queryParams.value).then(response => {
    planList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    planName: null,
    sortNo: null,
    status: 1,
    remark: null,
  }
  proxy.resetForm("planRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.status = undefined
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NursingPlan[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加护理计划"
}

/** 修改按钮操作 */
function handleUpdate(row: NursingPlan) {
  reset()
  const _id = row.id || ids.value[0]
  getPlan(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改护理计划"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["planRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updatePlan(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPlan(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: NursingPlan) {
  const _ids = row.id || ids.value
  const _idsStr = Array.isArray(_ids) ? _ids.join(',') : _ids
  proxy.$modal.confirm('是否确认删除护理计划编号为"' + _idsStr + '"的数据项？').then(function() {
    return delPlan(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm("是否确认导出所有护理计划数据项？").then(() => {
    exportPlan(queryParams.value).then((response: any) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `护理计划_${Date.now()}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    })
  })
}

// 计划项目关联相关方法
/** 查看计划项目 */
function handleViewProject(row: NursingPlan) {
  currentPlanId.value = row.id
  projectQueryParams.value.planId = row.id
  projectOpen.value = true
  getProjectList()
}

/** 获取计划项目列表 */
function getProjectList() {
  if (!currentPlanId.value) return
  projectLoading.value = true
  listPlanProject(currentPlanId.value).then(response => {
    projectList.value = response.data || []
  }).catch(() => {
    projectList.value = []
  }).finally(() => {
    projectLoading.value = false
  })
}

/** 获取执行周期文本 */
function getCycleText(cycle: number | undefined) {
  if (cycle === undefined || cycle === null) return '-'
  const cycleMap: Record<number, string> = { 0: '每天', 1: '每周', 2: '每月' }
  return cycleMap[cycle] || '-'
}

/** 项目搜索 */
function handleProjectSearch() {
  projectLoading.value = true
  listProject({ name: projectSearchName.value }).then(response => {
    availableProjects.value = response.rows
    projectLoading.value = false
  })
}

/** 新增项目关联 */
function handleAddProject() {
  // 先加载可选项目列表
  listProject({}).then(response => {
    availableProjects.value = response.rows
  })
  projectForm.value = {
    id: undefined,
    planId: currentPlanId.value,
    projectId: undefined,
    executeTime: '',
    executeCycle: 0,
    executeFrequency: 1,
    remark: ''
  }
  projectFormOpen.value = true
  projectTitle.value = "添加项目关联"
}

/** 编辑项目关联 */
function handleEditProject(row: ProjectPlan) {
  listProject({}).then(response => {
    availableProjects.value = response.rows
  })
  projectForm.value = { ...row }
  projectFormOpen.value = true
  projectTitle.value = "修改项目关联"
}

/** 提交项目关联表单 */
function submitProjectForm() {
  proxy.$refs["projectFormRef"].validate((valid: boolean) => {
    if (valid) {
      if (projectForm.value.id != null) {
        updatePlanProject(projectForm.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          projectFormOpen.value = false
          getProjectList()
        })
      } else {
        addPlanProject(projectForm.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          projectFormOpen.value = false
          getProjectList()
        })
      }
    }
  })
}

/** 取消项目表单 */
function cancelProjectForm() {
  projectFormOpen.value = false
}

/** 删除项目关联 */
function handleDeleteProject(row: ProjectPlan) {
  proxy.$modal.confirm('是否确认删除该项目关联？').then(function() {
    return delPlanProject(row.id!)
  }).then(() => {
    getProjectList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
