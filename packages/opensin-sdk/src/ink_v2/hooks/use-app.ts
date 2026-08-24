import { useContext } from 'react'
<<<<<<< HEAD
import AppContext from '../components/AppContext'
=======
import AppContext from '../../components_v2/AppContext.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

/**
 * `useApp` is a React hook, which exposes a method to manually exit the app (unmount).
 */
const useApp = () => useContext(AppContext)
export default useApp
