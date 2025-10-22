<template>
  <div class="passenger-management">
    <div class="header">
      <h2>乘客管理</h2>
      <button class="add-btn" @click="showAddModal = true">
        <span class="icon">➕</span>
        添加乘客
      </button>
    </div>

    <div class="passenger-list">
      <div v-if="passengers.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <p>暂无乘客信息</p>
        <p class="empty-tip">请添加常用乘客信息，方便快速购票</p>
      </div>

      <div v-else class="passenger-cards">
        <div 
          v-for="passenger in passengers" 
          :key="passenger.id"
          class="passenger-card"
        >
          <div class="card-header">
            <div class="passenger-info">
              <h3>{{ passenger.name }}</h3>
              <span class="id-type">{{ getIdTypeText(passenger.idType) }}</span>
            </div>
            <div class="card-actions">
              <button class="edit-btn" @click="editPassenger(passenger)">
                ✏️ 编辑
              </button>
              <button class="delete-btn" @click="deletePassenger(passenger.id)">
                🗑️ 删除
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">证件号码：</span>
              <span class="value">{{ maskIdNumber(passenger.idNumber) }}</span>
            </div>
            <div class="info-row">
              <span class="label">手机号码：</span>
              <span class="value">{{ passenger.phone || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="label">乘客类型：</span>
              <span class="value">{{ getPassengerTypeText(passenger.type) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑乘客模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑乘客' : '添加乘客' }}</h3>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        
        <form @submit.prevent="savePassenger" class="modal-body">
          <div class="form-group">
            <label>姓名 *</label>
            <input 
              v-model="currentPassenger.name" 
              type="text" 
              required 
              placeholder="请输入真实姓名"
            >
          </div>
          
          <div class="form-group">
            <label>证件类型 *</label>
            <select v-model="currentPassenger.idType" required>
              <option value="1">身份证</option>
              <option value="2">护照</option>
              <option value="3">军官证</option>
              <option value="4">港澳通行证</option>
              <option value="5">台湾通行证</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>证件号码 *</label>
            <input 
              v-model="currentPassenger.idNumber" 
              type="text" 
              required 
              placeholder="请输入证件号码"
            >
          </div>
          
          <div class="form-group">
            <label>手机号码</label>
            <input 
              v-model="currentPassenger.phone" 
              type="tel" 
              placeholder="请输入手机号码"
            >
          </div>
          
          <div class="form-group">
            <label>乘客类型 *</label>
            <select v-model="currentPassenger.type" required>
              <option value="1">成人</option>
              <option value="2">儿童</option>
              <option value="3">学生</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">
              取消
            </button>
            <button type="submit" class="save-btn">
              {{ isEditing ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PassengerManagement',
  data() {
    return {
      passengers: [],
      showAddModal: false,
      showEditModal: false,
      currentPassenger: {
        name: '',
        idType: '1',
        idNumber: '',
        phone: '',
        type: '1'
      },
      isEditing: false,
      editingId: null,
      loading: false
    }
  },
  async mounted() {
    await this.loadPassengers()
  },
  methods: {
    // 从后端加载乘客数据
    async loadPassengers() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No token found')
          return
        }

        const response = await fetch('/api/user/passengers', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          // 转换后端数据格式到前端格式
          this.passengers = data.passengers ? data.passengers.map(p => ({
            id: p.id,
            name: p.name,
            idType: this.convertIdType(p.idType),
            idNumber: p.idNumber,
            phone: p.phone,
            type: this.convertPassengerType(p.passengerType || p.type)
          })) : []
        } else {
          console.error('Failed to load passengers:', response.statusText)
        }
      } catch (error) {
        console.error('Error loading passengers:', error)
      } finally {
        this.loading = false
      }
    },

    // 保存乘客到后端
    async savePassengerToBackend(passengerData) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('请先登录')
          return false
        }

        const backendData = {
          name: passengerData.name,
          idType: this.convertIdTypeToBackend(passengerData.idType),
          idNumber: passengerData.idNumber,
          phone: passengerData.phone,
          passengerType: this.convertPassengerTypeToBackend(passengerData.type)
        }

        const response = await fetch('/api/user/passengers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendData)
        })

        if (response.ok) {
          return true
        } else {
          const errorData = await response.json()
          alert(errorData.error || '保存失败')
          return false
        }
      } catch (error) {
        console.error('Error saving passenger:', error)
        alert('保存失败，请重试')
        return false
      }
    },

    // 更新乘客到后端
    async updatePassengerToBackend(passengerId, passengerData) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('请先登录')
          return false
        }

        const backendData = {
          name: passengerData.name,
          idType: this.convertIdTypeToBackend(passengerData.idType),
          idNumber: passengerData.idNumber,
          phone: passengerData.phone,
          passengerType: this.convertPassengerTypeToBackend(passengerData.type)
        }

        const response = await fetch(`/api/user/passengers/${passengerId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendData)
        })

        if (response.ok) {
          return true
        } else {
          const errorData = await response.json()
          alert(errorData.error || '更新失败')
          return false
        }
      } catch (error) {
        console.error('Error updating passenger:', error)
        alert('更新失败，请重试')
        return false
      }
    },

    // 从后端删除乘客
    async deletePassengerFromBackend(passengerId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('请先登录')
          return false
        }

        const response = await fetch(`/api/user/passengers/${passengerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          return true
        } else {
          const errorData = await response.json()
          alert(errorData.error || '删除失败')
          return false
        }
      } catch (error) {
        console.error('Error deleting passenger:', error)
        alert('删除失败，请重试')
        return false
      }
    },

    // 转换证件类型（后端到前端）
    convertIdType(backendType) {
      const typeMap = {
        '身份证': '1',
        '护照': '2',
        '军官证': '3',
        '港澳通行证': '4',
        '台湾通行证': '5'
      }
      return typeMap[backendType] || '1'
    },

    // 转换证件类型（前端到后端）
    convertIdTypeToBackend(frontendType) {
      const typeMap = {
        '1': '身份证',
        '2': '护照',
        '3': '军官证',
        '4': '港澳通行证',
        '5': '台湾通行证'
      }
      return typeMap[frontendType] || '身份证'
    },

    // 转换乘客类型（后端到前端）
    convertPassengerType(backendType) {
      const typeMap = {
        '成人': '1',
        '儿童': '2',
        '学生': '3'
      }
      return typeMap[backendType] || '1'
    },

    // 转换乘客类型（前端到后端）
    convertPassengerTypeToBackend(frontendType) {
      const typeMap = {
        '1': '成人',
        '2': '儿童',
        '3': '学生'
      }
      return typeMap[frontendType] || '成人'
    },
    getIdTypeText(type) {
      const types = {
        '1': '身份证',
        '2': '护照',
        '3': '军官证',
        '4': '港澳通行证',
        '5': '台湾通行证'
      }
      return types[type] || '未知'
    },
    
    getPassengerTypeText(type) {
      const types = {
        '1': '成人',
        '2': '儿童',
        '3': '学生'
      }
      return types[type] || '未知'
    },
    
    maskIdNumber(idNumber) {
      if (!idNumber) return ''
      if (idNumber.length <= 8) return idNumber
      return idNumber.substring(0, 4) + '****' + idNumber.substring(idNumber.length - 4)
    },
    
    editPassenger(passenger) {
      this.currentPassenger = { ...passenger }
      this.isEditing = true
      this.editingId = passenger.id
      this.showEditModal = true
    },
    
    async deletePassenger(id) {
      if (confirm('确定要删除这个乘客吗？')) {
        const success = await this.deletePassengerFromBackend(id)
        if (success) {
          this.passengers = this.passengers.filter(p => p.id !== id)
        }
      }
    },
    
    async savePassenger() {
      if (this.isEditing) {
        // 编辑现有乘客
        const success = await this.updatePassengerToBackend(this.editingId, this.currentPassenger)
        if (success) {
          const index = this.passengers.findIndex(p => p.id === this.editingId)
          if (index !== -1) {
            this.passengers[index] = { ...this.currentPassenger, id: this.editingId }
          }
          this.closeModal()
        }
      } else {
        // 添加新乘客
        const success = await this.savePassengerToBackend(this.currentPassenger)
        if (success) {
          // 重新加载乘客列表以获取最新数据（包括后端生成的ID）
          await this.loadPassengers()
          this.closeModal()
        }
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.isEditing = false
      this.editingId = null
      this.currentPassenger = {
        name: '',
        idType: '1',
        idNumber: '',
        phone: '',
        type: '1'
      }
    }
  }
}
</script>

<style scoped>
.passenger-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-tip {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.passenger-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.passenger-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.passenger-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #dee2e6;
}

.passenger-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.id-type {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
  background: #218838;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #6c757d;
  min-width: 100px;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #2c3e50;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
</style>