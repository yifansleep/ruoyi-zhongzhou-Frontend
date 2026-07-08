import type { AjaxResult } from './common'
import type { SysUser } from './system/user'

// 登录响应
export interface LoginInfoResult extends AjaxResult {
  /** 令牌 */
  token: string
}

/** 用户信息响应 */
export interface UserInfoResult extends AjaxResult {
  /** 用户信息 */
  user: SysUser
  /** 角色数据 */
  roles: string[]
  /** 权限数据 */
  permissions: string[]
  /** 初始密码是否提醒修改 */
  isDefaultModifyPwd?: boolean
  /** 密码是否过期 */
  isPasswordExpired?: boolean
}

/** 验证码响应 */
export interface CaptchaInfoResult extends AjaxResult {
  /** 验证码缓存key */
  uuid: string;
  /** 验证码图片Base64 */
  img: string;
  /** 验证码开关 */
  captchaEnabled: boolean
}

/** 注册提交信息 */
export interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  code: string
  uuid: string
  email?: string
  phonenumber?: string
  emailCode?: string
  smsCode?: string
}

/** 登录提交信息 */
export interface LoginForm {
  username: string
  password: string
  rememberMe?: boolean | string
  code: string
  uuid: string
}

/** 验证码发送响应 */
export interface SendCodeResult extends AjaxResult {
  /** 验证码ID */
  codeId?: string
  /** 验证码内容（仅用于测试/开发环境） */
  code?: string
}

/** 唯一性检查响应 */
export interface CheckUniqueResult extends AjaxResult {
  /** 是否唯一 */
  unique: boolean
}
