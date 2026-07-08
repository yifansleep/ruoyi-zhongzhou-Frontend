<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="username">
        <el-input 
          v-model="registerForm.username" 
          type="text" 
          size="large" 
          auto-complete="off" 
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password" :rules="registerPwdValidator">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          type="text"
          size="large" 
          auto-complete="off"
          placeholder="邮箱（可选）"
          @blur="handleEmailBlur"
        >
          <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="phonenumber">
        <el-input
          v-model="registerForm.phonenumber"
          type="text"
          size="large" 
          auto-complete="off"
          placeholder="手机号（可选）"
          @blur="handlePhonenumberBlur"
        >
          <template #prefix><svg-icon icon-class="phone" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="emailCode" v-if="registerForm.email && emailCodeVisible">
        <el-input
          v-model="registerForm.emailCode"
          type="text"
          size="large" 
          auto-complete="off"
          placeholder="邮箱验证码"
          style="width: 63%"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <el-button 
            type="primary" 
            size="large" 
            :disabled="emailCodeCountdown > 0" 
            @click="handleSendEmailCode"
            class="code-btn"
          >
            {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}s后重发` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item prop="smsCode" v-if="registerForm.phonenumber && smsCodeVisible">
        <el-input
          v-model="registerForm.smsCode"
          type="text"
          size="large" 
          auto-complete="off"
          placeholder="短信验证码"
          style="width: 63%"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <el-button 
            type="primary" 
            size="large" 
            :disabled="smsCodeCountdown > 0" 
            @click="handleSendSmsCode"
            class="code-btn"
          >
            {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}s后重发` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          size="large" 
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large" 
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus"
import { getCodeImg, register, sendEmailCode, sendSmsCode, checkEmail, checkPhonenumber } from "@/api/login"
import defaultSettings from '@/settings'
import { usePasswordRule } from "@/utils/passwordRule"
import type { RegisterForm } from '@/types/api/login'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()
const { registerPwdValidator } = usePasswordRule()

const registerForm = ref<RegisterForm>({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: "",
  email: "",
  phonenumber: "",
  emailCode: "",
  smsCode: ""
})

const equalToPassword = (rule: any, value: string, callback: (error?: Error) => void): void => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: string, callback: (error?: Error) => void): void => {
  if (value && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)) {
    callback(new Error("请输入正确的邮箱格式"))
  } else {
    callback()
  }
}

const validatePhonenumber = (rule: any, value: string, callback: (error?: Error) => void): void => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error("请输入正确的手机号格式"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  email: [
    { validator: validateEmail, trigger: "blur" }
  ],
  phonenumber: [
    { validator: validatePhonenumber, trigger: "blur" }
  ],
  emailCode: [
    { required: true, trigger: "blur", message: "请输入邮箱验证码" }
  ],
  smsCode: [
    { required: true, trigger: "blur", message: "请输入短信验证码" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref<string>("")
const loading = ref<boolean>(false)
const captchaEnabled = ref<boolean>(true)
const emailCodeCountdown = ref<number>(0)
const smsCodeCountdown = ref<number>(0)
const emailCodeVisible = ref<boolean>(false)
const smsCodeVisible = ref<boolean>(false)
const emailCheckLoading = ref<boolean>(false)
const phonenumberCheckLoading = ref<boolean>(false)

let emailCountdownTimer: ReturnType<typeof setInterval> | null = null
let smsCountdownTimer: ReturnType<typeof setInterval> | null = null

function handleRegister(): void {
  proxy.$refs.registerRef.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const submitData = { ...registerForm.value }
      // 如果邮箱和手机号都为空，则不提交验证码
      if (!submitData.email && !submitData.phonenumber) {
        delete submitData.emailCode
        delete submitData.smsCode
      } else {
        // 如果有邮箱但没有输入验证码
        if (submitData.email && !submitData.emailCode) {
          delete submitData.emailCode
        }
        // 如果有手机号但没有输入验证码
        if (submitData.phonenumber && !submitData.smsCode) {
          delete submitData.smsCode
        }
      }
      register(submitData).then(() => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function getCode(): void {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

async function handleEmailBlur(): Promise<void> {
  const email = registerForm.value.email
  if (email) {
    // 先验证格式
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
      return
    }
    // 检查唯一性
    try {
      const res = await checkEmail(email)
      if (res.code === 200 && !res.unique) {
        ElMessageBox.alert("<font color='red'>该邮箱已被注册！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "warning",
        }).then(() => {
          registerForm.value.email = ""
        }).catch(() => {})
      } else {
        emailCodeVisible.value = true
      }
    } catch (error) {
      emailCodeVisible.value = true
    }
  } else {
    emailCodeVisible.value = false
    registerForm.value.emailCode = ""
  }
}

async function handlePhonenumberBlur(): Promise<void> {
  const phonenumber = registerForm.value.phonenumber
  if (phonenumber) {
    // 先验证格式
    if (!/^1[3-9]\d{9}$/.test(phonenumber)) {
      return
    }
    // 检查唯一性
    try {
      const res = await checkPhonenumber(phonenumber)
      if (res.code === 200 && !res.unique) {
        ElMessageBox.alert("<font color='red'>该手机号已被注册！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "warning",
        }).then(() => {
          registerForm.value.phonenumber = ""
        }).catch(() => {})
      } else {
        smsCodeVisible.value = true
      }
    } catch (error) {
      smsCodeVisible.value = true
    }
  } else {
    smsCodeVisible.value = false
    registerForm.value.smsCode = ""
  }
}

function handleSendEmailCode(): void {
  const email = registerForm.value.email
  if (!email) {
    ElMessage({ message: "请先输入邮箱", type: "warning" })
    return
  }
  sendEmailCode(email).then(res => {
    if (res.code === 200) {
      ElMessage({ message: "验证码已发送至邮箱", type: "success" })
      emailCodeCountdown.value = 60
      if (emailCountdownTimer) {
        clearInterval(emailCountdownTimer)
      }
      emailCountdownTimer = setInterval(() => {
        if (emailCodeCountdown.value > 0) {
          emailCodeCountdown.value--
        } else {
          if (emailCountdownTimer) {
            clearInterval(emailCountdownTimer)
            emailCountdownTimer = null
          }
        }
      }, 1000)
    }
  })
}

function handleSendSmsCode(): void {
  const phonenumber = registerForm.value.phonenumber
  if (!phonenumber) {
    ElMessage({ message: "请先输入手机号", type: "warning" })
    return
  }
  sendSmsCode(phonenumber).then(res => {
    if (res.code === 200) {
      ElMessage({ message: "验证码已发送至手机", type: "success" })
      smsCodeCountdown.value = 60
      if (smsCountdownTimer) {
        clearInterval(smsCountdownTimer)
      }
      smsCountdownTimer = setInterval(() => {
        if (smsCodeCountdown.value > 0) {
          smsCodeCountdown.value--
        } else {
          if (smsCountdownTimer) {
            clearInterval(smsCountdownTimer)
            smsCountdownTimer = null
          }
        }
      }, 1000)
    }
  })
}

onUnmounted(() => {
  if (emailCountdownTimer) {
    clearInterval(emailCountdownTimer)
  }
  if (smsCountdownTimer) {
    clearInterval(smsCountdownTimer)
  }
})

getCode()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.register-code {
  width: 33%;
  height: 40px;
  float: right;
  .code-btn {
    width: 100%;
    height: 40px;
    font-size: 13px;
  }
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
