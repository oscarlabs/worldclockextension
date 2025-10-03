import { ref, computed } from 'vue'

export function useLocalStorage(){
    const LOCAL_STORAGE = ref<boolean>(false)

    return{
        LOCAL_STORAGE
    }
}