import { ref, computed } from 'vue'

export function useLocalStorage(){
    const LOCAL_STORAGE = ref<boolean>(true)

    return{
        LOCAL_STORAGE
    }
}