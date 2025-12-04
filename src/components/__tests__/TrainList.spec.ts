import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainList from '../TrainList.vue'
import type { Train } from '../../services/trainService'

describe('TrainList', () => {
  const mockTrains: Train[] = [
    {
      trainNo: 'G1',
      from: 'Beijing',
      to: 'Shanghai',
      startTime: '09:00',
      endTime: '13:00',
      seats: [
        { type: 'second', left: 10, bookable: true },
        { type: 'first', left: 0, bookable: false }
      ]
    }
  ]

  it('renders train information correctly', () => {
    const wrapper = mount(TrainList, {
      props: {
        trains: mockTrains
      }
    })

    expect(wrapper.text()).toContain('G1')
    expect(wrapper.text()).toContain('Beijing')
    expect(wrapper.text()).toContain('Shanghai')
    expect(wrapper.text()).toContain('09:00')
    expect(wrapper.text()).toContain('13:00')
  })

  it('renders seat availability', () => {
    const wrapper = mount(TrainList, {
      props: {
        trains: mockTrains
      }
    })

    // Check second class
    // We expect the component to render some text indicating seat type and count
    expect(wrapper.text()).toContain('second')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('first')
    expect(wrapper.text()).toContain('0')
  })

  it('emits book event when book button is clicked', async () => {
    const wrapper = mount(TrainList, {
      props: {
        trains: mockTrains
      }
    })

    // Find a button that is bookable
    // Assuming the implementation will have a button for each seat type
    const buttons = wrapper.findAll('button')
    // The first seat is bookable (second class)
    await buttons[0].trigger('click')

    expect(wrapper.emitted('book')).toBeTruthy()
    // Payload should likely contain train info and seat type
    expect(wrapper.emitted('book')![0]).toEqual([mockTrains[0], 'second'])
  })
})
