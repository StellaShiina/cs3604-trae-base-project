<template>
  <div class="passenger-table-container">
    <table class="passenger-table">
      <tbody>
        <tr v-for="(passenger, index) in passengers" :key="passenger.id">
          <td class="checkbox-index-cell">
            <input
              type="checkbox"
              :checked="selectedIds.includes(passenger.id)"
              @change="handleSelectOne(passenger.id)"
              :disabled="passenger.isSelf"
            />
            <span class="index-number">{{ index + 1 }}</span>
          </td>
          <td class="name-cell">{{ passenger.name }}</td>
          <td class="id-type-cell">{{ passenger.idCardType || passenger.id_card_type || formatCardType(passenger.card_type) }}</td>
          <td class="id-number-cell">{{ maskIdCard(passenger.idCardNumber || passenger.id_card_number || passenger.card_no) }}</td>
          <td class="phone-cell">
            {{ formatPhone(passenger.phone || passenger.phoneNumber || passenger.phone_number || passenger.mobile) }}
          </td>
          <td class="verification-cell">
            <span class="verification-badge">
              <span class="verification-icon">✓</span>
            </span>
          </td>
          <td class="action-cell">
            <template v-if="!passenger.isSelf">
              <button
                class="action-button edit-button"
                @click="onEdit(passenger)"
                title="修改"
              >
                <img src="@/assets/edit.svg" alt="修改" class="action-icon" />
              </button>
              <button
                class="action-button delete-button"
                @click="onDelete(passenger.id)"
                title="删除"
              >
                <img src="@/assets/delete.svg" alt="删除" class="action-icon" />
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="passengers.length === 0" class="empty-state">暂无乘客信息</div>
  </div>
</template>

<script setup lang="ts">

// Define props
const props = defineProps<{
  passengers: any[];
  selectedIds: string[];
}>();

// Define emits
const emit = defineEmits<{
  (e: 'select', ids: string[]): void;
  (e: 'edit', passenger: any): void;
  (e: 'delete', passengerId: string): void;
}>();

// Helper functions
const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length <= 8) return idCard;
  const start = idCard.substring(0, 4);
  const end = idCard.substring(idCard.length - 3);
  return `${start}${'*'.repeat(idCard.length - 7)}${end}`;
};

const formatPhone = (phone: string) => {
  if (!phone || phone.trim() === '') return '-';
  if (phone.length <= 7) return phone;
  const start = phone.substring(0, 3);
  const end = phone.substring(phone.length - 4);
  return `(+86)${start}****${end}`;
};

const formatCardType = (type: string) => {
    const map: Record<string, string> = {
        'id_card': '中国居民身份证',
        'passport': '护照'
    }
    return map[type] || type || '中国居民身份证'
}

const handleSelectOne = (passengerId: string) => {
  if (props.selectedIds.includes(passengerId)) {
    emit('select', props.selectedIds.filter((id) => id !== passengerId));
  } else {
    emit('select', [...props.selectedIds, passengerId]);
  }
};

const onEdit = (passenger: any) => {
  emit('edit', passenger);
};

const onDelete = (passengerId: string) => {
  emit('delete', passengerId);
};
</script>

<style>
/* 乘客信息表格样式 */
.passenger-table-container {
  overflow-x: auto;
}

.passenger-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: #fff;
}

.passenger-table tbody tr {
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  border-left: 1px solid #b1dbff;
  border-right: 1px solid #b1dbff;
}

.passenger-table tbody tr:last-child {
  border-bottom: 1px solid #b1dbff;
}

.passenger-table tbody tr:hover {
  background-color: #fafafa;
}

.passenger-table td {
  padding: 12px;
  color: #333;
  font-size: 14px;
}

.passenger-table .checkbox-index-cell {
  width: 100px;
  text-align: center;
  border-right: 1px solid #e8e8e8;
  padding: 15px 0px;
}

.checkbox-index-cell input[type="checkbox"] {
  margin-right: 15px;
  vertical-align: middle;
}

.index-number {
  vertical-align: middle;
}

.name-cell {
  width: 120px;
  text-align: center;
}

.id-type-cell {
  width: 150px;
  text-align: center;
}

.id-number-cell {
  width: 200px;
  text-align: center;
}

.phone-cell {
  width: 150px;
  text-align: center;
}

.verification-cell {
  width: 120px;
  text-align: center;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #52c41a;
  border-radius: 50%;
  border: 2px solid #52c41a;
}

.verification-icon {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.action-cell {
  width: 100px;
  text-align: center;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0px 0px;
  margin: 0 4px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.edit-button .action-icon {
  filter: invert(49%) sepia(98%) saturate(2976%) hue-rotate(192deg) brightness(101%) contrast(98%);
}

.edit-button:hover {
  transform: scale(1.15);
}

.delete-button .action-icon {
  filter: invert(35%) sepia(77%) saturate(6133%) hue-rotate(342deg) brightness(91%) contrast(84%);
}

.delete-button:hover {
  transform: scale(1.15);
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: #999;
  font-size: 14px;
  background-color: #fff;
}

@media (max-width: 768px) {
  .passenger-table {
    font-size: 12px;
  }
  
  .passenger-table th,
  .passenger-table td {
    padding: 8px 6px;
  }
}
</style>
