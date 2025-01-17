import { defineStore } from 'pinia'
import { onMounted, reactive, ref } from 'vue'
import type { IPaginate, IPermission } from '../../types/backend'
import { message } from 'ant-design-vue'
import apiService from '../../services/api.service'

const usePermissionStore = defineStore('permission', () => {
  const openModal = ref<boolean>(false)

  const load = ref<boolean>(false)
  const dataMeta = ref<IPaginate>({
    current: 1,
    pageSize: 6,
    pages: 0,
    total: 0
  })
  const data = ref<IPermission[]>([])
  const valueSearch = ref<string>('')
  const form = reactive<IPermission>({
    _id: '',
    name: '',
    apiPath: '',
    module: '',
    method: ''
  })
  const loading = ref<boolean>(false)
  const refreshInput = () => {
    form._id = ''
    form.name = ''
    form.apiPath = ''
    form.module = ''
    form.method = ''
  }
  const handleOpenModal = () => {
    openModal.value = true
    refreshInput()
  }

  const getData = async (search?: string) => {
    load.value = true
    try {
      const params = `?current=${dataMeta.value?.current}&pageSize=${dataMeta.value?.pageSize}&sort=-createdAt${search ? '&module=/' + search + '/' : ''}`
      const res = await apiService.get('permissions' + params)
      if (res) {
        data.value = res.data.result
        dataMeta.value = res.data.meta
      }
    } catch (error: any) {
      message.error(error.response.data.message)
    } finally {
      load.value = false
    }
  }

  //chức năng xoá
  const deleteByID = async (id: string) => {
    load.value = true
    try {
      const res = await apiService.delete('permissions/' + id)
      if (res) {
        message.success('Xóa thành công!')
        load.value = false
        getData()
      }
    } catch (error: any) {
      message.error(error.response.data.message)
    } finally {
      load.value = false
    }
  }

  //code dành cho permission update

  const getByID = async (id: string) => {
    try {
      loading.value = true
      const res = await apiService.get('permissions/' + id)
      if (res) {
        Object.assign(form, res.data)
        openModal.value = true
      }
    } catch (error: any) {
      message.error(error.response.data.message)
    } finally {
      loading.value = false
    }
  }
  const updateAndAdd = async () => {
    loading.value = true
    try {
      if (form._id) {
        const res = await apiService.update('permissions/' + form._id, form)
        if (res) message.success('Cập nhật thành công!')
      } else {
        const res = await apiService.add('permissions', form)
        if (res) message.success('Thêm thành công!')
      }
      refreshInput()
      openModal.value = false
      getData()
    } catch (error: any) {
      message.error(error.response.data.message)
    } finally {
      loading.value = false
    }
  }

  return {
    openModal,
    updateAndAdd,
    form,
    loading,
    data,
    dataMeta,
    getData,
    valueSearch,
    load,
    deleteByID,
    getByID,
    handleOpenModal
  }
})

export default usePermissionStore
