<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="等级名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入等级名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="护理计划" prop="planId">
        <el-select v-model="queryParams.planId" placeholder="请选择护理计划" clearable filterable>
          <el-option
            v-for="item in planOptions"
            :key="item.id"
            :label="item.planName"
            :value="item.id"
          />
        </el-select>
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
          v-hasPermi="['nursing:level:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['nursing:level:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['nursing:level:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['nursing:level:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="levelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="等级名称" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="关联护理计划" align="center" prop="planName" show-overflow-tooltip />
      <el-table-column label="收费标准" align="center" prop="fee" width="120">
        <template #default="scope">
          <span>¥{{ scope.row.fee }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级描述" align="center" prop="description" show-overflow-tooltip />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['nursing:level:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['nursing:level:remove']">删除</el-button>
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

    <!-- 添加或修改护理等级对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="levelRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入等级名称" />
        </el-form-item>
        <el-form-item label="关联护理计划" prop="planId">
          <el-select v-model="form.planId" placeholder="请选择护理计划" filterable style="width: 100%">
            <el-option
              v-for="item in planOptions"
              :key="item.id"
              :label="item.planName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收费标准" prop="fee">
          <el-input-number v-model="form.fee" :precision="2" :min="0" :max="999999" controls-position="right" placeholder="请输入收费标准" style="width: 100%" />
        </el-form-item>
        <el-form-item label="等级描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入等级描述" />
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
  </div>
</template>

<script setup lang="ts" name="NursingLevel">
import type { NursingLevel, LevelQueryParams } from "@/types/api/nursing/level"
import type { NursingPlan } from "@/types/api/nursing/plan"
import { listLevel, getLevel, delLevel, addLevel, updateLevel, exportLevel } from "@/api/nursing/level"
import { listAllPlan } from "@/api/nursing/plan"

const { proxy } = getCurrentInstance()

const levelList = ref<NursingLevel[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const planOptions = ref<NursingPlan[]>([])

const data = reactive({
  form: {} as NursingLevel,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    planId: undefined,
    status: undefined,
  } as LevelQueryParams,
  rules: {
    name: [{ required: true, message: "等级名称不能为空", trigger: "blur" }],
    planId: [{ required: true, message: "请选择关联的护理计划", trigger: "change" }],
    fee: [{ required: true, message: "请输入收费标准", trigger: "blur" }],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询护理等级列表 */
function getList() {
  loading.value = true
  listLevel(queryParams.value).then(response => {
    levelList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 获取护理计划选项 */
function getPlanOptions() {
  listAllPlan().then(response => {
    planOptions.value = response.data || []
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
    name: null,
    planId: null,
    fee: null,
    description: null,
    status: 1,
    remark: null,
  }
  proxy.resetForm("levelRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.planId = undefined
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NursingLevel[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加护理等级"
}

/** 修改按钮操作 */
function handleUpdate(row: NursingLevel) {
  reset()
  const _id = row.id || ids.value[0]
  getLevel(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改护理等级"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["levelRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateLevel(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addLevel(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: NursingLevel) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除护理等级编号为"' + _ids + '"的数据项？').then(function() {
    return delLevel(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm("是否确认导出所有护理等级数据项？").then(() => {
    exportLevel(queryParams.value).then((response: any) => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `护理等级_${Date.now()}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    })
  })
}

getList()
getPlanOptions()
</script>
