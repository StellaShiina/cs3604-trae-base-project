import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PassengerManagement from '../../src/components/PassengerManagement.vue'

describe('PassengerManagement', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PassengerManagement, {
      props: {
        onPassengerChange: vi.fn()
      }
    })
  })

  describe('Component Rendering', () => {
    it('should display passenger list in table format with required columns', () => {
      // 验收标准：以表格形式展示乘车人列表，包含序号、姓名、证件类型、证件号码、手机号、核验状态
      const table = wrapper.find('[data-testid="passenger-table"]')
      expect(table.exists()).toBe(true)

      const headers = [
        'sequence-header',
        'name-header',
        'id-type-header',
        'id-number-header',
        'phone-header',
        'verification-status-header',
        'actions-header'
      ]

      headers.forEach(headerId => {
        const header = wrapper.find(`[data-testid="${headerId}"]`)
        expect(header.exists()).toBe(true)
      })

      // 验证表头文本
      expect(wrapper.find('[data-testid="sequence-header"]').text()).toContain('序号')
      expect(wrapper.find('[data-testid="name-header"]').text()).toContain('姓名')
      expect(wrapper.find('[data-testid="id-type-header"]').text()).toContain('证件类型')
      expect(wrapper.find('[data-testid="id-number-header"]').text()).toContain('证件号码')
      expect(wrapper.find('[data-testid="phone-header"]').text()).toContain('手机号')
      expect(wrapper.find('[data-testid="verification-status-header"]').text()).toContain('核验状态')
    })

    it('should provide edit and delete buttons for each passenger row', () => {
      // 验收标准：每行记录提供"编辑"和"删除"操作按钮
      // 设置测试数据
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        }
      ]

      const editButton = wrapper.find('[data-testid="edit-button-1"]')
      const deleteButton = wrapper.find('[data-testid="delete-button-1"]')

      expect(editButton.exists()).toBe(true)
      expect(deleteButton.exists()).toBe(true)
      expect(editButton.text()).toContain('编辑')
      expect(deleteButton.text()).toContain('删除')
    })

    it('should provide search box for name or ID number search', () => {
      // 验收标准：提供搜索框支持按姓名或证件号搜索
      const searchBox = wrapper.find('[data-testid="search-input"]')
      expect(searchBox.exists()).toBe(true)
      expect(searchBox.attributes('placeholder')).toContain('按姓名或证件号搜索')
    })

    it('should include add passenger and batch delete buttons', () => {
      // 验收标准：包含"添加乘车人"和"批量删除"功能按钮
      const addButton = wrapper.find('[data-testid="add-passenger-button"]')
      const batchDeleteButton = wrapper.find('[data-testid="batch-delete-button"]')

      expect(addButton.exists()).toBe(true)
      expect(batchDeleteButton.exists()).toBe(true)
      expect(addButton.text()).toContain('添加乘车人')
      expect(batchDeleteButton.text()).toContain('批量删除')
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        },
        {
          id: '2',
          name: '李四',
          idType: '身份证',
          idNumber: '987654321098765432',
          phone: '13987654321',
          verificationStatus: '待验证'
        }
      ]
    })

    it('should filter passengers by name when searching', async () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('张三')

      // 应该只显示张三的记录
      const passengerRows = wrapper.findAll('[data-testid^="passenger-row-"]')
      expect(passengerRows.length).toBe(1)
      expect(wrapper.find('[data-testid="passenger-row-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="passenger-row-2"]').exists()).toBe(false)
    })

    it('should filter passengers by ID number when searching', async () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('987654')

      // 应该只显示李四的记录
      const passengerRows = wrapper.findAll('[data-testid^="passenger-row-"]')
      expect(passengerRows.length).toBe(1)
      expect(wrapper.find('[data-testid="passenger-row-2"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="passenger-row-1"]').exists()).toBe(false)
    })

    it('should show all passengers when search is cleared', async () => {
      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('张三')
      await searchInput.setValue('')

      const passengerRows = wrapper.findAll('[data-testid^="passenger-row-"]')
      expect(passengerRows.length).toBe(2)
    })
  })

  describe('Delete Confirmation', () => {
    it('should show confirmation dialog before deleting passenger', async () => {
      // 验收标准：删除操作前应显示确认对话框
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        }
      ]

      const deleteButton = wrapper.find('[data-testid="delete-button-1"]')
      await deleteButton.trigger('click')

      const confirmDialog = wrapper.find('[data-testid="delete-confirm-dialog"]')
      expect(confirmDialog.exists()).toBe(true)
      expect(confirmDialog.text()).toContain('确认删除')
      expect(confirmDialog.text()).toContain('张三')
    })

    it('should show confirmation dialog for batch delete', async () => {
      wrapper.vm.selectedPassengers = ['1', '2']

      const batchDeleteButton = wrapper.find('[data-testid="batch-delete-button"]')
      await batchDeleteButton.trigger('click')

      const confirmDialog = wrapper.find('[data-testid="batch-delete-confirm-dialog"]')
      expect(confirmDialog.exists()).toBe(true)
      expect(confirmDialog.text()).toContain('确认删除选中的乘车人')
    })
  })

  describe('Modal Form Display', () => {
    it('should show modal form when adding passenger', async () => {
      // 验收标准：添加/编辑乘车人时显示模态表单
      const addButton = wrapper.find('[data-testid="add-passenger-button"]')
      await addButton.trigger('click')

      expect(wrapper.vm.showAddForm).toBe(true)
      const modal = wrapper.find('[data-testid="passenger-form-modal"]')
      expect(modal.exists()).toBe(true)
    })

    it('should show modal form when editing passenger', async () => {
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        }
      ]

      const editButton = wrapper.find('[data-testid="edit-button-1"]')
      await editButton.trigger('click')

      expect(wrapper.vm.editingPassenger).toBeTruthy()
      const modal = wrapper.find('[data-testid="passenger-form-modal"]')
      expect(modal.exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when data is loading', () => {
      wrapper.vm.isLoading = true

      const loadingIndicator = wrapper.find('[data-testid="loading-indicator"]')
      expect(loadingIndicator.exists()).toBe(true)

      const table = wrapper.find('[data-testid="passenger-table"]')
      expect(table.exists()).toBe(false)
    })

    it('should hide loading indicator when data is loaded', () => {
      wrapper.vm.isLoading = false

      const loadingIndicator = wrapper.find('[data-testid="loading-indicator"]')
      expect(loadingIndicator.exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      const errorMessage = '加载乘车人信息失败'
      wrapper.vm.error = errorMessage

      const errorElement = wrapper.find('[data-testid="error-message"]')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toContain(errorMessage)
    })
  })

  describe('Passenger Selection', () => {
    it('should allow selecting passengers for batch operations', async () => {
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        },
        {
          id: '2',
          name: '李四',
          idType: '身份证',
          idNumber: '987654321098765432',
          phone: '13987654321',
          verificationStatus: '待验证'
        }
      ]

      const checkbox1 = wrapper.find('[data-testid="passenger-checkbox-1"]')
      const checkbox2 = wrapper.find('[data-testid="passenger-checkbox-2"]')

      await checkbox1.setChecked(true)
      await checkbox2.setChecked(true)

      expect(wrapper.vm.selectedPassengers).toContain('1')
      expect(wrapper.vm.selectedPassengers).toContain('2')
    })

    it('should enable batch delete button when passengers are selected', async () => {
      wrapper.vm.selectedPassengers = ['1', '2']

      const batchDeleteButton = wrapper.find('[data-testid="batch-delete-button"]')
      expect(batchDeleteButton.attributes('disabled')).toBeUndefined()
    })

    it('should disable batch delete button when no passengers are selected', () => {
      wrapper.vm.selectedPassengers = []

      const batchDeleteButton = wrapper.find('[data-testid="batch-delete-button"]')
      expect(batchDeleteButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Function Calls', () => {
    it('should call loadPassengers on component mount', () => {
      const loadPassengersSpy = vi.spyOn(wrapper.vm, 'loadPassengers')
      wrapper.vm.$options.mounted.call(wrapper.vm)

      expect(loadPassengersSpy).toHaveBeenCalled()
    })

    it('should call showAddForm when add button is clicked', async () => {
      const showAddFormSpy = vi.spyOn(wrapper.vm, 'showAddForm')
      const addButton = wrapper.find('[data-testid="add-passenger-button"]')

      await addButton.trigger('click')

      expect(showAddFormSpy).toHaveBeenCalled()
    })

    it('should call editPassenger when edit button is clicked', async () => {
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        }
      ]

      const editPassengerSpy = vi.spyOn(wrapper.vm, 'editPassenger')
      const editButton = wrapper.find('[data-testid="edit-button-1"]')

      await editButton.trigger('click')

      expect(editPassengerSpy).toHaveBeenCalledWith('1')
    })

    it('should call deletePassenger when delete is confirmed', async () => {
      wrapper.vm.passengers = [
        {
          id: '1',
          name: '张三',
          idType: '身份证',
          idNumber: '123456789012345678',
          phone: '13912345678',
          verificationStatus: '已验证'
        }
      ]

      const deletePassengerSpy = vi.spyOn(wrapper.vm, 'deletePassenger')
      
      // 模拟删除确认
      await wrapper.vm.deletePassenger('1')

      expect(deletePassengerSpy).toHaveBeenCalledWith('1')
    })
  })
})