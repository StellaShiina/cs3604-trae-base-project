<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="register-form">
    <el-form-item label="用户名" prop="username" required>
      <template #label>
        <span><span class="required-mark">*</span>用户名</span>
      </template>
      <el-input v-model="form.username" placeholder="用户名设置成功后不可修改/30个字符以内" />
    </el-form-item>
    
    <el-form-item label="登录密码" prop="password" required>
       <template #label>
        <span><span class="required-mark">*</span>登录密码</span>
      </template>
      <el-input v-model="form.password" type="password" placeholder="6-20位字母、数字或符号" />
    </el-form-item>
    
    <el-form-item label="确认密码" prop="confirmPassword" required>
       <template #label>
        <span><span class="required-mark">*</span>确认密码</span>
      </template>
      <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入您的登录密码" />
    </el-form-item>
    
    <el-form-item label="证件类型" prop="idType" required>
       <template #label>
        <span><span class="required-mark">*</span>证件类型</span>
      </template>
      <el-select v-model="form.idType" placeholder="请选择">
        <el-option label="中国居民身份证" value="1" />
        <el-option label="港澳居民来往内地通行证" value="2" />
        <el-option label="台湾居民来往大陆通行证" value="3" />
        <el-option label="护照" value="B" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="姓名" prop="name" required>
       <template #label>
        <span><span class="required-mark">*</span>姓名</span>
      </template>
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    
    <el-form-item label="证件号码" prop="idNumber" required>
       <template #label>
        <span><span class="required-mark">*</span>证件号码</span>
      </template>
      <el-input v-model="form.idNumber" placeholder="请输入您的证件号码" />
    </el-form-item>
    
    <el-form-item label="手机号码" prop="phone" required>
       <template #label>
        <span><span class="required-mark">*</span>手机号码</span>
      </template>
      <el-input v-model="form.phone" placeholder="请输入您的手机号码" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请正确填写邮箱地址" />
    </el-form-item>

    <el-form-item prop="agreement">
      <el-checkbox v-model="form.agreement">
        我已阅读并同意遵守 <a href="#">《中国铁路客户服务中心网站服务条款》</a> <a href="#">《隐私权政策》</a>
      </el-checkbox>
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">下一步</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const emit = defineEmits(['submit'])

const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  idType: '1',
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  agreement: false
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateUsername = (rule: any, value: string, callback: any) => {
    console.log('Validating username:', value);
    if (value.length < 6) {
        console.log('Username too short');
        callback(new Error('用户名长度不能少于6个字符！'))
    } else if (value.length > 30) {
        callback(new Error('用户名长度不能超过30个字符！'))
    } else {
        callback()
    }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  idNumber: [
    { required: true, message: '请输入证件号码', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' }
  ],
  agreement: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请勾选协议'))
      } else {
        callback()
      }
    }, trigger: 'change' }
  ]
})

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      emit('submit', form)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style scoped>
.required-mark {
  color: red;
  margin-right: 4px;
}
</style>
