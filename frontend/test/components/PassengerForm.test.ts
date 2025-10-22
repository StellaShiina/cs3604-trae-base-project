import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PassengerForm from '../../src/components/PassengerForm.vue'

describe('PassengerForm', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PassengerForm, {
      props: {
        passenger: null,
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      }
    })
  })

  describe('Form Fields Rendering', () => {
    it('should display all required form fields', () => {
      // 验收标准：包含姓名、证件类型、证件号码、手机号、乘车人类型等字段
      const nameInput = wrapper.find('[data-testid="name-input"]')
      const idTypeSelect = wrapper.find('[data-testid="id-type-select"]')
      const idNumberInput = wrapper.find('[data-testid="id-number-input"]')
      const phoneInput = wrapper.find('[data-testid="phone-input"]')
      const passengerTypeSelect = wrapper.find('[data-testid="passenger-type-select"]')

      expect(nameInput.exists()).toBe(true)
      expect(idTypeSelect.exists()).toBe(true)
      expect(idNumberInput.exists()).toBe(true)
      expect(phoneInput.exists()).toBe(true)
      expect(passengerTypeSelect.exists()).toBe(true)
    })

    it('should display field labels correctly', () => {
      // 验证字段标签
      expect(wrapper.find('[data-testid="name-label"]').text()).toContain('姓名')
      expect(wrapper.find('[data-testid="id-type-label"]').text()).toContain('证件类型')
      expect(wrapper.find('[data-testid="id-number-label"]').text()).toContain('证件号码')
      expect(wrapper.find('[data-testid="phone-label"]').text()).toContain('手机号')
      expect(wrapper.find('[data-testid="passenger-type-label"]').text()).toContain('乘车人类型')
    })

    it('should mark required fields with asterisk', () => {
      // 验收标准：必填字段标记*号
      const requiredFields = [
        'name-label',
        'id-type-label',
        'id-number-label',
        'phone-label',
        'passenger-type-label'
      ]

      requiredFields.forEach(fieldId => {
        const label = wrapper.find(`[data-testid="${fieldId}"]`)
        expect(label.text()).toContain('*')
      })
    })

    it('should provide correct options for ID type select', () => {
      // 验收标准：证件类型包含身份证、护照、港澳通行证、台湾通行证等选项
      const idTypeSelect = wrapper.find('[data-testid="id-type-select"]')
      const options = idTypeSelect.findAll('option')

      const expectedOptions = ['身份证', '护照', '港澳通行证', '台湾通行证']
      expectedOptions.forEach(optionText => {
        const option = options.find(opt => opt.text().includes(optionText))
        expect(option).toBeTruthy()
      })
    })

    it('should provide correct options for passenger type select', () => {
      // 验收标准：乘车人类型包含成人、儿童、学生等选项
      const passengerTypeSelect = wrapper.find('[data-testid="passenger-type-select"]')
      const options = passengerTypeSelect.findAll('option')

      const expectedOptions = ['成人', '儿童', '学生']
      expectedOptions.forEach(optionText => {
        const option = options.find(opt => opt.text().includes(optionText))
        expect(option).toBeTruthy()
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate name field is not empty', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('')
      await nameInput.trigger('blur')

      const errorMessage = wrapper.find('[data-testid="name-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('姓名不能为空')
    })

    it('should validate name contains only Chinese characters', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('John123')
      await nameInput.trigger('blur')

      const errorMessage = wrapper.find('[data-testid="name-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('姓名只能包含中文字符')
    })

    it('should validate ID number format based on ID type', async () => {
      // 测试身份证号码格式验证
      const idTypeSelect = wrapper.find('[data-testid="id-type-select"]')
      const idNumberInput = wrapper.find('[data-testid="id-number-input"]')

      await idTypeSelect.setValue('身份证')
      await idNumberInput.setValue('123456')
      await idNumberInput.trigger('blur')

      const errorMessage = wrapper.find('[data-testid="id-number-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('身份证号码格式不正确')
    })

    it('should validate phone number format', async () => {
      const phoneInput = wrapper.find('[data-testid="phone-input"]')
      await phoneInput.setValue('123')
      await phoneInput.trigger('blur')

      const errorMessage = wrapper.find('[data-testid="phone-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('手机号格式不正确')
    })

    it('should validate all required fields are filled', async () => {
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')

      // 应该显示所有必填字段的错误信息
      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="id-number-error"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="phone-error"]').exists()).toBe(true)
    })
  })

  describe('Real-time Validation', () => {
    it('should show validation errors in real-time as user types', async () => {
      // 验收标准：实时验证并显示错误信息
      const nameInput = wrapper.find('[data-testid="name-input"]')
      
      await nameInput.setValue('a')
      await nameInput.trigger('input')

      const errorMessage = wrapper.find('[data-testid="name-error"]')
      expect(errorMessage.exists()).toBe(true)
    })

    it('should clear validation errors when input becomes valid', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      
      // 先输入无效值
      await nameInput.setValue('123')
      await nameInput.trigger('input')
      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(true)

      // 再输入有效值
      await nameInput.setValue('张三')
      await nameInput.trigger('input')
      expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(false)
    })
  })

  describe('Form Submission', () => {
    it('should prevent submission when validation fails', async () => {
      const onSubmitSpy = vi.fn()
      wrapper.setProps({ onSubmit: onSubmitSpy })

      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')

      expect(onSubmitSpy).not.toHaveBeenCalled()
    })

    it('should call onSubmit with form data when validation passes', async () => {
      const onSubmitSpy = vi.fn()
      wrapper.setProps({ onSubmit: onSubmitSpy })

      // 填写有效的表单数据
      await wrapper.find('[data-testid="name-input"]').setValue('张三')
      await wrapper.find('[data-testid="id-type-select"]').setValue('身份证')
      await wrapper.find('[data-testid="id-number-input"]').setValue('123456789012345678')
      await wrapper.find('[data-testid="phone-input"]').setValue('13912345678')
      await wrapper.find('[data-testid="passenger-type-select"]').setValue('成人')

      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')

      expect(onSubmitSpy).toHaveBeenCalledWith({
        name: '张三',
        idType: '身份证',
        idNumber: '123456789012345678',
        phone: '13912345678',
        passengerType: '成人'
      })
    })

    it('should show loading state during submission', async () => {
      wrapper.vm.isLoading = true

      const submitButton = wrapper.find('[data-testid="submit-button"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(submitButton.text()).toContain('提交中')

      const loadingSpinner = wrapper.find('[data-testid="loading-spinner"]')
      expect(loadingSpinner.exists()).toBe(true)
    })
  })

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const onCancelSpy = vi.fn()
      wrapper.setProps({ onCancel: onCancelSpy })

      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      await cancelButton.trigger('click')

      expect(onCancelSpy).toHaveBeenCalled()
    })

    it('should reset form when cancelled', async () => {
      // 填写表单数据
      await wrapper.find('[data-testid="name-input"]').setValue('张三')
      await wrapper.find('[data-testid="phone-input"]').setValue('13912345678')

      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      await cancelButton.trigger('click')

      // 表单应该被重置
      expect(wrapper.find('[data-testid="name-input"]').element.value).toBe('')
      expect(wrapper.find('[data-testid="phone-input"]').element.value).toBe('')
    })
  })

  describe('Edit Mode', () => {
    it('should populate form fields when editing existing passenger', async () => {
      const existingPassenger = {
        id: '1',
        name: '张三',
        idType: '身份证',
        idNumber: '123456789012345678',
        phone: '13912345678',
        passengerType: '成人'
      }

      wrapper.setProps({ passenger: existingPassenger })

      expect(wrapper.find('[data-testid="name-input"]').element.value).toBe('张三')
      expect(wrapper.find('[data-testid="id-type-select"]').element.value).toBe('身份证')
      expect(wrapper.find('[data-testid="id-number-input"]').element.value).toBe('123456789012345678')
      expect(wrapper.find('[data-testid="phone-input"]').element.value).toBe('13912345678')
      expect(wrapper.find('[data-testid="passenger-type-select"]').element.value).toBe('成人')
    })

    it('should change submit button text to "更新" in edit mode', () => {
      const existingPassenger = {
        id: '1',
        name: '张三',
        idType: '身份证',
        idNumber: '123456789012345678',
        phone: '13912345678',
        passengerType: '成人'
      }

      wrapper.setProps({ passenger: existingPassenger })

      const submitButton = wrapper.find('[data-testid="submit-button"]')
      expect(submitButton.text()).toContain('更新')
    })
  })

  describe('Error Handling', () => {
    it('should display error message when submission fails', () => {
      const errorMessage = '添加乘车人失败，请重试'
      wrapper.vm.error = errorMessage

      const errorElement = wrapper.find('[data-testid="form-error"]')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toContain(errorMessage)
    })

    it('should clear error message when form is reset', async () => {
      wrapper.vm.error = '添加乘车人失败'
      
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      await cancelButton.trigger('click')

      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labels for form fields', () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      const idNumberInput = wrapper.find('[data-testid="id-number-input"]')
      const phoneInput = wrapper.find('[data-testid="phone-input"]')

      expect(nameInput.attributes('aria-label')).toBeTruthy()
      expect(idNumberInput.attributes('aria-label')).toBeTruthy()
      expect(phoneInput.attributes('aria-label')).toBeTruthy()
    })

    it('should associate error messages with form fields using aria-describedby', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('')
      await nameInput.trigger('blur')

      expect(nameInput.attributes('aria-describedby')).toContain('name-error')
    })
  })
})