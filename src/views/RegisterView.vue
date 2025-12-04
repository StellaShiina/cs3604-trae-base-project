<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { register, sendSMS } from '../services/authService'
import SMSVerificationModal from '../components/SMSVerificationModal.vue'

const router = useRouter()

// Form Data
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  idType: 'id_card', // Default: 居民身份证
  name: '',
  idNo: '',
  discountType: 'adult', // Default: 成人
  email: '',
  countryCode: '+86',
  mobile: '',
  agreement: false
})

// Validation Errors (Per field)
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  idNo: '',
  email: '',
  mobile: ''
})

const showModal = ref(false)
const showSuccessMessage = ref(false)

// Options
const idTypeOptions = [
  { label: '居民身份证', value: 'id_card' },
  { label: '港澳居民居住证', value: 'hkm_res' },
  { label: '台湾居民居住证', value: 'tw_res' },
  { label: '外国人永久居留身份证', value: 'foreigner_res' },
  { label: '外国护照', value: 'passport' },
  { label: '中国护照', value: 'cn_passport' },
  { label: '港澳居民来往内地通行证', value: 'hkm_pass' },
  { label: '台湾居民来往大陆通行证', value: 'tw_pass' }
]

const discountTypeOptions = [
  { label: '成人', value: 'adult' },
  { label: '儿童', value: 'child' },
  { label: '学生', value: 'student' },
  { label: '残疾军人', value: 'disabled_soldier' }
]

const countryOptions = [
  { label: '+86 中国', value: '+86' },
  { label: '+852 中国香港', value: '+852' },
  { label: '+853 中国澳门', value: '+853' },
  { label: '+886 中国台湾', value: '+886' }
]

// Helpers
const getRealLength = (str: string) => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
      len += 2;
    } else {
      len++;
    }
  }
  return len;
}

// Password Strength Level (0: None, 1: Weak, 2: Medium, 3: Strong)
const passwordLevel = computed(() => {
  if (!form.password) return 0
  
  let types = 0
  if (/[a-zA-Z]/.test(form.password)) types++
  if (/\d/.test(form.password)) types++
  if (/[_]/.test(form.password)) types++
  
  if (form.password.length < 6) return 1
  
  if (types >= 2) {
     if (form.password.length >= 10 && types >= 3) return 3
     return 2
  }
  return 1
})

// Validators
const validateUsername = () => {
  if (!form.username) return '用户名不能为空'
  if (form.username.length < 6) return '用户名长度不能少于6个字符！'
  if (form.username.length > 30) return '用户名长度不能超过30个字符！'
  if (!/^[a-zA-Z]/.test(form.username)) return '用户名只能由字母、数字和_组成，须以字母开头！'
  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return '用户名只能由字母、数字和_组成，须以字母开头！'
  return ''
}

const validatePassword = () => {
  if (!form.password) return '密码不能为空'
  if (form.password.length < 6) return '密码长度不能少于6个字符！'
  
  let types = 0
  if (/[a-zA-Z]/.test(form.password)) types++
  if (/\d/.test(form.password)) types++
  if (/_/.test(form.password)) types++
  
  if (types < 2) return '格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上！'
  return ''
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) return '请再次输入密码'
  if (form.confirmPassword !== form.password) return '确认密码与密码不一致！'
  return ''
}

const validateName = () => {
  if (!form.name) return '请输入姓名！'
  const len = getRealLength(form.name)
  if (len < 3 || len > 30) return '允许输入的字符串在3-30个字符之间！'
  if (/[^a-zA-Z\u4e00-\u9fa5. ]/.test(form.name)) return '请输入姓名！' 
  return ''
}

const validateIdNo = () => {
  if (!form.idNo) return '请输入证件号码'
  if (form.idNo.length !== 18) return '请正确输入18位证件号码！'
  if (/[^0-9xX]/.test(form.idNo)) return '输入的证件编号中包含中文信息或特殊字符！'
  return ''
}

const validateEmail = () => {
  if (form.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return '请输入有效的电子邮件地址！'
  }
  return ''
}

const validateMobile = () => {
  if (!form.mobile) return '请输入手机号码'
  if (form.mobile.length !== 11) return '您输入的手机号码不是有效的格式！'
  if (!/^1\d{10}$/.test(form.mobile)) return '您输入的手机号码不是有效的格式！'
  return ''
}

// Handle Blur: Validate single field
const handleBlur = (field: keyof typeof errors, validator: () => string) => {
  const msg = validator()
  errors[field] = msg
}

const validateAll = () => {
  let isValid = true
  
  errors.username = validateUsername(); if(errors.username) isValid = false
  errors.password = validatePassword(); if(errors.password) isValid = false
  errors.confirmPassword = validateConfirmPassword(); if(errors.confirmPassword) isValid = false
  errors.name = validateName(); if(errors.name) isValid = false
  errors.idNo = validateIdNo(); if(errors.idNo) isValid = false
  errors.email = validateEmail(); if(errors.email) isValid = false
  errors.mobile = validateMobile(); if(errors.mobile) isValid = false
  
  if (!form.agreement) {
    alert('请阅读并同意服务条款')
    return false
  }
  
  return isValid
}

const handleNext = async () => {
  if (validateAll()) {
    try {
      await sendSMS(form.mobile)
      console.log(`SMS sent to ${form.mobile}`)
      showModal.value = true
    } catch (error) {
      console.error('Failed to send SMS', error)
      alert('验证码发送失败，请稍后重试')
    }
  }
}

const onVerificationSuccess = async () => {
  showModal.value = false
  // Perform Registration
  try {
    await register({
      username: form.username,
      password: form.password,
      email: form.email,
      mobile: form.mobile,
      name: form.name,
      id_type: form.idType,
      id_no: form.idNo,
      gender: 'male' 
    })
    
    showSuccessMessage.value = true
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    console.error('Registration failed', error)
    if (error.response && error.response.status === 409) {
      const errText = error.response.data.error || ''
      if (errText.includes('username')) errors.username = '该用户名已经占用，请重新选择用户名！'
      else if (errText.includes('mobile')) errors.mobile = '您输入的手机号码已被其他注册用户使用...'
      else if (errText.includes('email')) errors.email = '您输入的邮箱已被其他注册用户使用...'
      else if (errText.includes('id_no')) errors.idNo = '该证件号码已经被注册过...'
      else alert('注册失败：用户已存在')
    } else {
      alert('注册失败，请稍后再试')
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
         <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">Logo</div>
              <div class="flex flex-col">
                <span class="text-black font-bold text-lg leading-none">中国铁路12306</span>
                <span class="text-gray-400 text-sm leading-none">12306 CHINA RAILWAY</span>
              </div>
            </div>
            <div class="h-8 w-px bg-gray-300 mx-4"></div>
            <span class="text-xl text-black font-medium">用户注册</span>
         </div>
         <div class="text-sm">
           <router-link to="/login" class="text-blue-600 hover:underline">已有账号，直接登录 ></router-link>
         </div>
      </div>
    </header>

    <!-- Main Form -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <div class="bg-white rounded shadow p-8 max-w-5xl mx-auto border-t-4 border-blue-500">
        
        <form @submit.prevent class="space-y-6 pl-8">
          
          <!-- Username -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 用户名：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.username"
                   @blur="handleBlur('username', validateUsername)"
                   type="text" 
                   placeholder="用户名"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.username ? 'border-red-500' : 'border-gray-300'"
                 />
                 <span class="ml-4 text-orange-500 text-sm">6-30位字母、数字或"_"，字母开头</span>
              </div>
              <!-- Inline Error -->
              <div v-if="errors.username" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.username }}
              </div>
            </div>
          </div>

          <!-- Password -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 登录密码：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.password"
                   @blur="handleBlur('password', validatePassword)"
                   type="password" 
                   placeholder="6-20位字母、数字或符号"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.password ? 'border-red-500' : 'border-gray-300'"
                 />
                 <!-- Strength Indicator -->
                 <div class="flex space-x-1 ml-4">
                    <div class="w-12 h-4 bg-gray-200 border border-gray-300" :class="{'bg-red-500': passwordLevel >= 1}"></div>
                    <div class="w-12 h-4 bg-gray-200 border border-gray-300" :class="{'bg-orange-500': passwordLevel >= 2}"></div>
                    <div class="w-12 h-4 bg-gray-200 border border-gray-300" :class="{'bg-green-500': passwordLevel >= 3}"></div>
                 </div>
              </div>
              <div v-if="errors.password" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.password }}
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 确认密码：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.confirmPassword"
                   @blur="handleBlur('confirmPassword', validateConfirmPassword)"
                   type="password" 
                   placeholder="再次输入您的登录密码"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                 />
              </div>
              <div v-if="errors.confirmPassword" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.confirmPassword }}
              </div>
            </div>
          </div>

          <!-- ID Type -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 证件类型：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <select v-model="form.idType" class="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option v-for="opt in idTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                 </select>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 姓名：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.name"
                   @blur="handleBlur('name', validateName)"
                   type="text" 
                   placeholder="请输入姓名"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.name ? 'border-red-500' : 'border-gray-300'"
                 />
                 <a href="#" class="ml-4 text-orange-500 text-sm underline">姓名填写规则</a>
                 <span class="ml-2 text-orange-500 text-sm">（用于身份核验，请正确填写）</span>
              </div>
              <div v-if="errors.name" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.name }}
              </div>
            </div>
          </div>

          <!-- ID No -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 证件号码：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.idNo"
                   @blur="handleBlur('idNo', validateIdNo)"
                   type="text" 
                   placeholder="请输入您的证件号码"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.idNo ? 'border-red-500' : 'border-gray-300'"
                 />
                 <span class="ml-4 text-orange-500 text-sm">（用于身份核验，请正确填写）</span>
              </div>
              <div v-if="errors.idNo" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.idNo }}
              </div>
            </div>
          </div>

          <!-- Discount Type -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 优惠（待）类型：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <select v-model="form.discountType" class="w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option v-for="opt in discountTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                 </select>
              </div>
            </div>
          </div>

          <div class="border-t border-dashed border-gray-300 my-4"></div>

          <!-- Email -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              邮箱：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <input 
                   v-model="form.email"
                   @blur="handleBlur('email', validateEmail)"
                   type="email" 
                   placeholder="请正确填写邮箱地址"
                   class="w-64 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                   :class="errors.email ? 'border-red-500' : 'border-gray-300'"
                 />
              </div>
              <div v-if="errors.email" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.email }}
              </div>
            </div>
          </div>

          <!-- Mobile -->
          <div class="flex items-start">
            <label class="w-32 text-right pt-2 mr-4 font-medium text-gray-700">
              <span class="text-red-500">*</span> 手机号码：
            </label>
            <div class="flex-1">
              <div class="flex items-center">
                 <div class="flex w-64 border rounded" :class="errors.mobile ? 'border-red-500' : 'border-gray-300'">
                   <select v-model="form.countryCode" class="bg-gray-50 border-r px-2 outline-none text-sm text-gray-600">
                     <option v-for="opt in countryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                   </select>
                   <input 
                     v-model="form.mobile"
                     @blur="handleBlur('mobile', validateMobile)"
                     type="text" 
                     maxlength="11"
                     placeholder="手机号码"
                     class="flex-1 p-2 outline-none"
                   />
                 </div>
                 <span class="ml-4 text-orange-500 text-sm">请正确填写手机号码，稍后将向该手机号码发送短信验证码</span>
              </div>
              <div v-if="errors.mobile" class="mt-1 text-red-500 text-sm flex items-center">
                 <span class="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">×</span>
                 {{ errors.mobile }}
              </div>
            </div>
          </div>

          <!-- Agreement -->
          <div class="flex items-start">
             <div class="w-32 mr-4"></div>
             <div class="flex-1 flex items-center">
               <input type="checkbox" v-model="form.agreement" class="mt-1 mr-2 w-4 h-4" />
               <span class="text-sm text-gray-600">
                 我已阅读并同意遵守 <a href="#" class="text-blue-600">《中国铁路客户服务中心网站服务条款》</a> <a href="#" class="text-blue-600">《隐私权政策》</a>
               </span>
             </div>
          </div>

          <!-- Next Button -->
          <div class="flex justify-center mt-8 pt-8">
            <button 
              @click="handleNext"
              class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-12 rounded transition duration-200 shadow"
            >
              下一步
            </button>
          </div>
        </form>
      </div>
    </main>

    <!-- SMS Verification Modal -->
    <SMSVerificationModal 
      :is-open="showModal"
      :mobile="form.mobile"
      @close="showModal = false"
      @success="onVerificationSuccess"
    />

    <!-- Success Overlay -->
    <div v-if="showSuccessMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-xl text-center border-t-4 border-green-500">
        <div class="text-green-500 text-5xl mb-4">✓</div>
        <div class="text-xl font-bold text-gray-800">恭喜您注册成功！</div>
        <div class="text-gray-600 mt-2">正在跳转登录页...</div>
      </div>
    </div>

  </div>
</template>
