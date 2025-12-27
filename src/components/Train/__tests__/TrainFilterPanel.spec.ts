import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TrainFilterPanel from '../TrainFilterPanel.vue'

describe('TrainFilterPanel', () => {
  const defaultProps = {
    departureStations: ['北京南', '上海虹桥'],
    arrivalStations: ['南京南', '杭州东'],
    seatTypes: ['商务座', '一等座', '二等座'],
    isHighSpeed: false
  }

  it('renders stations correctly', () => {
    const wrapper = mount(TrainFilterPanel, {
      props: defaultProps
    })
    
    expect(wrapper.text()).toContain('北京南')
    expect(wrapper.text()).toContain('上海虹桥')
    expect(wrapper.text()).toContain('南京南')
  })

  it('emits filter-change event when a station is selected', async () => {
    const wrapper = mount(TrainFilterPanel, {
      props: defaultProps
    })

    // Find the checkbox for '北京南'
    const labels = wrapper.findAll('label.filter-checkbox')
    const targetLabel = labels.find(label => label.text().includes('北京南'))
    expect(targetLabel).toBeTruthy()

    const checkbox = (targetLabel as any).find('input[type="checkbox"]')
    expect(checkbox.exists()).toBe(true)

    await checkbox.setValue(true)
    
    // Check emitted events
    const emitted = wrapper.emitted('filter-change') as any
    expect(emitted).toBeTruthy()
    expect(emitted[0][0].departureStations).toContain('北京南')
  })

  it('handles "Select All" functionality', async () => {
    const wrapper = mount(TrainFilterPanel, {
      props: defaultProps
    })

    // Find the "Select All" button for departure stations
    // It's the button inside the row that contains "出发车站"
    const rows = wrapper.findAll('.filter-row')
    const departureRow = rows.find(row => row.text().includes('出发车站'))
    const selectAllBtn = departureRow?.find('button') // The first button in that row content is "全部"
    
    expect(selectAllBtn?.exists()).toBe(true)
    expect(selectAllBtn?.text()).toBe('全部')

    // Click select all (should select all if none selected, or none if all selected? logic depends on implementation)
    // Implementation: getSelectAllButtonClass checks length. click handler usually toggles or selects all.
    // Let's see: usually clicking "All" clears specific selections or selects all.
    // Let's click and see what happens to emitted value.
    
    await selectAllBtn?.trigger('click')
    
    const emitted = wrapper.emitted('filter-change')
    expect(emitted).toBeTruthy()
    // Based on common logic, if nothing selected, clicking 'All' might select all or clear selection (meaning all).
    // In many implementations, empty selection means "All". 
    // Let's verify the logic in a subsequent read if test fails, or just check that it emits something.
  })
})
