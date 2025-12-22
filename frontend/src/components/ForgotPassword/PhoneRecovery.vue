<template>
  <div class="phone-recovery-flow">
    <ProgressBar :currentStep="currentStep" />
    
    <div class="step-content">
      <AccountInfoStep 
        v-if="currentStep === 1" 
        @success="handleAccountVerified" 
      />
      <VerificationCodeStep
        v-if="currentStep === 2"
        :sessionId="sessionId"
        :phone="accountInfo.phone"
        @success="handleCodeVerified"
      />
      <SetNewPasswordStep
        v-if="currentStep === 3"
        :resetToken="resetToken"
        @success="handlePasswordReset"
      />
      <CompleteStep v-if="currentStep === 4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import ProgressBar from './ProgressBar.vue';
import AccountInfoStep from './AccountInfoStep.vue';
import VerificationCodeStep from './VerificationCodeStep.vue';
import SetNewPasswordStep from './SetNewPasswordStep.vue';
import CompleteStep from './CompleteStep.vue';

type Step = 1 | 2 | 3 | 4;

interface AccountInfo {
  phone: string;
  idCardType: string;
  idCardNumber: string;
}

const currentStep = ref<Step>(1);
const sessionId = ref('');
const resetToken = ref('');
const accountInfo = reactive<AccountInfo>({
  phone: '',
  idCardType: '',
  idCardNumber: ''
});

const handleAccountVerified = (sessId: string, info: AccountInfo) => {
  sessionId.value = sessId;
  Object.assign(accountInfo, info);
  currentStep.value = 2;
};

const handleCodeVerified = (token: string) => {
  resetToken.value = token;
  currentStep.value = 3;
};

const handlePasswordReset = () => {
  currentStep.value = 4;
};
</script>

<style lang="scss" scoped>
/* ==================== 手机找回流程容器 ==================== */
.phone-recovery-flow {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* ==================== 步骤内容 ==================== */
.step-content {
  margin-top: 10px; /* 减少上边距，从40px改为10px */
}
</style>
